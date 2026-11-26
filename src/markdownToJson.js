// Markdown (GFM) tables → JSON. Finds every table in the text, so you can paste
// a whole README section; text around the tables is ignored.
import { splitRow } from './markdownTable.js'

// | --- | :---: | ---: |   (outer pipes are optional in GFM)
const DELIMITER = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/
const JSON_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/

// **bold**, *italic*, `code`, [text](url), ~~strike~~ → plain text
function plainText(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(\*|_)(.+?)\1/g, '$2')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
}

function cellValue(raw, { types, empty, breaks, strip }) {
  let text = breaks ? raw.replace(/<br\s*\/?>/gi, '\n') : raw
  if (strip) text = plainText(text)
  if (text === '') return empty === 'null' ? null : empty === 'skip' ? undefined : ''
  if (types) {
    if (text === 'true') return true
    if (text === 'false') return false
    if (text === 'null') return null
    // Keep codes like 007 and very long numbers as text, so nothing changes.
    if (JSON_NUMBER.test(text) && text.replace(/[-.eE+]/g, '').length <= 15) return Number(text)
  }
  return text
}

// "Name", "Name", "" → "Name", "Name_2", "column3"
function uniqueKeys(headers, strip) {
  const seen = new Map()
  return headers.map((header, index) => {
    let key = (strip ? plainText(header) : header).trim() || `column${index + 1}`
    const count = (seen.get(key) || 0) + 1
    seen.set(key, count)
    if (count > 1) key = `${key}_${count}`
    return key
  })
}

// Returns { tables: [[{...}, ...], ...] }. Each table is an array of row objects.
// options: types (numbers / true / false / null), empty ('string' | 'null' | 'skip'),
//          breaks (<br> → line break), strip (remove **bold**, links, `code`)
export function markdownTablesToJson(text, options = {}) {
  const opts = { types: true, empty: 'string', breaks: true, strip: false, ...options }
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  const tables = []
  for (let i = 0; i < lines.length - 1; i++) {
    const header = lines[i]
    if (!header.includes('|') || !DELIMITER.test(lines[i + 1])) continue
    const keys = uniqueKeys(splitRow(header), opts.strip)
    const columns = splitRow(lines[i + 1]).length
    if (columns !== keys.length) continue // GFM: header and delimiter must have the same number of cells
    const rows = []
    let j = i + 2
    for (; j < lines.length && lines[j].trim() && lines[j].includes('|'); j++) {
      const cells = splitRow(lines[j])
      const row = {}
      keys.forEach((key, c) => {
        const value = cellValue(cells[c] ?? '', opts) // missing cells are empty; extra cells are ignored (GFM)
        if (value !== undefined) row[key] = value
      })
      rows.push(row)
    }
    tables.push(rows)
    i = j - 1
  }
  if (!tables.length) {
    throw new Error('No Markdown table found. A table needs a header row, then a line like | --- | --- |, then the data rows.')
  }
  return { tables }
}
