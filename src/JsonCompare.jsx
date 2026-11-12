import { useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import { safeFix } from './safeFix.js'
import { ToolPanel, Tool, StatusBadge, EmptyBox, Messages } from './ToolLayout.jsx'
import { getErrorLocation, useLiveJsonCheck, describeText } from './toolUtils.js'

// Parses JSON, and quietly repairs small mistakes (like trailing commas) if needed.
function parseWithFix(text) {
  try {
    return JSON.parse(text)
  } catch {
    return JSON.parse(safeFix(text.trim()))
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Adds a key to a path: $.address.city, $["first name"], $.skills[2]
function childPath(path, key) {
  if (typeof key === 'number') return `${path}[${key}]`
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`
}

// Walks both values and lists every difference.
// Key order does not matter; array items are compared by position.
function findDifferences(before, after, path = '$', out = []) {
  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of keys) {
      const p = childPath(path, key)
      if (!(key in after)) out.push({ type: 'removed', path: p, before: before[key] })
      else if (!(key in before)) out.push({ type: 'added', path: p, after: after[key] })
      else findDifferences(before[key], after[key], p, out)
    }
    return out
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length)
    for (let i = 0; i < length; i++) {
      const p = childPath(path, i)
      if (i >= after.length) out.push({ type: 'removed', path: p, before: before[i] })
      else if (i >= before.length) out.push({ type: 'added', path: p, after: after[i] })
      else findDifferences(before[i], after[i], p, out)
    }
    return out
  }

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    out.push({ type: 'changed', path, before, after })
  }
  return out
}

// Short, one-line text for a value in the differences list.
function preview(value) {
  const text = JSON.stringify(value)
  return text.length > 120 ? text.slice(0, 117) + '...' : text
}

const SAMPLE_BEFORE = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@example.com',
    isActive: true,
    skills: ['JSON', 'React'],
    address: { city: 'London', country: 'United Kingdom' },
  },
  null,
  2
)

const SAMPLE_AFTER = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@company.com',
    isActive: false,
    skills: ['JSON', 'React', 'API'],
    address: { city: 'Manchester', country: 'United Kingdom' },
    phone: '+44 20 7946 0000',
  },
  null,
  2
)

const LABELS = { added: 'Added', removed: 'Removed', changed: 'Changed' }

function JsonCompare() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [diffs, setDiffs] = useState(null)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const leftCheck = useLiveJsonCheck(left)
  const rightCheck = useLiveJsonCheck(right)

  function resetResult() {
    setDiffs(null)
    setError('')
    setErrorLocation(null)
  }

  function parseSide(text, name) {
    try {
      return { value: parseWithFix(text) }
    } catch {
      let location = null
      let message = ''
      try {
        JSON.parse(text)
      } catch (err) {
        location = getErrorLocation(text, err)
        message = err.message
      }
      return { error: `The ${name} JSON is not valid. ${message}`, location }
    }
  }

  function compare() {
    if (!left.trim() || !right.trim()) {
      setDiffs(null)
      setError('Please paste JSON into both boxes first.')
      return
    }
    const a = parseSide(left, 'Original')
    if (a.error) {
      setDiffs(null)
      setError(a.error)
      setErrorLocation(a.location)
      return
    }
    const b = parseSide(right, 'Modified')
    if (b.error) {
      setDiffs(null)
      setError(b.error)
      setErrorLocation(b.location)
      return
    }
    setError('')
    setErrorLocation(null)
    setFilter('all')
    setDiffs(findDifferences(a.value, b.value))
  }

  function loadSample() {
    setLeft(SAMPLE_BEFORE)
    setRight(SAMPLE_AFTER)
    resetResult()
  }

  function swap() {
    setLeft(right)
    setRight(left)
    resetResult()
  }

  function clearAll() {
    setLeft('')
    setRight('')
    resetResult()
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      compare()
    }
  }

  const counts = { added: 0, removed: 0, changed: 0 }
  for (const diff of diffs || []) counts[diff.type]++
  const shown = (diffs || []).filter((diff) => filter === 'all' || diff.type === filter)

  return (
    <div className="app tool-page compare-page">
      <NavBar />
      <h1>JSON Compare – Find Differences Online</h1>
      <p>
        Compare two JSON files and see exactly what was added, removed or
        changed. Key order is ignored. Your data never leaves your browser.
      </p>

      <div className="editor-layout">
        <ToolPanel
          title="Original"
          badge={<StatusBadge check={leftCheck} />}
          tools={<Tool onClick={() => { setLeft(''); resetResult() }}>Clear</Tool>}
          statusRight={describeText(left)}
        >
          <CodeEditor
            value={left}
            placeholder={'Paste the original JSON here...'}
            onChange={(text) => {
              setLeft(text)
              resetResult()
            }}
            onKeyDown={handleKeyDown}
            errorLine={leftCheck?.location?.line || null}
            onFileDrop={async (file) => {
              setLeft(await file.text())
              resetResult()
            }}
          />
        </ToolPanel>

        <ToolPanel
          title="Modified"
          badge={<StatusBadge check={rightCheck} />}
          tools={<Tool onClick={() => { setRight(''); resetResult() }}>Clear</Tool>}
          statusRight={describeText(right)}
        >
          <CodeEditor
            value={right}
            placeholder={'Paste the changed JSON here...\n\nTip: press Ctrl + Enter to compare.'}
            onChange={(text) => {
              setRight(text)
              resetResult()
            }}
            onKeyDown={handleKeyDown}
            errorLine={rightCheck?.location?.line || null}
            onFileDrop={async (file) => {
              setRight(await file.text())
              resetResult()
            }}
          />
        </ToolPanel>
      </div>

      <div className="action-bar">
        <button type="button" className="action-primary" onClick={compare} title="Shortcut: Ctrl + Enter">
          Compare JSON
        </button>
        <button type="button" className="action-secondary" onClick={swap}>
          ⇄ Swap
        </button>
        <Tool onClick={loadSample}>Sample</Tool>
        <Tool onClick={clearAll}>Clear all</Tool>
      </div>

      <Messages error={error} location={errorLocation} />

      <ToolPanel
        title="Differences"
        badge={
          diffs && (
            <span className={`status-badge ${diffs.length ? 'status-bad' : 'status-ok'}`}>
              {diffs.length ? `${diffs.length} difference${diffs.length > 1 ? 's' : ''}` : '✓ Identical'}
            </span>
          )
        }
        tabs={
          diffs && diffs.length > 0 && (
            <div className="tabs" role="tablist">
              {['all', 'added', 'removed', 'changed'].map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={filter === type}
                  className={filter === type ? 'tab active' : 'tab'}
                  onClick={() => setFilter(type)}
                >
                  {type === 'all' ? `All (${diffs.length})` : `${LABELS[type]} (${counts[type]})`}
                </button>
              ))}
            </div>
          )
        }
        statusLeft={
          diffs
            ? `${counts.added} added · ${counts.removed} removed · ${counts.changed} changed`
            : 'Not compared yet'
        }
      >
        {!diffs && <EmptyBox>The differences will appear here.</EmptyBox>}
        {diffs && diffs.length === 0 && (
          <EmptyBox>Both JSON documents have the same data. No differences found.</EmptyBox>
        )}
        {diffs && diffs.length > 0 && (
          <div className="diff-list">
            {shown.map((diff) => (
              <div key={diff.type + diff.path} className={`diff-row diff-${diff.type}`}>
                <span className="diff-type">{LABELS[diff.type]}</span>
                <code className="diff-path">{diff.path}</code>
                <span className="diff-values">
                  {diff.type === 'removed' && <code className="diff-old">{preview(diff.before)}</code>}
                  {diff.type === 'added' && <code className="diff-new">{preview(diff.after)}</code>}
                  {diff.type === 'changed' && (
                    <>
                      <code className="diff-old">{preview(diff.before)}</code>
                      <span className="diff-arrow">→</span>
                      <code className="diff-new">{preview(diff.after)}</code>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </ToolPanel>

      <section className="seo-content">
        <h2>What Is a JSON Compare Tool?</h2>
        <p>
          A JSON compare tool (also called a JSON diff tool) checks two JSON
          documents and lists every difference between them. It is useful when
          you want to see what changed between two API responses, two versions
          of a config file, or test data before and after an update.
        </p>

        <h2>How to Compare Two JSON Files</h2>
        <ol>
          <li>Paste the original JSON into the left box and the changed JSON into the right box. You can also drop a .json file on each box.</li>
          <li>Click Compare JSON, or press Ctrl + Enter.</li>
          <li>Read the list of differences. Use the Added, Removed and Changed tabs to filter it.</li>
          <li>Click Swap to compare in the other direction.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Shows added, removed and changed values with their full path, like $.address.city.</li>
          <li>Ignores key order, so {'{"a":1,"b":2}'} and {'{"b":2,"a":1}'} count as the same.</li>
          <li>Compares nested objects and arrays at any depth.</li>
          <li>Repairs small mistakes like trailing commas automatically before comparing.</li>
          <li>Works in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>How to Read the Results</h2>
        <p>
          Every difference is shown with its <strong>path</strong>, which tells you
          exactly where it is. <code>$</code> means the top of the document, a dot
          goes into an object, and a number in brackets is a position in an
          array. For example:
        </p>
        <ul>
          <li><code>$.email</code>: the email field at the top level.</li>
          <li><code>$.address.city</code>: the city inside the address object.</li>
          <li><code>$.orders[2].total</code>: the total of the third order (arrays start at 0).</li>
        </ul>
        <p>
          <strong>Added</strong> means the value only exists in the modified JSON,
          <strong> Removed</strong> means it only exists in the original, and
          <strong> Changed</strong> shows the old value and the new value side by side.
        </p>

        <h2>Common Uses</h2>
        <ul>
          <li><strong>API testing:</strong> compare the response before and after a code change to catch fields that disappeared or changed type.</li>
          <li><strong>Config files:</strong> see what differs between the settings on your laptop and on the server, for example in package.json or appsettings.json.</li>
          <li><strong>Data migrations:</strong> check that a record looks the same after it was exported and imported again.</li>
          <li><strong>Code reviews:</strong> understand a large JSON change faster than reading a text diff line by line.</li>
        </ul>

        <h2>JSON Compare vs Text Compare</h2>
        <p>
          A normal text diff compares line by line, so it reports changes when
          only the spacing or the key order is different. This tool understands
          JSON: it ignores formatting and key order and only reports real changes
          in the data. To compare any other kind of text, such as code or plain
          text, use <a href="/text-compare">Text Compare</a>.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>Does the order of keys matter?</h3>
        <p>
          No. JSON objects have no fixed key order, so this tool compares keys
          by name. Array items are compared by position, because order matters
          in arrays.
        </p>

        <h3>Is my data sent to a server?</h3>
        <p>No. Both JSON documents are compared inside your browser.</p>

        <h3>What if my JSON has an error?</h3>
        <p>
          The broken line is highlighted in red. Small mistakes are fixed
          automatically. For bigger problems, use our{' '}
          <a href="/">JSON Formatter</a> to repair the JSON or the{' '}
          <a href="/json-validator">JSON Validator</a> to find the exact error.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-viewer">JSON Viewer</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/json-to-xml">JSON to XML Converter</a>
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

export default JsonCompare
