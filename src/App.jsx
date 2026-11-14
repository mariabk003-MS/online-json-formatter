import { useEffect, useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import { safeFix } from './safeFix.js'
import CodeEditor from './CodeEditor.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { JsonTreeView } from './JsonTree.jsx'
import { JsonGraph } from './JsonGraph.jsx'
import { ToolPanel, Tool, StatusBadge, Tabs, EmptyBox, Messages, MoreMenu } from './ToolLayout.jsx'
import {
  getErrorLocation,
  useLiveJsonCheck,
  describeText,
  formatSize,
  downloadText,
  readTextFile,
  describeFixes,
  makeShareCode,
  readShareCode,
  fetchText,
  printText,
} from './toolUtils.js'

// Links longer than this may not work in every browser or chat app.
const MAX_SHARE_LINK = 30000

function App() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [parsed, setParsed] = useState(undefined)
  const [resultVersion, setResultVersion] = useState(0)
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const [success, setSuccess] = useState('')
  const [indent, setIndent] = useState('2')
  const [outputTab, setOutputTab] = useState('code')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [autoFormat, setAutoFormat] = useState(true)
  const [urlBoxOpen, setUrlBoxOpen] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const fileInputRef = useRef(null)

  // Checks the input while the user types, so we can show ✓ / ✗ and the error line.
  const liveCheck = useLiveJsonCheck(json)

  // The input is NOT saved, for privacy. Remove any copy an older version saved.
  useEffect(() => {
    try {
      localStorage.removeItem('formatter-input')
    } catch {
      // Storage can be blocked. Nothing to remove then.
    }
  }, [])

  // Opening a share link (#json=...) or a ?url=... link loads that JSON.
  useEffect(() => {
    const hash = window.location.hash.match(/^#json=(.+)$/)
    const urlParam = new URLSearchParams(window.location.search).get('url')
    if (hash) {
      readShareCode(hash[1])
        .then((text) => formatInto(text, 'Shared JSON opened.'))
        .catch(() => showError('This share link is broken or incomplete. Please ask for the link again.'))
    } else if (urlParam) {
      loadFromUrl(urlParam)
    }
    // Runs once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setResultVersion((v) => v + 1)
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
    setShareUrl('')
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

  // Used by both the Upload button and drag & drop.
  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      showSuccess(`"${file.name}" loaded. Now click Fix & Format JSON or Minify.`)
    } catch (err) {
      showError(err.message)
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) readFile(file)
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('Result copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadJSON() {
    downloadText(result, 'formatted.json', 'application/json')
    showSuccess('JSON downloaded successfully!')
  }

  // Puts text in the input box and, when it can be read, formats it right away.
  function formatInto(text, message) {
    handleInputChange(text)
    try {
      const { parsed, fixedText, report } = parseWithFix(text)
      showResult(JSON.stringify(parsed, null, getIndent()), parsed)
      if (fixedText) setJson(fixedText)
      showSuccess(report ? `${message} ${describeFixes(report)}` : message)
    } catch {
      showSuccess(`${message} It has errors, so please check the red line.`)
    }
  }

  // Auto format: pasting JSON into an empty box formats it straight away.
  function handlePaste(event) {
    if (!autoFormat || json.trim()) return
    const text = event.clipboardData?.getData('text') || ''
    if (!text.trim()) return
    event.preventDefault()
    formatInto(text, 'Pasted and formatted automatically.')
  }

  async function shareLink() {
    if (!json.trim()) {
      showError('Please paste your JSON first, then click Share.')
      return
    }
    try {
      const code = await makeShareCode(result || json)
      const link = `${window.location.origin}/#json=${code}`
      if (link.length > MAX_SHARE_LINK) {
        showError('This JSON is too large to share as a link. Please use Download and send the file instead.')
        return
      }
      setShareUrl(link)
      let copied = false
      try {
        await navigator.clipboard.writeText(link)
        copied = true
      } catch {
        // Some browsers block the clipboard. The link is still shown below to copy by hand.
      }
      showSuccess(
        `${copied ? 'Share link copied!' : 'Share link created. Copy it from the box below.'} Anyone with the link can open this JSON. The data is inside the link itself, not stored on our server.`
      )
    } catch {
      showError('Could not create the share link in this browser.')
    }
  }

  async function loadFromUrl(url = urlValue) {
    if (!url.trim()) {
      showError('Please enter the link to a JSON file.')
      return
    }
    try {
      const text = await fetchText(url.trim())
      setUrlBoxOpen(false)
      formatInto(text, 'JSON loaded from the link.')
    } catch (err) {
      showError(err.message)
    }
  }

  function printResult() {
    try {
      printText(result, 'Formatted JSON')
    } catch (err) {
      showError(err.message)
    }
  }

  // Puts the result back into the input box, e.g. to keep editing it.
  function useResultAsInput() {
    handleInputChange(result)
    showSuccess('Result moved to the input box.')
  }

  // The red line in the editor: the live check, or the last error shown.
  const errorLine = liveCheck?.location?.line || errorLocation?.line || null

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON Formatter &amp; Beautifier Online</h1>
      <p>
        Free JSON formatter, beautifier and validator that auto-fixes errors.
        Private: your data never leaves your browser.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        onChange={handleFileUpload}
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
              <Tool onClick={() => setUrlBoxOpen(!urlBoxOpen)} title="Load JSON from a link">URL</Tool>
              <Tool onClick={clearAll}>Clear</Tool>
            </>
          }
          statusLeft={`Ln ${cursor.line}, Col ${cursor.column}`}
          statusRight={describeText(json)}
          footer={
            // Main actions, right under the input so they are easy to find on phones too
            <>
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
                    <option value="3">3 spaces</option>
                    <option value="4">4 spaces</option>
                    <option value="tab">Tab</option>
                  </select>
                </label>
              </div>
              <div className="options-row">
                <label className="option" title="When the box is empty, pasted JSON is formatted straight away">
                  <input
                    type="checkbox"
                    checked={autoFormat}
                    onChange={(event) => setAutoFormat(event.target.checked)}
                  />
                  Auto-format on paste
                </label>
              </div>
            </>
          }
        >
          {urlBoxOpen && (
            <form
              className="url-box"
              onSubmit={(event) => {
                event.preventDefault()
                loadFromUrl()
              }}
            >
              <input
                type="url"
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                placeholder="https://example.com/data.json"
                aria-label="Link to a JSON file"
                autoFocus
              />
              <button type="submit" className="tool">Load</button>
              <button type="button" className="tool" onClick={() => setUrlBoxOpen(false)}>Cancel</button>
            </form>
          )}
          <CodeEditor
            value={json}
            placeholder={'Paste your JSON here, or drop a .json file...\n\nTip: press Ctrl + Enter to fix and format.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            errorLine={errorLine}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="Result"
          tabs={
            <Tabs
              value={outputTab}
              onChange={setOutputTab}
              options={[
                { value: 'code', label: 'Code' },
                { value: 'tree', label: 'Tree' },
                { value: 'graph', label: 'Graph' },
              ]}
            />
          }
          tools={
            <>
              <Tool onClick={copyResult} disabled={!result}>Copy</Tool>
              <Tool onClick={shareLink} disabled={!json.trim()} title="Copy a link that opens this JSON">
                Share
              </Tool>
              <MoreMenu
                items={[
                  { label: 'Download .json', onClick: downloadJSON, disabled: !result },
                  { label: 'Use as input (edit)', onClick: useResultAsInput, disabled: !result },
                  { label: 'Print', onClick: printResult, disabled: !result },
                ]}
              />
            </>
          }
          statusLeft={result ? `${result.split('\n').length} lines` : 'No result yet'}
          statusRight={result ? formatSize(result) : ''}
        >
          {!result && <EmptyBox>Your formatted JSON will appear here.</EmptyBox>}
          {result && outputTab === 'code' && <JsonHighlight text={result} />}
          {result && outputTab === 'tree' && parsed !== undefined && (
            <JsonTreeView key={resultVersion} data={parsed} />
          )}
          {result && outputTab === 'graph' && parsed !== undefined && <JsonGraph data={parsed} />}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} location={errorLocation} />
      {shareUrl && (
        <div className="share-box">
          <label htmlFor="share-link">Share link</label>
          <input id="share-link" readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
          <button type="button" className="tool" onClick={() => setShareUrl('')}>Close</button>
          <p className="share-note">
            Your JSON is stored inside this link (after the #), which browsers never send to any server.
            Nothing is saved on our side. Anyone with the link can open it.
          </p>
        </div>
      )}

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
          <li>Choose 2, 3 or 4 spaces, or Tab indentation.</li>
          <li>Click Fix &amp; Format JSON to format your data, or Minify to compress it into one line.</li>
          <li>Review the output in the result panel.</li>
          <li>Click Copy, or open the ⋯ menu next to Share and choose Download .json to save your output.</li>
        </ol>

        <h2>Benefits of Our Online JSON Formatter</h2>
        <ul>
          <li>Format JSON into a readable structure.</li>
          <li>Choose your preferred indentation: 2, 3 or 4 spaces, or Tab.</li>
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
          <li>Colored result with line numbers, a Tree view you can expand and collapse, and a Graph view that draws your JSON as a diagram.</li>
          <li>Dark mode, full screen editing and drag &amp; drop file upload.</li>
          <li>Share your JSON with a private link, load JSON from a URL, auto-format on paste and print.</li>
          <li>Copy the formatted JSON, or download it from the ⋯ menu.</li>
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
          Yes. Open the ⋯ menu next to Share and choose Download .json to save
          the formatted result as a file.
        </p>

        <h3>How does the Share link work? Is it private?</h3>
        <p>
          Your JSON is compressed and placed inside the link itself, after the
          # sign. Browsers never send that part of a link to any server, so
          nothing is uploaded or stored on our side. The link keeps working for
          as long as you keep it, and anyone you give it to can open the JSON,
          so only share it with people who should see the data.
        </p>

        <h3>What happens when I load JSON from a URL?</h3>
        <p>
          Your browser downloads the file directly from the website you enter.
          It does not pass through our server. Some websites block this for
          security reasons (CORS); in that case, download the file and use
          Upload instead.
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
        <a href="/json-compare">JSON Compare</a>
        {' | '}
        <a href="/json-repair">JSON Repair</a>
        {' | '}
        <a href="/json-to-yaml">JSON to YAML</a>
        {' | '}
        <a href="/xml-to-json">XML to JSON</a>
        {' | '}
        <a href="/tools">All Tools</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/unexpected-token-in-json">Unexpected Token in JSON</a>
        {' | '}
        <a href="/pretty-print-json">How to Pretty Print JSON</a>
        {' | '}
        <a href="/json-to-xml">JSON to XML Converter</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default App