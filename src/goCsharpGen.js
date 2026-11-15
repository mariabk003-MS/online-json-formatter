// Code generators for Go structs and C# classes/records.
// Both use the shared type model from typeModel.js (same as Java and Python).
import { inferModel, splitNullable, toPascalCase } from './typeModel.js'

// ---------- Go ----------

// Common initialisms are written in capitals in Go: userId → UserID, apiUrl → APIURL.
const GO_INITIALISMS = new Set([
  'ACL', 'API', 'ASCII', 'CPU', 'CSS', 'DNS', 'EOF', 'GUID', 'HTML', 'HTTP', 'HTTPS', 'ID', 'IP', 'JSON',
  'LHS', 'QPS', 'RAM', 'RHS', 'RPC', 'SKU', 'SLA', 'SMTP', 'SQL', 'SSH', 'TCP', 'TLS', 'TTL', 'UDP', 'UI',
  'UID', 'URI', 'URL', 'UTF8', 'UUID', 'VM', 'XML', 'XMPP', 'XSRF', 'XSS',
])

function goFieldName(key) {
  const words = String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
  let name = words
    .map((word) => {
      const upper = word.toUpperCase()
      return GO_INITIALISMS.has(upper) ? upper : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
  if (!name) name = 'Field'
  if (!/^[A-Za-z]/.test(name)) name = 'F' + name
  return name
}

const GO_BASIC = { string: 'string', integer: 'int64', number: 'float64', boolean: 'bool' }

function goType(type) {
  const { base, nullable } = splitNullable(type)
  let t
  if (GO_BASIC[base.kind]) t = GO_BASIC[base.kind]
  else if (base.kind === 'object') t = base.name
  else if (base.kind === 'array') return `[]${goType(base.items)}` // a nil slice already means "no value"
  else return 'any' // null-only, unknown or mixed values
  return nullable ? `*${t}` : t
}

// Lines up the columns the way gofmt does.
function alignColumns(rows) {
  const widths = []
  for (const row of rows) row.forEach((cell, i) => (widths[i] = Math.max(widths[i] || 0, cell.length)))
  return rows.map((row) =>
    row.map((cell, i) => (i < row.length - 1 ? cell.padEnd(widths[i]) : cell)).join(' ')
  )
}

export function jsonToGo(data, rootName = 'Root', omitEmpty = true) {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))
  const blocks = []
  if (model.root.kind !== 'object') blocks.push(`type ${toPascalCase(rootName || 'Root')} ${goType(model.root)}`)

  for (const [name, fields] of model.classes) {
    const used = new Set()
    const rows = fields.map((field) => {
      let fieldName = goFieldName(field.key)
      let n = 2
      while (used.has(fieldName)) fieldName = `${goFieldName(field.key)}${n++}`
      used.add(fieldName)
      const tag = field.optional && omitEmpty ? `${field.key},omitempty` : field.key
      return [fieldName, goType(field.type), `\`json:"${tag.replace(/"/g, '\\"')}"\``]
    })
    const body = rows.length ? alignColumns(rows).map((line) => `\t${line}`).join('\n') + '\n' : ''
    blocks.push(`type ${name} struct {\n${body}}`)
  }
  return blocks.join('\n\n') + '\n'
}

// ---------- C# ----------

const CS_KEYWORDS = new Set(['Object', 'String', 'Type', 'Equals', 'GetHashCode', 'GetType', 'ToString'])
const CS_BASIC = { string: 'string', integer: 'long', number: 'double', boolean: 'bool' }
const VALUE_TYPES = new Set(['long', 'double', 'bool'])

function csType(type, optional) {
  const { base, nullable } = splitNullable(type)
  let t
  let reference = true
  if (CS_BASIC[base.kind]) {
    t = CS_BASIC[base.kind]
    reference = !VALUE_TYPES.has(t)
  } else if (base.kind === 'object') t = base.name
  else if (base.kind === 'array') t = `List<${csType(base.items, false).type.replace(/\?$/, '')}>`
  else return { type: 'object?', init: '' }
  const canBeMissing = nullable || optional
  if (canBeMissing) return { type: `${t}?`, init: '' }
  // Non-null reference types get a default so the code has no nullable warnings.
  if (!reference) return { type: t, init: '' }
  return { type: t, init: t === 'string' ? ' = "";' : ' = new();' }
}

export function jsonToCSharp(data, rootName = 'Root', style = 'class', library = 'system') {
  const model = inferModel(data, toPascalCase(rootName || 'Root'))
  const usesList = JSON.stringify([...model.classes.values()]).includes('"array"')
  const attribute = (key) =>
    library === 'system' ? `JsonPropertyName("${key}")` : library === 'newtonsoft' ? `JsonProperty("${key}")` : ''

  let needsAttribute = false
  const blocks = []
  for (const [name, fields] of model.classes) {
    const used = new Set()
    const props = fields.map((field) => {
      let prop = toPascalCase(field.key)
      if (prop === name || CS_KEYWORDS.has(prop)) prop = `${prop}Value`
      let n = 2
      const base = prop
      while (used.has(prop)) prop = `${base}${n++}`
      used.add(prop)
      const { type, init } = csType(field.type, field.optional)
      const attr = library !== 'none' && prop !== field.key ? attribute(field.key) : ''
      if (attr) needsAttribute = true
      return { prop, type, init, attr }
    })

    if (style === 'record') {
      const params = props
        .map((p) => `    ${p.attr ? `[property: ${p.attr}] ` : ''}${p.type} ${p.prop}`)
        .join(',\n')
      blocks.push(`public record ${name}(\n${params}\n);`)
    } else {
      const body = props
        .map((p) => `${p.attr ? `    [${p.attr}]\n` : ''}    public ${p.type} ${p.prop} { get; set; }${p.init}`)
        .join('\n\n')
      blocks.push(`public class ${name}\n{\n${body}\n}`)
    }
  }

  const usings = []
  if (usesList) usings.push('using System.Collections.Generic;')
  if (needsAttribute && library === 'system') usings.push('using System.Text.Json.Serialization;')
  if (needsAttribute && library === 'newtonsoft') usings.push('using Newtonsoft.Json;')
  const rootNote =
    model.root.kind === 'array'
      ? `// The JSON is an array: deserialize it as List<${model.root.items.kind === 'object' ? model.root.items.name : 'object'}>.\n\n`
      : ''
  return (usings.length ? usings.join('\n') + '\n\n' : '') + rootNote + blocks.join('\n\n') + '\n'
}
