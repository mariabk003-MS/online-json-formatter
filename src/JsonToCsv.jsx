import { useState } from 'react'
import './App.css'

// Turns nested objects into flat keys, e.g. { user: { name: 'Ali' } } -> { 'user.name': 'Ali' }
function flattenObject(obj, prefix = '', output = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, output)
    } else if (Array.isArray(value)) {
      output[newKey] = JSON.stringify(value)
    } else {
      output[newKey] = value
    }
  }
  return output
}

// Wraps a value in quotes when it contains the delimiter, quotes or new lines.
function escapeCsvValue(value, delimiter) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  const needsQuotes =
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')

  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text
}

function parseWithFix(text) {
  try {
    return JSON.parse(text)
  } catch {
    const fixed = text.trim().replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(fixed)
  }
}

function jsonToCsv(data, delimiter) {
  let rows = Array.isArray(data) ? data : [data]

  if (rows.length === 0) {
    throw new Error('The JSON array is empty.')
  }

  // Simple values like [1, 2, 3] become a single "value" column.
  rows = rows.map((row) =>
    row !== null && typeof row === 'object' && !Array.isArray(row)
      ? flattenObject(row)
      : { value: Array.isArray(row) ? JSON.stringify(row) : row }
  )

  const headers = []
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) headers.push(key)
    }
  }

  const headerLine = headers
    .map((header) => escapeCsvValue(header, delimiter))
    .join(delimiter)

  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCsvValue(row[header], delimiter)).join(delimiter)
  )

  return { csv: [headerLine, ...dataLines].join('\n'), rowCount: rows.length }
}

function JsonToCsv() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [delimiter, setDelimiter] = useState(',')

  function showError(message) {
    setResult('')
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function convert() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    let data
    try {
      data = parseWithFix(json)
    } catch (err) {
      showError(`This is not valid JSON. ${err.message}`)
      return
    }

    if (data === null || typeof data !== 'object') {
      showError('Please enter a JSON object or an array of objects.')
      return
    }

    try {
      const { csv, rowCount } = jsonToCsv(data, delimiter)
      setResult(csv)
      showSuccess(`Converted successfully! ${rowCount} row(s) created.`)
    } catch (err) {
      showError(err.message)
    }
  }

  function loadSample() {
    const sample = [
      { id: 1, name: 'Ayesha', city: 'Lahore', contact: { email: 'ayesha@example.com' } },
      { id: 2, name: 'Rahul', city: 'Mumbai', contact: { email: 'rahul@example.com' } },
      { id: 3, name: 'Sara', city: 'Dubai', contact: { email: 'sara@example.com' } },
    ]
    setJson(JSON.stringify(sample, null, 2))
    setResult('')
    setError('')
    setSuccess('')
  }

  function clearAll() {
    setJson('')
    setResult('')
    setError('')
    setSuccess('')
  }

  async function copyResult() {
    if (!result) {
      setError('Please convert your JSON first.')
      setSuccess('')
      return
    }
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('CSV copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadCsv() {
    if (!result) {
      setError('Please convert your JSON first.')
      setSuccess('')
      return
    }

    // The \uFEFF mark helps Excel open special characters correctly.
    const blob = new Blob(['\uFEFF' + result], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
        link.href = url
    link.download = 'converted.csv'
    link.click()
    URL.revokeObjectURL(url)

    showSuccess('CSV downloaded successfully!')
  }

  return (
    <div className="app">
      <h1>JSON to CSV Converter</h1>
      <p>Convert JSON data into a CSV file you can open in Excel or Google Sheets.</p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input JSON</h2>

          <textarea
            placeholder='Paste your JSON here, for example: [{"name": "Ali", "city": "Lahore"}]'
            value={json}
            onChange={(event) => {
              setJson(event.target.value)
              setError('')
              setSuccess('')
              setResult('')
            }}
          />

          <div className="buttons">
            <button onClick={convert}>Convert to CSV</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
            <label className="indent-label">
              Separator:{' '}
              <select
                value={delimiter}
                onChange={(event) => setDelimiter(event.target.value)}
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={'\t'}>Tab</option>
              </select>
            </label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>CSV Result</h2>

          <pre className="result-output">
            {result || 'Your CSV will appear here...'}
          </pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy CSV</button>
            <button onClick={downloadCsv}>Download CSV</button>
          </div>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <section className="seo-content">
        <h2>What Is a JSON to CSV Converter?</h2>
        <p>
          A JSON to CSV converter changes JSON data into CSV (comma-separated
          values) format. CSV files open easily in spreadsheet programs like
          Microsoft Excel and Google Sheets, so converting JSON to CSV makes
          your data simple to sort, filter, and share.
        </p>

        <h2>How to Convert JSON to CSV</h2>
        <ol>
          <li>Paste your JSON into the Input JSON box, or click Load Sample to try an example.</li>
          <li>Choose a separator: comma, semicolon, or tab.</li>
          <li>Click Convert to CSV.</li>
          <li>Click Copy CSV or Download CSV to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Converts an array of JSON objects into CSV rows.</li>
          <li>Creates column headers automatically from your JSON keys.</li>
          <li>Flattens nested objects into columns such as contact.email.</li>
          <li>Handles commas, quotes, and line breaks inside values safely.</li>
          <li>Downloads a CSV file that opens correctly in Excel.</li>
          <li>Runs in your browser, so your data is not uploaded to a server.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>What JSON format works best?</h3>
        <p>
          An array of objects works best, for example a list of users or
          products. Each object becomes one row, and each key becomes a column.
          A single JSON object is converted into one row.
        </p>

        <h3>What happens to nested JSON?</h3>
        <p>
          Nested objects are flattened using dot notation. For example,
          {' '}<code>{'{"contact": {"email": "a@b.com"}}'}</code> becomes a
          column named <code>contact.email</code>. Arrays inside a value are
          kept as JSON text in a single cell.
        </p>

        <h3>Why would I use a semicolon separator?</h3>
        <p>
          In some regions, Excel expects semicolons instead of commas. If your
          CSV opens with all data in one column, try the semicolon option.
        </p>

        <h3>Is this JSON to CSV converter free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>
      </section>

      <footer className="site-footer">
        <a href="/">JSON Formatter</a>
        {' | '}
                <a href="/csv-to-json">CSV to JSON Converter</a>
                {' | '}
                <a href="/about">About</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonToCsv