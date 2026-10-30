import { useState } from 'react'
import './App.css'
import './JsonViewer.css'
import NavBar from './NavBar.jsx'

// Shows a simple value (text, number, true/false, null) in its own color.
function ValueText({ value }) {
  if (value === null) return <span className="jv-null">null</span>
  if (typeof value === 'string') return <span className="jv-string">"{value}"</span>
  if (typeof value === 'number') return <span className="jv-number">{String(value)}</span>
  if (typeof value === 'boolean') return <span className="jv-boolean">{String(value)}</span>
  return <span>{String(value)}</span>
}

// One line of the tree. Objects and arrays can be opened and closed.
function TreeNode({ name, value, depth, openAll }) {
  const isContainer = value !== null && typeof value === 'object'
  const [open, setOpen] = useState(openAll === null ? depth < 2 : openAll)

  const label =
    name === undefined ? null : (
      <>
        <span className="jv-key">{typeof name === 'number' ? name : `"${name}"`}</span>
        <span className="jv-colon">: </span>
      </>
    )

  if (!isContainer) {
    return (
      <div className="jv-row">
        <span className="jv-spacer" />
        {label}
        <ValueText value={value} />
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const entries = isArray
    ? value.map((item, index) => [index, item])
    : Object.entries(value)
  const summary = isArray
    ? `[ ${entries.length} ${entries.length === 1 ? 'item' : 'items'} ]`
    : `{ ${entries.length} ${entries.length === 1 ? 'key' : 'keys'} }`

  return (
    <div>
      <div className="jv-row">
        <button
          type="button"
          className="jv-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Collapse' : 'Expand'}
        >
          {open ? '▾' : '▸'}
        </button>
        {label}
        <span className="jv-summary" onClick={() => setOpen(!open)}>
          {summary}
        </span>
      </div>
      {open && entries.length > 0 && (
        <div className="jv-children">
          {entries.map(([key, child]) => (
            <TreeNode
              key={key}
              name={key}
              value={child}
              depth={depth + 1}
              openAll={openAll}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function JsonViewer() {
  const [json, setJson] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [openAll, setOpenAll] = useState(null)
  const [treeVersion, setTreeVersion] = useState(0)

  function showTree(text) {
    if (!text.trim()) {
      setData(null)
      setError('Please paste your JSON first.')
      return
    }
    try {
      setData({ value: JSON.parse(text) })
      setError('')
      setOpenAll(null)
      setTreeVersion((v) => v + 1)
    } catch (err) {
      setData(null)
      setError('Invalid JSON: ' + err.message)
    }
  }

  function expandAll() {
    setOpenAll(true)
    setTreeVersion((v) => v + 1)
  }

  function collapseAll() {
    setOpenAll(false)
    setTreeVersion((v) => v + 1)
  }

  function loadSample() {
    const sample = {
      store: 'Online Shop',
      open: true,
      rating: 4.7,
      address: { city: 'Lahore', country: 'Pakistan' },
      products: [
        { id: 1, name: 'Keyboard', price: 2500, inStock: true },
        { id: 2, name: 'Mouse', price: 1200, inStock: false },
      ],
      discount: null,
    }
    const text = JSON.stringify(sample, null, 2)
    setJson(text)
    showTree(text)
  }

  function clearAll() {
    setJson('')
    setData(null)
    setError('')
  }

  return (
    <div className="app">
      <NavBar />
      <h1>JSON Viewer</h1>
      <p>
        View JSON as an interactive tree. Expand and collapse objects and
        arrays to explore your data.
      </p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input JSON</h2>

          <textarea
            placeholder="Paste your JSON here to view it as a tree..."
            value={json}
            onChange={(event) => setJson(event.target.value)}
          />

          <div className="buttons">
            <button onClick={() => showTree(json)}>View Tree</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Tree View</h2>

          {data && (
            <div className="buttons">
              <button onClick={expandAll}>Expand All</button>
              <button onClick={collapseAll}>Collapse All</button>
            </div>
          )}

          {error && <p className="error">{error}</p>}

          {!data && !error && (
            <pre className="result-output">Your JSON tree will appear here...</pre>
          )}

          {data && (
            <div className="jv-tree" key={treeVersion}>
              <TreeNode value={data.value} depth={0} openAll={openAll} />
            </div>
          )}
        </section>
      </div>

      <section className="seo-content">
        <h2>What Is a JSON Viewer?</h2>
        <p>
          A JSON viewer shows JSON data as a tree instead of plain text. Each
          object and array becomes a branch you can open or close, so large
          and deeply nested JSON is much easier to read and understand.
        </p>

        <h2>How to Use the JSON Viewer</h2>
        <ol>
          <li>Paste your JSON into the Input JSON box, or click Load Sample.</li>
          <li>Click View Tree.</li>
          <li>Click the arrows to open or close objects and arrays.</li>
          <li>Use Expand All or Collapse All to see everything or just the top level.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Collapsible tree view for objects and arrays.</li>
          <li>Item and key counts for every branch.</li>
          <li>Different colors for text, numbers, true/false, and null values.</li>
          <li>Works in your browser. Your data is not uploaded.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON viewer free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>

        <h3>Is my JSON sent to a server?</h3>
        <p>No. Your JSON is read and displayed inside your browser.</p>

        <h3>What if my JSON has an error?</h3>
        <p>
          The viewer will show an error message. To find the exact line and
          column of the problem, use our{' '}
          <a href="/json-validator">JSON Validator</a>, or read the{' '}
          <a href="/common-json-errors">Common JSON Errors guide</a>.
        </p>

        <h3>Can I format or minify my JSON?</h3>
        <p>
          Yes. Use our <a href="/">JSON Formatter</a> to beautify or minify
          your JSON and download the result.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonViewer