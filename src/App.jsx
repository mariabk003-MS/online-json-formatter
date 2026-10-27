
import { useState } from 'react'
import './App.css'

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
    const [indent, setIndent] = useState('2')

  function getIndent() {
    return indent === 'tab' ? '\t' : Number(indent)
  }

  function fixAndFormatJSON() {
    if (!json.trim()) {
      setError('Please paste your JSON first.')
      setSuccess('')
      setResult('')
      return
    }

    try {
      const parsed = JSON.parse(json)
      setResult(JSON.stringify(parsed, null, getIndent()))
      setError('')
      setSuccess('Valid JSON! Fixed and formatted successfully.')
      return
    } catch {
      // Try correcting a common trailing-comma mistake.
    }

    let fixed = json.trim()
    fixed = fixed.replace(/,\s*([}\]])/g, '$1')

    try {
      const parsed = JSON.parse(fixed)
      setResult(JSON.stringify(parsed, null, 2))
      setJson(fixed)
      setError('')
      setSuccess('A common syntax mistake was fixed and JSON formatted.')
    } catch (err) {
      setResult('')
      setSuccess('')
      setError(
        `Could not safely fix this JSON. ${err.message} Please check the error and correct the input.`
      )
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

  async function copyResult() {
    if (!result) {
      setError('Please fix and format JSON first.')
      setSuccess('')
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      setError('')
      setSuccess('Result copied successfully!')
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

    setError('')
    setSuccess('JSON downloaded successfully!')
  }

  return (
    <div className="app">
      <h1>Online JSON Formatter</h1>
      <p>Fix, format, and validate your JSON easily.</p>

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

          <div className="buttons">
            <button onClick={fixAndFormatJSON}>
              Fix &amp; Format JSON
            </button>
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
          <li>Paste your JSON data into the Input JSON box.</li>
          <li>Click Fix &amp; Format JSON to format your data.</li>
          <li>Review the output in the result panel.</li>
          <li>Click Copy Result or Download JSON to save your output.</li>
        </ol>

        <h2>Benefits of Our Online JSON Formatter</h2>
        <ul>
          <li>Format JSON into a readable structure.</li>
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

        <h3>Can I download formatted JSON?</h3>
        <p>
          Yes. Click Download JSON to save the formatted result as a JSON file.
        </p>
      </section>
            <footer className="site-footer">
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default App
