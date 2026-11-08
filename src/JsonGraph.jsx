// Graph view: every object/array is a box, lines show which box is inside which.
// Drawn as plain SVG, laid out left to right like a family tree.
import { useMemo, useState } from 'react'

const NODE_WIDTH = 230
const HEADER_HEIGHT = 28
const ROW_HEIGHT = 20
const PADDING = 8
const GAP_X = 70
const GAP_Y = 18
const MAX_NODES = 400
const MAX_ROWS = 12 // longer objects show "… N more" so boxes stay readable

const isContainer = (value) => value !== null && typeof value === 'object'

function shortText(text, max) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

function valueText(value) {
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (Array.isArray(value)) return `[${value.length}]`
  if (typeof value === 'object') return `{${Object.keys(value).length}}`
  return String(value)
}

function valueClass(value) {
  if (value === null) return 'jg-null'
  if (typeof value === 'string') return 'jg-string'
  if (typeof value === 'number') return 'jg-number'
  if (typeof value === 'boolean') return 'jg-boolean'
  return 'jg-link'
}

// Turns JSON into boxes with positions and the lines between them.
function buildGraph(data) {
  const nodes = []
  let truncated = false

  function makeNode(value, title, depth) {
    if (nodes.length >= MAX_NODES) {
      truncated = true
      return null
    }
    const entries = Array.isArray(value) ? value.map((v, i) => [i, v]) : Object.entries(value)
    const node = { id: nodes.length, title, depth, rows: [], children: [], x: depth * (NODE_WIDTH + GAP_X) }
    nodes.push(node)
    entries.slice(0, MAX_ROWS).forEach(([key, child], rowIndex) => {
      node.rows.push({ key: String(key), value: child })
      if (isContainer(child)) {
        const kid = makeNode(child, Array.isArray(value) ? `${title}[${key}]` : String(key), depth + 1)
        if (kid) node.children.push({ node: kid, rowIndex })
      }
    })
    if (entries.length > MAX_ROWS) node.more = entries.length - MAX_ROWS
    const rowCount = node.rows.length + (node.more ? 1 : 0)
    node.height = HEADER_HEIGHT + Math.max(rowCount, 1) * ROW_HEIGHT + PADDING
    node.kind = Array.isArray(value) ? `array · ${entries.length}` : `object · ${entries.length}`
    return node
  }

  const root = isContainer(data) ? makeNode(data, 'root', 0) : null

  // Place boxes top to bottom; a parent sits in the middle of its children.
  let cursor = 0
  const lowestAtDepth = []
  function shift(node, dy) {
    node.y += dy
    node.children.forEach((child) => shift(child.node, dy))
  }
  function place(node) {
    if (node.children.length === 0) {
      node.y = cursor
      cursor += node.height + GAP_Y
    } else {
      node.children.forEach((child) => place(child.node))
      const first = node.children[0].node
      const last = node.children[node.children.length - 1].node
      node.y = (first.y + last.y + last.height) / 2 - node.height / 2
    }
    const minY = (lowestAtDepth[node.depth] ?? -Infinity) + GAP_Y
    if (node.y < minY) {
      const dy = minY - node.y
      shift(node, dy)
      cursor = Math.max(cursor, node.y + node.height + GAP_Y)
    }
    if (node.y < 0) shift(node, -node.y)
    lowestAtDepth[node.depth] = node.y + node.height
  }
  if (root) place(root)

  const width = nodes.reduce((max, n) => Math.max(max, n.x + NODE_WIDTH), 0)
  const height = nodes.reduce((max, n) => Math.max(max, n.y + n.height), 0)
  return { nodes, width, height, truncated }
}

export function JsonGraph({ data }) {
  const graph = useMemo(() => buildGraph(data), [data])
  const [zoom, setZoom] = useState(null) // null = fit to the box
  const [boxWidth, setBoxWidth] = useState(0)

  if (graph.nodes.length === 0) {
    return <div className="result-empty">A graph needs an object or an array.</div>
  }

  const margin = 16
  const width = graph.width + margin * 2
  const height = graph.height + margin * 2
  // Fit: shrink so the whole graph fits the box width (never bigger than 100%).
  const fitZoom = boxWidth ? Math.max(0.3, Math.min(1, (boxWidth - 4) / width)) : 1
  const scale = zoom ?? fitZoom

  return (
    <div className="graph-wrap">
      <div className="tree-actions">
        <button type="button" className="tool" onClick={() => setZoom(Math.max(0.3, scale - 0.15))} aria-label="Zoom out">−</button>
        <button type="button" className="tool" onClick={() => setZoom(1)} title="Show at 100%">{Math.round(scale * 100)}%</button>
        <button type="button" className="tool" onClick={() => setZoom(Math.min(2, scale + 0.15))} aria-label="Zoom in">+</button>
        <button type="button" className="tool" onClick={() => setZoom(null)}>Fit</button>
        <span className="graph-note">
          {graph.nodes.length} boxes{graph.truncated ? ` (only the first ${MAX_NODES} are shown)` : ''}
        </span>
      </div>
      <div
        className="graph-box"
        ref={(element) => {
          if (element && element.clientWidth !== boxWidth) setBoxWidth(element.clientWidth)
        }}
      >
        <svg width={width * scale} height={height * scale} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="JSON graph">
          <g transform={`translate(${margin} ${margin})`}>
            {graph.nodes.map((node) =>
              node.children.map(({ node: child, rowIndex }) => {
                const x1 = node.x + NODE_WIDTH
                const y1 = node.y + HEADER_HEIGHT + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2 + 2
                const x2 = child.x
                const y2 = child.y + HEADER_HEIGHT / 2
                const mid = (x1 + x2) / 2
                return (
                  <path
                    key={`${node.id}-${child.id}`}
                    className="jg-edge"
                    d={`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}
                  />
                )
              })
            )}
            {graph.nodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                <rect className="jg-box" width={NODE_WIDTH} height={node.height} rx="8" />
                <rect className="jg-head" width={NODE_WIDTH} height={HEADER_HEIGHT} rx="8" />
                <rect className="jg-head" y={HEADER_HEIGHT - 8} width={NODE_WIDTH} height="8" />
                <text className="jg-title" x="10" y="18">{shortText(node.title, 18)}</text>
                <text className="jg-kind" x={NODE_WIDTH - 10} y="18" textAnchor="end">{node.kind}</text>
                {node.rows.map((row, index) => (
                  <text key={row.key} x="10" y={HEADER_HEIGHT + index * ROW_HEIGHT + 16} className="jg-row">
                    <tspan className="jg-key">{shortText(row.key, 14)}</tspan>
                    <tspan className="jg-colon">: </tspan>
                    <tspan className={valueClass(row.value)}>
                      {shortText(valueText(row.value), Math.max(6, 28 - Math.min(row.key.length, 14)))}
                    </tspan>
                  </text>
                ))}
                {node.more && (
                  <text x="10" y={HEADER_HEIGHT + node.rows.length * ROW_HEIGHT + 16} className="jg-colon">
                    … {node.more} more
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
