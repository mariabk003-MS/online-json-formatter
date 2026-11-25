// JSON example → Zod schema code (Zod 4 or Zod 3), built on the shared type model.
import { inferModel, splitNullable, toPascalCase } from './typeModel.js'

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const propName = (key) => (IDENTIFIER.test(key) ? key : JSON.stringify(key))

// The string check for each detected format. A datetime with a +05:00 style
// offset needs { offset: true }; Zod only accepts "Z" by default.
function stringSchema(type, version, values) {
  const format = type.format
  if (!format) return 'z.string()'
  if (format === 'datetime') {
    const options = values.offset ? '{ offset: true }' : ''
    return version === 4 ? `z.iso.datetime(${options})` : `z.string().datetime(${options})`
  }
  if (format === 'date') return version === 4 ? 'z.iso.date()' : 'z.string().date()'
  return version === 4 ? `z.${format}()` : `z.string().${format}()`
}

// options:
//   version     4 | 3
//   formats     add email / url / uuid / date checks for strings that clearly are one
//   inline      nest objects inside the parent instead of one const per object
//   types       also export a TypeScript type for every schema (z.infer)
export function jsonToZod(data, rootInput = 'Root', { version = 4, formats = true, inline = false, types = true } = {}) {
  const rootName = toPascalCase(rootInput.trim() || 'Root') // "user list" → "UserList"
  const model = inferModel(data, rootName)
  // Whether any datetime string has an offset (+05:00), so { offset: true } is needed.
  const offset = /\d{2}:\d{2}(:\d{2}(\.\d+)?)?[+-]\d{2}:\d{2}"/.test(JSON.stringify(data))

  const schemaName = (name) => `${name}Schema`

  function expr(type, depth) {
    switch (type.kind) {
      case 'string':
        return formats ? stringSchema(type, version, { offset }) : 'z.string()'
      case 'integer':
        return 'z.number().int()'
      case 'number':
        return 'z.number()'
      case 'boolean':
        return 'z.boolean()'
      case 'null':
        return 'z.null()'
      case 'array':
        return `z.array(${expr(type.items, depth)})`
      case 'object':
        return inline ? objectBody(type.name, depth) : schemaName(type.name)
      case 'union': {
        const { base, nullable } = splitNullable(type)
        if (nullable) return `${expr(base, depth)}.nullable()`
        return `z.union([${type.types.map((t) => expr(t, depth)).join(', ')}])`
      }
      default:
        return 'z.unknown()'
    }
  }

  function objectBody(name, depth) {
    const fields = model.classes.get(name) || []
    if (!fields.length) return 'z.object({})'
    const pad = '  '.repeat(depth + 1)
    const lines = fields.map((field) => {
      let value = expr(field.type, depth + 1)
      if (field.optional) value += '.optional()'
      return `${pad}${propName(field.key)}: ${value},`
    })
    return `z.object({\n${lines.join('\n')}\n${'  '.repeat(depth)}})`
  }

  const out = [`import { z } from 'zod'${version === 3 ? ' // Zod 3' : ''}`, '']
  const typeLine = (name) => `export type ${name} = z.infer<typeof ${schemaName(name)}>`

  if (!inline) {
    // Children first: a const must be defined before another schema uses it.
    const names = [...model.classes.keys()].reverse()
    for (const name of names) {
      out.push(`export const ${schemaName(name)} = ${objectBody(name, 0)}`)
      if (types) out.push(typeLine(name))
      out.push('')
    }
  }

  // The root: an object that is already written above, or anything else (array, value).
  const rootIsWritten = !inline && model.root.kind === 'object' && model.root.name === rootName
  if (!rootIsWritten) {
    const rootExpr = model.root.kind === 'object' && inline ? objectBody(model.root.name, 0) : expr(model.root, 0)
    // A nested object may already be called "Root" (from a "root" key); then use RootList.
    const name = !inline && model.classes.has(rootName) ? `${rootName}List` : rootName
    out.push(`export const ${schemaName(name)} = ${rootExpr}`)
    if (types) out.push(typeLine(name))
    out.push('')
  }

  return out.join('\n')
}
