
import { useState } from 'react'
import './App.css'

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function formatJSON() {
    setError('')
    setSuccess('')

    if (!json.trim()) {
      setResult('')
      setError('Please enter JSON to format.')
      return
    }

    try {
      const data = JSON.parse(json)
      setResult(JSON.stringify(data, null, 2))
      setSuccess('JSON formatted successfully!')
    } catch (err) {
      setResult('')
      setError(
        err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON.'
      )
    }
  }

  function minifyJSON() {
    setError('')
    setSuccess('')

    if (!json.trim()) {
      setResult('')
      setError('Please enter JSON to minify.')
      return
    }

    try {
      const data = JSON.parse(json)
      setResult(JSON.stringify(data))
      setSuccess('JSON minified successfully!')
    } catch (err) {
      setResult('')
      setError(
        err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON.'
      )
    }
  }

  function validateJSON() {
    setError('')
    setSuccess('')
    setResult('')

    if (!json.trim()) {
      setError('Please enter JSON to validate.')
      return
    }

    try {
      JSON.parse(json)
      setSuccess('Valid JSON! Your JSON syntax is correct.')
    } catch (err) {
      setError(
        err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON.'
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
    setSuccess('Sample JSON loaded successfully!')
  }

  function clearAll() {
    setJson('')
    setResult('')
    setError('')
    setSuccess('')
  }

  async function copyResult() {
    if (!result) {
      setError('Please format or minify JSON before copying.')
      setSuccess('')
      return
    }

    try {
      await navigator.clipboard.writeText(result)
      setError('')
      setSuccess('JSON copied successfully!')
    } catch {
      setError('Could not copy. Please try again.')
      setSuccess('')
    }
  }

  function downloadJSON() {
    try {
      const content = result || json

      if (!content.trim()) {
        setError('Please enter JSON before downloading.')
        setSuccess('')
        return
      }

      const data = JSON.parse(content)
      const formatted = JSON.stringify(data, null, 2)
      const blob = new Blob([formatted], {
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
    } catch {
      setError('Please enter valid JSON before downloading.')
      setSuccess('')
    }
  }

  return (
    
<div className="app">
  <h1>Online JSON Formatter</h1>
  <p>Format and validate your JSON easily.</p>

  <div className="editor-layout">
    <section className="editor-panel">
      <h2>Input JSON</h2>
      <textarea
        placeholder="Paste your JSON here..."
        value={json}
        onChange={(e) => {
          setJson(e.target.value)
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


      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {result && (
        <>
          <h2>Result</h2>
          <pre>{result}</pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy Result</button>
            <button onClick={downloadJSON}>Download JSON</button>
          </div>
        </>
      )}
    </div>
  )
}

export default App
