import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { JsonTreeView } from './JsonTree.jsx'
import { ToolPanel, Tool, StatusBadge, Tabs, EmptyBox } from './ToolLayout.jsx'
import {
  getErrorLocation,
  useLiveJsonCheck,
  describeText,
  formatSize,
  readTextFile,
} from './toolUtils.js'

// Gives a simple tip for the most common JSON mistakes.
function getHint(text, message) {
  if (/Expected ','/i.test(message)) {
    return 'A comma is probably missing at the end of the previous line, or between two values.'
  }
  if (/,\s*[}\]]/.test(text)) {
    return 'There may be a trailing comma before a closing } or ]. Remove the last comma.'
  }
  if (/'[^'\n]*'\s*:/.test(text) || /:\s*'[^'\n]*'/.test(text)) {
    return 'JSON needs double quotes ("), not single quotes.'
  }
  if (/(^|\s)\/\//m.test(text) || /\/\*/.test(text)) {
    return 'JSON does not allow comments. Remove any // or /* */ comments.'
  }
  if (/[{,]\s*[A-Za-z_$][\w$]*\s*:/.test(text)) {
    return 'Every key must be in double quotes, for example "name": "Emily".'
  }
  if (/end of|unexpected end/i.test(message)) {
    return 'The JSON ends too early. Check for a missing } or ].'
  }
  return 'Check the marked line for a missing comma, quote, or bracket.'
}

function getDepth(value) {
  if (value === null || typeof value !== 'object') return 0
  let max = 0
  for (const child of Object.values(value)) {
    const depth = getDepth(child)
    if (depth > max) max = depth
  }
  return max + 1
}

// One sample with a single missing comma, so visitors can see how errors are shown.
const SAMPLE = [
  '{',
  '  "id": 1024,',
  '  "name": "Emily Clark",',
  '  "email": "emily.clark@example.com"',
  '  "isActive": true,',
  '  "skills": ["JSON", "React", "API"],',
  '  "address": {',
  '    "city": "London",',
  '    "country": "United Kingdom"',
  '  }',
  '}',
].join('\n')

