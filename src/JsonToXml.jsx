import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import CodeEditor from './CodeEditor.jsx'
import { ToolPanel, Tool, StatusBadge, EmptyBox, XmlOutput, Messages } from './ToolLayout.jsx'
import { useLiveJsonCheck, describeText, formatSize, downloadText, readTextFile } from './toolUtils.js'
import { safeFix } from './safeFix.js'
import { Code } from './ArticlePage.jsx'

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
    const fixed = safeFix(text.trim())
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
  const [cursor, setCursor] = useState({ line: 1, column: 1 })
  const fileInputRef = useRef(null)
  const liveCheck = useLiveJsonCheck(json)

  function showError(message) {
    setResult('')
    setSuccess('')
    setError(message)
  }

  function showSuccess(message) {
    setError('')
    setSuccess(message)
  }

  function handleInputChange(text) {
    setJson(text)
    setError('')
    setSuccess('')
    setResult('')
  }

  function convert(text = json) {
    if (!text.trim()) {
      showError('Please paste your JSON first.')
      return
    }

    let data
    try {
      data = parseWithFix(text)
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
        city: 'London',
        books: [
          { title: 'Learn JSON', price: 12.99, inStock: true },
          { title: 'XML Basics', price: 9.5, inStock: false },
        ],
      },
    }
    handleInputChange(JSON.stringify(sample, null, 2))
  }

  function clearAll() {
    handleInputChange('')
  }

  async function readFile(file) {
    try {
      const text = await readTextFile(file)
      handleInputChange(text)
      showSuccess(`"${file.name}" loaded. Click Convert to XML.`)
    } catch (err) {
      showError(err.message)
    }
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result)
      showSuccess('XML copied successfully!')
    } catch {
      setError('Could not copy. Please copy the result manually.')
      setSuccess('')
    }
  }

  function downloadXml() {
    downloadText(result, 'converted.xml', 'application/xml;charset=utf-8')
    showSuccess('XML downloaded successfully!')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      convert()
    }
  }

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>JSON to XML Converter</h1>
      <p>Convert JSON data into clean, well-formatted XML in your browser.</p>

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
          title="JSON Input"
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
            <>
              <div className="action-bar">
                <button type="button" className="action-primary" onClick={() => convert()} title="Shortcut: Ctrl + Enter">
                  Convert to XML
                </button>
                <label className="indent-select">
                  Indent
                  <select value={indentSize} onChange={(event) => setIndentSize(event.target.value)}>
                    <option value="2">2 spaces</option>
                    <option value="4">4 spaces</option>
                  </select>
                </label>
              </div>
              <div className="options-row">
                <label className="option">
                  Root tag
                  <input
                    type="text"
                    value={rootName}
                    onChange={(event) => setRootName(event.target.value)}
                  />
                </label>
                <label className="option">
                  <input
                    type="checkbox"
                    checked={addDeclaration}
                    onChange={(event) => setAddDeclaration(event.target.checked)}
                  />
                  Add XML declaration
                </label>
              </div>
            </>
          }
        >
          <CodeEditor
            value={json}
            placeholder={'Paste your JSON here, or drop a .json file. For example:\n{"name": "Emily", "city": "London"}\n\nTip: press Ctrl + Enter to convert.'}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            errorLine={liveCheck?.location?.line || null}
            onCursor={setCursor}
            onFileDrop={readFile}
          />
        </ToolPanel>

        <ToolPanel
          title="XML Result"
          tools={
            <>
              <Tool onClick={copyResult} disabled={!result}>Copy</Tool>
              <Tool onClick={downloadXml} disabled={!result}>Download</Tool>
            </>
          }
          statusLeft={result ? `${result.split('\n').length} lines` : 'No result yet'}
          statusRight={result ? formatSize(result) : ''}
        >
          {result ? <XmlOutput text={result} /> : <EmptyBox>Your XML will appear here.</EmptyBox>}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} />

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
          <li>Paste your JSON into the JSON Input box, click Upload, or click Sample to try an example.</li>
          <li>Optionally change the root tag name and indentation.</li>
          <li>Click Convert to XML.</li>
          <li>Click Copy or Download to save the XML.</li>
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

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 7,
  "name": "Emily & Co",
  "tags": ["admin", "editor"],
  "address": { "city": "London" },
  "manager": null
}`}</Code>
        <Code label="XML">{`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <id>7</id>
  <name>Emily &amp; Co</name>
  <tags>admin</tags>
  <tags>editor</tags>
  <address>
    <city>London</city>
  </address>
  <manager/>
</root>`}</Code>

        <h2>How JSON Maps to XML</h2>
        <ul>
          <li><strong>Objects</strong> become nested elements, like <code>address</code> → <code>&lt;address&gt;&lt;city&gt;</code>.</li>
          <li><strong>Arrays</strong> repeat the tag once per item, so <code>tags</code> becomes two <code>&lt;tags&gt;</code> elements.</li>
          <li><strong>null</strong> becomes an empty element such as <code>&lt;manager/&gt;</code>.</li>
          <li><strong>Special characters</strong> are escaped: &amp; becomes <code>&amp;amp;</code>.</li>
          <li>XML needs <strong>one root element</strong>, so everything is wrapped in <code>&lt;root&gt;</code>. You can change its name.</li>
        </ul>
        <p>
          XML has no data types, so numbers and true/false become plain text. If
          the receiving system needs types, it usually reads them from an XML
          Schema (XSD).
        </p>

        <h2>When You Still Need XML</h2>
        <p>
          Many older and enterprise systems only accept XML: SOAP web services,
          banking and payment formats, government reporting, RSS feeds and
          some e-commerce product feeds. Convert your JSON here, check the
          result with the <a href="/xml-formatter">XML Formatter</a>, and go back the other
          way with <a href="/xml-to-json">XML to JSON</a>.
        </p>

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
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/what-is-json">What Is JSON?</a>{' | '}
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