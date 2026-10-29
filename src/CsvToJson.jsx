import { useState } from 'react'
import './App.css'
import NavBar from './NavBar.jsx'

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

// Turns "25" into 25, "true" into true, and keeps values like "007" as text.
function convertValue(value) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return value
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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [delimiterChoice, setDelimiterChoice] = useState('auto')
  const [convertTypes, setConvertTypes] = useState(true)
  const [nestKeys, setNestKeys] = useState(true)

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
    if (!csv.trim()) {
      showError('Please paste your CSV first.')
      return
    }

    try {
      const { data, delimiter } = csvToJson(csv, delimiterChoice, convertTypes, nestKeys)
      setResult(JSON.stringify(data, null, 2))
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
      '1,Ayesha,"Lahore, Pakistan",ayesha@example.com,true',
      '2,Rahul,"Mumbai, India",rahul@example.com,false',
      '3,Sara,"Dubai, UAE",sara@example.com,true',
    ].join('\n')
    setCsv(sample)
    setResult('')
    setError('')
    setSuccess('')
  }

  function clearAll() {
    setCsv('')
    setResult('')
    setError('')
    setSuccess('')
  }

  async function copyResult() {
    if (!result) {
      setError('Please convert your CSV first.')
      setSuccess('')
      return
    }
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('JSON copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadJson() {
    if (!result) {
      setError('Please convert your CSV first.')
      setSuccess('')
      return
    }

    const blob = new Blob([result], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'converted.json'
    link.click()
    URL.revokeObjectURL(url)

    showSuccess('JSON downloaded successfully!')
  }

  return (
    <div className="app">
      <NavBar />
      <h1>CSV to JSON Converter</h1>
      <p>Convert CSV data from Excel or Google Sheets into clean JSON.</p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input CSV</h2>

          <textarea
            placeholder={'Paste your CSV here, for example:\nname,city\nAli,Lahore'}
            value={csv}
            onChange={(event) => {
              setCsv(event.target.value)
              setError('')
              setSuccess('')
              setResult('')
            }}
          />

          <div className="buttons">
            <button onClick={convert}>Convert to JSON</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
            <label className="indent-label">
              Separator:{' '}
              <select
                value={delimiterChoice}
                onChange={(event) => setDelimiterChoice(event.target.value)}
              >
                <option value="auto">Auto detect</option>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={'\t'}>Tab</option>
              </select>
            </label>
          </div>

          <div className="buttons">
            <label className="indent-label">
              <input
                type="checkbox"
                checked={convertTypes}
                onChange={(event) => setConvertTypes(event.target.checked)}
              />{' '}
              Convert numbers and true/false
            </label>
            <label className="indent-label">
              <input
                type="checkbox"
                checked={nestKeys}
                onChange={(event) => setNestKeys(event.target.checked)}
              />{' '}
              Create nested objects from dot columns
            </label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>JSON Result</h2>

          <pre className="result-output">
            {result || 'Your JSON will appear here...'}
          </pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy JSON</button>
            <button onClick={downloadJson}>Download JSON</button>
          </div>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

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
          <li>Paste your CSV into the Input CSV box, or click Load Sample to try an example.</li>
          <li>Keep the separator on Auto detect, or choose comma, semicolon, or tab.</li>
          <li>Choose whether to convert numbers and true/false values.</li>
          <li>Click Convert to JSON.</li>
          <li>Click Copy JSON or Download JSON to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Uses the first row as JSON keys automatically.</li>
          <li>Detects comma, semicolon, and tab separators.</li>
          <li>Handles quoted values that contain commas, such as "Lahore, Pakistan".</li>
          <li>Converts numbers, true, false, and null into real JSON types.</li>
          <li>Turns columns like contact.email into nested JSON objects.</li>
          <li>Runs in your browser, so your data is not uploaded to a server.</li>
        </ul>

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
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
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

export default CsvToJson