import { useEffect, useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import CodeEditor from './CodeEditor.jsx'
import { ToolPanel, Tool, StatusBadge, EmptyBox, Messages, FaqSection, RelatedTools, OpenInMenu } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { useLiveJsonCheck, describeText, downloadText, readTextFile, parseJsonLenient, useJsonHandoff } from './toolUtils.js'
import { typeOf, setIn, deleteIn, renameKey, addChild, duplicate, moveItem, convertType, pathToString, countNodes } from './jsonEdit.js'

const SAMPLE = {
  id: 1024,
  name: 'Emily Clark',
  email: 'emily.clark@example.com',
  active: true,
  balance: 2500.75,
  manager: null,
  roles: ['admin', 'editor'],
  address: { street: '221B Baker Street', city: 'London', country: 'United Kingdom' },
  orders: [
    { id: 'A-1001', total: 59.99, paid: true },
    { id: 'A-1002', total: 14.5, paid: false },
  ],
}
const TYPES = ['string', 'number', 'boolean', 'null', 'object', 'array']
const PAGE = 100 // children shown per step in long arrays/objects

// Opens the root and its direct children.
function initialOpen(data) {
  const open = new Set(['$'])
  if (data && typeof data === 'object') {
    for (const [key, value] of Object.entries(data)) {
      if (value && typeof value === 'object') open.add(pathToString([Array.isArray(data) ? Number(key) : key]))
    }
  }
  return open
}

function allPaths(value, path = [], out = []) {
  if (value && typeof value === 'object') {
    out.push(pathToString(path))
    for (const [key, child] of Object.entries(value)) allPaths(child, [...path, Array.isArray(value) ? Number(key) : key], out)
  }
  return out
}

// Text field that commits on Enter or when it loses focus.
function DraftInput({ value, onCommit, className, label, multiline }) {
  const [draft, setDraft] = useState(value)
  const [prev, setPrev] = useState(value)
  if (prev !== value) {
    setPrev(value)
    setDraft(value)
  }
  // onCommit returns false when the text is not accepted; the field then goes back.
  const commit = () => {
    if (draft !== value && onCommit(draft) === false) setDraft(value)
  }
  const props = {
    className,
    value: draft,
    'aria-label': label,
    title: label,
    spellCheck: false,
    onChange: (event) => setDraft(event.target.value),
    onBlur: commit,
    onKeyDown: (event) => {
      if (event.key === 'Enter' && !(multiline && event.shiftKey)) {
        event.preventDefault()
        commit()
      } else if (event.key === 'Escape') {
        setDraft(value)
      }
    },
  }
  return multiline ? <textarea rows={2} {...props} /> : <input type="text" size={Math.min(Math.max(String(draft).length, 4), 40)} {...props} />
}

function ValueEditor({ value, path, ctx }) {
  const where = pathToString(path)
  const type = typeOf(value)
  if (type === 'string') {
    return (
      <DraftInput
        className="je-value je-string"
        value={value}
        multiline={value.includes('\n')}
        label={`Text value of ${where}`}
        onCommit={(text) => ctx.edit(setIn(ctx.data, path, text))}
      />
    )
  }
  if (type === 'number') {
    return (
      <DraftInput
        className="je-value je-number"
        value={String(value)}
        label={`Number value of ${where}`}
        onCommit={(text) => {
          const n = Number(text.trim())
          if (text.trim() === '' || !Number.isFinite(n)) {
            ctx.fail(`"${text}" is not a number. Change the type to string to store text.`)
            return false
          }
          ctx.edit(setIn(ctx.data, path, n))
          return true
        }}
      />
    )
  }
  if (type === 'boolean') {
    return (
      <select className="je-value je-boolean" value={String(value)} aria-label={`True or false value of ${where}`} onChange={(event) => ctx.edit(setIn(ctx.data, path, event.target.value === 'true'))}>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }
  return <span className="je-null">null</span>
}

function TreeNode({ name, value, path, parent, ctx }) {
  const id = pathToString(path)
  const type = typeOf(value)
  const container = type === 'object' || type === 'array'
  const open = ctx.open.has(id)
  const entries = container ? Object.entries(value) : []
  const limit = ctx.limits[id] || PAGE
  const depth = path.length

  return (
    <div className="je-node" role="treeitem" aria-expanded={container ? open : undefined} aria-label={id}>
      <div className="je-row" style={{ paddingLeft: depth * 18 + 6 }}>
        {container ? (
          <button type="button" className="je-toggle" onClick={() => ctx.toggle(id)} aria-label={`${open ? 'Collapse' : 'Expand'} ${id}`}>
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="je-toggle-space" />
        )}

        {parent === 'object' && (
          <>
            <DraftInput
              className="je-key"
              value={name}
              label={`Key name of ${id}`}
              onCommit={(text) => {
                try {
                  ctx.edit(renameKey(ctx.data, path, text))
                  return true
                } catch (err) {
                  ctx.fail(err.message)
                  return false
                }
              }}
            />
            <span className="je-colon">:</span>
          </>
        )}
        {parent === 'array' && <span className="je-index">{name}</span>}
        {parent === 'array' && <span className="je-colon">:</span>}

        {container ? (
          <span className="je-summary">{type === 'array' ? `[ ${value.length} item${value.length === 1 ? '' : 's'} ]` : `{ ${entries.length} key${entries.length === 1 ? '' : 's'} }`}</span>
        ) : (
          <ValueEditor value={value} path={path} ctx={ctx} />
        )}

        <span className="je-actions">
          <select className="je-type" value={type} aria-label={`Type of ${id}`} title="Change type" onChange={(event) => ctx.edit(setIn(ctx.data, path, convertType(value, event.target.value)))}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {container && (
            <button type="button" className="je-btn" title={type === 'array' ? 'Add item' : 'Add key'} aria-label={`Add to ${id}`} onClick={() => ctx.add(path)}>
              +
            </button>
          )}
          {parent === 'array' && (
            <>
              <button type="button" className="je-btn" title="Move up" aria-label={`Move ${id} up`} onClick={() => ctx.edit(moveItem(ctx.data, path, -1))}>
                ↑
              </button>
              <button type="button" className="je-btn" title="Move down" aria-label={`Move ${id} down`} onClick={() => ctx.edit(moveItem(ctx.data, path, 1))}>
                ↓
              </button>
            </>
          )}
          {parent && (
            <>
              <button type="button" className="je-btn" title="Duplicate" aria-label={`Duplicate ${id}`} onClick={() => ctx.edit(duplicate(ctx.data, path))}>
                ⧉
              </button>
              <button type="button" className="je-btn je-delete" title="Delete" aria-label={`Delete ${id}`} onClick={() => ctx.edit(deleteIn(ctx.data, path))}>
                ✕
              </button>
            </>
          )}
        </span>
      </div>

      {container && open && (
        <div role="group">
          {entries.slice(0, limit).map(([key, child]) => (
            <TreeNode
              key={key}
              name={key}
              value={child}
              path={[...path, type === 'array' ? Number(key) : key]}
              parent={type}
              ctx={ctx}
            />
          ))}
          {entries.length > limit && (
            <button type="button" className="je-more" style={{ marginLeft: (depth + 1) * 18 + 6 }} onClick={() => ctx.showMore(id)}>
              Show {Math.min(PAGE, entries.length - limit)} more of {entries.length - limit}
            </button>
          )}
          {entries.length === 0 && (
            <div className="je-empty" style={{ paddingLeft: (depth + 1) * 18 + 30 }}>
              {type === 'array' ? 'Empty array: click + to add an item' : 'Empty object: click + to add a key'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function JsonEditor() {
  const [text, setText] = useState('')
  const [data, setData] = useState(undefined)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [open, setOpen] = useState(() => new Set(['$']))
  const [limits, setLimits] = useState({})
  const [indent, setIndent] = useState(2)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const [stale, setStale] = useState(false)
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(text)

  const show = (value, spaces = indent) => JSON.stringify(value, null, spaces)

  function load(value, message) {
    setData(value)
    setText(show(value))
    setPast([])
    setFuture([])
    setOpen(initialOpen(value))
    setLimits({})
    setStale(false)
    setError('')
    setSuccess(message)
  }

  useJsonHandoff((value, message) => {
    try {
      load(parseJsonLenient(value, 'JSON').data, `${message} Click any value in the tree to edit it.`)
    } catch (err) {
      setText(value)
      setError(err.message)
    }
  })

  // Applies a tree edit and remembers the previous version for Undo.
  function edit(next) {
    if (next === data) return
    setPast((p) => [...p.slice(-99), data])
    setFuture([])
    setData(next)
    setText(show(next))
    setStale(false)
    setError('')
    setSuccess('')
  }

  function undo() {
    if (!past.length) return
    const previous = past[past.length - 1]
    setPast(past.slice(0, -1))
    setFuture([data, ...future])
    setData(previous)
    setText(show(previous))
    setSuccess('Undone.')
  }

  function redo() {
    if (!future.length) return
    const [next, ...rest] = future
    setFuture(rest)
    setPast([...past, data])
    setData(next)
    setText(show(next))
    setSuccess('Redone.')
  }

  function handleText(value) {
    setText(value)
    setSuccess('')
    if (!value.trim()) {
      setData(undefined)
      setStale(false)
      return
    }
    try {
      const parsed = JSON.parse(value)
      if (data === undefined) setOpen(initialOpen(parsed))
      setData(parsed)
      setStale(false)
      setError('')
    } catch {
      setStale(data !== undefined)
    }
  }

  // Format & load: also repairs common mistakes such as single quotes or trailing commas.
  function formatAndLoad() {
    if (!text.trim()) {
      setError('Paste your JSON first, or click Sample.')
      return
    }
    try {
      const { data: value, report } = parseJsonLenient(text, 'JSON')
      const fixed = report && Object.keys(report).length
      load(value, fixed ? 'JSON repaired and loaded into the tree.' : `Loaded ${countNodes(value)} values into the tree.`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function readFile(file) {
    try {
      const content = await readTextFile(file)
      setText(content)
      try {
        load(JSON.parse(content), `"${file.name}" loaded.`)
      } catch {
        setData(undefined)
        setError(`"${file.name}" is not valid JSON yet. Click Format & Load to repair it.`)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const ctx = {
    data,
    open,
    limits,
    edit,
    fail: setError,
    toggle: (id) =>
      setOpen((current) => {
        const next = new Set(current)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      }),
    showMore: (id) => setLimits((current) => ({ ...current, [id]: (current[id] || PAGE) + PAGE })),
    add: (path) => {
      try {
        const result = addChild(data, path)
        setOpen((current) => new Set([...current, pathToString(path)]))
        edit(result.root)
        setSuccess(`Added ${pathToString(result.path)}. Rename it or change its value.`)
      } catch (err) {
        setError(err.message)
      }
    },
  }

  useEffect(() => {
    function onKey(event) {
      const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)
      if (!(event.ctrlKey || event.metaKey) || inField) return
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const nodeCount = data === undefined ? 0 : countNodes(data)

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON Editor Online</h1>
      <p>
        Edit JSON as a tree: change values and keys, add, duplicate, move and delete items, and change types, with undo.
        The text updates as you edit. Runs in your browser, so your data is never uploaded.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,application/json,text/plain"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) readFile(file)
        }}
      />

      <div className="editor-layout">
        <ToolPanel
          title="JSON text"
          badge={<StatusBadge check={liveCheck} />}
          tools={
            <>
              <Tool onClick={() => load(structuredClone(SAMPLE), 'Sample loaded. Click any value in the tree to edit it.')}>Sample</Tool>
              <Tool onClick={() => fileInputRef.current?.click()}>Upload</Tool>
              <Tool onClick={() => { setText(''); setData(undefined); setPast([]); setFuture([]); setError(''); setSuccess('') }}>Clear</Tool>
              <OpenInMenu getText={() => text} disabled={!text.trim()} onError={setError} />
            </>
          }
          statusLeft={`Ln ${cursor.line}, Col ${cursor.column}`}
          statusRight={describeText(text)}
          footer={
            <>
              <div className="action-bar">
                <button type="button" className="action-primary" onClick={formatAndLoad} title="Repairs common mistakes, formats the text and loads the tree">
                  Format &amp; Load
                </button>
              </div>
              <div className="options-row">
                <label className="option">
                  Indent
                  <select
                    value={indent}
                    onChange={(event) => {
                      const spaces = Number(event.target.value)
                      setIndent(spaces)
                      if (data !== undefined && !stale) setText(show(data, spaces))
                    }}
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                  </select>
                </label>
              </div>
            </>
          }
        >
          <CodeEditor
            value={text}
            placeholder={'Paste your JSON here, or click Sample.\n\nEdits in the tree on the right update this text.'}
            onChange={handleText}
            errorLine={liveCheck?.location?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="Tree editor"
          tools={
            <>
              <Tool onClick={undo} disabled={!past.length} title="Undo (Ctrl + Z)">Undo</Tool>
              <Tool onClick={redo} disabled={!future.length} title="Redo (Ctrl + Y)">Redo</Tool>
              <Tool
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(text)
                    setSuccess('JSON copied!')
                  } catch {
                    setError('Could not copy. Please copy the text manually.')
                  }
                }}
                disabled={data === undefined}
              >
                Copy
              </Tool>
              <Tool onClick={() => { downloadText(show(data), 'edited.json', 'application/json'); setSuccess('edited.json downloaded!') }} disabled={data === undefined}>
                Download
              </Tool>
            </>
          }
          footer={
            <div className="action-bar">
              <button
                type="button"
                className="action-secondary"
                onClick={() => setOpen(new Set(allPaths(data)))}
                disabled={data === undefined || nodeCount > 5000}
                title={nodeCount > 5000 ? 'Too large to expand everything at once' : 'Open every object and array'}
              >
                Expand all
              </button>
              <button type="button" className="action-secondary" onClick={() => setOpen(new Set(['$']))} disabled={data === undefined}>
                Collapse all
              </button>
            </div>
          }
          statusLeft={data === undefined ? 'No JSON loaded' : `${nodeCount} values${stale ? ' · text has errors, tree shows the last valid version' : ''}`}
          statusRight={past.length ? `${past.length} edit${past.length === 1 ? '' : 's'}` : ''}
        >
          {data === undefined ? (
            <EmptyBox>Your editable tree will appear here.</EmptyBox>
          ) : (
            <div className="je-tree" role="tree" aria-label="JSON tree editor">
              <TreeNode name="" value={data} path={[]} parent={null} ctx={ctx} />
            </div>
          )}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} />

      <section className="seo-content">
        <h2>What Is a JSON Editor?</h2>
        <p>
          A JSON editor lets you change JSON without hunting for commas and brackets in a wall of
          text. Each value appears in a tree where you can click and type. The editor keeps the
          structure valid for you, so the result is always correct JSON. Edit config files, fix an
          API response before sending it back, or build test data by hand.
        </p>

        <h2>How to Edit JSON Online</h2>
        <ol>
          <li>Paste your JSON on the left, drop a .json file on it, or click Sample.</li>
          <li>Click Format &amp; Load. Common mistakes like trailing commas or single quotes are repaired first.</li>
          <li>Edit in the tree: click a value or key, type, and press Enter.</li>
          <li>Copy the updated JSON from the left panel, or download it as a file.</li>
        </ol>

        <h2>What You Can Do in the Tree</h2>
        <table>
          <thead>
            <tr><th>Action</th><th>How</th></tr>
          </thead>
          <tbody>
            <tr><td>Change a value</td><td>Click it, type, then press Enter or click elsewhere. Esc cancels.</td></tr>
            <tr><td>Rename a key</td><td>Click the key name and type a new one. Duplicate keys are refused.</td></tr>
            <tr><td>Add a key or item</td><td>Click <strong>+</strong> on an object or array.</td></tr>
            <tr><td>Duplicate</td><td>Click <strong>⧉</strong> to insert a copy right after the item.</td></tr>
            <tr><td>Reorder an array</td><td>Use <strong>↑</strong> and <strong>↓</strong> on array items.</td></tr>
            <tr><td>Delete</td><td>Click <strong>✕</strong>.</td></tr>
            <tr><td>Change the type</td><td>Pick string, number, boolean, null, object or array from the type list. <code>&quot;42&quot;</code> becomes <code>42</code>, an object becomes an array of its values, and so on.</td></tr>
            <tr><td>Undo and redo</td><td>Buttons above the tree, or Ctrl + Z and Ctrl + Y.</td></tr>
          </tbody>
        </table>
        <p>
          You can also keep typing in the text panel: as soon as the text is valid JSON, the tree
          updates. While the text has an error, the tree keeps the last valid version and the error
          line is highlighted.
        </p>

        <h2>Large Files</h2>
        <p>
          Only the first two levels open automatically, and long arrays show 100 items at a time with
          a &quot;Show more&quot; button, so big files stay responsive. To just read or search a large
          file, the <a href="/json-viewer">JSON Viewer</a> is faster; to pull out one value, use the
          <a href="/json-path"> JSONPath Tester</a>.
        </p>

        <h2>Private by Design</h2>
        <p>
          Everything happens in your browser tab. Your JSON is not uploaded or saved anywhere, which
          makes the editor safe for config files with keys and for customer data. Reloading the page
          clears it, so download your file when you are done.
        </p>

        <FaqSection faqs={FAQS['json-editor']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-viewer', 'JSON Viewer'],
            ['/json-compare', 'JSON Compare'],
            ['/json-repair', 'JSON Repair'],
          ]}
        />
      </section>

      <SiteFooter />
    </div>
  )
}

export default JsonEditor
