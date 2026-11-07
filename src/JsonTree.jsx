// Collapsible tree view of JSON data, used by the Formatter, Viewer and Validator.
import { useState } from 'react'
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

// One line of the tree. Objects and arrays can be opened and closed.
export function TreeNode({ name, value, depth, openAll }) {
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

// The tree with "Expand all" / "Collapse all" buttons, sized to fit a tool box.
export function JsonTreeView({ data }) {
  const [openAll, setOpenAll] = useState(null)
  const [version, setVersion] = useState(0)

  function setAll(value) {
    setOpenAll(value)
    setVersion((v) => v + 1)
  }

  return (
    <div className="tree-wrap">
      <div className="tree-actions">
        <button type="button" className="tool" onClick={() => setAll(true)}>Expand all</button>
        <button type="button" className="tool" onClick={() => setAll(false)}>Collapse all</button>
      </div>
      <div className="jv-tree" key={version}>
        <TreeNode value={data} depth={0} openAll={openAll} />
      </div>
    </div>
  )
}
