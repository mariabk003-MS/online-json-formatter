import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import NavBar from './NavBar.jsx'
import { safeFix } from './safeFix.js'
import './Formatter.css'
import CodeEditor from './CodeEditor.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { TreeNode } from './JsonViewer.jsx'

// Friendly names for each kind of fix that safeFix can make.
const FIX_LABELS = {
  trailingCommas: 'trailing comma removed',
  missingCommas: 'missing comma added',
  missingColons: 'missing colon added',
  wrongColons: '"," or "=" changed to ":"',
  lineBreaks: 'line break inside a string escaped',
  controlChars: 'tab or control character escaped',
  comments: 'comment removed',
  singleQuotes: 'single quote changed to double quote',
  smartQuotes: 'curly quote changed to straight quote',
  unquotedKeys: 'quotes added around a key',
  pythonValues: 'True/False/None changed to true/false/null',
  missingBrackets: 'missing closing bracket added',
  missingQuotes: 'missing closing quote added',
}

// Turns a safeFix report into a sentence like:
// "Fixed 3 problems: trailing comma removed (×2), missing colon added."
function describeFixes(report) {
  const parts = Object.entries(report).map(([kind, count]) => {
    const label = FIX_LABELS[kind] || kind
    return count > 1 ? `${label} (×${count})` : label
  })
  const total = Object.values(report).reduce((sum, count) => sum + count, 0)
  if (total === 0) return 'JSON was cleaned up and formatted.'
  return `Fixed ${total} problem${total > 1 ? 's' : ''}: ${parts.join(', ')}.`
}

// Finds the line and column of a JSON.parse error, and the text of that line.
function getErrorLocation(text, err) {
  let line
  let column
  const lineMatch = err.message.match(/line (\d+) column (\d+)/)
  const posMatch = err.message.match(/position (\d+)/)
  let position = posMatch ? Number(posMatch[1]) : -1

  // Chrome sometimes gives no position, only a short piece of the text, like:
  // Unexpected token 'h', ..."1,\n  "b": hello\n}" is not valid JSON
  // The piece starts 10 characters before the problem when it begins with "...".
  const tokenMatch = err.message.match(/^Unexpected token '(.)', (\.\.\.)?"([\s\S]*?)"(\.\.\.)? is not valid JSON/)
  if (!lineMatch && position === -1 && tokenMatch) {
    const [, token, cutAtStart, piece] = tokenMatch
    const pieceStart = text.indexOf(piece)
    if (pieceStart !== -1) {
      position = cutAtStart ? pieceStart + 10 : pieceStart + piece.indexOf(token)
    }
  }

  if (lineMatch) {
    line = Number(lineMatch[1])
    column = Number(lineMatch[2])
  } else if (position !== -1) {
    const before = text.slice(0, position)
    line = before.split('\n').length
    column = before.length - before.lastIndexOf('\n')
  } else {
    return null
  }

  // Show at most 60 characters around the problem, so long lines still fit.
  const fullLine = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
  const start = Math.max(0, column - 40)
  const snippet = fullLine.slice(start, start + 60)
  const pointer = ' '.repeat(Math.max(0, column - 1 - start)) + '^'

  return { line, column, snippet, pointer }
}

// Reads a saved value from the browser. Returns '' if storage is blocked.
function loadSaved(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be blocked (private window). The tool still works without it.
  }
}

