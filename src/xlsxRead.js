// Reads .xlsx files in the browser: unzips with DecompressionStream and parses
// the sheet XML. No library, so the page stays small. Used by Excel to JSON.

// ---------- ZIP ----------
async function inflateRaw(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function unzip(buffer) {
  const data = new Uint8Array(buffer)
  const view = new DataView(buffer)
  let eocd = -1
  for (let i = data.length - 22; i >= Math.max(0, data.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('This is not an .xlsx file. Save it in Excel as "Excel Workbook (*.xlsx)" and try again.')
  const count = view.getUint16(eocd + 10, true)
  let offset = view.getUint32(eocd + 16, true)
  const files = new Map()
  const decoder = new TextDecoder()
  for (let n = 0; n < count; n++) {
    if (view.getUint32(offset, true) !== 0x02014b50) break
    const method = view.getUint16(offset + 10, true)
    const size = view.getUint32(offset + 20, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const local = view.getUint32(offset + 42, true)
    const name = decoder.decode(data.subarray(offset + 46, offset + 46 + nameLength))
    files.set(name, { method, size, local })
    offset += 46 + nameLength + extraLength + commentLength
  }
  return async function read(name) {
    const entry = files.get(name)
    if (!entry) return null
    const start = entry.local + 30 + view.getUint16(entry.local + 26, true) + view.getUint16(entry.local + 28, true)
    const raw = data.subarray(start, start + entry.size)
    if (entry.method === 0) return decoder.decode(raw)
    if (entry.method === 8) return decoder.decode(await inflateRaw(raw))
    throw new Error('This .xlsx file uses an unsupported compression method.')
  }
}

// ---------- XML helpers ----------
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
// XML reads CRLF as LF; Excel writes control characters as _xHHHH_.
const decodeXml = (text) =>
  text.replace(/\r\n?/g, '\n').replace(/_x([0-9A-F]{4})_/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()])
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`))
  return m ? decodeXml(m[1]) : null
}
// Text of a string item: all <t> runs, skipping phonetic (<rPh>) hints.
const textOf = (xml) =>
  decodeXml(
    xml.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '').replace(/<t(?:\s[^>]*)?\/>/g, '')
      .match(/<t(?:\s[^>]*)?>[\s\S]*?<\/t>/g)?.map((t) => t.replace(/^<t[^>]*>|<\/t>$/g, '')).join('') ?? ''
  )

// ---------- Dates ----------
const DATE_FORMAT_IDS = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 30, 36, 45, 46, 47, 50, 57])
function formatKind(code) {
  if (!code) return null
  const clean = code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '')
  if (!/[dmyhs]/i.test(clean) || /^general$/i.test(clean.trim())) return null
  const hasDate = /[dy]/i.test(clean) || (/m/i.test(clean) && !/[hs]/i.test(clean))
  const hasTime = /[hs]/i.test(clean)
  return hasDate && hasTime ? 'datetime' : hasDate ? 'date' : 'time'
}
const pad = (n) => String(n).padStart(2, '0')
function excelDate(serial, kind, date1904) {
  const days = date1904 ? serial + 1462 : serial
  const ms = Math.round((days - 25569) * 86400000)
  const d = new Date(ms)
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  if (kind === 'time') return time
  if (kind === 'date') return date
  return `${date}T${time}`
}

const colIndex = (ref) => {
  let n = 0
  for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + ch.charCodeAt(0) - 64
  return n - 1
}
export const colName = (index) => {
  let s = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

// Returns { sheets: [{ name, rows }] } where rows is a 2D array of cell values
// (string, number, boolean or null).
export async function readXlsx(buffer) {
  const read = await unzip(buffer)
  const workbook = await read('xl/workbook.xml')
  if (!workbook) throw new Error('This file has no workbook inside. Is it a real .xlsx file?')
  const date1904 = /<workbookPr\b[^>]*\bdate1904="(1|true)"/.test(workbook)

  const rels = (await read('xl/_rels/workbook.xml.rels')) || ''
  const targets = new Map()
  for (const tag of rels.match(/<Relationship\b[^>]*>/g) || []) targets.set(attr(tag, 'Id'), attr(tag, 'Target'))

  const shared = []
  const sst = await read('xl/sharedStrings.xml')
  if (sst) for (const si of sst.match(/<si>[\s\S]*?<\/si>/g) || []) shared.push(textOf(si))

  const styles = (await read('xl/styles.xml')) || ''
  const customFormats = new Map()
  for (const tag of styles.match(/<numFmt\b[^>]*>/g) || []) customFormats.set(Number(attr(tag, 'numFmtId')), attr(tag, 'formatCode'))
  const xfKinds = []
  const cellXfs = styles.match(/<cellXfs\b[\s\S]*?<\/cellXfs>/)?.[0] || ''
  for (const tag of cellXfs.match(/<xf\b[^>]*>/g) || []) {
    const id = Number(attr(tag, 'numFmtId') || 0)
    xfKinds.push(customFormats.has(id) ? formatKind(customFormats.get(id)) : DATE_FORMAT_IDS.has(id) ? (id >= 18 && id <= 21 ? 'time' : id === 22 ? 'datetime' : 'date') : null)
  }

  const sheets = []
  for (const tag of workbook.match(/<sheet\b[^>]*>/g) || []) {
    const name = attr(tag, 'name')
    let target = targets.get(attr(tag, 'r:id')) || ''
    target = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`
    const xml = await read(target)
    if (!xml) continue
    const rows = []
    for (const rowXml of xml.match(/<row\b[\s\S]*?(?:<\/row>|\/>)/g) || []) {
      const rowNumber = Number(attr(rowXml.match(/<row\b[^>]*>/)[0], 'r')) - 1 || rows.length
      const cells = []
      for (const cell of rowXml.match(/<c\b[^>]*?(?:\/>|>[\s\S]*?<\/c>)/g) || []) {
        const open = cell.match(/<c\b[^>]*>/)[0]
        const ref = attr(open, 'r')
        const index = ref ? colIndex(ref) : cells.length
        const type = attr(open, 't')
        const v = cell.match(/<v>([\s\S]*?)<\/v>/)?.[1]
        let value = null
        if (type === 's') value = v != null ? shared[Number(v)] ?? '' : null
        else if (type === 'inlineStr') value = textOf(cell.match(/<is>[\s\S]*?<\/is>/)?.[0] || '')
        else if (type === 'str') value = v != null ? decodeXml(v) : null
        else if (type === 'b') value = v === '1'
        else if (type === 'e') value = v != null ? decodeXml(v) : null
        else if (type === 'd') value = v != null ? decodeXml(v) : null
        else if (v != null && v !== '') {
          const number = Number(v)
          const kind = xfKinds[Number(attr(open, 's') || 0)]
          value = kind ? excelDate(number, kind, date1904) : number
        }
        cells[index] = value
      }
      rows[rowNumber] = cells
    }
    // Fill gaps so every row is an array.
    for (let i = 0; i < rows.length; i++) rows[i] = rows[i] || []
    sheets.push({ name, rows })
  }
  if (!sheets.length) throw new Error('No worksheets were found in this file.')
  return { sheets }
}

// Turns a 2D array into JSON-ready data.
//   header: use the first row as keys     empty: 'skip' | 'null' for empty cells
export function rowsToJson(rows, { header = true, empty = 'skip' } = {}) {
  const width = Math.max(0, ...rows.map((r) => r.length))
  const isEmptyRow = (r) => !r || r.every((v) => v == null || v === '')
  const body = rows.slice(header ? 1 : 0)
  while (body.length && isEmptyRow(body[body.length - 1])) body.pop()
  if (!header) {
    return body.map((r) => Array.from({ length: width }, (_, i) => (r[i] == null || r[i] === '' ? null : r[i])))
  }
  const used = new Map()
  const keys = Array.from({ length: width }, (_, i) => {
    let key = rows[0]?.[i] == null || rows[0][i] === '' ? `Column ${colName(i)}` : String(rows[0][i]).trim()
    const n = (used.get(key) || 0) + 1
    used.set(key, n)
    return n > 1 ? `${key}_${n}` : key
  })
  return body
    .filter((r) => !isEmptyRow(r))
    .map((r) => {
      const item = {}
      keys.forEach((key, i) => {
        const value = r[i]
        if (value == null || value === '') {
          if (empty === 'null') item[key] = null
        } else item[key] = value
      })
      return item
    })
}
