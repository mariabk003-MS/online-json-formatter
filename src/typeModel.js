// Reads example JSON and works out its "shape": which fields exist, their
// types, which are optional, and which nested objects need their own class.
// Used by JSON to Python, JSON to Java and the JSON Schema Generator.

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// "user_address" → "UserAddress"
export function toPascalCase(text) {
  const name = String(text)
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, next) => (next ? next.toUpperCase() : ''))
    .replace(/^[a-z]/, (first) => first.toUpperCase())
  if (!name) return 'Item'
  return /^[A-Za-z_]/.test(name) ? name : `T${name}`
}

// "firstName" / "first-name" → "first_name"
export function toSnakeCase(text) {
  const name = String(text)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
  if (!name) return 'field'
  return /^[a-z_]/.test(name) ? name : `f_${name}`
}

// "first-name" → "firstName"
export function toCamelCase(text) {
  const pascal = toPascalCase(text)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// "companies" → "company"
function singular(text) {
  if (/ies$/i.test(text)) return text.slice(0, -3) + 'y'
  if (/(ss|us)$/i.test(text)) return text
  if (/s$/i.test(text)) return text.slice(0, -1)
  return text + 'Item'
}

// A type is one of:
//   { kind: 'string' | 'integer' | 'number' | 'boolean' | 'null' | 'unknown' }
//   { kind: 'object', name }            (fields are in model.classes[name])
//   { kind: 'array', items: <type> }
//   { kind: 'union', types: [<type>, ...] }
// Returns { root: <type>, classes: Map(name → [{ key, type, optional }]) }
export function inferModel(data, rootName = 'Root') {
  const classes = new Map()

  function uniqueName(base) {
    let name = base
    let n = 2
    while (classes.has(name)) name = `${base}${n++}`
    return name
  }

  function objectType(objects, hint) {
    const name = uniqueName(toPascalCase(hint))
    classes.set(name, []) // reserve now, so parents are listed before children
    const keys = []
    for (const object of objects) {
      for (const key of Object.keys(object)) if (!keys.includes(key)) keys.push(key)
    }
    classes.set(
      name,
      keys.map((key) => {
        const values = objects.filter((object) => key in object).map((object) => object[key])
        return { key, type: typeOf(values, key), optional: values.length < objects.length }
      })
    )
    return { kind: 'object', name }
  }

  function typeOf(values, hint) {
    const types = []
    const add = (type) => {
      if (!types.some((t) => sameType(t, type))) types.push(type)
    }
    const objects = values.filter(isPlainObject)
    if (objects.length) add(objectType(objects, hint))
    const arrays = values.filter(Array.isArray)
    if (arrays.length) {
      const items = arrays.flat()
      add({ kind: 'array', items: items.length ? typeOf(items, singular(hint)) : { kind: 'unknown' } })
    }
    let hasInteger = false
    let hasFloat = false
    for (const value of values) {
      if (value === null) add({ kind: 'null' })
      else if (typeof value === 'string') add({ kind: 'string' })
      else if (typeof value === 'boolean') add({ kind: 'boolean' })
      else if (typeof value === 'number') {
        if (Number.isInteger(value)) hasInteger = true
        else hasFloat = true
      }
    }
    if (hasFloat) add({ kind: 'number' })
    else if (hasInteger) add({ kind: 'integer' })
    if (types.length === 0) return { kind: 'unknown' }
    return types.length === 1 ? types[0] : { kind: 'union', types }
  }

  const root = typeOf([data], rootName)
  return { root, classes }
}

function sameType(a, b) {
  if (a.kind !== b.kind) return false
  if (a.kind === 'object') return a.name === b.name
  if (a.kind === 'array') return sameType(a.items, b.items)
  return a.kind !== 'union'
}

// Splits "X | null" into { base: X, nullable: true }
export function splitNullable(type) {
  if (type.kind === 'null') return { base: { kind: 'unknown' }, nullable: true }
  if (type.kind !== 'union') return { base: type, nullable: false }
  const rest = type.types.filter((t) => t.kind !== 'null')
  const nullable = rest.length < type.types.length
  return { base: rest.length === 1 ? rest[0] : { kind: 'union', types: rest }, nullable }
}

// ---------- JSON Schema (draft 2020-12) ----------
export function modelToJsonSchema(model, title = 'Root') {
  const defs = {}

  function schemaFor(type) {
    switch (type.kind) {
      case 'string':
      case 'integer':
      case 'number':
      case 'boolean':
      case 'null':
        return { type: type.kind }
      case 'array':
        return { type: 'array', items: schemaFor(type.items) }
      case 'object':
        return objectSchema(type.name)
      case 'union': {
        const simple = type.types.every((t) => ['string', 'integer', 'number', 'boolean', 'null'].includes(t.kind))
        if (simple) return { type: type.types.map((t) => t.kind) }
        return { anyOf: type.types.map(schemaFor) }
      }
      default:
        return {}
    }
  }

  function objectSchema(name) {
    if (defs[name]) return defs[name]
    const fields = model.classes.get(name) || []
    const schema = { type: 'object', properties: {}, required: [] }
    defs[name] = schema
    for (const field of fields) {
      schema.properties[field.key] = schemaFor(field.type)
      if (!field.optional) schema.required.push(field.key)
    }
    if (schema.required.length === 0) delete schema.required
    return schema
  }

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title,
    ...schemaFor(model.root),
  }
}
