// Small helpers shared by all tool pages (Formatter, Viewer, Validator, converters).
import { useMemo } from 'react'
import { safeFix } from './safeFix.js'

// Finds the line and column of a JSON.parse error, and the text of that line.
// Returns { line, column, snippet, pointer } or null.
export function getErrorLocation(text, err) {
  let line
  let column
  const message = err?.message || ''
  const lineMatch = message.match(/line (\d+) column (\d+)/)
  const posMatch = message.match(/position (\d+)/)
  let position = posMatch ? Number(posMatch[1]) : -1

  // Chrome sometimes gives no position, only a short piece of the text, like:
  // Unexpected token 'h', ..."1,\n  "b": hello\n}" is not valid JSON
  // The piece starts 10 characters before the problem when it begins with "...".
  const tokenMatch = message.match(/^Unexpected token '(.)', (\.\.\.)?"([\s\S]*?)"(\.\.\.)? is not valid JSON/)
  if (!lineMatch && position === -1 && tokenMatch) {
    const [, token, cutAtStart, piece] = tokenMatch
    const pieceStart = text.indexOf(piece)
    if (pieceStart !== -1) {
      position = cutAtStart ? pieceStart + 10 : pieceStart + piece.indexOf(token)
    }
  }

  if (lineMatch) {
    line = Number(lineMatch[1])
    column = Number(lineMatch[2])
  } else if (position !== -1) {
    const before = text.slice(0, position)
    line = before.split('\n').length
    column = before.length - before.lastIndexOf('\n')
  } else {
    return null
  }

  // Show at most 60 characters around the problem, so long lines still fit.
  const fullLine = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
  const start = Math.max(0, column - 40)
  const snippet = fullLine.slice(start, start + 60)
  const pointer = ' '.repeat(Math.max(0, column - 1 - start)) + '^'

  return { line, column, snippet, pointer }
}

// Inputs bigger than this are not checked while typing, to keep typing fast.
const LIVE_CHECK_LIMIT = 500 * 1024

// Checks JSON while the user types. Returns null (empty), { valid: true }
// or { valid: false, location }.
export function useLiveJsonCheck(text) {
  return useMemo(() => {
    if (!text.trim() || text.length > LIVE_CHECK_LIMIT) return null
    try {
      JSON.parse(text)
      return { valid: true }
    } catch (err) {
      return { valid: false, location: getErrorLocation(text, err) }
    }
  }, [text])
}

