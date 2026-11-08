// Collapsible tree view of JSON data, used by the Formatter, Viewer and Validator.
import { useMemo, useState } from 'react'
import './JsonViewer.css'

const IMAGE_LINK = /^https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|avif)(\?\S*)?$/i

// An image link: hovering shows a small preview. The image is only loaded on hover.
function ImageLink({ value }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="jv-string jv-image"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      "{value}"
      {show && (
        <span className="jv-image-preview">
          <img src={value} alt="Preview" referrerPolicy="no-referrer" />
        </span>
      )}
    </span>
  )
}

// Shows a simple value (text, number, true/false, null) in its own color.
function ValueText({ value }) {
  if (value === null) return <span className="jv-null">null</span>
  if (typeof value === 'string' && IMAGE_LINK.test(value)) return <ImageLink value={value} />
  if (typeof value === 'string') return <span className="jv-string">"{value}"</span>
  if (typeof value === 'number') return <span className="jv-number">{String(value)}</span>
  if (typeof value === 'boolean') return <span className="jv-boolean">{String(value)}</span>
  return <span>{String(value)}</span>
}

// Search: finds every key or simple value that contains the search text.
// Returns { keep: Set of paths to show, hits: Set of matching paths, count }.
function findMatches(data, term) {
  const keep = new Set()
  const hits = new Set()
  function walk(value, name, path) {
    const keyHit = name !== undefined && String(name).toLowerCase().includes(term)
    const isContainer = value !== null && typeof value === 'object'
    const valueHit = !isContainer && String(value).toLowerCase().includes(term)
    let childHit = false
    if (isContainer) {
      for (const [key, child] of Object.entries(value)) {
        const k = Array.isArray(value) ? Number(key) : key
        if (walk(child, k, `${path}/${key}`)) childHit = true
      }
    }
    if (keyHit || valueHit) hits.add(path)
    const show = keyHit || valueHit || childHit
    if (show) keep.add(path)
    return show
  }
  walk(data, undefined, '')
  return { keep, hits, count: hits.size }
}

// Wraps the part of the text that matches the search in <mark>.
function Highlight({ text, term }) {
  if (!term) return text
  const index = text.toLowerCase().indexOf(term)
  if (index < 0) return text
  return (
    <>
      {text.slice(0, index)}
      <mark className="jv-mark">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  )
}

// One line of the tree. Objects and arrays can be opened and closed.
// "search" (optional) = { term, keep, hits } shows only matching branches, opened.
export function TreeNode({ name, value, depth, openAll, path = '', search }) {
  const isContainer = value !== null && typeof value === 'object'
  const [manualOpen, setOpen] = useState(openAll === null ? depth < 2 : openAll)
  const open = search ? true : manualOpen
  const term = search && search.hits.has(path) ? search.term : ''

  const label =
    name === undefined ? null : (
      <>
        <span className="jv-key">
          {typeof name === 'number' ? name : <>&quot;<Highlight text={String(name)} term={term} />&quot;</>}
        </span>
        <span className="jv-colon">: </span>
      </>
    )

  if (!isContainer) {
    return (
      <div className="jv-row">
        <span className="jv-spacer" />
        {label}
        {term && typeof value === 'string' ? (
          <span className="jv-string">&quot;<Highlight text={value} term={term} />&quot;</span>
        ) : term && value !== null && typeof value !== 'string' ? (
          <span className={typeof value === 'number' ? 'jv-number' : 'jv-boolean'}>
            <Highlight text={String(value)} term={term} />
          </span>
        ) : (
          <ValueText value={value} />
        )}
      </div>
    )
  }

  const isArray = Array.isArray(value)
  const allEntries = isArray
    ? value.map((item, index) => [index, item])
    : Object.entries(value)
  const entries = search ? allEntries.filter(([key]) => search.keep.has(`${path}/${key}`)) : allEntries
  const summary = isArray
    ? `[ ${allEntries.length} ${allEntries.length === 1 ? 'item' : 'items'} ]`
    : `{ ${allEntries.length} ${allEntries.length === 1 ? 'key' : 'keys'} }`

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
              path={`${path}/${key}`}
              search={search}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// The tree with "Expand all" / "Collapse all" buttons and a search box,
// sized to fit a tool box.
export function JsonTreeView({ data }) {
  const [openAll, setOpenAll] = useState(null)
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const search = useMemo(() => (term ? { term, ...findMatches(data, term) } : null), [data, term])

  function setAll(value) {
    setOpenAll(value)
    setVersion((v) => v + 1)
  }

  return (
    <div className="tree-wrap">
      <div className="tree-actions">
        <input
          type="search"
          className="tree-search"
          placeholder="Search keys and values…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search the tree"
        />
        {search ? (
          <span className="tree-count">
            {search.count} match{search.count === 1 ? '' : 'es'}
          </span>
        ) : (
          <>
            <button type="button" className="tool" onClick={() => setAll(true)}>Expand all</button>
            <button type="button" className="tool" onClick={() => setAll(false)}>Collapse all</button>
          </>
        )}
      </div>
      <div className="jv-tree" key={version}>
        {search && search.count === 0 ? (
          <p className="tree-empty">No keys or values contain “{query}”.</p>
        ) : (
          <TreeNode value={data} depth={0} openAll={openAll} search={search} />
        )}
      </div>
    </div>
  )
}
