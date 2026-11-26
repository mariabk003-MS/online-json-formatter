// Formats JSON5 and JSONC (JSON with comments) WITHOUT losing the comments.
// The text is checked with the official json5 parser, then split into tokens
// (strings, values, brackets, comments) and written again with clean indentation.
import JSON5 from 'json5'

// ---------- tokenizer ----------
// Each token: { type: 'string' | 'value' | 'punct' | 'line' | 'block', text, newlines }
// newlines = how many line breaks came before the token in the original text.
function tokenize(text) {
  const tokens = []
  let i = 0
  let newlines = 0
  const push = (type, end) => {
    tokens.push({ type, text: text.slice(i, end), newlines })
    newlines = 0
    i = end
  }
  while (i < text.length) {
    const ch = text[i]
    if (ch === '\n') {
      newlines++
      i++
    } else if (/\s/.test(ch) || ch === '﻿') {
      i++
    } else if (ch === '/' && text[i + 1] === '/') {
      let end = text.indexOf('\n', i)
      if (end < 0) end = text.length
      push('line', end)
      tokens[tokens.length - 1].text = tokens[tokens.length - 1].text.replace(/\s+$/, '')
    } else if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      push('block', end < 0 ? text.length : end + 2)
    } else if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < text.length && text[j] !== ch) j += text[j] === '\\' ? 2 : 1
      push('string', Math.min(j + 1, text.length))
    } else if ('{}[]:,'.includes(ch)) {
      push('punct', i + 1)
    } else {
      let j = i
      while (j < text.length && !/[\s{}[\]:,"'/]/.test(text[j])) j++
      push('value', Math.max(j, i + 1))
    }
  }
  return tokens
}

const JSON_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/

// Rewrites a key or value so it is valid in JSONC (strict JSON + comments).
function toJsonc(token, isKey) {
  if (token.type === 'string') return JSON.stringify(JSON5.parse(token.text))
  if (isKey) return JSON.stringify(Object.keys(JSON5.parse(`{${token.text}:0}`))[0])
  if (['true', 'false', 'null'].includes(token.text)) return token.text
  if (JSON_NUMBER.test(token.text)) return token.text // keeps 1.0 and large integers exactly
  const number = JSON5.parse(token.text)
  if (!Number.isFinite(number)) {
    throw new Error(`${token.text} cannot be written in JSONC or JSON, which have no Infinity or NaN. Use JSON5 output, or change the value.`)
  }
  return String(number) // 0x1F → 31, .5 → 0.5, +1 → 1
}

// Error with line/column so the editor can mark the line.
function locate(err, text) {
  const line = err.lineNumber
  const column = err.columnNumber
  const error = new Error(`This is not valid JSON5 (line ${line}, column ${column}): ${err.message.replace(/^JSON5: /, '').replace(/ at \d+:\d+$/, '')}.`)
  const lineText = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
  const start = Math.max(0, column - 40)
  error.location = { line, column, snippet: lineText.slice(start, start + 60), pointer: ' '.repeat(Math.max(0, column - 1 - start)) + '^' }
  return error
}

// output: 'jsonc' | 'json5' | 'json'
// indent: number of spaces or '\t'
// trailingCommas: true keeps a comma after the last item, false removes it
// Returns { text, comments }  (comments = how many were kept, or removed for 'json')
export function formatJson5(text, { output = 'jsonc', indent = 2, trailingCommas = false } = {}) {
  if (!text.trim()) throw new Error('Please paste your JSON5 or JSONC first.')
  let data
  try {
    data = JSON5.parse(text)
  } catch (err) {
    throw err.lineNumber ? locate(err, text) : err
  }
  const tokens = tokenize(text)
  const comments = tokens.filter((t) => t.type === 'line' || t.type === 'block').length

  if (output === 'json') {
    let failed = null
    const json = JSON.stringify(data, (key, value) => {
      if (typeof value === 'number' && !Number.isFinite(value)) failed = String(value)
      return value
    }, indent)
    if (failed) throw new Error(`${failed} cannot be written in JSON, which has no Infinity or NaN. Use JSON5 output, or change the value.`)
    return { text: json + '\n', comments }
  }

  const pad = typeof indent === 'number' ? ' '.repeat(indent) : indent
  const significant = (from) => {
    for (let k = from; k < tokens.length; k++) if (tokens[k].type !== 'line' && tokens[k].type !== 'block') return tokens[k]
    return null
  }

  let out = ''
  let depth = 0
  let pending = false // a line break is owed before the next token
  let blank = false // the original had an empty line here; keep one

  const flush = (token) => {
    if (out && pending) {
      out += (blank || token.newlines >= 2 ? '\n' : '') + '\n' + pad.repeat(depth)
    }
    pending = false
    blank = false
  }

  for (let k = 0; k < tokens.length; k++) {
    const token = tokens[k]
    const t = token.text

    if (token.type === 'line' || token.type === 'block') {
      // A comment on the same line as the code before it stays at the end of that line.
      if (out && token.newlines === 0) {
        out += ' ' + t
      } else {
        if (out) pending = true
        if (token.newlines >= 2) blank = true
        flush(token)
        out += token.type === 'block' ? t.replace(/\n[ \t]*/g, '\n' + pad.repeat(depth) + ' ') : t
      }
      pending = token.type === 'line' || pending || significant(k + 1)?.newlines > 0
      continue
    }

    if (t === '{' || t === '[') {
      flush(token)
      const close = t === '{' ? '}' : ']'
      const next = tokens[k + 1]
      if (next && next.text === close) {
        out += t + close
        k++
      } else {
        out += t
        depth++
        pending = true
      }
    } else if (t === '}' || t === ']') {
      depth--
      pending = true
      blank = false
      flush({ newlines: 0 })
      out += t
    } else if (t === ',') {
      const next = significant(k + 1)
      const closes = next && (next.text === '}' || next.text === ']')
      if (!closes || trailingCommas) out += ','
      pending = true
    } else if (t === ':') {
      out += ': '
    } else {
      flush(token)
      const isKey = significant(k + 1)?.text === ':'
      out += output === 'jsonc' ? toJsonc(token, isKey) : t
    }
  }
  return { text: out + '\n', comments }
}
