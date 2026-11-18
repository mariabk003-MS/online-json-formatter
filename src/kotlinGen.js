// JSON → Kotlin data classes, for kotlinx.serialization, Gson or Moshi.
import { inferModel, splitNullable, toCamelCase, toPascalCase } from './typeModel.js'

// Kotlin hard keywords: as names they need `backticks`.
const KT_KEYWORDS = new Set([
  'as', 'break', 'class', 'continue', 'do', 'else', 'false', 'for', 'fun', 'if', 'in', 'interface',
  'is', 'null', 'object', 'package', 'return', 'super', 'this', 'throw', 'true', 'try', 'typealias',
  'typeof', 'val', 'var', 'when', 'while',
])

const LIBRARIES = {
  kotlinx: {
    classAnnotation: '@Serializable',
    field: (key) => `@SerialName("${key}")`,
    imports: (uses) => [
      uses.rename && 'import kotlinx.serialization.SerialName',
      'import kotlinx.serialization.Serializable',
      uses.any && 'import kotlinx.serialization.json.JsonElement',
    ],
    anyType: 'JsonElement',
  },
  gson: {
    classAnnotation: '',
    field: (key) => `@SerializedName("${key}")`,
    imports: (uses) => [uses.rename && 'import com.google.gson.annotations.SerializedName'],
    anyType: 'Any',
  },
  moshi: {
    classAnnotation: '@JsonClass(generateAdapter = true)',
    field: (key) => `@Json(name = "${key}")`,
    imports: (uses) => [uses.rename && 'import com.squareup.moshi.Json', 'import com.squareup.moshi.JsonClass'],
    anyType: 'Any',
  },
  none: {
    classAnnotation: '',
    field: () => '',
    imports: () => [],
    anyType: 'Any',
  },
}

export function jsonToKotlin(data, rootName = 'Root', library = 'kotlinx') {
  const lib = LIBRARIES[library] || LIBRARIES.kotlinx
  const model = inferModel(data, toPascalCase(rootName || 'Root'))
  const uses = { rename: false, any: false }

  // Returns the Kotlin type of a JSON type, without the trailing "?".
  function ktType(type) {
    switch (type.kind) {
      case 'string': return 'String'
      case 'integer': return 'Long'
      case 'number': return 'Double'
      case 'boolean': return 'Boolean'
      case 'object': return type.name
      case 'array': {
        const { base, nullable } = splitNullable(type.items)
        return `List<${ktType(base)}${nullable || isAny(base) ? '?' : ''}>`
      }
      default:
        uses.any = true
        return lib.anyType
    }
  }
  const isAny = (type) => !['string', 'integer', 'number', 'boolean', 'object', 'array'].includes(type.kind)

  const blocks = []
  for (const [name, fields] of model.classes) {
    const used = new Set()
    const params = fields.map((field) => {
      let prop = toCamelCase(field.key)
      const base = prop
      let n = 2
      while (used.has(prop)) prop = `${base}${n++}`
      used.add(prop)
      const { base: baseType, nullable } = splitNullable(field.type)
      const optional = nullable || field.optional || isAny(baseType)
      const type = ktType(baseType) + (optional ? '?' : '')
      const rename = prop !== field.key && lib.field(field.key)
      if (rename) uses.rename = true
      const ident = KT_KEYWORDS.has(prop) ? `\`${prop}\`` : prop
      return `${rename ? `    ${rename}\n` : ''}    val ${ident}: ${type}${optional ? ' = null' : ''},`
    })
    const annotation = lib.classAnnotation ? `${lib.classAnnotation}\n` : ''
    // A data class needs at least one property, so an empty object becomes a plain class.
    blocks.push(params.length ? `${annotation}data class ${name}(\n${params.join('\n')}\n)` : `${annotation}class ${name}`)
  }

  const imports = blocks.length ? lib.imports(uses).filter(Boolean) : []
  let rootNote = ''
  if (model.root.kind === 'array') {
    rootNote = `// The JSON is an array: decode it as ${ktType(model.root)}.\n\n`
  } else if (model.root.kind !== 'object') {
    rootNote = `// The JSON is a single ${model.root.kind} value, so there is no class to generate.\n`
  }
  return (imports.length ? imports.join('\n') + '\n\n' : '') + rootNote + blocks.join('\n\n') + '\n'
}
