import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { Code } from './ArticlePage.jsx'
import { ToolPanel, Tool, Tabs, EmptyBox, DataTable, Messages } from './ToolLayout.jsx'
import { describeText, formatSize, downloadText, readTextFile } from './toolUtils.js'

// Picks the separator that appears most in the first line.
function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || ''
  const options = [',', ';', '\t']
  let best = ','
  let bestCount = 0
  for (const option of options) {
    const count = firstLine.split(option).length - 1
    if (count > bestCount) {
      best = option
      bestCount = count
    }
  }
  return best
}

// Reads CSV text into rows, handling quoted values like "Lahore, Pakistan".
function parseCsv(text, delimiter) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (inQuotes) {
    throw new Error('A quoted value is not closed. Please check your quotes.')
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''))
}

const JSON_INPUT_MESSAGE =
  'This looks like JSON, not CSV. CSV is plain rows separated by commas, like: name,city'

// Turns "25" into 25, "true" into true, and keeps values like "007" as text.
// Extra spaces around values (common when copying from Excel or emails) are removed.
function convertValue(value) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

// Puts a value at a path like "contact.email" inside an object.
function setNested(obj, path, value) {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current[part] === undefined || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {}
    }
    current = current[part]
  }
  current[parts[parts.length - 1]] = value
}

function csvToJson(text, delimiterChoice, convertTypes, nestKeys) {
  const cleanText = text.replace(/^\uFEFF/, '')
  const delimiter = delimiterChoice === 'auto' ? detectDelimiter(cleanText) : delimiterChoice
  const rows = parseCsv(cleanText, delimiter)

  if (rows.length < 2) {
    throw new Error('Please enter a header row and at least one data row.')
  }

  const headers = rows[0].map((header, index) => {
    const name = header.trim()
    return name === '' ? `column${index + 1}` : name
  })

  const data = rows.slice(1).map((row) => {
    const item = {}
    headers.forEach((header, index) => {
      const raw = row[index] ?? ''
      const value = convertTypes ? convertValue(raw) : raw
      if (nestKeys && header.includes('.')) {
        setNested(item, header, value)
      } else {
        item[header] = value
      }
    })
    return item
  })

  return { data, delimiter }
}

function delimiterName(delimiter) {
  if (delimiter === ',') return 'comma'
  if (delimiter === ';') return 'semicolon'
  return 'tab'
}