function formatSize(text) {
  const bytes = new Blob([text]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function getStartTheme() {
  const saved = loadSaved('theme')
  let theme = saved
  if (saved !== 'dark' && saved !== 'light') {
    theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  // Set it right away, so the page does not flash light before turning dark.
  document.body.classList.toggle('dark', theme === 'dark')
  return theme
}

// Inputs bigger than this are not checked while typing, to keep typing fast.
const LIVE_CHECK_LIMIT = 500 * 1024

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [parsed, setParsed] = useState(undefined)
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const [success, setSuccess] = useState('')
  const [indent, setIndent] = useState('2')
  const [outputTab, setOutputTab] = useState('code')
  const [openAll, setOpenAll] = useState(null)
  const [treeVersion, setTreeVersion] = useState(0)
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [theme, setTheme] = useState(getStartTheme)
  const [fullscreen, setFullscreen] = useState(null) // null, 'input' or 'output'
  const fileInputRef = useRef(null)

  // Checks the input while the user types, so we can show ✓ / ✗ and the error line.
  const liveCheck = useMemo(() => {
    if (!json.trim() || json.length > LIVE_CHECK_LIMIT) return null
    try {
      JSON.parse(json)
      return { valid: true }
    } catch (err) {
      return { valid: false, location: getErrorLocation(json, err) }
    }
  }, [json])

  // Dark mode: add a class to <body> so the whole page changes color.
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    save('theme', theme)
    return () => document.body.classList.remove('dark')
  }, [theme])

  // The input is NOT saved, for privacy. Remove any copy an older version saved.
  useEffect(() => {
    try {
      localStorage.removeItem('formatter-input')
    } catch {
      // Storage can be blocked. Nothing to remove then.
    }
  }, [])

  // Esc closes full screen.
  useEffect(() => {
    if (!fullscreen) return
    function onKey(event) {
      if (event.key === 'Escape') setFullscreen(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  function getIndent() {
    return indent === 'tab' ? '\t' : Number(indent)
  }

  function showError(message, location = null) {
    setResult('')
    setParsed(undefined)
    setSuccess('')
    setError(message)
    setErrorLocation(location)
  }

  function showSuccess(message) {
    setError('')
    setErrorLocation(null)
    setSuccess(message)
  }

  function showResult(text, data) {
    setResult(text)
    setParsed(data)
    setOpenAll(null)
    setTreeVersion((v) => v + 1)
  }

  function parseWithFix(text) {
    try {
      return { parsed: JSON.parse(text), fixedText: null, report: null }
    } catch {
      const report = {}
      const fixed = safeFix(text.trim(), report)
      return { parsed: JSON.parse(fixed), fixedText: fixed, report }
    }
  }

  // Shows where the ORIGINAL input is broken (line, column and a pointer).
  function showParseError(prefix) {
    let location = null
    let message = ''
    try {
      JSON.parse(json)
    } catch (err) {
      location = getErrorLocation(json, err)
      message = err.message
    }
    // Add the line/column only if the browser's message does not already say it.
    const where =
      location && !/line \d+/.test(message)
        ? ` (line ${location.line}, column ${location.column})`
        : ''
    showError(
      `${prefix}${where}. ${message} Please correct the input near the marked spot.`,
      location
    )
  }

  function fixAndFormatJSON() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    try {
      const { parsed, fixedText, report } = parseWithFix(json)
      showResult(JSON.stringify(parsed, null, getIndent()), parsed)

      if (fixedText) {
        setJson(fixedText)
        showSuccess(describeFixes(report))
      } else {
        showSuccess('Valid JSON! Formatted successfully.')
      }
    } catch {
      showParseError('Could not safely fix this JSON')
    }
  }

  function minifyJSON() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    try {
      const { parsed, report } = parseWithFix(json)
      showResult(JSON.stringify(parsed), parsed)
      showSuccess(
        report ? `JSON minified. ${describeFixes(report)}` : 'JSON minified successfully!'
      )
    } catch {
      showParseError('Could not minify this JSON')
    }
  }

  // Ctrl + Enter (or Cmd + Enter on Mac) runs Fix & Format.
  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      fixAndFormatJSON()
    }
  }

  function handleInputChange(text) {
    setJson(text)
    setError('')
    setErrorLocation(null)
    setSuccess('')
    setResult('')
    setParsed(undefined)
  }

  // A short, real-looking customer record with 2 small mistakes, so visitors
  // see the red error line and can fix it with one click.
  function loadSample() {
    handleInputChange(
      [
        '{',
        '  "id": 1024,',
        '  "name": "Emily Clark",',
        '  "email": "emily.clark@example.com",',
        '  "isActive": true,',
        '  "balance": 2500.75,',
        '  "manager": null,',
        '  "skills": ["JSON", "React", "API"]',
        '  "address": {',
        '    "city": "London",',
        '    "country": "United Kingdom",',
        '  }',
        '}',
      ].join('\n')
    )
    setSuccess('Sample loaded with 2 small mistakes. Click Fix & Format JSON to repair them.')
  }

  function clearAll() {
    handleInputChange('')
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  // Used by both the Upload button and drag & drop.
  async function readFile(file) {
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError('File is too large. Please upload a file smaller than 5 MB.')
      return
    }

    try {
      const text = await file.text()
      handleInputChange(text)
      showSuccess(`"${file.name}" loaded. Now click Fix & Format JSON or Minify JSON.`)
    } catch {
      showError('Could not read this file. Please try another .json or .txt file.')
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) readFile(file)
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

  // Puts the result back into the input box, e.g. to keep editing it.
  function useResultAsInput() {
    if (!result) return
    handleInputChange(result)
    showSuccess('Result moved to the input box.')
  }

  function expandAll() {
    setOpenAll(true)
    setTreeVersion((v) => v + 1)
  }

  function collapseAll() {
    setOpenAll(false)
    setTreeVersion((v) => v + 1)
  }

  function toggleFullscreen(panel) {
    setFullscreen(fullscreen === panel ? null : panel)
  }

  // The red line in the editor: the live check, or the last error shown.
  const errorLine = liveCheck?.location?.line || errorLocation?.line || null

  let status = null
  if (liveCheck?.valid) {
    status = <span className="status-badge status-ok">✓ Valid JSON</span>
  } else if (liveCheck && !liveCheck.valid) {
    status = (
      <span className="status-badge status-bad">
        ✗ Invalid JSON{liveCheck.location ? ` – line ${liveCheck.location.line}` : ''}
      </span>
    )
  }

  return (
    <div className="app formatter">
      <NavBar />
      <h1>JSON Formatter &amp; Beautifier Online</h1>
      <p>
        Free online JSON formatter, beautifier and validator. Paste your JSON
        to format, validate or minify it instantly. Your data stays in your
        browser and is never uploaded.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div className="editor-layout">
        <section className={`editor-panel${fullscreen === 'input' ? ' panel-fullscreen' : ''}`}>
          <div className="panel-header">
            <h2>Input</h2>
            {status}
            <div className="toolbar">
              <button type="button" className="tool" onClick={loadSample}>Sample</button>
              <button type="button" className="tool" onClick={openFilePicker}>Upload</button>
              <button type="button" className="tool" onClick={clearAll}>Clear</button>
              <button
                type="button"
                className="tool tool-icon"
                onClick={() => toggleFullscreen('input')}
                title={fullscreen === 'input' ? 'Exit full screen (Esc)' : 'Full screen'}
                aria-label={fullscreen === 'input' ? 'Exit full screen' : 'Full screen'}
              >
                {fullscreen === 'input' ? '✕' : '⛶'}
              </button>
            </div>
          </div>

          <div className="panel-box">
            <CodeEditor
              value={json}
              placeholder={'Paste your JSON here, or drop a .json file...\n\nTip: press Ctrl + Enter to fix and format.'}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              errorLine={errorLine}
              onCursor={setCursor}
              onFileDrop={readFile}
            />
            <div className="status-bar">
              <span>
                Ln {cursor.line}, Col {cursor.column}
              </span>
              <span>
                {json ? `${json.split('\n').length} lines · ${formatSize(json)}` : 'Empty'}
              </span>
            </div>
          </div>

          {/* Main actions, right under the input so they are easy to find on phones too */}
          <div className="action-bar">
            <button type="button" className="action-primary" onClick={fixAndFormatJSON} title="Shortcut: Ctrl + Enter">
              Fix &amp; Format JSON
            </button>
            <button type="button" className="action-secondary" onClick={minifyJSON}>
              Minify
            </button>
            <label className="indent-select">
              Indent
              <select value={indent} onChange={(event) => setIndent(event.target.value)}>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </label>
            <button
              type="button"
              className="tool tool-icon theme-toggle"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </section>

        <section className={`editor-panel${fullscreen === 'output' ? ' panel-fullscreen' : ''}`}>
          <div className="panel-header">
            <h2>Result</h2>
            <div className="tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={outputTab === 'code'}
                className={outputTab === 'code' ? 'tab active' : 'tab'}
                onClick={() => setOutputTab('code')}
              >
                Code
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={outputTab === 'tree'}
                className={outputTab === 'tree' ? 'tab active' : 'tab'}
                onClick={() => setOutputTab('tree')}
              >
                Tree
              </button>
            </div>
            <div className="toolbar">
              <button type="button" className="tool" onClick={copyResult} disabled={!result}>Copy</button>
              <button type="button" className="tool" onClick={downloadJSON} disabled={!result}>Download</button>
              <button
                type="button"
                className="tool"
                onClick={useResultAsInput}
                disabled={!result}
                title="Move the result into the input box"
              >
                Edit
              </button>
              <button
                type="button"
                className="tool tool-icon"
                onClick={() => toggleFullscreen('output')}
                title={fullscreen === 'output' ? 'Exit full screen (Esc)' : 'Full screen'}
                aria-label={fullscreen === 'output' ? 'Exit full screen' : 'Full screen'}
              >
                {fullscreen === 'output' ? '✕' : '⛶'}
              </button>
            </div>
          </div>

          <div className="panel-box">
            {!result && (
              <div className="result-empty">Your formatted JSON will appear here.</div>
            )}

            {result && outputTab === 'code' && <JsonHighlight text={result} />}

            {result && outputTab === 'tree' && parsed !== undefined && (
              <div className="tree-wrap">
                <div className="tree-actions">
                  <button type="button" className="tool" onClick={expandAll}>Expand all</button>
                  <button type="button" className="tool" onClick={collapseAll}>Collapse all</button>
                </div>
                <div className="jv-tree" key={treeVersion}>
                  <TreeNode value={parsed} depth={0} openAll={openAll} />
                </div>
              </div>
            )}

            <div className="status-bar">
              <span>{result ? `${result.split('\n').length} lines` : 'No result yet'}</span>
              <span>{result ? formatSize(result) : ''}</span>
            </div>
          </div>
        </section>
      </div>

      {error &&<p className="error">{error}</p>}
      {errorLocation && (
        <pre className="error-location">
          {`Line ${errorLocation.line}: ${errorLocation.snippet}\n`}
          {' '.repeat(`Line ${errorLocation.line}: `.length) + errorLocation.pointer}
        </pre>
      )}
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
          <li>Paste your JSON data into the Input box, or click Upload to open a .json or .txt file.</li>
          <li>Choose 2 spaces, 4 spaces, or Tab indentation.</li>
          <li>Click Fix &amp; Format JSON to format your data, or Minify to compress it into one line.</li>
          <li>Review the output in the result panel.</li>
          <li>Click Copy or Download to save your output.</li>
        </ol>

        <h2>Benefits of Our Online JSON Formatter</h2>
        <ul>
          <li>Format JSON into a readable structure.</li>
          <li>Choose your preferred indentation: 2 spaces, 4 spaces, or Tab.</li>
          <li>Minify JSON to remove extra spaces and reduce file size.</li>
          <li>Upload JSON files directly from your computer.</li>
          <li>Check JSON syntax and see the exact line and column of any error.</li>
          <li>
            Fix common mistakes automatically: trailing or missing commas,
            missing colons, single quotes, unquoted keys, comments, line breaks
            inside strings, Python True/False/None and missing closing brackets.
          </li>
          <li>See a list of every fix that was made.</li>
          <li>Line numbers, live “Valid / Invalid” check and the error line highlighted in red.</li>
          <li>Colored result with line numbers, plus a Tree view you can expand and collapse.</li>
          <li>Dark mode, full screen editing and drag &amp; drop file upload.</li>
          <li>Copy or download the formatted JSON result.</li>
          <li>Process JSON directly in your browser.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON formatter free?</h3>
        <p>Yes. You can use this online JSON formatter for free.</p>

        <h3>Can this tool fix invalid JSON?</h3>
        <p>
          Yes, it can fix many common mistakes: trailing commas, missing commas
          or colons, single or curly quotes, keys without quotes, // and /* */
          comments, real line breaks inside strings, Python True/False/None and
          missing closing brackets. After fixing, it tells you exactly what was
          changed. If something cannot be fixed safely, it shows the line and
          column of the error so you can correct it yourself.
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
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/what-is-json">What Is JSON?</a>{' | '}
        <a href="/json-viewer">JSON Viewer</a>{' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
                <a href="/csv-to-json">CSV to JSON Converter</a>
                {' | '}
                <a href="/about">About</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/json-to-xml">JSON to XML Converter</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default App