// JSON → PHP: an array literal, or PHP 8 classes with a fromArray() factory.
import { inferModel, splitNullable, toCamelCase, toPascalCase } from './typeModel.js'

// Single quotes when possible (only \ and ' need escaping there); double quotes
// when the text has control characters such as line breaks.
export function phpString(text) {
  // eslint-disable-next-line no-control-regex -- control characters are exactly what we look for
  if (!/[\x00-\x1f\x7f]/.test(text)) return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  const named = { '\n': '\\n', '\r': '\\r', '\t': '\\t', '\v': '\\v', '\f': '\\f', '\x1b': '\\e' }
  // eslint-disable-next-line no-control-regex -- control characters are escaped here
  const body = text.replace(/[\\"$\x00-\x1f\x7f]/g, (ch) => {
    if (ch === '\\') return '\\\\'
    if (ch === '"') return '\\"'
    if (ch === '$') return '\\$'
    return named[ch] || `\\x${ch.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()}`
  })
  return `"${body}"`
}

function phpValue(value, indent, level, long) {
  const pad = indent.repeat(level + 1)
  const close = indent.repeat(level)
  const [open, end] = long ? ['array(', ')'] : ['[', ']']
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return phpString(value)
  if (Array.isArray(value)) {
    if (!value.length) return open + end
    return `${open}\n${value.map((v) => `${pad}${phpValue(v, indent, level + 1, long)},`).join('\n')}\n${close}${end}`
  }
  const entries = Object.entries(value)
  if (!entries.length) return open + end
  return `${open}\n${entries.map(([k, v]) => `${pad}${phpString(k)} => ${phpValue(v, indent, level + 1, long)},`).join('\n')}\n${close}${end}`
}

export function jsonToPhpArray(data, { variable = 'data', long = false } = {}) {
  const name = String(variable || 'data').replace(/^\$/, '').replace(/[^A-Za-z0-9_]/g, '_').replace(/^(\d)/, '_$1') || 'data'
  return `<?php\n\n$${name} = ${phpValue(data, '    ', 0, long)};\n`
}

// ---------- classes ----------
// Words PHP does not allow as class names (case-insensitive).
const RESERVED = new Set(
  ('abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile enum eval exit extends final finally fn for foreach function global goto if implements include instanceof insteadof interface isset list match namespace new or print private protected public readonly require return static switch throw trait try unset use var while xor yield ' +
    'int float bool string true false null void iterable object mixed never self parent').split(' ')
)

export function jsonToPhpClasses(data, rootName = 'Root') {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))
  const names = new Map()
  const taken = new Set([...model.classes.keys()].map((n) => n.toLowerCase()))
  for (const name of model.classes.keys()) {
    let fixed = name
    if (RESERVED.has(name.toLowerCase())) {
      fixed = `${name}Model`
      for (let n = 2; taken.has(fixed.toLowerCase()); n++) fixed = `${name}Model${n}`
      taken.add(fixed.toLowerCase())
    }
    names.set(name, fixed)
  }

  const scalar = { string: 'string', integer: 'int', number: 'float', boolean: 'bool' }
  const isUnknown = (t) => !['string', 'integer', 'number', 'boolean', 'object', 'array'].includes(t.kind)

  const blocks = []
  for (const [name, fields] of model.classes) {
    const className = names.get(name)
    const used = new Set()
    const props = fields.map((field) => {
      let prop = toCamelCase(field.key)
      if (prop === 'this') prop = 'thisValue' // $this cannot be a parameter name
      const base = prop
      for (let n = 2; used.has(prop); n++) prop = `${base}${n}`
      used.add(prop)
      const { base: type, nullable } = splitNullable(field.type)
      const optional = nullable || field.optional
      const access = `$data[${phpString(field.key)}]`
      let phpType
      let doc = ''
      let expr
      if (isUnknown(type)) {
        phpType = 'mixed'
        expr = optional ? `${access} ?? null` : access
      } else if (type.kind === 'object') {
        const cls = names.get(type.name)
        phpType = (optional ? '?' : '') + cls
        expr = optional ? `isset(${access}) ? ${cls}::fromArray(${access}) : null` : `${cls}::fromArray(${access})`
      } else if (type.kind === 'array') {
        phpType = (optional ? '?' : '') + 'array'
        const { base: item } = splitNullable(type.items)
        if (item.kind === 'object') {
          const cls = names.get(item.name)
          doc = `/** @var ${cls}[] */`
          const map = `array_map(fn (array $item) => ${cls}::fromArray($item), ${optional ? `${access} ?? []` : access})`
          expr = optional ? `isset(${access}) ? ${map} : null` : map
        } else {
          if (scalar[item.kind]) doc = `/** @var ${scalar[item.kind]}[] */`
          expr = optional ? `${access} ?? null` : access
        }
      } else {
        phpType = (optional ? '?' : '') + scalar[type.kind]
        if (type.kind === 'number') expr = optional ? `isset(${access}) ? (float) ${access} : null` : `(float) ${access}`
        else expr = optional ? `${access} ?? null` : access
      }
      return { prop, phpType, doc, expr }
    })

    const params = props
      .map((p) => `${p.doc ? `        ${p.doc}\n` : ''}        public ${p.phpType} $${p.prop},`)
      .join('\n')
    const args = props.map((p) => `            ${p.prop}: ${p.expr},`).join('\n')
    blocks.push(
      props.length
        ? `final class ${className}\n{\n    public function __construct(\n${params}\n    ) {\n    }\n\n    public static function fromArray(array $data): self\n    {\n        return new self(\n${args}\n        );\n    }\n}`
        : `final class ${className}\n{\n    public static function fromArray(array $data): self\n    {\n        return new self();\n    }\n}`
    )
  }

  let usage
  const rootClass = model.root.kind === 'object' ? names.get(model.root.name) : null
  if (rootClass) {
    usage = `// Usage:\n// $${toCamelCase(rootClass)} = ${rootClass}::fromArray(json_decode($json, true, flags: JSON_THROW_ON_ERROR));\n\n`
  } else if (model.root.kind === 'array') {
    const { base: item } = splitNullable(model.root.items)
    const cls = item.kind === 'object' ? names.get(item.name) : null
    usage = cls
      ? `// The JSON is an array. Usage:\n// $items = array_map(fn (array $item) => ${cls}::fromArray($item), json_decode($json, true, flags: JSON_THROW_ON_ERROR));\n\n`
      : '// The JSON is an array of plain values, so there is no class to generate.\n'
  } else {
    usage = `// The JSON is a single ${model.root.kind} value, so there is no class to generate.\n`
  }
  return `<?php\n\ndeclare(strict_types=1);\n\n${usage}${blocks.join('\n\n')}${blocks.length ? '\n' : ''}`
}
