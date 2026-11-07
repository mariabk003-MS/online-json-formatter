// Shared building blocks for all tool pages, so every tool looks the same.
import { useEffect, useState } from 'react'

// One side of a tool: a title row with small buttons, a dark box, and a
// status bar at the bottom of the box. Has its own full screen button.
//   title       "Input", "Result", ...
//   badge       optional element next to the title (e.g. <StatusBadge />)
//   tabs        optional element (e.g. <Tabs />)
//   tools       small buttons shown on the right of the title row
//   statusLeft / statusRight  text in the status bar
//   footer      optional element under the box (e.g. the action bar)
export function ToolPanel({ title, badge, tabs, tools, statusLeft, statusRight, footer, children }) {
  const [fullscreen, setFullscreen] = useState(false)

  // Esc closes full screen.
  useEffect(() => {
    if (!fullscreen) return
    function onKey(event) {
      if (event.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  return (
    <section className={`editor-panel${fullscreen ? ' panel-fullscreen' : ''}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        {badge}
        {tabs}
        <div className="toolbar">
          {tools}
          <button
            type="button"
            className="tool tool-icon"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit full screen (Esc)' : 'Full screen'}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
          >
            {fullscreen ? '✕' : '⛶'}
          </button>
        </div>
      </div>

      <div className="panel-box">
        {children}
        <div className="status-bar">
          <span>{statusLeft}</span>
          <span>{statusRight}</span>
        </div>
      </div>

      {footer}
    </section>
  )
}

// A small toolbar button.
export function Tool({ children, ...props }) {
  return (
    <button type="button" className="tool" {...props}>
      {children}
    </button>
  )
}

// A "⋯" button that opens a small list of extra actions.
// items: [{ label, onClick, disabled }]
export function MoreMenu({ items }) {
  const [open, setOpen] = useState(false)

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <span className="more-menu">
      <button
        type="button"
        className="tool tool-icon"
        aria-label="More actions"
        aria-expanded={open}
        title="More actions"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(!open)
        }}
      >
        ⋯
      </button>
      {open && (
        <span className="more-menu-list" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onClick()
              }}
            >
              {item.label}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

// ✓ Valid JSON / ✗ Invalid JSON – line 4  (check comes from useLiveJsonCheck)
export function StatusBadge({ check, validText = 'Valid JSON', invalidText = 'Invalid JSON' }) {
  if (!check) return null
  if (check.valid) return <span className="status-badge status-ok">✓ {validText}</span>
  return (
    <span className="status-badge status-bad">
      ✗ {invalidText}
      {check.location ? ` – line ${check.location.line}` : ''}
    </span>
  )
}

// Code / Tree style switch. options: [{ value, label }]
export function Tabs({ value, onChange, options }) {
  return (
    <div className="tabs" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={value === option.value ? 'tab active' : 'tab'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

// The grey text shown in an empty result box.
export function EmptyBox({ children }) {
  return <div className="result-empty">{children}</div>
}

// Plain (not colored) text output with line numbers, e.g. for CSV or XML.
export function PlainOutput({ text }) {
  const lines = text.split('\n')
  let numbers = ''
  for (let n = 1; n <= lines.length; n++) numbers += n + '\n'
  return (
    <div className="jh-box">
      <pre className="jh-gutter" aria-hidden="true">{numbers}</pre>
      <pre className="jh-code">{text}</pre>
    </div>
  )
}

// Colors one line of XML: tag names blue, attribute values and text green,
// <?xml ?> purple, comments grey. Every character is kept (nothing is dropped).
const XML_TOKEN =
  /(<\?[^>]*\?>)|(<!--.*?-->)|(<!\[CDATA\[.*?\]\]>)|(<\/?)([\w.:-]+)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)(\s*\/?>)|([^<]+)|(<)/g
const XML_ATTR = /(\s+)([^\s=]+)(?:(\s*=\s*)("[^"]*"|'[^']*'))?/g

function colorAttributes(attrs) {
  return [...attrs.matchAll(XML_ATTR)].map((match) => {
    const [, space, name, equals, value] = match
    return (
      <span key={match.index}>
        {space}
        <span className="jv-number">{name}</span>
        {equals && <span className="jv-colon">{equals}</span>}
        {value && <span className="jv-string">{value}</span>}
      </span>
    )
  })
}

function colorXmlLine(line) {
  const parts = []
  for (const match of line.matchAll(XML_TOKEN)) {
    const [text, declaration, comment, cdata, open, name, attrs, close, content] = match
    const key = match.index
    if (declaration) {
      parts.push(<span key={key} className="jv-boolean">{declaration}</span>)
    } else if (comment) {
      parts.push(<span key={key} className="jv-colon">{comment}</span>)
    } else if (cdata) {
      parts.push(<span key={key} className="jv-string">{cdata}</span>)
    } else if (name) {
      parts.push(
        <span key={key}>
          <span className="jv-colon">{open}</span>
          <span className="jv-key">{name}</span>
          {attrs && colorAttributes(attrs)}
          <span className="jv-colon">{close}</span>
        </span>
      )
    } else if (content && content.trim()) {
      parts.push(<span key={key} className="jv-string">{content}</span>)
    } else {
      parts.push(text)
    }
  }
  return parts
}

// XML output with colors and line numbers (big results are shown without colors).
export function XmlOutput({ text }) {
  if (text.length > 300 * 1024) return <PlainOutput text={text} />
  const lines = text.split('\n')
  let numbers = ''
  for (let n = 1; n <= lines.length; n++) numbers += n + '\n'
  return (
    <div className="jh-box">
      <pre className="jh-gutter" aria-hidden="true">{numbers}</pre>
      <pre className="jh-code">
        {lines.map((line, index) => (
          <span key={index}>
            {colorXmlLine(line)}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  )
}

// Spreadsheet-like preview. Shows at most `limit` rows so big files stay fast.
export function DataTable({ headers, rows, limit = 200 }) {
  const shown = rows.slice(0, limit)
  return (
    <div className="table-box">
      <table className="data-table">
        <thead>
          <tr>
            <th className="row-number">#</th>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, index) => (
            <tr key={index}>
              <td className="row-number">{index + 1}</td>
              {headers.map((header) => {
                const value = row[header]
                const text =
                  value === null || value === undefined
                    ? ''
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                return <td key={header}>{text}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit && (
        <p className="table-more">Showing the first {limit} of {rows.length} rows.</p>
      )}
    </div>
  )
}

// The "Frequently Asked Questions" part of a page. faqs: [[question, answer], ...]
export function FaqSection({ faqs }) {
  return (
    <>
      <h2>Frequently Asked Questions</h2>
      {faqs.map(([question, answer]) => (
        <div key={question}>
          <h3>{question}</h3>
          <p>{answer}</p>
        </div>
      ))}
    </>
  )
}

// A short "Related tools" line with links, good for visitors and for SEO.
export function RelatedTools({ links }) {
  return (
    <>
      <h2>Related Tools</h2>
      <p className="related-tools">
        {links.map(([href, label], index) => (
          <span key={href}>
            {index > 0 && ' · '}
            <a href={href}>{label}</a>
          </span>
        ))}
      </p>
    </>
  )
}

// Error / success messages under the tool, with the error line and a ^ pointer.
export function Messages({ error, success, location, hint }) {
  return (
    <>
      {error && <p className="error">{error}</p>}
      {location && (
        <pre className="error-location">
          {`Line ${location.line}: ${location.snippet}\n`}
          {' '.repeat(`Line ${location.line}: `.length) + location.pointer}
        </pre>
      )}
      {hint && <p className="hint-box"><strong>Tip:</strong> {hint}</p>}
      {success && <p className="success">{success}</p>}
    </>
  )
}
