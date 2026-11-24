import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToToml } from './tomlConvert.js'

const SAMPLE = JSON.stringify(
  {
    title: 'Weather API',
    debug: false,
    server: { host: '0.0.0.0', port: 8080, timeout: 30.5 },
    database: { url: 'postgres://localhost/weather', pool: 10, replicas: ['db1.example.com', 'db2.example.com'] },
    owner: { name: 'Emily Clark', email: 'emily@example.com' },
    jobs: [
      { name: 'refresh', every: '15m' },
      { name: 'cleanup', every: '24h' },
    ],
  },
  null,
  2
)

function JsonToToml() {
  const [rootKey, setRootKey] = useState('items')

  return (
    <ConverterPage
      h1="JSON to TOML Converter"
      intro="Convert JSON into a valid TOML 1.0 config file, ready for Cargo.toml, pyproject.toml, Hugo or any app that reads TOML. Nested objects become [tables] and lists of objects become [[arrays of tables]]. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="TOML"
      inputPlaceholder="Paste a JSON object..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'config.toml', mimeType: 'application/toml' }}
      actions={[
        {
          label: 'Convert to TOML',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const { toml, notes } = jsonToToml(data, rootKey.trim() || 'items')
            return { output: toml, message: ['Converted to TOML successfully!', ...notes].join(' ') }
          },
        },
      ]}
      options={
        <label className="option">
          Key for a top-level array
          <input
            type="text"
            value={rootKey}
            onChange={(event) => setRootKey(event.target.value)}
            spellCheck={false}
            size={10}
            aria-label="Key used when the JSON is an array"
          />
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Does This Converter Do?</h2>
        <p>
          It writes the same data as TOML (Tom&apos;s Obvious, Minimal Language), the config format used
          by Rust&apos;s Cargo, Python&apos;s <code>pyproject.toml</code>, Hugo, Netlify and many other tools.
          Simple values come first, nested objects become <code>[sections]</code>, and the output follows
          TOML 1.0, so any TOML parser can read it.
        </p>

        <h2>How to Convert JSON to TOML</h2>
        <ol>
          <li>Paste your JSON, drop a .json file on the box, or load it from a link with URL.</li>
          <li>Click Convert to TOML, or press Ctrl + Enter.</li>
          <li>Copy the TOML, or download it as a .toml file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "title": "Weather API",
  "server": { "host": "0.0.0.0", "port": 8080 },
  "jobs": [
    { "name": "refresh", "every": "15m" },
    { "name": "cleanup", "every": "24h" }
  ]
}`}</Code>
        <Code label="TOML">{`title = "Weather API"

[server]
host = "0.0.0.0"
port = 8080

[[jobs]]
name = "refresh"
every = "15m"

[[jobs]]
name = "cleanup"
every = "24h"`}</Code>

        <h2>How JSON Becomes TOML</h2>
        <table>
          <thead>
            <tr><th>JSON</th><th>TOML</th></tr>
          </thead>
          <tbody>
            <tr><td>Nested object</td><td>A <code>[table]</code> section, e.g. <code>[server]</code> or <code>[database.pool]</code></td></tr>
            <tr><td>Array of objects</td><td>An array of tables, one <code>[[jobs]]</code> block per item</td></tr>
            <tr><td>Array of values</td><td>An inline array: <code>replicas = [ &quot;db1&quot;, &quot;db2&quot; ]</code></td></tr>
            <tr><td>String, number, boolean</td><td>The same value; text is quoted and escaped</td></tr>
            <tr><td>Keys with spaces or other symbols</td><td>Quoted keys: <code>&quot;first name&quot; = &quot;Emily&quot;</code></td></tr>
            <tr><td><code>null</code></td><td>Left out, because TOML has no null (the message says how many)</td></tr>
            <tr><td>A top-level array</td><td>Placed under a key (default <code>items</code>), because a TOML file must start with a table</td></tr>
          </tbody>
        </table>
        <p>
          TOML writes simple values before sections, so keys can come out in a different order than in your
          JSON. The data is the same: converting the TOML back with <a href="/toml-to-json">TOML to JSON</a> gives
          equal values.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Dates:</strong> JSON has no date type, so date strings stay quoted strings in TOML. Edit them to bare dates like <code>2026-11-24</code> if your app expects a TOML date.</li>
          <li><strong>Comments:</strong> JSON has no comments, so there are none to carry over. You can add <code># notes</code> to the TOML afterwards.</li>
          <li><strong>Broken JSON?</strong> Common mistakes like trailing commas and single quotes are repaired automatically. For anything else, use <a href="/json-repair">JSON Repair</a>.</li>
          <li>Prefer YAML for your config? Use <a href="/json-to-yaml">JSON to YAML</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-toml']} />

        <RelatedTools
          links={[
            ['/toml-to-json', 'TOML to JSON'],
            ['/json-to-yaml', 'JSON to YAML'],
            ['/', 'JSON Formatter'],
            ['/json-validator', 'JSON Validator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToToml
