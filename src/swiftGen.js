// JSON → Swift Codable structs.
import { inferModel, splitNullable, toCamelCase, toPascalCase } from './typeModel.js'

// Swift keywords: as property names they need `backticks`.
const SWIFT_KEYWORDS = new Set([
  'Any', 'Self', 'as', 'associatedtype', 'break', 'case', 'catch', 'class', 'continue', 'default', 'defer',
  'deinit', 'do', 'else', 'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'for', 'func', 'guard',
  'if', 'import', 'in', 'init', 'inout', 'internal', 'is', 'let', 'nil', 'open', 'operator', 'private',
  'protocol', 'public', 'repeat', 'rethrows', 'return', 'self', 'static', 'struct', 'subscript', 'super',
  'switch', 'throw', 'throws', 'true', 'try', 'typealias', 'var', 'where', 'while',
])

// Type names that would clash with Swift or Foundation types (an API "data" key is very common).
const RESERVED_TYPES = new Set([
  'Any', 'Array', 'Bool', 'Calendar', 'Character', 'Codable', 'Collection', 'Data', 'Date', 'Decoder',
  'Dictionary', 'Double', 'Element', 'Encoder', 'Error', 'Float', 'Index', 'Int', 'JSONValue', 'Locale',
  'Measurement', 'Never', 'Notification', 'Optional', 'Protocol', 'Range', 'Result', 'Self', 'Sequence',
  'Set', 'String', 'TimeZone', 'Type', 'URL', 'UUID', 'Void',
])

const JSON_VALUE = `// Holds a value whose type the sample did not show (null or mixed).
enum JSONValue: Codable {
    case string(String), number(Double), bool(Bool), object([String: JSONValue]), array([JSONValue]), null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() { self = .null }
        else if let value = try? container.decode(Bool.self) { self = .bool(value) }
        else if let value = try? container.decode(Double.self) { self = .number(value) }
        else if let value = try? container.decode(String.self) { self = .string(value) }
        else if let value = try? container.decode([JSONValue].self) { self = .array(value) }
        else { self = .object(try container.decode([String: JSONValue].self)) }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let value): try container.encode(value)
        case .number(let value): try container.encode(value)
        case .bool(let value): try container.encode(value)
        case .object(let value): try container.encode(value)
        case .array(let value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }
}`

const swiftString = (text) => `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

export function jsonToSwift(data, rootName = 'Root', mutable = false) {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))

  // Rename structs whose name clashes with a Swift type: Data → DataModel.
  const names = new Map()
  const taken = new Set(model.classes.keys())
  for (const name of model.classes.keys()) {
    let fixed = name
    if (RESERVED_TYPES.has(name)) {
      fixed = `${name}Model`
      let n = 2
      while (taken.has(fixed)) fixed = `${name}Model${n++}`
      taken.add(fixed)
    }
    names.set(name, fixed)
  }

  let usesJsonValue = false
  function swiftType(type) {
    switch (type.kind) {
      case 'string': return 'String'
      case 'integer': return 'Int'
      case 'number': return 'Double'
      case 'boolean': return 'Bool'
      case 'object': return names.get(type.name)
      case 'array': {
        const { base, nullable } = splitNullable(type.items)
        const inner = swiftType(base)
        return `[${inner}${nullable && inner !== 'JSONValue' ? '?' : ''}]`
      }
      default:
        usesJsonValue = true
        return 'JSONValue'
    }
  }

  const keyword = mutable ? 'var' : 'let'
  const blocks = []
  for (const [name, fields] of model.classes) {
    const used = new Set()
    const props = fields.map((field) => {
      let prop = toCamelCase(field.key)
      // These cannot be property names even in backticks, so rename them.
      if (['self', 'Self', 'init', 'deinit', 'subscript', 'super', 'Any', 'Type', 'Protocol'].includes(prop)) prop = `${prop}Value`
      const base = prop
      let n = 2
      while (used.has(prop)) prop = `${base}${n++}`
      used.add(prop)
      const ident = SWIFT_KEYWORDS.has(prop) ? `\`${prop}\`` : prop
      const { base: baseType, nullable } = splitNullable(field.type)
      const type = swiftType(baseType)
      const optional = nullable || field.optional || type === 'JSONValue'
      return { key: field.key, prop, ident, type: type + (optional ? '?' : '') }
    })

    const lines = [`struct ${names.get(name)}: Codable {`]
    for (const p of props) lines.push(`    ${keyword} ${p.ident}: ${p.type}`)
    if (props.some((p) => p.prop !== p.key)) {
      lines.push('', '    enum CodingKeys: String, CodingKey {')
      for (const p of props) lines.push(p.prop === p.key ? `        case ${p.ident}` : `        case ${p.ident} = ${swiftString(p.key)}`)
      lines.push('    }')
    }
    lines.push('}')
    blocks.push(lines.join('\n'))
  }

  if (usesJsonValue) blocks.push(JSON_VALUE)
  let rootNote = ''
  if (model.root.kind === 'array') {
    rootNote = `// The JSON is an array: decode it with JSONDecoder().decode(${swiftType(model.root)}.self, from: data)\n\n`
  } else if (model.root.kind !== 'object') {
    rootNote = `// The JSON is a single ${model.root.kind} value, so there is no struct to generate.\n`
  }
  return (blocks.length ? 'import Foundation\n\n' : '') + rootNote + blocks.join('\n\n') + '\n'
}
