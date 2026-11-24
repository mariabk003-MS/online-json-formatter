import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { tomlToJson } from './tomlConvert.js'

const SAMPLE = `# Cargo.toml for a small Rust app
[package]
name = "weather-api"
version = "0.3.1"
edition = "2021"
authors = ["Emily Clark <emily@example.com>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

[[bin]]
name = "server"
path = "src/main.rs"

[profile.release]
opt-level = 3
lto = true`

function TomlToJson() {
  const [indent, setIndent] = useState('2')

  return (
    <ConverterPage
      h1="TOML to JSON Converter"
      intro="Convert TOML config files, such as Cargo.toml, pyproject.toml or hugo.toml, into clean JSON. Follows TOML 1.0, keeps large integers exact, and marks the exact line of any error. Runs in your browser, so your files are never uploaded."
      inputTitle="TOML Input"
      outputTitle="JSON Result"
      inputIsJson={false}
      inputPlaceholder="Paste your TOML here, or drop a .toml file..."
      inputAccept=".toml,.txt,application/toml,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'converted.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Convert to JSON',
          run: (text) => {
            const { json, notes } = tomlToJson(text, indent === 'min' ? undefined : Number(indent))
            return { output: json, message: ['Converted to JSON successfully!', ...notes].join(' ') }
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
        <h2>What Is TOML?</h2>
        <p>
          TOML (Tom&apos;s Obvious, Minimal Language) is a config file format built to be easy for people
          to read and write. Version 1.0 came out in 2021. You meet it in Rust&apos;s <code>Cargo.toml</code>,
          Python&apos;s <code>pyproject.toml</code>, Hugo and Netlify settings and many other tools. This
          converter turns that TOML into JSON, so you can use it in a script or an API, or simply see
          what the file really contains.
        </p>

        <h2>How to Convert TOML to JSON</h2>
        <ol>
          <li>Paste your TOML, drop a .toml file on the box, or load it from a link with URL.</li>
          <li>Pick the JSON indentation, or Minified.</li>
          <li>Click Convert to JSON, or press Ctrl + Enter.</li>
          <li>Copy the result, download it, or send it to another tool with Open in.</li>
        </ol>

        <h2>Example</h2>
        <Code label="TOML">{`[package]
name = "weather-api"
version = "0.3.1"

[dependencies]
serde = { version = "1.0", features = ["derive"] }`}</Code>
        <Code label="JSON">{`{
  "package": {
    "name": "weather-api",
    "version": "0.3.1"
  },
  "dependencies": {
    "serde": {
      "version": "1.0",
      "features": [
        "derive"
      ]
    }
  }
}`}</Code>

        <h2>How TOML Types Become JSON</h2>
        <table>
          <thead>
            <tr><th>TOML</th><th>JSON</th></tr>
          </thead>
          <tbody>
            <tr><td><code>[table]</code> and inline tables <code>{'{'} a = 1 {'}'}</code></td><td>Object</td></tr>
            <tr><td><code>[[array of tables]]</code></td><td>Array of objects</td></tr>
            <tr><td>Strings: basic, literal <code>&apos;...&apos;</code> and multi-line <code>&quot;&quot;&quot;...&quot;&quot;&quot;</code></td><td>String</td></tr>
            <tr><td>Integers, also hex <code>0xFF</code>, octal <code>0o17</code>, binary <code>0b101</code> and <code>1_000</code></td><td>Number (large integers keep every digit)</td></tr>
            <tr><td>Floats, <code>true</code> / <code>false</code></td><td>Number, boolean</td></tr>
            <tr><td>Dates and times, such as <code>1979-05-27</code> or <code>07:32:00</code></td><td>String in the same format, e.g. <code>&quot;1979-05-27&quot;</code></td></tr>
            <tr><td><code>inf</code>, <code>-inf</code>, <code>nan</code></td><td>The strings <code>&quot;inf&quot;</code>, <code>&quot;-inf&quot;</code>, <code>&quot;nan&quot;</code> (JSON has no such numbers)</td></tr>
          </tbody>
        </table>
        <p>
          Comments (<code># ...</code>) are not data, so they do not appear in the JSON. When dates or
          <code> inf</code>/<code>nan</code> values are turned into text, the message under the tool says so.
        </p>

        <h2>Common TOML Errors</h2>
        <ul>
          <li><strong>Defining a key or table twice</strong>, e.g. two <code>[package]</code> sections: &quot;trying to redefine an already defined table or value&quot;.</li>
          <li><strong>A value is missing</strong> after <code>=</code>, or a string has no closing quote.</li>
          <li><strong>A table header is not closed</strong>, like <code>[profile.release</code>.</li>
          <li><strong>Strings without quotes</strong>: unlike YAML, <code>name = Emily</code> is invalid; write <code>name = &quot;Emily&quot;</code>.</li>
        </ul>
        <p>The error message shows the line and column, and the line is marked so you can fix it quickly.</p>

        <h2>Tips</h2>
        <ul>
          <li>Need it the other way round? Use <a href="/json-to-toml">JSON to TOML</a>.</li>
          <li>Working with YAML configs too? See <a href="/yaml-to-json">YAML to JSON</a> and <a href="/json-vs-yaml">JSON vs YAML</a>.</li>
          <li>In Python 3.11 and newer, the built-in <code>tomllib</code> module reads TOML: <code>tomllib.load(open(&quot;pyproject.toml&quot;, &quot;rb&quot;))</code>, then <code>json.dumps()</code> writes JSON.</li>
        </ul>

        <FaqSection faqs={FAQS['toml-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-toml', 'JSON to TOML'],
            ['/yaml-to-json', 'YAML to JSON'],
            ['/json-viewer', 'JSON Viewer'],
            ['/json-to-yaml', 'JSON to YAML'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default TomlToJson
