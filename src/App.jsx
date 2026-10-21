
import { useState } from 'react'
import './App.css'

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function formatJSON() {
    try {
      const parsed = JSON.parse(json)
      setResult(JSON.stringify(parsed, null, 2))
      setError('')
      setSuccess('JSON formatted successfully!')
    } catch {
      setError('Invalid JSON. Please check your input.')
      setSuccess('')
      setResult('')
    }
  }

  function minifyJSON() {
    try {
      const parsed = JSON.parse(json)
      setResult(JSON.stringify(parsed))
      setError('')
      setSuccess('JSON minified successfully!')
    } catch {
      setError('Invalid JSON. Please check your input.')
      setSuccess('')
      setResult('')
    }
  }

  function validateJSON() {
    try {
      JSON.parse(json)
      setError('')
      setSuccess('Valid JSON!')
    } catch {
      setError('Invalid JSON. Please check your input.')
      setSuccess('')
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
      setError('Please format or minify JSON first.')
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
      setError('Please format or minify JSON first.')
      setSuccess('')
      return
    }

    const blob = new Blob([result], {
      type: 'application/json',
    })
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
      <p>Format, minify, and validate your JSON easily.</p>

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
            <button onClick={formatJSON}>Format JSON</button>
            <button onClick={minifyJSON}>Minify JSON</button>
            <button onClick={validateJSON}>Validate JSON</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Formatted Result</h2>

          <pre className="result-output">
            {result || 'Your formatted JSON will appear here...'}
          </pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy Result</button>
            <button onClick={downloadJSON}>Download JSON</button>
          </div>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  )
}

export default App
