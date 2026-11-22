// JSON → HTML <table> markup. Every value is escaped, so the result is safe to
// paste into a page (and to show in the preview).

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// { user: { name: 'Emily' } } → { 'user.name': 'Emily' }; arrays stay as JSON text.
function flatten(object, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (isObject(value) && Object.keys(value).length) flatten(value, name, out)
    else out[name] = Array.isArray(value) || isObject(value) ? JSON.stringify(value) : value
  }
  return out
}

const headersOf = (rows) => {
  const headers = []
  for (const row of rows) for (const key of Object.keys(row)) if (!headers.includes(key)) headers.push(key)
  return headers
}

const text = (value) => (value === null || value === undefined ? '' : escapeHtml(value))

export const TABLE_CSS = `<style>
  table.json-table { border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 14px; }
  table.json-table th, table.json-table td { border: 1px solid #d0d7de; padding: 6px 10px; text-align: left; vertical-align: top; }
  table.json-table th { background: #f6f8fa; font-weight: 600; }
</style>
`

// ---------- flat mode: one row per item, nested keys become "a.b" columns ----------
function flatTable(rows, indent, cls) {
  const headers = headersOf(rows)
  const pad = (n) => indent.repeat(n)
  const lines = [`<table${cls}>`, `${pad(1)}<thead>`, `${pad(2)}<tr>`]
  for (const h of headers) lines.push(`${pad(3)}<th>${escapeHtml(h)}</th>`)
  lines.push(`${pad(2)}</tr>`, `${pad(1)}</thead>`, `${pad(1)}<tbody>`)
  for (const row of rows) {
    lines.push(`${pad(2)}<tr>`)
    for (const h of headers) lines.push(`${pad(3)}<td>${text(row[h])}</td>`)
    lines.push(`${pad(2)}</tr>`)
  }
  lines.push(`${pad(1)}</tbody>`, '</table>')
  return lines
}

// ---------- nested mode: objects and arrays become tables inside cells ----------
function nestedValue(value, depth, indent, cls) {
  if (Array.isArray(value)) {
    if (value.length && value.every(isObject)) return nestedRows(value, depth, indent, cls)
    if (value.some((v) => v !== null && typeof v === 'object')) return nestedList(value, depth, indent, cls)
    return [text(value.join(', '))]
  }
  if (isObject(value)) return nestedKeyValue(value, depth, indent, cls)
  return [text(value)]
}

function cell(tag, value, depth, indent, cls) {
  const pad = indent.repeat(depth)
  const inner = nestedValue(value, depth + 1, indent, cls)
  if (inner.length === 1) return [`${pad}<${tag}>${inner[0]}</${tag}>`]
  return [`${pad}<${tag}>`, ...inner, `${pad}</${tag}>`]
}

function nestedRows(rows, depth, indent, cls) {
  const pad = (n) => indent.repeat(depth + n)
  const headers = headersOf(rows)
  const lines = [`${pad(0)}<table${cls}>`, `${pad(1)}<thead>`, `${pad(2)}<tr>`]
  for (const h of headers) lines.push(`${pad(3)}<th>${escapeHtml(h)}</th>`)
  lines.push(`${pad(2)}</tr>`, `${pad(1)}</thead>`, `${pad(1)}<tbody>`)
  for (const row of rows) {
    lines.push(`${pad(2)}<tr>`)
    for (const h of headers) lines.push(...cell('td', row[h], depth + 3, indent, cls))
    lines.push(`${pad(2)}</tr>`)
  }
  lines.push(`${pad(1)}</tbody>`, `${pad(0)}</table>`)
  return lines
}

function nestedKeyValue(object, depth, indent, cls) {
  const pad = (n) => indent.repeat(depth + n)
  const lines = [`${pad(0)}<table${cls}>`, `${pad(1)}<tbody>`]
  for (const [key, value] of Object.entries(object)) {
    lines.push(`${pad(2)}<tr>`, `${pad(3)}<th>${escapeHtml(key)}</th>`)
    lines.push(...cell('td', value, depth + 3, indent, cls))
    lines.push(`${pad(2)}</tr>`)
  }
  lines.push(`${pad(1)}</tbody>`, `${pad(0)}</table>`)
  return lines
}

function nestedList(items, depth, indent, cls) {
  const pad = (n) => indent.repeat(depth + n)
  const lines = [`${pad(0)}<ul>`]
  for (const item of items) lines.push(...cell('li', item, depth + 1, indent, cls))
  lines.push(`${pad(0)}</ul>`)
  return lines
}

// mode: 'flat' | 'nested'; css: add a <style> block and class="json-table"
export function jsonToHtmlTable(data, { mode = 'flat', css = false } = {}) {
  const indent = '  '
  const cls = css ? ' class="json-table"' : ''
  let lines
  let rowCount
  if (Array.isArray(data)) {
    if (!data.length) throw new Error('The JSON array is empty, so there is nothing to put in a table.')
    if (mode === 'nested' && data.every(isObject)) {
      lines = nestedRows(data, 0, indent, cls)
    } else {
      const rows = data.map((item) => (isObject(item) ? (mode === 'flat' ? flatten(item) : item) : { value: item }))
      lines = mode === 'flat' ? flatTable(rows, indent, cls) : nestedRows(rows, 0, indent, cls)
    }
    rowCount = data.length
  } else if (isObject(data)) {
    lines = mode === 'flat' ? flatKeyValue(flatten(data), indent, cls) : nestedKeyValue(data, 0, indent, cls)
    rowCount = Object.keys(mode === 'flat' ? flatten(data) : data).length
  } else {
    throw new Error('Please enter a JSON array or object. A single value has nothing to put in a table.')
  }
  return { html: (css ? TABLE_CSS : '') + lines.join('\n') + '\n', rowCount }
}

function flatKeyValue(object, indent, cls) {
  const lines = [`<table${cls}>`, `${indent}<tbody>`]
  for (const [key, value] of Object.entries(object)) {
    lines.push(`${indent.repeat(2)}<tr>`, `${indent.repeat(3)}<th>${escapeHtml(key)}</th>`, `${indent.repeat(3)}<td>${text(value)}</td>`, `${indent.repeat(2)}</tr>`)
  }
  lines.push(`${indent}</tbody>`, '</table>')
  return lines
}