// "1.2 KB", "530 B", ...
export function formatSize(text) {
  const bytes = new Blob([text]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

// "12 lines · 1.2 KB", or the empty text when there is nothing.
export function describeText(text, emptyText = 'Empty') {
  if (!text) return emptyText
  return `${text.split('\n').length} lines · ${formatSize(text)}`
}

// Saves text as a file on the visitor's computer.
export function downloadText(text, fileName, mimeType) {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

// Reads a dropped or uploaded file. Throws an Error with a friendly message.
export async function readTextFile(file, maxMB = 5) {
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`File is too large. Please use a file smaller than ${maxMB} MB.`)
  }
  try {
    return await file.text()
  } catch {
    throw new Error('Could not read this file. Please try another file.')
  }
}

// Friendly names for each kind of fix that safeFix can make.
export const FIX_LABELS = {
  trailingCommas: 'trailing comma removed',
  missingCommas: 'missing comma added',
  missingColons: 'missing colon added',
  wrongColons: '"," or "=" changed to ":"',
  lineBreaks: 'line break inside a string escaped',
  controlChars: 'tab or control character escaped',
  comments: 'comment removed',
  singleQuotes: 'single quote changed to double quote',
  smartQuotes: 'curly quote changed to straight quote',
  unquotedKeys: 'quotes added around a key',
  pythonValues: 'True/False/None changed to true/false/null',
  missingBrackets: 'missing closing bracket added',
  missingQuotes: 'missing closing quote added',
}

// Turns a safeFix report into a sentence like:
// "Fixed 3 problems: trailing comma removed (×2), missing colon added."
export function describeFixes(report) {
  const parts = Object.entries(report).map(([kind, count]) => {
    const label = FIX_LABELS[kind] || kind
    return count > 1 ? `${label} (×${count})` : label
  })
  const total = Object.values(report).reduce((sum, count) => sum + count, 0)
  if (total === 0) return 'JSON was cleaned up and formatted.'
  return `Fixed ${total} problem${total > 1 ? 's' : ''}: ${parts.join(', ')}.`
}

// Parses JSON. On failure throws an Error with a friendly message and
// err.location (line/column) so the page can mark the broken line.
export function parseJsonOrThrow(text, what = 'input') {
  try {
    return JSON.parse(text)
  } catch (err) {
    const location = getErrorLocation(text, err)
    const where = location && !/line \d+/.test(err.message) ? ` (line ${location.line}, column ${location.column})` : ''
    const error = new Error(`The ${what} is not valid JSON${where}. ${err.message}`)
    error.location = location
    throw error
  }
}

// Like parseJsonOrThrow, but first quietly repairs common mistakes
// (trailing commas, single quotes, comments ...). Returns { data, report }:
// report is null when the JSON was already valid, else safeFix's fix counts.
export function parseJsonLenient(text, what = 'input') {
  try {
    return { data: JSON.parse(text), report: null }
  } catch {
    try {
      const report = {}
      const data = JSON.parse(safeFix(text.trim(), report))
      return { data, report }
    } catch {
      parseJsonOrThrow(text, what) // throws with the error location of the original text
    }
  }
  return { data: undefined, report: null }
}

// ---------- Share links ----------
// The JSON is compressed and put after the # in the link. The part after #
// is never sent to any server, so shared JSON stays private between the
// people who have the link. Codes start with "z" (compressed) or "b" (plain).

function bytesToBase64Url(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(text) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '==='.slice((base64.length + 3) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function makeShareCode(text) {
  const bytes = new TextEncoder().encode(text)
  if (typeof CompressionStream === 'undefined') return 'b' + bytesToBase64Url(bytes)
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  const packed = new Uint8Array(await new Response(stream).arrayBuffer())
  return 'z' + bytesToBase64Url(packed)
}

export async function readShareCode(code) {
  const kind = code[0]
  const bytes = base64UrlToBytes(code.slice(1))
  if (kind === 'b') return new TextDecoder().decode(bytes)
  if (kind !== 'z' || typeof DecompressionStream === 'undefined') {
    throw new Error('This share link could not be opened in this browser.')
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new TextDecoder().decode(await new Response(stream).arrayBuffer())
}

// Downloads text from a link (the site must allow it with CORS).
export async function fetchText(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Please enter a full link that starts with https://')
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http and https links can be loaded.')
  let response
  try {
    response = await fetch(parsed.href)
  } catch {
    throw new Error(
      'Could not load this link. The website may not allow other sites to read it (CORS). Download the file and use Upload instead.'
    )
  }
  if (!response.ok) throw new Error(`The link returned an error (${response.status}).`)
  return response.text()
}

// Opens the browser's print dialog for a piece of text.
export function printText(text, title) {
  const win = window.open('', '_blank')
  if (!win) throw new Error('Please allow pop-ups to print.')
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  win.document.write(
    `<!doctype html><title>${title}</title><style>body{font:13px/1.5 Consolas,monospace;margin:24px}pre{white-space:pre-wrap;word-break:break-word}</style><pre>${safe}</pre>`
  )
  win.document.close()
  win.focus()
  win.print()
}

// Turns a js-yaml error into an Error with a friendly message and a location,
// so the page can mark the broken line. Other errors are returned unchanged.
export function yamlError(err, text) {
  if (!err?.mark) return err
  const line = err.mark.line + 1
  const column = err.mark.column + 1
  const lineText = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
  const start = Math.max(0, column - 40)
  const error = new Error(`This is not valid YAML (line ${line}, column ${column}). ${err.reason}.`)
  error.location = {
    line,
    column,
    snippet: lineText.slice(start, start + 60),
    pointer: ' '.repeat(Math.max(0, column - 1 - start)) + '^',
  }
  return error
}
