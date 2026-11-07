// Safely fixes common JSON mistakes, reading the text one character at a time.
// Text inside strings is never changed, except:
//   - real line breaks, tabs and other control characters become \n, \r, \t or \u00XX
//   - \' (not allowed in JSON) becomes '
//
// Fixes outside strings:
//  1. A trailing comma before } or ] is removed.
//  2. A missing ':' between a key and its value is added.
//  3. A missing ',' between two values (or two key/value pairs) is added.
//  4. A ',' or '=' used instead of ':' after a key is replaced with ':'.
//  5. // and /* */ comments are removed.
//  6. 'single quoted' and “smart quoted” strings become "double quoted".
//  7. Keys without quotes get quotes: {name: 1} -> {"name": 1}
//  8. Python values True, False, None become true, false, null.
//  9. Missing } or ] at the end are added.
//
// Optional: pass an empty object as `report` and safeFix fills it with how
// many times each fix was used, e.g. { trailingCommas: 2, missingColons: 1 }.
export function safeFix(text, report = {}) {
  let out = ''
  const stack = [] // open containers: '{' or '['
  let expect = 'value' // what should come next: 'key', 'colon', 'value' or 'comma'
  let lastEnd = 0 // position in out right after the last key or value

  function note(kind) {
    report[kind] = (report[kind] || 0) + 1
  }

  // Puts a missing ':' or ',' right after the last key/value.
  function insertAtLastEnd(mark) {
    out = out.slice(0, lastEnd) + mark + out.slice(lastEnd)
  }

  function inObject() {
    return stack[stack.length - 1] === '{'
  }

  // Called when a new key or value starts.
  function beforeToken() {
    if (expect === 'colon') {
      insertAtLastEnd(':')
      note('missingColons')
      expect = 'value'
    } else if (expect === 'comma' && stack.length > 0) {
      insertAtLastEnd(',')
      note('missingCommas')
      expect = inObject() ? 'key' : 'value'
    }
  }

  // Called when a key or value has ended.
  function afterToken() {
    expect = expect === 'key' ? 'colon' : 'comma'
    lastEnd = out.length
  }

  // Removes a ',' if it is the last non-space character written so far.
  function dropTrailingComma() {
    const trimmed = out.trimEnd()
    if (trimmed.endsWith(',')) {
      out = trimmed.slice(0, -1) + out.slice(trimmed.length)
      note('trailingCommas')
    }
  }

  // Copies a string that starts at text[i] and always writes it with "double quotes".
  function copyString(quote) {
    let closers = quote
    if (quote === "'") note('singleQuotes')
    if (quote === '“' || quote === '”') {
      closers = '“”"'
      note('smartQuotes')
    }
    out += '"'
    i++
    let escaped = false
    while (i < text.length) {
      const c = text[i]
      i++
      if (escaped) {
        if (c === "'") {
          out = out.slice(0, -1) + "'" // \' is not valid JSON, ' is enough
        } else {
          out += c
        }
        escaped = false
      } else if (c === '\\') {
        out += c
        escaped = true
      } else if (closers.includes(c)) {
        out += '"'
        return
      } else if (c === '"') {
        out += '\\"' // a " inside a 'single quoted' string
      } else if ((c === '\n' || c === '\r') && nextLineStartsNewEntry()) {
        // The closing quote was forgotten at the end of this line, e.g.
        //   "website": "Online JSON Formatter
        //   "country": "Pakistan"
        // Close the string here instead of joining the next line into it.
        const content = out.trimEnd()
        const endsWithComma = content.endsWith(',')
        out = (endsWithComma ? content.slice(0, -1) : content) + '"'
        note('missingQuotes')
        i-- // let the main loop handle the line break
        return endsWithComma // the main loop will write the comma after the string
      } else if (c === '\n') {
        out += '\\n'
        note('lineBreaks')
      } else if (c === '\r') {
        out += '\\r'
        if (text[i] !== '\n') note('lineBreaks')
      } else if (c === '\t') {
        out += '\\t'
        note('controlChars')
      } else if (c.charCodeAt(0) < 0x20) {
        out += '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
        note('controlChars')
      } else {
        out += c
      }
    }
    out += '"' // the string was never closed
    note('missingQuotes')
  }

  // True if the line after text[i - 1] looks like a new key ("country": ...)
  // or a closing } or ], which means the current string was never closed.
  function nextLineStartsNewEntry() {
    const rest = text.slice(i, i + 200)
    return /^[\s]*("[^"\n]*"\s*:|[}\]])/.test(rest)
  }

  const pythonValues ={ True: 'true', False: 'false', None: 'null' }

  let i = 0
  while (i < text.length) {
    const ch = text[i]

    // A string: copy it, escaping control characters inside it.
    if (ch === '"' || ch === "'" || ch === '“' || ch === '”') {
      beforeToken()
      const isKey = expect === 'key'
      const commaAfter = copyString(ch)

      // A key whose closing quote was forgotten, e.g.  "website "Online JSON",
      // The string read as "website " is followed straight away by a letter,
      // so its last quote really is the start of the value.
      if (isKey && !commaAfter && text[i - 1] === ch && /\s"$/.test(out) && /[^\s:,}\]]/.test(text[i] || ' ')) {
        out = out.slice(0, -1).trimEnd() + '"'
        i-- // read that quote again as the start of the value
        note('missingQuotes')
      }

      afterToken()
      if (commaAfter) {
        out += ','
        expect = inObject() ? 'key' : 'value'
      }
      continue
    }

    // Comments: // until the end of the line, or /* ... */
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++
      note('comments')
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end === -1 ? text.length : end + 2
      note('comments')
      continue
    }

    if (ch === '{' || ch === '[') {
      beforeToken()
      stack.push(ch)
      expect = ch === '{' ? 'key' : 'value'
      out += ch
      i++
      continue
    }

    if (ch === '}' || ch === ']') {
      dropTrailingComma()
      stack.pop()
      out += ch
      i++
      expect = 'comma'
      lastEnd = out.length
      continue
    }

    if (ch === ':') {
      expect = 'value'
      out += ch
      i++
      continue
    }

    // A ',' or '=' typed right after a key instead of ':' (e.g. "name", "Maria").
    if ((ch === ',' || ch === '=') && expect === 'colon') {
      let j = i + 1
      while (j < text.length && /\s/.test(text[j])) j++
      if (text[j] !== '}' && text[j] !== ']' && text[j] !== ',' && j < text.length) {
        expect = 'value'
        out += ':'
        note('wrongColons')
        i++
        continue
      }
    }

    if (ch === ',') {
      expect = inObject() ? 'key' : 'value'
      out += ch
      i++
      continue
    }

    if (/\s/.test(ch)) {
      out += ch
      i++
      continue
    }

    // A number, true, false, null or any other word.
    beforeToken()
    let word = ''
    while (i < text.length && !/[\s,:{}[\]"'“”/]/.test(text[i])) {
      word += text[i]
      i++
    }
    if (word === '') {
      // A single character that is not part of any word (like a lone '/').
      out += ch
      i++
      continue
    }
    if (expect === 'key') {
      out += '"' + word + '"'
      note('unquotedKeys')
    } else if (pythonValues[word]) {
      out += pythonValues[word]
      note('pythonValues')
    } else {
      out += word
    }
    afterToken()
  }

  // Close any { or [ that was left open.
  if (stack.length > 0) {
    dropTrailingComma()
    while (stack.length > 0) {
      out += stack.pop() === '{' ? '}' : ']'
      note('missingBrackets')
    }
  }

  return out
}
