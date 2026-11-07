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
