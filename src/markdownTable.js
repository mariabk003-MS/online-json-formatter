// JSON → GitHub Flavored Markdown (GFM) table, plus a tiny renderer of that
// table back to safe HTML for the live preview.

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// { user: { name: 'Emily' } } → { 'user.name': 'Emily' }
function flatten(object, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (isObject(value) && Object.keys(value).length) flatten(value, name, out)
    else out[name] = value
  }
  return out
}

// One cell's text. Lists of plain values are joined with commas; other objects
// and arrays are written as compact JSON.
function cellText(value) {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value) && value.every((item) => item === null || typeof item !== 'object')) {
    return value.map((item) => (item === null ? 'null' : String(item))).join(', ')
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

// A pipe would end the cell and a line break would end the row.
export function escapeCell(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r\n|\r|\n/g, '<br>')
    .trim()
}

const isNumber = (value) => typeof value === 'number'

function headersOf(rows) {
  const headers = []
  const seen = new Set()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key)
        headers.push(key)
      }
    }
  }
  return headers
}

// align: 'none' | 'left' | 'center' | 'right' | 'numbers' (numbers right, text left)
// pad: line the columns up with spaces so the raw Markdown is easy to read
export function jsonToMarkdownTable(data, { align = 'none', pad = true, flat = true } = {}) {
  let headers
  let rows
  if (Array.isArray(data)) {
    if (!data.length) throw new Error('The JSON array is empty, so there is nothing to put in a table.')
    const objects = data.map((item) => (isObject(item) ? (flat ? flatten(item) : item) : { value: item }))
    headers = headersOf(objects)
    rows = objects.map((row) => headers.map((h) => row[h]))
  } else if (isObject(data)) {
    const object = flat ? flatten(data) : data
    headers = ['Key', 'Value']
    rows = Object.entries(object).map(([key, value]) => [key, value])
  } else {
    throw new Error('Please enter a JSON array or object. A single value has nothing to put in a table.')
  }
  if (!headers.length) throw new Error('The objects have no keys, so there are no columns to make.')

  const head = headers.map((h) => escapeCell(String(h)) || ' ')
  const body = rows.map((row) => row.map((value) => escapeCell(cellText(value))))

  // Right-align a column when every filled cell in it is a number.
  const numeric = headers.map((_, col) => {
    const values = rows.map((row) => row[col]).filter((v) => v !== null && v !== undefined && v !== '')
    return values.length > 0 && values.every(isNumber)
  })
  const sides = headers.map((_, col) => (align === 'numbers' ? (numeric[col] ? 'right' : 'left') : align))

  const widths = headers.map((_, col) =>
    pad ? Math.max(3, [...head[col]].length, ...body.map((row) => [...row[col]].length)) : 3
  )
  const fill = (text, col) => {
    if (!pad) return text
    const space = widths[col] - [...text].length
    if (space <= 0) return text
    if (sides[col] === 'right') return ' '.repeat(space) + text
    if (sides[col] === 'center') return ' '.repeat(Math.floor(space / 2)) + text + ' '.repeat(Math.ceil(space / 2))
    return text + ' '.repeat(space)
  }
  const rule = (col) => {
    const width = widths[col]
    if (sides[col] === 'left') return ':' + '-'.repeat(width - 1)
    if (sides[col] === 'right') return '-'.repeat(width - 1) + ':'
    if (sides[col] === 'center') return ':' + '-'.repeat(width - 2) + ':'
    return '-'.repeat(width)
  }
  const line = (cells) => `| ${cells.join(' | ')} |`

  const lines = [
    line(head.map(fill)),
    line(headers.map((_, col) => rule(col))),
    ...body.map((row) => line(row.map(fill))),
  ]
  return { markdown: lines.join('\n') + '\n', rowCount: rows.length, columnCount: headers.length }
}

// ---------- preview: our own Markdown table → safe HTML ----------
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

// Splits "| a | b \| c |" into ["a", "b | c"], honoring \| and \\ escapes.
export function splitRow(line) {
  const cells = []
  let current = ''
  const text = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '\\' && (text[i + 1] === '|' || text[i + 1] === '\\')) {
      current += text[i + 1]
      i++
    } else if (ch === '|') {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

export function markdownTableToHtml(markdown) {
  const lines = markdown.split('\n').filter((l) => l.trim())
  if (lines.length < 2) return ''
  const sides = splitRow(lines[1]).map((rule) => {
    const left = rule.startsWith(':')
    const right = rule.endsWith(':')
    return left && right ? 'center' : right ? 'right' : left ? 'left' : ''
  })
  // Values are escaped first; only our own <br> line breaks become real ones.
  const cell = (tag, text, col) => {
    const style = sides[col] ? ` style="text-align:${sides[col]}"` : ''
    return `<${tag}${style}>${escapeHtml(text).replace(/&lt;br&gt;/g, '<br>')}</${tag}>`
  }
  const head = splitRow(lines[0]).map((t, col) => cell('th', t, col)).join('')
  const body = lines
    .slice(2)
    .map((l) => `<tr>${splitRow(l).map((t, col) => cell('td', t, col)).join('')}</tr>`)
    .join('')
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}
