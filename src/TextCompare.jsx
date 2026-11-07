import { useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import CodeEditor from './CodeEditor.jsx'
import { ToolPanel, Tool, EmptyBox, Messages, FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { describeText } from './toolUtils.js'

// Comparing is slow for huge texts, so the changed middle part is limited.
const MAX_CELLS = 9_000_000

// Line-by-line difference (longest common subsequence).
// Returns rows like { type: 'same' | 'added' | 'removed', text, oldLine, newLine }.
function diffLines(oldText, newText, ignoreCase, ignoreSpaces) {
  const a = oldText.split('\n')
  const b = newText.split('\n')
  const key = (line) => {
    let k = ignoreSpaces ? line.replace(/\s+/g, ' ').trim() : line
    if (ignoreCase) k = k.toLowerCase()
    return k
  }
  const ka = a.map(key)
  const kb = b.map(key)

  // Skip the lines that are the same at the start and the end.
  let start = 0
  while (start < a.length && start < b.length && ka[start] === kb[start]) start++
  let endA = a.length
  let endB = b.length
  while (endA > start && endB > start && ka[endA - 1] === kb[endB - 1]) {
    endA--
    endB--
  }

  const n = endA - start
  const m = endB - start
  if (n * m > MAX_CELLS) {
    throw new Error('These texts are too different and too long to compare here. Try smaller parts.')
  }

  // table[i][j] = length of the common part of a[start+i..] and b[start+j..]
  const width = m + 1
  const table = new Uint32Array((n + 1) * width)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i * width + j] =
        ka[start + i] === kb[start + j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1])
    }
  }

  const rows = []
  for (let i = 0; i < start; i++) rows.push({ type: 'same', text: b[i], oldLine: i + 1, newLine: i + 1 })
  let i = 0
  let j = 0
  while (i < n || j < m) {
    if (i < n && j < m && ka[start + i] === kb[start + j]) {
      rows.push({ type: 'same', text: b[start + j], oldLine: start + i + 1, newLine: start + j + 1 })
      i++
      j++
    } else if (j < m && (i >= n || table[i * width + j + 1] >= table[(i + 1) * width + j])) {
      rows.push({ type: 'added', text: b[start + j], newLine: start + j + 1 })
      j++
    } else {
      rows.push({ type: 'removed', text: a[start + i], oldLine: start + i + 1 })
      i++
    }
  }
  for (let k = 0; endA + k < a.length; k++) {
    rows.push({ type: 'same', text: b[endB + k], oldLine: endA + k + 1, newLine: endB + k + 1 })
  }
  return rows
}

const SAMPLE_OLD = `Dear Emily,

Thank you for your order #A-100.
Your keyboard will be shipped on Monday.
The total price is £49.99.

Best regards,
City Electronics`

const SAMPLE_NEW = `Dear Emily,

Thank you for your order #A-100.
Your keyboard and mouse will be shipped on Tuesday.
The total price is £69.49.
You can track your parcel online.

Best regards,
City Electronics`

