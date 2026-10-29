import { useRef, useState } from 'react'
import './App.css'
import NavBar from './NavBar.jsx'

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [indent, setIndent] = useState('2')
  const fileInputRef = useRef(null)

  function getIndent() {
    return indent === 'tab' ? '\t' : Number(indent)
  }

  function showError(message) {
    setResult('')
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function parseWithFix(text) {
    try {
      return { parsed: JSON.parse(text), fixedText: null }
    } catch {
      const fixed = text.trim().replace(/,\s*([}\]])/g, '$1')
      return { parsed: JSON.parse(fixed), fixedText: fixed }
    }
  }

  function fixAndFormatJSON() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    try {
      const { parsed, fixedText } = parseWithFix(json)
      setResult(JSON.stringify(parsed, null, getIndent()))

      if (fixedText) {
        setJson(fixedText)
        showSuccess('A common syntax mistake was fixed and JSON formatted.')
      } else {
        showSuccess('Valid JSON! Fixed and formatted successfully.')
      }
    } catch (err) {
      showError(
        `Could not safely fix this JSON. ${err.message} Please check the error and correct the input.`
      )
    }
  }

  function minifyJSON() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    try {
      const { parsed } = parseWithFix(json)
      setResult(JSON.stringify(parsed))
      showSuccess('JSON minified successfully!')
    } catch (err) {
      showError(`Could not minify this JSON. ${err.message}`)
    }
  }

  function loadSample() {
    const sample = {
      name: 'Maria',
      skill: 'Microbiology',
      website: 'Online JSON Formatter',
      country: 'Pakistan',
    }

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

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError('File is too large. Please upload a file smaller than 5 MB.')
      return
    }

    try {
      const text = await file.text()
      setJson(text)
      setResult('')
      showSuccess(`"${file.name}" loaded. Now click Fix & Format JSON or Minify JSON.`)
    } catch {
      showError('Could not read this file. Please try another .json or .txt file.')
    }
  }

  async function copyResult() {
    if (!result) {
      setError('Please fix and format JSON first.')
      setSuccess('')
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      showSuccess('Result copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadJSON() {
    if (!result) {
      setError('Please fix and format JSON first.')
      setSuccess('')
      return
    }

    const blob = new Blob([result], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'formatted.json'
    link.click()
    URL.revokeObjectURL(url)

    showSuccess('JSON downloaded successfully!')
  }

  return (
    <div className="app">
      <NavBar />
      <h1>Online JSON Formatter</h1>
      <p>Fix, format, minify, and validate your JSON easily.</p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input JSON</h2>

          <textarea
            placeholder="Paste your JSON here..."
            value={json}
            onChange={(event) => {
              setJson(event.target.value)
              setError('')
              setSuccess('')
              setResult('')
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div className="buttons">
            <button onClick={fixAndFormatJSON}>
              Fix &amp; Format JSON
            </button>
            <button onClick={minifyJSON}>Minify JSON</button>
            <button onClick={openFilePicker}>Upload File</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
            <label className="indent-label">
              Indent:{' '}
              <select
                value={indent}
                onChange={(event) => setIndent(event.target.value)}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Corrected JSON Result</h2>

          <pre className="result-output">
            {result || 'Your corrected JSON will appear here...'}
          </pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy Result</button>
            <button onClick={downloadJSON}>Download JSON</button>
          </div>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <section className="seo-content">
        <h2>What Is a JSON Formatter?</h2>
        <p>
          A JSON formatter is a free online tool that makes JSON data easier
          to read by adding consistent spacing and indentation. Use this
          Online JSON Formatter to format JSON and check whether your data
          has valid JSON syntax.
        </p>

        <h2>How to Use This JSON Formatter</h2>
        <ol>
          <li>Paste your JSON data into the Input JSON box, or click Upload File to open a .json or .txt file.</li>
          <li>Choose 2 spaces, 4 spaces, or Tab indentation.</li>
          <li>Click Fix &amp; Format JSON to format your data, or Minify JSON to compress it into one line.</li>
          <li>Review the output in the result panel.</li>
          <li>Click Copy Result or Download JSON to save your output.</li>
        </ol>

        <h2>Benefits of Our Online JSON Formatter</h2>
        <ul>
          <li>Format JSON into a readable structure.</li>
          <li>Choose your preferred indentation: 2 spaces, 4 spaces, or Tab.</li>
          <li>Minify JSON to remove extra spaces and reduce file size.</li>
          <li>Upload JSON files directly from your computer.</li>
          <li>Check JSON syntax by parsing your input.</li>
          <li>Correct common trailing-comma mistakes automatically.</li>
          <li>Copy or download the formatted JSON result.</li>
          <li>Process JSON directly in your browser.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON formatter free?</h3>
        <p>Yes. You can use this online JSON formatter for free.</p>

        <h3>Can this tool fix invalid JSON?</h3>
        <p>
          It can correct common trailing-comma mistakes. Other syntax
          errors may need to be corrected manually.
        </p>

        <h3>What does Minify JSON do?</h3>
        <p>
          Minify removes all extra spaces and line breaks, so your JSON fits
          on a single line. This makes the data smaller, which is useful for
          APIs and configuration files.
        </p>

        <h3>Is my uploaded JSON file sent to a server?</h3>
        <p>
          No. Uploaded files are read and processed inside your browser.
        </p>

        <h3>Can I download formatted JSON?</h3>
        <p>
          Yes. Click Download JSON to save the formatted result as a JSON file.
        </p>

        <h3>Can I convert JSON to CSV?</h3>
        <p>
          Yes. Use our free <a href="/json-to-csv">JSON to CSV Converter</a> to
          turn JSON data into a CSV file for Excel or Google Sheets.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/json-to-csv">JSON to CSV Converter</a>
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

export default App