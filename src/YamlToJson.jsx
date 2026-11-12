import { useState } from 'react'
import yaml from 'js-yaml'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'

// Reads YAML. Files with several documents (separated by ---) become an array.
// Errors get a line/column location so the broken line can be marked.
function readYaml(text) {
  try {
    const docs = yaml.loadAll(text).filter((doc) => doc !== undefined)
    if (docs.length === 0) throw new Error('The YAML is empty.')
    return docs.length === 1 ? docs[0] : docs
  } catch (err) {
    if (!err.mark) throw err
    const line = err.mark.line + 1
    const column = err.mark.column + 1
    const lineText = (text.split('\n')[line - 1] || '').replace(/\t/g, ' ')
    const start = Math.max(0, column - 40)
    const error = new Error(`This is not valid YAML (line ${line}, column ${column}). ${err.reason}.`)
    error.location = {
      line,
      column,
      snippet: lineText.slice(start, start + 60),
      pointer: ' '.repeat(Math.max(0, column - 1 - start)) + '^',
    }
    throw error
  }
}

const SAMPLE = `# App settings
name: my-web-app
version: 1.4.0
private: true
port: 8080
database:
  host: localhost
  user: admin
  ssl: false
services:
  - api
  - worker
  - scheduler
owner:
  name: Emily Clark
  city: London`

function YamlToJson() {
  const [indent, setIndent] = useState('2')

  return (
    <ConverterPage
      h1="YAML to JSON Converter"
      intro="Convert YAML config files into clean, formatted JSON. Errors are shown with the exact line."
      inputTitle="YAML Input"
      outputTitle="JSON Result"
      inputIsJson={false}
      inputPlaceholder="Paste your YAML here, or drop a .yaml / .yml file..."
      inputAccept=".yaml,.yml,.txt,application/yaml,text/yaml,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'converted.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Convert to JSON',
          run: (text) => {
            const data = readYaml(text)
            const space = indent === 'min' ? undefined : Number(indent)
            return {
              output: JSON.stringify(data, null, space),
              message: Array.isArray(data) && /^---/m.test(text)
                ? `Converted ${data.length} YAML documents into a JSON array.`
                : 'Converted to JSON successfully!',
            }
          },
        },
      ]}
      options={
        <label className="option">
          JSON indent
          <select value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="min">Minified</option>
          </select>
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is a YAML to JSON Converter?</h2>
        <p>
          A YAML to JSON converter reads YAML, the format used by most config
          files, and writes the same data as JSON. This is useful when an API,
          a script or a tool only accepts JSON, or when you want to check what
          your YAML really contains.
        </p>

        <h2>How to Convert YAML to JSON</h2>
        <ol>
          <li>Paste your YAML into the YAML Input box, click Upload, or drop a .yaml file.</li>
          <li>Click Convert to JSON, or press Ctrl + Enter.</li>
          <li>If there is an error, the broken line is marked in red with the line and column.</li>
          <li>Click Copy or Download to save the JSON.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Supports nested maps, lists, comments, multi-line text and anchors.</li>
          <li>Several documents separated by --- become a JSON array.</li>
          <li>Clear error messages with line and column.</li>
          <li>Choose 2 spaces, 4 spaces or minified JSON.</li>
          <li>Runs in your browser. Your YAML is never uploaded.</li>
        </ul>

        <h2>Anchors and Merge Keys</h2>
        <p>
          YAML can reuse a block with an anchor (<code>&amp;</code>) and pull it in with
          a merge key (<code>&lt;&lt;: *</code>). JSON has no such feature, so the
          converter writes the values out in full:
        </p>
        <Code label="YAML">{`base: &base
  timeout: 30
  retries: 3
prod:
  <<: *base
  retries: 5`}</Code>
        <Code label="JSON">{`{
  "base": { "timeout": 30, "retries": 3 },
  "prod": { "timeout": 30, "retries": 5 }
}`}</Code>
        <p>Comments are dropped too, because JSON does not allow them.</p>

        <h2>Watch Out for Numbers</h2>
        <p>
          Unquoted values become numbers when they look like numbers. That means
          <code> version: 1.10</code> becomes <code>1.1</code> and <code>zip: 01234</code> becomes
          <code> 1234</code> in the JSON. If a value must stay text, put it in quotes
          in the YAML: <code>version: &quot;1.10&quot;</code>.
        </p>

        <h2>Common YAML Errors</h2>
        <ul>
          <li><strong>bad indentation of a mapping entry:</strong> one line has a different number of spaces than its neighbours.</li>
          <li><strong>Tabs:</strong> YAML only allows spaces for indentation.</li>
          <li><strong>Missing space after a colon:</strong> write <code>key: value</code>, not <code>key:value</code>.</li>
          <li><strong>Unquoted special characters:</strong> values starting with <code>@</code>, <code>*</code>, <code>&amp;</code> or containing <code>: </code> need quotes.</li>
        </ul>
        <p>
          The error message shows the line and column, so you can jump straight
          to the problem. To go the other way, use <a href="/json-to-yaml">JSON to YAML</a>.
        </p>

        <FaqSection faqs={FAQS['yaml-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-yaml', 'JSON to YAML'],
            ['/', 'JSON Formatter'],
            ['/json-viewer', 'JSON Viewer'],
            ['/xml-to-json', 'XML to JSON'],
            ['/json-vs-yaml', 'JSON vs YAML'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default YamlToJson
