// JSON → Dart classes with fromJson / toJson, plain or for json_serializable.
import { inferModel, splitNullable, toCamelCase, toPascalCase, toSnakeCase } from './typeModel.js'

// Reserved words and built-in identifiers, plus names a model class already uses.
const DART_RESERVED = new Set([
  'abstract', 'as', 'assert', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'covariant', 'default', 'deferred', 'do', 'dynamic', 'else', 'enum', 'export', 'extends', 'extension',
  'external', 'factory', 'false', 'final', 'finally', 'for', 'get', 'hide', 'if', 'implements', 'import',
  'in', 'interface', 'is', 'late', 'library', 'mixin', 'new', 'null', 'on', 'operator', 'part', 'required',
  'rethrow', 'return', 'set', 'show', 'static', 'super', 'switch', 'sync', 'this', 'throw', 'true', 'try',
  'typedef', 'var', 'void', 'while', 'with', 'yield',
  'fromJson', 'toJson', 'hashCode', 'runtimeType', 'toString', 'noSuchMethod',
])

const PRIMITIVES = { string: 'String', integer: 'int', number: 'double', boolean: 'bool' }

export function jsonToDart(data, rootName = 'Root', style = 'plain') {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))
  const serializable = style === 'json_serializable'

  // Dart type of a JSON type. Unknown and mixed values are dynamic (already nullable).
  function dartType(type) {
    const { base, nullable } = splitNullable(type)
    let name
    if (PRIMITIVES[base.kind]) name = PRIMITIVES[base.kind]
    else if (base.kind === 'object') name = base.name
    else if (base.kind === 'array') name = `List<${dartType(base.items)}>`
    else return 'dynamic'
    return nullable ? `${name}?` : name
  }

  // Expression that reads `src` (a dynamic value) as the given type.
  function fromExpr(type, src, depth = 0) {
    const { base, nullable } = splitNullable(type)
    const q = nullable ? '?' : ''
    switch (base.kind) {
      case 'string': return `${src} as String${q}`
      case 'integer': return `${src} as int${q}`
      case 'boolean': return `${src} as bool${q}`
      // JSON numbers like 5 arrive as int, so read any number and convert.
      case 'number': return `(${src} as num${q})${q}.toDouble()`
      case 'object': {
        const read = `${base.name}.fromJson(${src} as Map<String, dynamic>)`
        return nullable ? `${src} == null ? null : ${read}` : read
      }
      case 'array': {
        if (dartType(base.items) === 'dynamic') return `${src} as List<dynamic>${q}`
        const v = depth ? `e${depth + 1}` : 'e'
        return `(${src} as List<dynamic>${q})${q}.map((${v}) => ${fromExpr(base.items, v, depth + 1)}).toList()`
      }
      default: return src
    }
  }

  // Expression that turns a field value back into JSON-ready data.
  function toExpr(type, src, depth = 0) {
    const { base, nullable } = splitNullable(type)
    const q = nullable ? '?' : ''
    if (base.kind === 'object') return `${src}${q}.toJson()`
    if (base.kind === 'array' && needsConvert(base.items)) {
      const v = depth ? `e${depth + 1}` : 'e'
      return `${src}${q}.map((${v}) => ${toExpr(base.items, v, depth + 1)}).toList()`
    }
    return src
  }
  const needsConvert = (type) => {
    const { base } = splitNullable(type)
    return base.kind === 'object' || (base.kind === 'array' && needsConvert(base.items))
  }

  const blocks = []
  for (const [name, fields] of model.classes) {
    const used = new Set()
    const props = fields.map((field) => {
      let prop = toCamelCase(field.key)
      if (DART_RESERVED.has(prop)) prop = `${prop}Value`
      const base = prop
      let n = 2
      while (used.has(prop)) prop = `${base}${n++}`
      used.add(prop)
      // A key missing from some objects is nullable too.
      const type = field.optional && field.type.kind !== 'null'
        ? { kind: 'union', types: [field.type, { kind: 'null' }] }
        : field.type
      const dType = dartType(type)
      return { key: field.key, prop, type, dType, optional: dType.endsWith('?') || dType === 'dynamic' }
    })

    const lines = []
    if (serializable) {
      const nested = props.some((p) => needsConvert(p.type))
      lines.push(nested ? '@JsonSerializable(explicitToJson: true)' : '@JsonSerializable()')
    }
    lines.push(`class ${name} {`)
    for (const p of props) {
      if (serializable && p.prop !== p.key) lines.push(`  @JsonKey(name: '${p.key.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}')`)
      lines.push(`  final ${p.dType} ${p.prop};`)
    }
    if (props.length) lines.push('')
    const params = props.map((p) => `${p.optional ? '' : 'required '}this.${p.prop}`)
    lines.push(params.length ? `  ${name}({\n${params.map((p) => `    ${p},`).join('\n')}\n  });` : `  ${name}();`)
    lines.push('')
    const key = (k) => `'${k.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\$/g, '\\$')}'`
    if (serializable) {
      lines.push(`  factory ${name}.fromJson(Map<String, dynamic> json) => _$${name}FromJson(json);`)
      lines.push('')
      lines.push(`  Map<String, dynamic> toJson() => _$${name}ToJson(this);`)
    } else {
      if (props.length) {
        lines.push(`  factory ${name}.fromJson(Map<String, dynamic> json) => ${name}(`)
        for (const p of props) lines.push(`        ${p.prop}: ${fromExpr(p.type, `json[${key(p.key)}]`)},`)
        lines.push('      );')
      } else {
        lines.push(`  factory ${name}.fromJson(Map<String, dynamic> json) => ${name}();`)
      }
      lines.push('')
      if (props.length) {
        lines.push('  Map<String, dynamic> toJson() => {')
        for (const p of props) lines.push(`        ${key(p.key)}: ${toExpr(p.type, p.prop)},`)
        lines.push('      };')
      } else {
        lines.push('  Map<String, dynamic> toJson() => {};')
      }
    }
    lines.push('}')
    blocks.push(lines.join('\n'))
  }

  let header = ''
  if (serializable && blocks.length) {
    header = `import 'package:json_annotation/json_annotation.dart';\n\npart '${toSnakeCase(rootName || 'Root')}.g.dart';\n\n`
  }
  let rootNote = ''
  if (model.root.kind === 'array') {
    rootNote = `// The JSON is an array: decode it with\n// ${fromExpr(model.root, 'jsonDecode(text)')}\n\n`
  } else if (model.root.kind !== 'object') {
    rootNote = `// The JSON is a single ${model.root.kind} value, so there is no class to generate.\n`
  }
  return header + rootNote + blocks.join('\n\n') + '\n'
}
