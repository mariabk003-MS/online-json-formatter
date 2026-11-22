// Pure helpers for the JSON Editor. Every function returns a new value and
// never changes the one it gets, so undo/redo can keep old versions.
// A path is an array of keys: strings for objects, numbers for arrays.

export const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

export function typeOf(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value === 'object' ? 'object' : typeof value
}

export function getIn(root, path) {
  return path.reduce((node, key) => (node == null ? undefined : node[key]), root)
}

export function setIn(root, path, value) {
  if (path.length === 0) return value
  const [key, ...rest] = path
  const child = setIn(root[key], rest, value)
  if (Array.isArray(root)) {
    const copy = root.slice()
    copy[key] = child
    return copy
  }
  return { ...root, [key]: child }
}

export function deleteIn(root, path) {
  if (path.length === 0) throw new Error('The root cannot be deleted.')
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  const parent = getIn(root, parentPath)
  let next
  if (Array.isArray(parent)) next = parent.filter((_, i) => i !== key)
  else {
    next = { ...parent }
    delete next[key]
  }
  return setIn(root, parentPath, next)
}

// Renames an object key and keeps its position.
export function renameKey(root, path, newKey) {
  const parentPath = path.slice(0, -1)
  const oldKey = path[path.length - 1]
  if (newKey === oldKey) return root
  const parent = getIn(root, parentPath)
  if (!isObject(parent)) throw new Error('Only object keys can be renamed.')
  if (Object.prototype.hasOwnProperty.call(parent, newKey)) throw new Error(`The key "${newKey}" already exists here.`)
  const next = {}
  for (const [k, v] of Object.entries(parent)) next[k === oldKey ? newKey : k] = v
  return setIn(root, parentPath, next)
}

// Adds an empty item to an array, or a new "key" to an object. Returns { root, path } of the new child.
export function addChild(root, path) {
  const target = getIn(root, path)
  if (Array.isArray(target)) {
    return { root: setIn(root, path, [...target, '']), path: [...path, target.length] }
  }
  if (isObject(target)) {
    let key = 'key'
    for (let n = 2; Object.prototype.hasOwnProperty.call(target, key); n++) key = `key${n}`
    return { root: setIn(root, path, { ...target, [key]: '' }), path: [...path, key] }
  }
  throw new Error('Items can only be added to objects and arrays.')
}

// Inserts a copy of an item right after it (arrays and objects).
export function duplicate(root, path) {
  if (path.length === 0) throw new Error('The root cannot be duplicated.')
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  const parent = getIn(root, parentPath)
  const copy = structuredClone(parent[key])
  if (Array.isArray(parent)) {
    const next = [...parent.slice(0, key + 1), copy, ...parent.slice(key + 1)]
    return setIn(root, parentPath, next)
  }
  let newKey = `${key}_copy`
  for (let n = 2; Object.prototype.hasOwnProperty.call(parent, newKey); n++) newKey = `${key}_copy${n}`
  const next = {}
  for (const [k, v] of Object.entries(parent)) {
    next[k] = v
    if (k === key) next[newKey] = copy
  }
  return setIn(root, parentPath, next)
}

// Moves an array item up (-1) or down (+1).
export function moveItem(root, path, step) {
  const parentPath = path.slice(0, -1)
  const index = path[path.length - 1]
  const parent = getIn(root, parentPath)
  if (!Array.isArray(parent)) throw new Error('Only array items can be moved.')
  const to = index + step
  if (to < 0 || to >= parent.length) return root
  const next = parent.slice()
  ;[next[index], next[to]] = [next[to], next[index]]
  return setIn(root, parentPath, next)
}

// Converts a value to another JSON type, keeping as much as makes sense.
export function convertType(value, type) {
  const current = typeOf(value)
  if (current === type) return value
  switch (type) {
    case 'string':
      return current === 'object' || current === 'array' ? JSON.stringify(value) : value === null ? '' : String(value)
    case 'number': {
      const n = typeof value === 'boolean' ? Number(value) : Number(value)
      return Number.isFinite(n) ? n : 0
    }
    case 'boolean':
      return value === 'false' || value === '0' || value === '' ? false : Boolean(value)
    case 'null':
      return null
    case 'array':
      return current === 'object' ? Object.values(value) : value === null || value === '' ? [] : [value]
    case 'object':
      return current === 'array' ? Object.fromEntries(value.map((v, i) => [String(i), v])) : {}
    default:
      return value
  }
}

// ["address", "city"] → $.address.city ; ["tags", 0] → $.tags[0] ; ["first name"] → $["first name"]
export function pathToString(path) {
  return '$' + path.map((key) => (typeof key === 'number' ? `[${key}]` : /^[A-Za-z_$][\w$]*$/.test(key) ? `.${key}` : `[${JSON.stringify(key)}]`)).join('')
}

export function countNodes(value) {
  if (value === null || typeof value !== 'object') return 1
  let n = 1
  for (const child of Object.values(value)) n += countNodes(child)
  return n
}
