import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import { ToolPanel, Tool, StatusBadge, Tabs, EmptyBox, PlainOutput, DataTable, Messages } from './ToolLayout.jsx'
import { useLiveJsonCheck, describeText, formatSize, downloadText, readTextFile } from './toolUtils.js'
import { safeFix } from './safeFix.js'

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
    const fixed = safeFix(text.trim())
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

  return { csv: [headerLine, ...dataLines].join('\n'), rowCount: rows.length, headers, rows }
}

function JsonToCsv() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [table, setTable] = useState(null)
  const [tab, setTab] = useState('table')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(json)

  function showError(message) {
    setResult('')
    setTable(null)
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function handleInputChange(text) {
    setJson(text)
    setError('')
    setSuccess('')
    setResult('')
    setTable(null)
  }

  function convert(text = json) {
    if (!text.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    let data
    try {
      data = parseWithFix(text)
    } catch (err) {
      showError(`This is not valid JSON. ${err.message}`)
      return
    }

    if (data === null || typeof data !== 'object') {
      showError('Please enter a JSON object or an array of objects.')
      return
    }

    try {
      const { csv, rowCount, headers, rows } = jsonToCsv(data, delimiter)
      setResult(csv)
      setTable({ headers, rows })
      showSuccess(`Converted successfully! ${rowCount} row(s) and ${headers.length} column(s) created.`)
    } catch (err) {
      showError(err.message)
    }
  }

  function loadSample() {
    const sample = [
      { id: 1, name: 'Emily Clark', city: 'London', contact: { email: 'emily@example.com' } },
      { id: 2, name: 'James Smith', city: 'Manchester', contact: { email: 'james@example.com' } },
      { id: 3, name: 'Olivia Brown', city: 'Bristol', contact: { email: 'olivia@example.com' } },
    ]
    handleInputChange(JSON.stringify(sample, null, 2))
  }

  function clearAll() {
    handleInputChange('')
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      showSuccess(`"${file.name}" loaded. Click Convert to CSV.`)
    } catch (err) {
      showError(err.message)
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('CSV copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadCsv() {
    // A BOM mark at the start helps Excel open special characters correctly.
    downloadText(String.fromCharCode(0xfeff) + result, 'converted.csv', 'text/csv;charset=utf-8')
    showSuccess('CSV downloaded successfully!')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      convert()
    }
  }

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON to CSV Converter</h1>
      <p>Convert JSON data into a CSV file you can open in Excel or Google Sheets.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) readFile(file)
        }}
        style={{ display: 'none' }}
      />

      <div className="editor-layout">
        <ToolPanel
          title="JSON Input"
          badge={<StatusBadge check={liveCheck} />}
          tools={
            <>
              <Tool onClick={loadSample}>Sample</Tool>
              <Tool onClick={() => fileInputRef.current?.click()}>Upload</Tool>
              <Tool onClick={clearAll}>Clear</Tool>
            </>
          }
          statusLeft={`Ln ${cursor.line}, Col ${cursor.column}`}
          statusRight={describeText(json)}
          footer={
            <div className="action-bar">
              <button type="button" className="action-primary" onClick={() => convert()} title="Shortcut: Ctrl + Enter">
                Convert to CSV
              </button>
              <label className="indent-select">
                Separator
                <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value={'\t'}>Tab</option>
                </select>
              </label>
            </div>
          }
        >
          <CodeEditor
            value={json}
            placeholder={'Paste your JSON here, for example:\n[{"name": "Emily", "city": "London"}]\n\nTip: press Ctrl + Enter to convert.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            errorLine={liveCheck?.location?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="CSV Result"
          tabs={
            <Tabs
              value={tab}
              onChange={setTab}
              options={[
                { value: 'table', label: 'Table' },
                { value: 'csv', label: 'CSV' },
              ]}
            />
          }
          tools={
            <>
              <Tool onClick={copyResult} disabled={!result}>Copy</Tool>
              <Tool onClick={downloadCsv} disabled={!result}>Download</Tool>
            </>
          }
          statusLeft={table ? `${table.rows.length} rows · ${table.headers.length} columns` : 'No result yet'}
          statusRight={result ? formatSize(result) : ''}
        >
          {!result && <EmptyBox>Your CSV will appear here.</EmptyBox>}
          {result && tab === 'table' && table && <DataTable headers={table.headers} rows={table.rows} />}
          {result && tab === 'csv' && <PlainOutput text={result} />}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} />

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
          <li>Paste your JSON into the JSON Input box, click Upload, or click Sample to try an example.</li>
          <li>Choose a separator: comma, semicolon, or tab.</li>
          <li>Click Convert to CSV.</li>
          <li>Check the Table preview, then click Copy or Download to save the CSV.</li>
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
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/what-is-json">What Is JSON?</a>{' | '}
        <a href="/json-to-xml">JSON to XML</a>{' | '}
        <a href="/json-viewer">JSON Viewer</a>{' | '}
        <a href="/">JSON Formatter</a>
        {' | '}
                <a href="/csv-to-json">CSV to JSON Converter</a>
                {' | '}
                <a href="/about">About</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonToCsv