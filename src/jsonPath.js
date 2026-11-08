// A small JSONPath engine (no library, no eval). Supports:
//   $  .key  ['key']  [0]  [-1]  [*]  .*  ..key  ..*  [0,2]  ['a','b']
//   [1:3]  [::2]  [?(@.price < 10)]  [?(@.tags)]  [?(@.a == 'x' && @.b > 2)]
// Returns [{ path, value }].

function splitTopLevel(text, separator) {
  const parts = []
  let depth = 0
  let quote = null
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = null
    } else if (c === "'" || c === '"') quote = c
    else if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (depth === 0 && text.startsWith(separator, i)) {
      parts.push(text.slice(start, i))
      start = i + separator.length
      i += separator.length - 1
    }
  }
  parts.push(text.slice(start))
  return parts
}

function parseLiteral(text) {
  const t = text.trim()
  if (/^'.*'$|^".*"$/s.test(t)) return t.slice(1, -1).replace(/\\(['"\\])/g, '$1')
  if (t === 'true') return true
  if (t === 'false') return false
  if (t === 'null') return null
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(t)) return Number(t)
  throw new Error(`Cannot read the value "${t}" in the filter. Use numbers, 'text', true, false or null.`)
}

// Reads @.a.b or @['a'] relative to an item.
function readRelative(item, expr) {
  const path = expr.trim()
  if (!path.startsWith('@')) throw new Error(`Filter values must start with @, for example @.price (got "${path}").`)
  const steps = []
  const re = /\.([A-Za-z_$][\w$-]*)|\[\s*'([^']*)'\s*\]|\[\s*"([^"]*)"\s*\]|\[\s*(-?\d+)\s*\]/g
  let rest = path.slice(1)
  let match
  let consumed = 0
  while ((match = re.exec(rest)) && match.index === consumed) {
    steps.push(match[1] ?? match[2] ?? match[3] ?? Number(match[4]))
    consumed = re.lastIndex
  }
  if (consumed !== rest.length) throw new Error(`Cannot read "${path}" in the filter.`)
  let value = item
  for (const step of steps) {
    if (value === null || typeof value !== 'object') return { found: false }
    const key = typeof step === 'number' && Array.isArray(value) && step < 0 ? value.length + step : step
    if (!(key in value)) return { found: false }
    value = value[key]
  }
  return { found: true, value }
}

const OPERATORS = ['==', '!=', '<=', '>=', '<', '>']

function testCondition(item, condition) {
  const orParts = splitTopLevel(condition, '||')
  if (orParts.length > 1) return orParts.some((part) => testCondition(item, part))
  const andParts = splitTopLevel(condition, '&&')
  if (andParts.length > 1) return andParts.every((part) => testCondition(item, part))
  let text = condition.trim()
  if (text.startsWith('(') && text.endsWith(')')) return testCondition(item, text.slice(1, -1))
  const negate = text.startsWith('!')
  if (negate) text = text.slice(1).trim()
  const op = OPERATORS.find((o) => splitTopLevel(text, o).length === 2)
  let result
  if (!op) {
    result = readRelative(item, text).found
  } else {
    const [left, right] = splitTopLevel(text, op)
    const l = readRelative(item, left)
    if (!l.found) return negate
    const r = right.trim().startsWith('@') ? readRelative(item, right).value : parseLiteral(right)
    const a = l.value
    result =
      op === '==' ? a === r : op === '!=' ? a !== r : op === '<' ? a < r : op === '<=' ? a <= r : op === '>' ? a > r : a >= r
  }
  return negate ? !result : result
}

const childPath = (path, key) =>
  typeof key === 'number' ? `${path}[${key}]` : /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}['${key}']`

function children(node) {
  const { value, path } = node
  if (Array.isArray(value)) return value.map((v, i) => ({ value: v, path: childPath(path, i) }))
  if (value && typeof value === 'object') return Object.entries(value).map(([k, v]) => ({ value: v, path: childPath(path, k) }))
  return []
}

function descendants(node) {
  const out = [node]
  for (const child of children(node)) out.push(...descendants(child))
  return out
}

function applySelector(nodes, selector) {
  const s = selector.trim()
  const out = []
  for (const node of nodes) {
    const { value } = node
    if (s === '*') {
      out.push(...children(node))
    } else if (s.startsWith('?')) {
      const condition = s.slice(1).trim().replace(/^\((.*)\)$/s, '$1')
      for (const child of children(node)) if (testCondition(child.value, condition)) out.push(child)
    } else if (/^-?\d*\s*:\s*-?\d*(\s*:\s*-?\d*)?$/.test(s)) {
      if (!Array.isArray(value)) continue
      const [a, b, c] = s.split(':').map((x) => (x.trim() === '' ? undefined : Number(x)))
      const step = c || 1
      const len = value.length
      const norm = (n, fallback) => (n === undefined ? fallback : n < 0 ? Math.max(0, len + n) : Math.min(n, len))
      const start = norm(a, step > 0 ? 0 : len - 1)
      const end = norm(b, step > 0 ? len : -1)
      for (let i = start; step > 0 ? i < end : i > end; i += step) out.push({ value: value[i], path: childPath(node.path, i) })
    } else {
      for (const part of splitTopLevel(s, ',')) {
        const p = part.trim()
        if (/^-?\d+$/.test(p)) {
          if (!Array.isArray(value)) continue
          const index = Number(p) < 0 ? value.length + Number(p) : Number(p)
          if (index >= 0 && index < value.length) out.push({ value: value[index], path: childPath(node.path, index) })
        } else {
          const key = parseLiteral(p)
          if (value && typeof value === 'object' && !Array.isArray(value) && key in value) {
            out.push({ value: value[key], path: childPath(node.path, key) })
          }
        }
      }
    }
  }
  return out
}

export function queryJsonPath(data, expression) {
  const expr = expression.trim()
  if (!expr.startsWith('$')) throw new Error('A JSONPath must start with $, for example $.store.book[0].title')
  let nodes = [{ value: data, path: '$' }]
  let i = 1
  while (i < expr.length) {
    if (expr.startsWith('..', i)) {
      i += 2
      nodes = nodes.flatMap(descendants)
      if (expr[i] === '[') continue
      const m = /^(\*|[A-Za-z_$][\w$-]*)/.exec(expr.slice(i))
      if (!m) throw new Error(`Expected a key name after ".." at position ${i + 1}.`)
      nodes = applySelector(nodes, m[1] === '*' ? '*' : `'${m[1]}'`)
      i += m[1].length
    } else if (expr[i] === '.') {
      i++
      const m = /^(\*|[A-Za-z_$][\w$-]*)/.exec(expr.slice(i))
      if (!m) throw new Error(`Expected a key name after "." at position ${i + 1}.`)
      nodes = applySelector(nodes, m[1] === '*' ? '*' : `'${m[1]}'`)
      i += m[1].length
    } else if (expr[i] === '[') {
      let depth = 0
      let quote = null
      let j = i
      for (; j < expr.length; j++) {
        const c = expr[j]
        if (quote) {
          if (c === '\\') j++
          else if (c === quote) quote = null
        } else if (c === "'" || c === '"') quote = c
        else if (c === '[' || c === '(') depth++
        else if (c === ']' || c === ')') {
          depth--
          if (depth === 0 && c === ']') break
        }
      }
      if (j >= expr.length) throw new Error('A [ is not closed with ].')
      nodes = applySelector(nodes, expr.slice(i + 1, j))
      i = j + 1
    } else if (/\s/.test(expr[i])) {
      i++
    } else {
      throw new Error(`Unexpected "${expr[i]}" at position ${i + 1}. Use . or [ ] between parts.`)
    }
  }
  return nodes
}
