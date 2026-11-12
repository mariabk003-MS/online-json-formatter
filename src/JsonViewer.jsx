import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import { JsonTreeView } from './JsonTree.jsx'
import { JsonGraph } from './JsonGraph.jsx'
import { ToolPanel, Tool, StatusBadge, Tabs, EmptyBox, Messages } from './ToolLayout.jsx'
import { getErrorLocation, useLiveJsonCheck, describeText, readTextFile, describeFixes } from './toolUtils.js'
import { safeFix } from './safeFix.js'

const SAMPLE = {
  store: 'City Electronics',
  open: true,
  rating: 4.7,
  address: { city: 'London', country: 'United Kingdom' },
  products: [
    { id: 1, name: 'Keyboard', price: 49.99, inStock: true },
    { id: 2, name: 'Mouse', price: 19.99, inStock: false },
  ],
  discount: null,
}

// Counts keys/items and finds the deepest level, for the status bar.
function getStats(value) {
  let nodes = 0
  let depth = 0
  function walk(item, level) {
    nodes++
    if (level > depth) depth = level
    if (item && typeof item === 'object') {
      for (const child of Object.values(item)) walk(child, level + 1)
    }
  }
  walk(value, 0)
  return `${nodes} values · depth ${depth}`
}

function JsonViewer() {
  const [json, setJson] = useState('')
  const [data, setData] = useState(null)
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const [success, setSuccess] = useState('')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [view, setView] = useState('tree')
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(json)

  function handleInputChange(text) {
    setJson(text)
    setError('')
    setErrorLocation(null)
    setSuccess('')
  }

  function showTree(text = json) {
    if (!text.trim()) {
      setData(null)
      setError('Please paste your JSON first.')
      return
    }
    try {
      setData({ value: JSON.parse(text) })
      setVersion((v) => v + 1)
      setError('')
      setErrorLocation(null)
    } catch (err) {
      // Try the same safe auto-repair as the other tools (missing commas, quotes, comments…).
      try {
        const report = {}
        const value = JSON.parse(safeFix(text.trim(), report))
        setData({ value })
        setVersion((v) => v + 1)
        setError('')
        setErrorLocation(null)
        setSuccess(`${describeFixes(report)} Your input was not changed; use the JSON Formatter or JSON Repair to copy the fixed JSON.`)
      } catch {
        const location = getErrorLocation(text, err)
        setData(null)
        setError(`Invalid JSON: ${err.message}`)
        setErrorLocation(location)
      }
    }
  }

  function loadSample() {
    const text = JSON.stringify(SAMPLE, null, 2)
    handleInputChange(text)
    showTree(text)
  }

  function clearAll() {
    handleInputChange('')
    setData(null)
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      showTree(text)
      setSuccess(`"${file.name}" loaded.`)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      showTree()
    }
  }

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON Viewer</h1>
      <p>
        View JSON as an interactive tree. Expand and collapse objects and
        arrays to explore your data.
      </p>

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
          title="Input"
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
              <button type="button" className="action-primary" onClick={() => showTree()} title="Shortcut: Ctrl + Enter">
                View Tree
              </button>
            </div>
          }
        >
          <CodeEditor
            value={json}
            placeholder={'Paste your JSON here, or drop a .json file...\n\nTip: press Ctrl + Enter to view the tree.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            errorLine={liveCheck?.location?.line || errorLocation?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="View"
          tabs={
            <Tabs
              value={view}
              onChange={setView}
              options={[
                { value: 'tree', label: 'Tree' },
                { value: 'graph', label: 'Graph' },
              ]}
            />
          }
          statusLeft={data ? getStats(data.value) : 'No tree yet'}
        >
          {data && view === 'tree' && <JsonTreeView key={version} data={data.value} />}
          {data && view === 'graph' && <JsonGraph data={data.value} />}
          {!data && (
            <EmptyBox>Your JSON tree will appear here.</EmptyBox>
          )}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} location={errorLocation} />

      <section className="seo-content">
        <h2>What Is a JSON Viewer?</h2>
        <p>
          A JSON viewer shows JSON data as a tree instead of plain text. Each
          object and array becomes a branch you can open or close, so large
          and deeply nested JSON is much easier to read and understand.
        </p>

        <h2>How to Use the JSON Viewer</h2>
        <ol>
          <li>Paste your JSON into the Input box, click Upload, or click Sample.</li>
          <li>Click View Tree.</li>
          <li>Click the arrows to open or close objects and arrays.</li>
          <li>Use Expand All or Collapse All to see everything or just the top level.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Collapsible tree view for objects and arrays.</li>
          <li>Graph view that draws your JSON as connected boxes, with zoom.</li>
          <li>Item and key counts for every branch.</li>
          <li>Different colors for text, numbers, true/false, and null values.</li>
          <li>Line numbers and a live Valid / Invalid check while you type.</li>
          <li>Upload or drag &amp; drop a .json file, and full screen view.</li>
          <li>Works in your browser. Your data is not uploaded.</li>
        </ul>

        <h2>When a JSON Viewer Helps Most</h2>
        <ul>
          <li><strong>Reading API responses:</strong> a single response can have hundreds of nested fields. Collapse everything, then open only the branch you need.</li>
          <li><strong>Debugging:</strong> quickly check whether a field is missing, null, or a string instead of a number. Each type has its own color.</li>
          <li><strong>Understanding a new data source:</strong> the item counts on every branch show at a glance how many orders, users or records a file contains.</li>
          <li><strong>Explaining data to others:</strong> the Graph view draws objects as connected boxes, which is easier to show in a meeting than raw text.</li>
        </ul>

        <h2>Tree View vs Graph View vs Code View</h2>
        <p>
          <strong>Tree view</strong> is best for deep data: you open one level at a
          time, like folders on your computer. <strong>Graph view</strong> is best
          for seeing how objects relate to each other, for example a user, the
          user&apos;s address and the user&apos;s orders. <strong>Code view</strong> in
          the <a href="/">JSON Formatter</a> is best when you want to copy, edit or
          download the formatted text.
        </p>

        <h2>Tips for Large JSON Files</h2>
        <ul>
          <li>Use <strong>Collapse All</strong> first, then expand only the parts you need.</li>
          <li>Search inside the tree to jump to a key or value instead of scrolling.</li>
          <li>If a file is very large, check its size with the <a href="/json-size-calculator">JSON Size Calculator</a>, or pull out just the values you need with the <a href="/json-path">JSONPath Tester</a>.</li>
          <li>If the viewer reports an error, fix it with <a href="/json-repair">JSON Repair</a> and paste the result back.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON viewer free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>

        <h3>Is my JSON sent to a server?</h3>
        <p>No. Your JSON is read and displayed inside your browser.</p>

        <h3>What if my JSON has an error?</h3>
        <p>
          Common mistakes, like a missing comma, single quotes or comments,
          are repaired automatically so you can still see the tree, and the
          viewer lists every fix it made. If the JSON is too broken to repair
          safely, it shows the error and highlights the line in red. To copy
          the fixed JSON, use our <a href="/">JSON Formatter</a> or{' '}
          <a href="/json-repair">JSON Repair</a>, or read the{' '}
          <a href="/common-json-errors">Common JSON Errors guide</a>.
        </p>

        <h3>Can I format or minify my JSON?</h3>
        <p>
          Yes. Use our <a href="/">JSON Formatter</a> to beautify or minify
          your JSON and download the result.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/what-is-json">What Is JSON?</a>{' | '}
        <a href="/json-to-xml">JSON to XML</a>{' | '}
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