function CsvToJson() {
  const [csv, setCsv] = useState('')
  const [result, setResult] = useState('')
  const [records, setRecords] = useState(null)
  const [tab, setTab] = useState('json')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [delimiterChoice, setDelimiterChoice] = useState('auto')
  const [convertTypes, setConvertTypes] = useState(true)
  const [nestKeys, setNestKeys] = useState(true)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const fileInputRef = useRef(null)

  function showError(message) {
    setResult('')
    setRecords(null)
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function handleInputChange(text) {
    setCsv(text)
    setError('')
    setSuccess('')
    setResult('')
    setRecords(null)
  }

  function convert(text = csv) {
    if (!text.trim()) {
      showError('Please paste your CSV first.')
      return
    }

    // People sometimes paste JSON here by mistake. Point them to the right tool.
    const firstChar = text.trim().charAt(0)
    if (firstChar === '{' || firstChar === '[') {
      showError(JSON_INPUT_MESSAGE)
      return
    }

    try {
      const { data, delimiter } = csvToJson(text, delimiterChoice, convertTypes, nestKeys)
      setResult(JSON.stringify(data, null, 2))
      setRecords(data)
      showSuccess(
        `Converted successfully! ${data.length} record(s) created using ${delimiterName(delimiter)} separator.`
      )
    } catch (err) {
      showError(err.message)
    }
  }

  function loadSample() {
    const sample = [
      'id,name,city,contact.email,active',
      '1,Emily Clark,"London, UK",emily@example.com,true',
      '2,James Smith,"Manchester, UK",james@example.com,false',
      '3,Olivia Brown,"Bristol, UK",olivia@example.com,true',
    ].join('\n')
    handleInputChange(sample)
  }

  function clearAll() {
    handleInputChange('')
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      showSuccess(`"${file.name}" loaded. Click Convert to JSON.`)
    } catch (err) {
      showError(err.message)
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('JSON copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadJson() {
    downloadText(result, 'converted.json', 'application/json')
    showSuccess('JSON downloaded successfully!')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      convert()
    }
  }

  // Columns for the table preview: every key used by any record.
  const tableHeaders = []
  if (records) {
    for (const record of records) {
      for (const key of Object.keys(record)) {
        if (!tableHeaders.includes(key)) tableHeaders.push(key)
      }
    }
  }

  const csvLines = csv ? csv.split('\n').filter((line) => line.trim()).length : 0

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>CSV to JSON Converter</h1>
      <p>Convert CSV data from Excel or Google Sheets into clean JSON.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) readFile(file)
        }}
        style={{ display: 'none' }}
      />

      <div className="editor-layout">
        <ToolPanel
          title="CSV Input"
          badge={csvLines > 1 ? <span className="status-badge status-ok">{csvLines - 1} data rows</span> : null}
          tools={
            <>
              <Tool onClick={loadSample}>Sample</Tool>
              <Tool onClick={() => fileInputRef.current?.click()}>Upload</Tool>
              <Tool onClick={clearAll}>Clear</Tool>
            </>
          }
          statusLeft={`Ln ${cursor.line}, Col ${cursor.column}`}
          statusRight={describeText(csv)}
          footer={
            <>
              <div className="action-bar">
                <button type="button" className="action-primary" onClick={() => convert()} title="Shortcut: Ctrl + Enter">
                  Convert to JSON
                </button>
                <label className="indent-select">
                  Separator
                  <select value={delimiterChoice} onChange={(event) => setDelimiterChoice(event.target.value)}>
                    <option value="auto">Auto detect</option>
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value={'\t'}>Tab</option>
                  </select>
                </label>
              </div>
              <div className="options-row">
                <label className="option">
                  <input
                    type="checkbox"
                    checked={convertTypes}
                    onChange={(event) => setConvertTypes(event.target.checked)}
                  />
                  Convert numbers and true/false
                </label>
                <label className="option">
                  <input
                    type="checkbox"
                    checked={nestKeys}
                    onChange={(event) => setNestKeys(event.target.checked)}
                  />
                  Nested objects from dot columns (contact.email)
                </label>
              </div>
            </>
          }
        >
          <CodeEditor
            value={csv}
            placeholder={'Paste your CSV here, or drop a .csv file. For example:\nname,city\nEmily,London\n\nTip: press Ctrl + Enter to convert.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="JSON Result"
          tabs={
            <Tabs
              value={tab}
              onChange={setTab}
              options={[
                { value: 'json', label: 'JSON' },
                { value: 'table', label: 'Table' },
              ]}
            />
          }
          tools={
            <>
              <Tool onClick={copyResult} disabled={!result}>Copy</Tool>
              <Tool onClick={downloadJson} disabled={!result}>Download</Tool>
            </>
          }
          statusLeft={records ? `${records.length} records` : 'No result yet'}
          statusRight={result ? formatSize(result) : ''}
        >
          {!result && <EmptyBox>Your JSON will appear here.</EmptyBox>}
          {result && tab === 'json' && <JsonHighlight text={result} />}
          {result && tab === 'table' && records && <DataTable headers={tableHeaders} rows={records} />}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} />
      {error === JSON_INPUT_MESSAGE && (
        <p className="hint-box">
          Want to turn JSON into a table? Use our{' '}
          <a href="/json-to-csv">JSON to CSV Converter</a>.
        </p>
      )}

      <section className="seo-content">
        <h2>What Is a CSV to JSON Converter?</h2>
        <p>
          A CSV to JSON converter turns rows from a CSV file into a list of
          JSON objects. Each row becomes one object, and the first row of the
          CSV becomes the keys. This is useful when you want to move data from
          Excel or Google Sheets into a website, an app, or an API.
        </p>

        <h2>How to Convert CSV to JSON</h2>
        <ol>
          <li>Paste your CSV into the CSV Input box, click Upload, or click Sample to try an example.</li>
          <li>Keep the separator on Auto detect, or choose comma, semicolon, or tab.</li>
          <li>Choose whether to convert numbers and true/false values.</li>
          <li>Click Convert to JSON.</li>
          <li>Check the JSON or Table tab, then click Copy or Download to save the result.</li>
        </ol>

        <h2>What I Found While Testing</h2>
        <p>
          When I tested this converter with a small product list, I noticed
          that some product names came out with extra spaces in front, like
          "   Notebook" instead of "Notebook". This happens easily when you copy
          data from Excel, an email, or a website. So I updated the tool to
          remove extra spaces around each value automatically. Numbers such as
          prices and quantities are still converted into real numbers.
        </p>
        <figure style={{ margin: '1.5rem 0' }}>
          <img
            src="/images/csv-to-json-result.png"
            alt="CSV to JSON Converter result showing clean product names Notebook and Pen with numeric price and quantity values"
            width="1500"
            height="820"
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
            }}
          />
          <figcaption style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
            After the fix: names are clean, and prices and quantities stay as
            numbers.
          </figcaption>
        </figure>

        <h2>Features</h2>
        <ul>
          <li>Uses the first row as JSON keys automatically.</li>
          <li>Detects comma, semicolon, and tab separators.</li>
          <li>Handles quoted values that contain commas, such as "Lahore, Pakistan".</li>
          <li>Converts numbers, true, false, and null into real JSON types.</li>
          <li>Turns columns like contact.email into nested JSON objects.</li>
          <li>Runs in your browser, so your data is not uploaded to a server.</li>
        </ul>

        <h2>Example</h2>
        <Code label="CSV">{`id,name,city,contact.email,active
1,Emily Clark,"Lahore, Pakistan",emily@example.com,true
2,James Smith,London,,false`}</Code>
        <Code label="JSON">{`[
  {
    "id": 1,
    "name": "Emily Clark",
    "city": "Lahore, Pakistan",
    "contact": { "email": "emily@example.com" },
    "active": true
  },
  {
    "id": 2,
    "name": "James Smith",
    "city": "London",
    "contact": { "email": "" },
    "active": false
  }
]`}</Code>
        <p>
          The first row becomes the keys, the quoted city keeps its comma,
          <code> contact.email</code> becomes a nested object, and <code>1</code> and
          <code> true</code> become a real number and boolean. An empty cell becomes
          an empty string.
        </p>

        <h2>Tips for Clean Results</h2>
        <ul>
          <li><strong>Exporting from Excel:</strong> use File → Save As → CSV UTF-8, so letters like é and ü are kept.</li>
          <li><strong>Semicolons instead of commas?</strong> European Excel often uses semicolons. The separator is detected automatically, or you can pick it yourself.</li>
          <li><strong>Codes and phone numbers:</strong> values with a leading zero, like <code>00123</code>, always stay text. Turn off type conversion if other number-like codes, such as IDs or phone numbers, must stay text too.</li>
          <li><strong>Use clear headers:</strong> they become your JSON keys, so <code>first_name</code> works better than <code>First Name (required)</code>.</li>
        </ul>
        <p>
          Need it the other way? Use <a href="/json-to-csv">JSON to CSV</a> or create a
          real spreadsheet with <a href="/json-to-excel">JSON to Excel</a>.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>Does the first row need to be a header?</h3>
        <p>
          Yes. The first row is used as the names of the JSON keys. Empty
          header cells are named column1, column2, and so on.
        </p>

        <h3>Why are some numbers kept as text?</h3>
        <p>
          Values with leading zeros, such as 007 or phone numbers, are kept as
          text so that no digits are lost.
        </p>

        <h3>Can I convert JSON back to CSV?</h3>
        <p>
          Yes. Use our <a href="/json-to-csv">JSON to CSV Converter</a> to turn
          JSON data into a CSV file for Excel or Google Sheets.
        </p>

        <h3>Can I format the JSON result?</h3>
        <p>
          The result is already formatted. You can also paste it into our{' '}
          <a href="/">JSON Formatter</a> to minify it or change the indentation.
        </p>
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
        <a href="/json-to-csv">JSON to CSV Converter</a>
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

export default CsvToJson