// JSON → Rust structs for serde.
import { inferModel, splitNullable, toPascalCase, toSnakeCase } from './typeModel.js'

// Rust keywords. Most can be raw identifiers (r#type); these four cannot.
const RUST_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false',
  'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return',
  'self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
  'abstract', 'become', 'box', 'do', 'final', 'gen', 'macro', 'override', 'priv', 'try', 'typeof',
  'unsized', 'virtual', 'yield',
])
const NOT_RAW = new Set(['self', 'super', 'crate', 'Self'])

// Struct names that would clash with types every Rust file can see.
const RESERVED_TYPES = new Set(['Box', 'Err', 'None', 'Ok', 'Option', 'Result', 'Self', 'Some', 'String', 'Vec'])

const rustString = (text) => `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

export function jsonToRust(data, rootName = 'Root', publicFields = true) {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))

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

  function rustType(type) {
    const { base, nullable } = splitNullable(type)
    let name
    switch (base.kind) {
      case 'string': name = 'String'; break
      case 'integer': name = 'i64'; break
      case 'number': name = 'f64'; break
      case 'boolean': name = 'bool'; break
      case 'object': name = names.get(base.name); break
      case 'array': name = `Vec<${rustType(base.items)}>`; break
      default: name = 'serde_json::Value'
    }
    // serde_json::Value can already hold null, except when the key is missing (handled below).
    return nullable && name !== 'serde_json::Value' ? `Option<${name}>` : name
  }

  const vis = publicFields ? 'pub ' : ''
  const blocks = []
  for (const [name, fields] of model.classes) {
    const used = new Set()
    const lines = ['#[derive(Debug, Clone, Serialize, Deserialize)]', `${vis}struct ${names.get(name)} {`]
    for (const field of fields) {
      let prop = toSnakeCase(field.key)
      if (NOT_RAW.has(prop)) prop = `${prop}_`
      const base = prop
      let n = 2
      while (used.has(prop)) prop = `${base}_${n++}`
      used.add(prop)
      const ident = RUST_KEYWORDS.has(prop) ? `r#${prop}` : prop
      let type = rustType(field.type)
      const { base: baseType } = splitNullable(field.type)
      const isValue = !['string', 'integer', 'number', 'boolean', 'object', 'array'].includes(baseType.kind)
      // A key missing from some objects (or an unknown value) is an Option, so serde accepts it being absent.
      if ((field.optional || (isValue && field.type.kind === 'null')) && !type.startsWith('Option<')) type = `Option<${type}>`
      // serde removes the r# prefix itself, so only a real name change needs rename.
      if (prop !== field.key) lines.push(`    #[serde(rename = ${rustString(field.key)})]`)
      lines.push(`    ${vis}${ident}: ${type},`)
    }
    lines.push('}')
    blocks.push(lines.join('\n'))
  }

  let rootNote = ''
  if (model.root.kind === 'array') {
    rootNote = `// The JSON is an array: parse it with\n// let items: ${rustType(model.root)} = serde_json::from_str(&text)?;\n\n`
  } else if (model.root.kind !== 'object') {
    rootNote = `// The JSON is a single ${model.root.kind} value, so there is no struct to generate.\n`
  }
  const header = blocks.length ? 'use serde::{Deserialize, Serialize};\n\n' : ''
  return header + rootNote + blocks.join('\n\n') + '\n'
}