function TextCompare() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [rows, setRows] = useState(null)
  const [onlyChanges, setOnlyChanges] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [ignoreSpaces, setIgnoreSpaces] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setRows(null)
    setError('')
  }

  function compare() {
    if (!left && !right) {
      setError('Please paste text into both boxes first.')
      return
    }
    try {
      setRows(diffLines(left, right, ignoreCase, ignoreSpaces))
      setError('')
    } catch (err) {
      setRows(null)
      setError(err.message)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      compare()
    }
  }

  const added = rows ? rows.filter((row) => row.type === 'added').length : 0
  const removed = rows ? rows.filter((row) => row.type === 'removed').length : 0
  const shown = rows ? rows.filter((row) => !onlyChanges || row.type !== 'same') : []

  return (
    <div className="app tool-page compare-page">
      <NavBar />
      <h1>Text Compare – Find the Difference Between Two Texts</h1>
      <p>
        Compare two texts line by line and see exactly what was added or
        removed. Works for code, config files, letters and lists.
      </p>

      <div className="editor-layout">
        <ToolPanel
          title="Original text"
          tools={<Tool onClick={() => { setLeft(''); reset() }}>Clear</Tool>}
          statusRight={describeText(left)}
        >
          <CodeEditor
            value={left}
            placeholder="Paste the original text here..."
            onChange={(text) => {
              setLeft(text)
              reset()
            }}
            onKeyDown={handleKeyDown}
            onFileDrop={async (file) => {
              setLeft(await file.text())
              reset()
            }}
          />
        </ToolPanel>
        <ToolPanel
          title="Changed text"
          tools={<Tool onClick={() => { setRight(''); reset() }}>Clear</Tool>}
          statusRight={describeText(right)}
        >
          <CodeEditor
            value={right}
            placeholder={'Paste the changed text here...\n\nTip: press Ctrl + Enter to compare.'}
            onChange={(text) => {
              setRight(text)
              reset()
            }}
            onKeyDown={handleKeyDown}
            onFileDrop={async (file) => {
              setRight(await file.text())
              reset()
            }}
          />
        </ToolPanel>
      </div>

      <div className="action-bar">
        <button type="button" className="action-primary" onClick={compare} title="Shortcut: Ctrl + Enter">
          Compare Text
        </button>
        <button
          type="button"
          className="action-secondary"
          onClick={() => {
            setLeft(right)
            setRight(left)
            reset()
          }}
        >
          ⇄ Swap
        </button>
        <Tool
          onClick={() => {
            setLeft(SAMPLE_OLD)
            setRight(SAMPLE_NEW)
            reset()
          }}
        >
          Sample
        </Tool>
        <Tool onClick={() => { setLeft(''); setRight(''); reset() }}>Clear all</Tool>
      </div>
      <div className="options-row">
        <label className="option">
          <input type="checkbox" checked={ignoreCase} onChange={(event) => { setIgnoreCase(event.target.checked); reset() }} />
          Ignore upper / lower case
        </label>
        <label className="option">
          <input type="checkbox" checked={ignoreSpaces} onChange={(event) => { setIgnoreSpaces(event.target.checked); reset() }} />
          Ignore extra spaces
        </label>
      </div>

      <Messages error={error} />

      <ToolPanel
        title="Differences"
        badge={
          rows && (
            <span className={`status-badge ${added || removed ? 'status-bad' : 'status-ok'}`}>
              {added || removed ? `${added} added · ${removed} removed` : '✓ Identical'}
            </span>
          )
        }
        tools={
          rows && (
            <label className="option">
              <input type="checkbox" checked={onlyChanges} onChange={(event) => setOnlyChanges(event.target.checked)} />
              Only show changes
            </label>
          )
        }
        statusLeft={rows ? `${rows.length} lines compared` : 'Not compared yet'}
      >
        {!rows && <EmptyBox>The differences will appear here.</EmptyBox>}
        {rows && (
          <div className="text-diff">
            {shown.map((row, index) => (
              <div key={index} className={`text-diff-row text-diff-${row.type}`}>
                <span className="text-diff-num">{row.oldLine || ''}</span>
                <span className="text-diff-num">{row.newLine || ''}</span>
                <span className="text-diff-mark">{row.type === 'added' ? '+' : row.type === 'removed' ? '−' : ''}</span>
                <span className="text-diff-text">{row.text || ' '}</span>
              </div>
            ))}
            {shown.length === 0 && <EmptyBox>No differences found.</EmptyBox>}
          </div>
        )}
      </ToolPanel>

      <section className="seo-content">
        <h2>What Is a Text Compare Tool?</h2>
        <p>
          A text compare tool (also called a diff checker) shows the
          differences between two versions of a text. Lines that were added are
          green, lines that were removed are red, and unchanged lines stay
          plain, each with its old and new line number.
        </p>

        <h2>How to Compare Two Texts</h2>
        <ol>
          <li>Paste the original text on the left and the changed text on the right, or drop a file on each box.</li>
          <li>Click Compare Text, or press Ctrl + Enter.</li>
          <li>Turn on Only show changes to hide the lines that are the same.</li>
          <li>Use Ignore case or Ignore extra spaces to skip small differences.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Line-by-line comparison with old and new line numbers.</li>
          <li>Added and removed lines in clear colors.</li>
          <li>Options to ignore case and extra spaces.</li>
          <li>Works with code, CSV, logs, config files and normal text.</li>
          <li>Runs in your browser. Your text is never uploaded.</li>
        </ul>

        <FaqSection faqs={FAQS['text-compare']} />

        <RelatedTools
          links={[
            ['/json-compare', 'JSON Compare'],
            ['/json-sorter', 'JSON Sorter'],
            ['/', 'JSON Formatter'],
            ['/url-encode-decode', 'URL Encode / Decode'],
          ]}
        />
      </section>

      <SiteFooter />
    </div>
  )
}

export default TextCompare