function JsonValidator() {
  const [json, setJson] = useState('')
  const [status, setStatus] = useState(null)
  const [tab, setTab] = useState('report')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(json)

  function handleInputChange(text) {
    setJson(text)
    setStatus(null)
  }

  function validate(text = json) {
    if (!text.trim()) {
      setStatus({ empty: true })
      setTab('report')
      return
    }

    try {
      const parsed = JSON.parse(text)
      const isArray = Array.isArray(parsed)
      const isObject = parsed !== null && typeof parsed === 'object' && !isArray
      setStatus({
        valid: true,
        parsed,
        formatted: JSON.stringify(parsed, null, 2),
        type: isArray ? 'Array' : isObject ? 'Object' : typeof parsed,
        count: isArray ? parsed.length : isObject ? Object.keys(parsed).length : null,
        depth: getDepth(parsed),
        size: formatSize(text),
        lines: text.split('\n').length,
      })
    } catch (err) {
      setStatus({
        valid: false,
        message: err.message,
        location: getErrorLocation(text, err),
        hint: getHint(text, err.message),
      })
      setTab('report')
    }
  }

  function loadSample() {
    handleInputChange(SAMPLE)
  }

  function clearAll() {
    handleInputChange('')
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      validate(text)
    } catch (err) {
      setStatus({ valid: false, message: err.message, location: null, hint: '' })
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      validate()
    }
  }

  // Formatted / Tree tabs only make sense for valid JSON.
  const tabs = status?.valid
    ? [
        { value: 'report', label: 'Report' },
        { value: 'code', label: 'Formatted' },
        { value: 'tree', label: 'Tree' },
      ]
    : [{ value: 'report', label: 'Report' }]
  const activeTab = status?.valid ? tab : 'report'

  let statusLeft = 'Not checked yet'
  if (status?.valid) statusLeft = '✓ Valid'
  if (status?.valid === false) statusLeft = '✗ Invalid'

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON Validator Online</h1>
      <p>
        Free online JSON validator and syntax checker. Find the exact line and
        column of any error. Your data stays in your browser.
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
              <button type="button" className="action-primary" onClick={() => validate()} title="Shortcut: Ctrl + Enter">
                Validate JSON
              </button>
              <a className="action-link" href="/">
                Auto-fix errors in the JSON Formatter →
              </a>
            </div>
          }
        >
          <CodeEditor
            value={json}
            placeholder={'Paste your JSON here, or drop a .json file...\n\nTip: press Ctrl + Enter to validate.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            errorLine={liveCheck?.location?.line || status?.location?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="Result"
          tabs={<Tabs value={activeTab} onChange={setTab} options={tabs} />}
          statusLeft={statusLeft}
          statusRight={status?.valid ? `${status.lines} lines · ${status.size}` : ''}
        >
          {!status && <EmptyBox>Your validation result will appear here.</EmptyBox>}

          {status?.empty && <EmptyBox>Please paste your JSON first.</EmptyBox>}

          {status?.valid === true && activeTab === 'report' && (
            <div className="report">
              <div className="report-title report-ok">✓ Valid JSON. No errors found.</div>
              <dl className="report-grid">
                <dt>Type</dt>
                <dd>{status.type}</dd>
                {status.count !== null && (
                  <>
                    <dt>{status.type === 'Array' ? 'Items' : 'Top-level keys'}</dt>
                    <dd>{status.count}</dd>
                  </>
                )}
                <dt>Nesting depth</dt>
                <dd>{status.depth}</dd>
                <dt>Lines</dt>
                <dd>{status.lines}</dd>
                <dt>Size</dt>
                <dd>{status.size}</dd>
              </dl>
              <p className="report-note">Open the Formatted or Tree tab to read your JSON.</p>
            </div>
          )}

          {status?.valid === true && activeTab === 'code' && <JsonHighlight text={status.formatted} />}
          {status?.valid === true && activeTab === 'tree' && <JsonTreeView data={status.parsed} />}

          {status?.valid === false && (
            <div className="report">
              <div className="report-title report-bad">✗ Invalid JSON</div>
              {status.location && (
                <>
                  <p className="report-where">
                    Error at <strong>line {status.location.line}</strong>, column {status.location.column}
                  </p>
                  <pre className="report-code">
                    {`${status.location.snippet}\n${status.location.pointer}`}
                  </pre>
                </>
              )}
              <p className="report-message">{status.message}</p>
              {status.hint && (
                <p className="report-tip">
                  <strong>Tip:</strong> {status.hint}
                </p>
              )}
              <p className="report-note">
                Want it fixed for you? Paste it into the <a href="/">JSON Formatter</a> and click
                Fix &amp; Format JSON.
              </p>
            </div>
          )}
        </ToolPanel>
      </div>

      <section className="seo-content">
        <h2>What Is a JSON Validator?</h2>
        <p>
          A JSON validator checks whether your data follows the rules of the
          JSON format. If something is wrong, this tool shows the exact line
          and column of the problem, so you can fix it quickly instead of
          searching through the whole file.
        </p>

        <h2>How to Validate JSON</h2>
        <ol>
          <li>Paste your JSON into the Input box, click Upload, or click Sample.</li>
          <li>Click Validate JSON.</li>
          <li>If the JSON is valid, you will see its type, size, and a formatted copy.</li>
          <li>If it is invalid, read the line number, the marked position, and the tip to fix it.</li>
        </ol>

        <h2>My Quick Test</h2>
        <p>
          To check the tool myself, I pasted a small JSON object with one
          common mistake: an extra comma after the last value. As soon as I
          clicked Validate JSON, the red error message told me the problem was
          on line 5, column 4, so I knew exactly where to look. The tool also
          marked the spot with a ^ symbol and showed a tip to remove the last
          comma.
        </p>
        <figure style={{ margin: '1.5rem 0' }}>
          <img
            src="/images/json-validator-error.png"
            alt="JSON Validator showing an Invalid JSON error at line 5 column 4, with the position marked and a tip to remove a trailing comma"
            width="1500"
            height="385"
            loading="lazy"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
            }}
          />
          <figcaption style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>
            Example: a trailing comma caught by our JSON Validator, with the
            exact line and column.
          </figcaption>
        </figure>

        <h2>Common JSON Errors</h2>
        <ul>
          <li>Missing comma between two values or properties.</li>
          <li>Trailing comma after the last item, such as [1, 2, 3,].</li>
          <li>Single quotes instead of double quotes around keys or strings.</li>
          <li>Keys without quotes, such as name: "Ali" instead of "name": "Ali".</li>
          <li>Comments, which are not allowed in standard JSON.</li>
          <li>Missing closing bracket {'}'} or ].</li>
        </ul>
        <p>
          See wrong and correct examples for each error in our{' '}
          <a href="/common-json-errors">Common JSON Errors guide</a>, or learn
          what each message means in{' '}
          <a href="/unexpected-token-in-json">Unexpected Token in JSON</a>.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>Is this JSON validator free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>

        <h3>Is my JSON sent to a server?</h3>
        <p>No. Validation happens inside your browser.</p>

        <h3>Can this tool fix my JSON?</h3>
        <p>
          This page shows where the error is. To automatically fix common
          trailing-comma mistakes and format your data, use our{' '}
          <a href="/">JSON Formatter</a>.
        </p>

        <h3>What is the difference between a JSON validator and a JSON formatter?</h3>
        <p>
          A JSON validator checks if your data is correct and shows where any
          error is. A JSON formatter makes valid JSON easier to read by adding
          spacing and indentation. Validate first, then use the{' '}
          <a href="/">JSON Formatter</a> or the{' '}
          <a href="/json-viewer">JSON Viewer</a> to read the result.
        </p>

        <h3>Does this tool check JSON Schema?</h3>
        <p>
          No. This validator checks JSON syntax, which means it confirms the
          data follows the JSON format rules. It does not compare your data
          against a JSON Schema.
        </p>

        <h3>Can I convert valid JSON to CSV?</h3>
        <p>
          Yes. Use our <a href="/json-to-csv">JSON to CSV Converter</a> to
          create a CSV file for Excel or Google Sheets.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/what-is-json">What Is JSON?</a>{' | '}
        <a href="/json-viewer">JSON Viewer</a>{' | '}
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/json-to-xml">JSON to XML Converter</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonValidator