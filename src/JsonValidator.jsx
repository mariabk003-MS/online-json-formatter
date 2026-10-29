import { useState } from 'react'
import './App.css'

// Finds the line and column of a JSON error from the browser's message.
function getErrorLocation(text, message) {
  const lineCol = message.match(/line (\d+) column (\d+)/i)
  if (lineCol) return { line: Number(lineCol[1]), column: Number(lineCol[2]) }

  const pos = message.match(/position (\d+)/i)
  if (pos) {
    const before = text.slice(0, Number(pos[1]))
    const lines = before.split('\n')
    return { line: lines.length, column: lines[lines.length - 1].length + 1 }
  }
  return null
}

// Gives a simple tip for the most common JSON mistakes.
function getHint(text, message) {
  if (/Expected ','/i.test(message)) {
    return 'A comma is probably missing at the end of the previous line, or between two values.'
  }
  if (/,\s*[}\]]/.test(text)) {
    return 'There may be a trailing comma before a closing } or ]. Remove the last comma.'
  }
  if (/'[^'\n]*'\s*:/.test(text) || /:\s*'[^'\n]*'/.test(text)) {
    return 'JSON needs double quotes ("), not single quotes.'
  }
  if (/(^|\s)\/\//m.test(text) || /\/\*/.test(text)) {
    return 'JSON does not allow comments. Remove any // or /* */ comments.'
  }
  if (/[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(text)) {
    return 'Every key must be in double quotes, for example "name": "Ali".'
  }
  if (/end of|unexpected end/i.test(message)) {
    return 'The JSON ends too early. Check for a missing } or ].'
  }
  return 'Check the shown line for a missing comma, quote, or bracket.'
}

function getDepth(value) {
  if (value === null || typeof value !== 'object') return 0
  let max = 0
  for (const child of Object.values(value)) {
    const depth = getDepth(child)
    if (depth > max) max = depth
  }
  return max + 1
}

function JsonValidator() {
  const [json, setJson] = useState('')
  const [status, setStatus] = useState(null)

  function validate() {
    if (!json.trim()) {
      setStatus({ empty: true })
      return
    }

    try {
      const parsed = JSON.parse(json)
      const isArray = Array.isArray(parsed)
      const isObject = parsed !== null && typeof parsed === 'object' && !isArray
      setStatus({
        valid: true,
        formatted: JSON.stringify(parsed, null, 2),
        type: isArray ? 'Array' : isObject ? 'Object' : typeof parsed,
        count: isArray ? parsed.length : isObject ? Object.keys(parsed).length : null,
        depth: getDepth(parsed),
        size: new Blob([json]).size,
      })
    } catch (err) {
      const location = getErrorLocation(json, err.message)
      let lineText = ''
      if (location) {
        lineText = json.split('\n')[location.line - 1] ?? ''
      }
      setStatus({
        valid: false,
        message: err.message,
        location,
        lineText,
        hint: getHint(json, err.message),
      })
    }
  }

  function loadValidSample() {
    const sample = {
      name: 'Ayesha',
      city: 'Lahore',
      skills: ['JSON', 'CSV'],
      contact: { email: 'ayesha@example.com' },
    }
    setJson(JSON.stringify(sample, null, 2))
    setStatus(null)
  }

  function loadInvalidSample() {
    setJson('{\n  "name": "Ayesha",\n  "city": "Lahore"\n  "skills": ["JSON", "CSV"]\n}')
    setStatus(null)
  }

  function clearAll() {
    setJson('')
    setStatus(null)
  }

  return (
    <div className="app">
      <h1>JSON Validator</h1>
      <p>Check if your JSON is valid and find the exact line and column of any error.</p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input JSON</h2>

          <textarea
            placeholder="Paste your JSON here to check it..."
            value={json}
            onChange={(event) => {
              setJson(event.target.value)
              setStatus(null)
            }}
          />

          <div className="buttons">
            <button onClick={validate}>Validate JSON</button>
            <button onClick={loadValidSample}>Valid Sample</button>
            <button onClick={loadInvalidSample}>Invalid Sample</button>
            <button onClick={clearAll}>Clear</button>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Validation Result</h2>

          {!status && (
            <pre className="result-output">Your validation result will appear here...</pre>
          )}

          {status?.empty && <p className="error">Please paste your JSON first.</p>}

          {status?.valid === true && (
            <>
              <p className="success">Valid JSON! No errors found.</p>
              <ul className="seo-content">
                <li>Type: {status.type}</li>
                {status.count !== null && (
                  <li>{status.type === 'Array' ? 'Items' : 'Top-level keys'}: {status.count}</li>
                )}
                <li>Nesting depth: {status.depth}</li>
                <li>Size: {status.size} bytes</li>
              </ul>
              <pre className="result-output">{status.formatted}</pre>
            </>
          )}

          {status?.valid === false && (
            <>
              <p className="error">Invalid JSON: {status.message}</p>
              {status.location && (
                <>
                  <p>
                    Error at <strong>line {status.location.line}</strong>, column{' '}
                    {status.location.column}:
                  </p>
                  <pre className="result-output">
                    {status.lineText + '\n' + ' '.repeat(Math.max(status.location.column - 1, 0)) + '^'}
                  </pre>
                </>
              )}
              <p><strong>Tip:</strong> {status.hint}</p>
            </>
          )}
        </section>
      </div>

      <section className="seo-content">
        <h2>What Is a JSON Validator?</h2>
        <p>
          A JSON validator checks whether your data follows the rules of the
          JSON format. If something is wrong, this tool shows the exact line
          and column of the problem, so you can fix it quickly instead of
          searching through the whole file.
        </p>

        <h2>How to Validate JSON</h2>
        <ol>
          <li>Paste your JSON into the Input JSON box, or try the Valid or Invalid sample.</li>
          <li>Click Validate JSON.</li>
          <li>If the JSON is valid, you will see its type, size, and a formatted copy.</li>
          <li>If it is invalid, read the line number, the marked position, and the tip to fix it.</li>
        </ol>

        <h2>Common JSON Errors</h2>
        <ul>
          <li>Missing comma between two values or properties.</li>
          <li>Trailing comma after the last item, such as [1, 2, 3,].</li>
          <li>Single quotes instead of double quotes around keys or strings.</li>
          <li>Keys without quotes, such as name: "Ali" instead of "name": "Ali".</li>
          <li>Comments, which are not allowed in standard JSON.</li>
          <li>Missing closing bracket {'}'} or ].</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON validator free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>

        <h3>Is my JSON sent to a server?</h3>
        <p>No. Validation happens inside your browser.</p>

        <h3>Can this tool fix my JSON?</h3>
        <p>
          This page shows where the error is. To automatically fix common
          trailing-comma mistakes and format your data, use our{' '}
          <a href="/">JSON Formatter</a>.
        </p>

        <h3>Can I convert valid JSON to CSV?</h3>
        <p>
          Yes. Use our <a href="/json-to-csv">JSON to CSV Converter</a> to
          create a CSV file for Excel or Google Sheets.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonValidator