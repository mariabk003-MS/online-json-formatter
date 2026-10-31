import { useState } from 'react'
import './App.css'
import NavBar from './NavBar.jsx'

// Makes any JSON key safe to use as an XML tag name.
function safeTagName(key) {
  let name = String(key).trim().replace(/[^A-Za-z0-9_.-]/g, '_')
  if (!name) name = '_'
  if (/^[^A-Za-z_]/.test(name) || /^xml/i.test(name)) name = '_' + name
  return name
}

// Replaces special characters so the XML stays valid.
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseWithFix(text) {
  try {
    return JSON.parse(text)
  } catch {
    const fixed = text.trim().replace(/,\s*([}\]])/g, '$1')
    return JSON.parse(fixed)
  }
}

function toXml(value, tag, indent, level) {
  const pad = indent.repeat(level)

  if (value === null || value === undefined) {
    return `${pad}<${tag}/>`
  }

  // Arrays repeat the same tag for every item.
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}<${tag}/>`
    return value
      .map((item) =>
        Array.isArray(item)
          ? `${pad}<${tag}>\n${toXml(item, 'item', indent, level + 1)}\n${pad}</${tag}>`
          : toXml(item, tag, indent, level)
      )
      .join('\n')
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (entries.length === 0) return `${pad}<${tag}/>`
    const children = entries
      .map(([key, child]) => toXml(child, safeTagName(key), indent, level + 1))
      .join('\n')
    return `${pad}<${tag}>\n${children}\n${pad}</${tag}>`
  }

  return `${pad}<${tag}>${escapeXml(value)}</${tag}>`
}

function jsonToXml(data, rootName, indent, addDeclaration) {
  const root = safeTagName(rootName || 'root')
  let body

  if (Array.isArray(data)) {
    const items = data.length ? toXml(data, 'item', indent, 1) : ''
    body = items ? `<${root}>\n${items}\n</${root}>` : `<${root}/>`
  } else {
    body = toXml(data, root, indent, 0)
  }

  const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
  return addDeclaration ? declaration + body : body
}

function JsonToXml() {
  const [json, setJson] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rootName, setRootName] = useState('root')
  const [indentSize, setIndentSize] = useState('2')
  const [addDeclaration, setAddDeclaration] = useState(true)

  function showError(message) {
    setResult('')
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function convert() {
    if (!json.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    let data
    try {
      data = parseWithFix(json)
    } catch (err) {
      showError(`This is not valid JSON. ${err.message}`)
      return
    }

    if (data === null || typeof data !== 'object') {
      showError('Please enter a JSON object or an array.')
      return
    }

    const indent = ' '.repeat(Number(indentSize))
    setResult(jsonToXml(data, rootName, indent, addDeclaration))
    showSuccess('Converted to XML successfully!')
  }

  function loadSample() {
    const sample = {
      store: {
        name: 'Book Corner',
        city: 'Lahore',
        books: [
          { title: 'Learn JSON', price: 499, inStock: true },
          { title: 'XML Basics', price: 350, inStock: false },
        ],
      },
    }
    setJson(JSON.stringify(sample, null, 2))
    setResult('')
    setError('')
    setSuccess('')
  }

  function clearAll() {
    setJson('')
    setResult('')
    setError('')
    setSuccess('')
  }

  async function copyResult() {
    if (!result) {
      setError('Please convert your JSON first.')
      setSuccess('')
      return
    }
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('XML copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadXml() {
    if (!result) {
      setError('Please convert your JSON first.')
      setSuccess('')
      return
    }
    const blob = new Blob([result], { type: 'application/xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'converted.xml'
    link.click()
    URL.revokeObjectURL(url)
    showSuccess('XML downloaded successfully!')
  }

  return (
    <div className="app">
      <NavBar />
      <h1>JSON to XML Converter</h1>
      <p>Convert JSON data into clean, well-formatted XML in your browser.</p>

      <div className="editor-layout">
        <section className="editor-panel">
          <h2>Input JSON</h2>

          <textarea
            placeholder='Paste your JSON here, for example: {"name": "Ali", "city": "Lahore"}'
            value={json}
            onChange={(event) => {
              setJson(event.target.value)
              setError('')
              setSuccess('')
              setResult('')
            }}
          />

          <div className="buttons">
            <button onClick={convert}>Convert to XML</button>
            <button onClick={loadSample}>Load Sample</button>
            <button onClick={clearAll}>Clear</button>
            <label className="indent-label">
              Root tag:{' '}
              <input
                type="text"
                value={rootName}
                onChange={(event) => setRootName(event.target.value)}
                style={{ width: '90px' }}
              />
            </label>
            <label className="indent-label">
              Indent:{' '}
              <select
                value={indentSize}
                onChange={(event) => setIndentSize(event.target.value)}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </label>
            <label className="indent-label">
              <input
                type="checkbox"
                checked={addDeclaration}
                onChange={(event) => setAddDeclaration(event.target.checked)}
              />{' '}
              XML declaration
            </label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>XML Result</h2>

          <pre className="result-output">
            {result || 'Your XML will appear here...'}
          </pre>

          <div className="buttons">
            <button onClick={copyResult}>Copy XML</button>
            <button onClick={downloadXml}>Download XML</button>
          </div>
        </section>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <section className="seo-content">
        <h2>What Is a JSON to XML Converter?</h2>
        <p>
          A JSON to XML converter changes JSON data into XML (Extensible Markup
          Language) format. Many older systems, APIs, and enterprise tools still
          use XML, so converting JSON to XML helps you share data between
          modern and legacy applications.
        </p>

        <h2>How to Convert JSON to XML</h2>
        <ol>
          <li>Paste your JSON into the Input JSON box, or click Load Sample to try an example.</li>
          <li>Optionally change the root tag name and indentation.</li>
          <li>Click Convert to XML.</li>
          <li>Click Copy XML or Download XML to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Converts JSON objects and arrays into well-formatted XML.</li>
          <li>Turns each JSON key into an XML tag automatically.</li>
          <li>Repeats tags for array items, which is the standard XML style.</li>
          <li>Escapes special characters like &amp;, &lt; and &gt; safely.</li>
          <li>Fixes invalid key names, such as keys with spaces or starting with numbers.</li>
          <li>Runs in your browser, so your data is not uploaded to a server.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>How are JSON arrays converted to XML?</h3>
        <p>
          Each item in an array becomes a separate tag with the same name. For
          example, <code>{'{"books": [{"title": "A"}, {"title": "B"}]}'}</code>{' '}
          creates two <code>{'<books>'}</code> elements, one for each book.
        </p>

        <h3>What is the root tag?</h3>
        <p>
          Every XML document needs one main tag that wraps all other tags. If
          your JSON starts with an array, the items are placed inside this root
          tag. You can change its name in the Root tag box.
        </p>

        <h3>What happens to invalid key names?</h3>
        <p>
          XML tag names cannot contain spaces or start with a number. Such
          characters are replaced with an underscore, and an underscore is added
          at the start when needed, so the XML stays valid.
        </p>

        <h3>Is this JSON to XML converter free?</h3>
        <p>Yes. It is free to use and does not require sign-up.</p>
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
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonToXml