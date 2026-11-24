// TOML ⇄ JSON on top of smol-toml (TOML 1.0). Handles what the two formats do
// not share: JSON has no dates, inf or nan; TOML has no null and needs an
// object (a table) at the top.
import { parse, stringify } from 'smol-toml'

// Turns a smol-toml error into one with line/column, so the line can be marked red.
function tomlError(err, text) {
  if (!err?.line) return err
  const { line, column } = err
  const lineText = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
  const start = Math.max(0, column - 40)
  const reason = String(err.message).split('\n')[0].replace(/^Invalid TOML document: /, '')
  const error = new Error(`This is not valid TOML (line ${line}, column ${column}): ${reason}.`)
  error.location = {
    line,
    column,
    snippet: lineText.slice(start, start + 60),
    pointer: ' '.repeat(Math.max(0, column - 1 - start)) + '^',
  }
  return error
}

const BIG = '\u0000BIG:'

// TOML text → { json, notes }
export function tomlToJson(text, indent = 2) {
  let data
  try {
    data = parse(text, { integersAsBigInt: 'asNeeded' })
  } catch (err) {
    throw tomlError(err, text)
  }
  let special = 0
  let dates = 0
  const json = JSON.stringify(
    data,
    function (key, value) {
      const raw = this[key]
      // Dates: smol-toml's TomlDate; keep TOML's own text, without a pointless ".000".
      if (raw && typeof raw === 'object' && raw.isDate && typeof raw.toISOString === 'function') {
        dates++
        return raw.toISOString().replace(/\.000(?=$|Z|[+-])/, '')
      }
      if (typeof value === 'bigint') return BIG + value.toString()
      if (typeof value === 'number' && !Number.isFinite(value)) {
        special++
        return Number.isNaN(value) ? 'nan' : value > 0 ? 'inf' : '-inf'
      }
      return value
    },
    indent
  ).replace(/"\\u0000BIG:(-?\d+)"/g, '$1')

  const notes = []
  if (dates) notes.push(`${dates} date${dates === 1 ? '' : 's'} written as text.`)
  if (special) notes.push(`${special} inf/nan value${special === 1 ? '' : 's'} written as text, because JSON has no such numbers.`)
  return { json, notes }
}

// Removes nulls everywhere (TOML has no null). Counts what was removed.
function dropNulls(value, counter) {
  if (Array.isArray(value)) {
    return value.filter((item) => (item === null ? (counter.n++, false) : true)).map((item) => dropNulls(item, counter))
  }
  if (value && typeof value === 'object') {
    const kept = []
    for (const [key, child] of Object.entries(value)) {
      if (child === null) counter.n++
      else kept.push([key, dropNulls(child, counter)])
    }
    return Object.fromEntries(kept)
  }
  return value
}

// JSON value → { toml, notes }. rootKey wraps a top-level array, e.g. { items: [...] }.
export function jsonToToml(data, rootKey = 'items') {
  const notes = []
  let value = data
  if (Array.isArray(value)) {
    value = { [rootKey]: value }
    notes.push(`TOML needs a table at the top, so the array was placed under "${rootKey}".`)
  } else if (value === null || typeof value !== 'object') {
    throw new Error('Please enter a JSON object or array. TOML cannot hold a single value on its own.')
  }
  const counter = { n: 0 }
  value = dropNulls(value, counter)
  if (counter.n) notes.push(`${counter.n} null value${counter.n === 1 ? '' : 's'} left out, because TOML has no null.`)
  return { toml: stringify(value), notes }
}
