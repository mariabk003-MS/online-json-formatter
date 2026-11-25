import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideNodeJsonFile() {
  return (
    <ArticlePage
      h1="How to Read and Write a JSON File in Node.js"
      intro="Every way to load a JSON file in Node.js (fs, fs/promises, require and import), how to save JSON back to disk, and the fixes for ENOENT, the hidden BOM character and other common errors."
      updated="November 19, 2026"
      faqKey="read-json-file-nodejs"
      related={[
        ['/javascript-json-parse', 'JSON.parse in JavaScript'],
        ['/json-validator', 'JSON Validator'],
        ['/json-lines', 'JSON Lines (JSONL)'],
        ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
      ]}
    >
      <h2>The Quick Way: readFileSync + JSON.parse</h2>
      <p>For a config file or a script, read the file as text and parse it:</p>
      <Code label="config.json">{`{
  "name": "Emily",
  "port": 3000,
  "features": ["auth", "logs"]
}`}</Code>
      <Code label="read.js">{`const fs = require('node:fs')

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
console.log(config.name, config.port)   // Emily 3000`}</Code>
      <p>
        Always pass <code>&apos;utf8&apos;</code>. Without it, <code>readFileSync</code> returns a Buffer;
        <code> JSON.parse</code> turns it into a string for you, but stating the encoding makes the
        code clear and avoids surprises with other encodings.
      </p>

      <h2>Without Blocking: fs/promises</h2>
      <p>In a server or any async code, use the promise version so other requests are not held up:</p>
      <Code label="read.mjs (ES modules)">{`import { readFile } from 'node:fs/promises'

const text = await readFile(new URL('./config.json', import.meta.url), 'utf8')
const config = JSON.parse(text)
console.log(config.features.join(', '))   // auth, logs`}</Code>
      <p>
        In CommonJS, use <code>const {'{'} readFile {'}'} = require(&apos;node:fs/promises&apos;)</code> inside an
        <code> async</code> function.
      </p>

      <h2>require() and import</h2>
      <Code label="CommonJS">{`const config = require('./config.json')`}</Code>
      <Code label="ES modules">{`import config from './config.json' with { type: 'json' }`}</Code>
      <p>
        Both are short, and both read the file <strong>only once</strong>. Node caches the result,
        so every later <code>require</code> returns the same object: if one part of your code changes
        it, everyone sees the change. We set <code>port = 9999</code> on the object from
        <code> require</code>, and the next <code>require(&apos;./config.json&apos;)</code> also returned
        <code> 9999</code>. Changes to the file on disk are not picked up until the process restarts. Use
        <code> readFileSync</code> or <code>readFile</code> when the file can change while the app runs,
        such as a data file you also write to.
      </p>
      <p>
        The <code>with {'{'} type: &apos;json&apos; {'}'}</code> part is required for JSON imports in current
        Node versions. Older guides show <code>assert {'{'} type: &apos;json&apos; {'}'}</code>, the earlier
        spelling.
      </p>

      <h2>Write a JSON File</h2>
      <Code label="write.js">{`const fs = require('node:fs')

const config = { name: 'Emily', port: 8080, features: ['auth', 'logs'] }
fs.writeFileSync('config.json', JSON.stringify(config, null, 2) + '\\n')`}</Code>
      <Code label="Result">{`{
  "name": "Emily",
  "port": 8080,
  "features": [
    "auth",
    "logs"
  ]
}`}</Code>
      <p>
        <code>JSON.stringify(value, null, 2)</code> indents with two spaces so the file stays easy to
        read and to compare in Git. The final <code>&apos;\n&apos;</code> ends the file with a newline, which
        most editors and linters expect. In async code, use <code>await writeFile(...)</code> from
        <code> node:fs/promises</code> the same way.
      </p>

      <h2>Error: ENOENT, no such file or directory</h2>
      <p>
        A relative path like <code>&apos;config.json&apos;</code> is resolved from the folder you
        <strong> run</strong> <code>node</code> in, not the folder the script is in. Running the same script
        from its parent folder gave <code>ENOENT</code>. Build the path from the script&apos;s own location:
      </p>
      <Code label="CommonJS">{`const path = require('node:path')
const file = path.join(__dirname, 'config.json')
const config = JSON.parse(fs.readFileSync(file, 'utf8'))`}</Code>
      <Code label="ES modules">{`const file = new URL('./config.json', import.meta.url)
const config = JSON.parse(readFileSync(file, 'utf8'))`}</Code>
      <p>
        <code>require(&apos;./config.json&apos;)</code> and <code>import</code> already resolve paths from the
        script&apos;s folder, which is one reason they seem to &quot;just work&quot;.
      </p>

      <h2>Error: Unexpected token at the Very Start (the BOM)</h2>
      <p>
        If a file that looks perfect fails with an error pointing at the first character, it
        probably starts with an invisible <strong>byte order mark</strong> (BOM, <code>U+FEFF</code>). Some
        Windows editors add it when saving as &quot;UTF-8 with BOM&quot;. This is the error Node 24 gave
        us for <code>{'{'}&quot;name&quot;: &quot;Emily&quot;{'}'}</code> saved with a BOM:
      </p>
      <Code label="Error">{`SyntaxError: Unexpected token '\uFEFF', "\uFEFF{"name": "Emily"}" is not valid JSON`}</Code>
      <p>
        The quoted character looks empty because it is invisible. Remove it before parsing:
      </p>
      <Code label="Strip the BOM">{`const text = fs.readFileSync('config.json', 'utf8').replace(/^\\uFEFF/, '')
const config = JSON.parse(text)`}</Code>
      <p>
        Interestingly, <code>require()</code> strips the BOM itself, so the same file loaded with
        <code> require</code> worked. To fix the file for good, re-save it as plain &quot;UTF-8&quot; in your
        editor (in VS Code, click the encoding in the status bar).
      </p>

      <h2>Error: Expected double-quoted property name</h2>
      <p>
        That message, or any other <code>SyntaxError</code> from <code>JSON.parse</code>, means the file is
        not valid JSON. For <code>{'{'}&quot;name&quot;: &quot;Emily&quot;,{'}'}</code> Node reported
        <code> Expected double-quoted property name in JSON at position 17 (line 1 column 18)</code>: a
        trailing comma. Catch the error so your app can explain what went wrong:
      </p>
      <Code label="Safe loading">{`function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(\`\${file} not found\`)
    throw new Error(\`\${file} is not valid JSON: \${err.message}\`)
  }
}`}</Code>
      <p>
        Paste the file into the <a href="/json-validator">JSON Validator</a> to see the exact line, or let
        <a href="/json-repair"> JSON Repair</a> fix trailing commas, single quotes and comments for you.
      </p>

      <h2>Large Files: Read Line by Line</h2>
      <p>
        <code>JSON.parse</code> needs the whole file in memory. For logs and exports with millions of
        records, store one JSON object per line (<a href="/json-lines">JSON Lines</a>) and read it as a
        stream:
      </p>
      <Code label="Count error lines in logs.jsonl">{`import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

let errors = 0
const rl = createInterface({ input: createReadStream('logs.jsonl'), crlfDelay: Infinity })
for await (const line of rl) {
  if (!line.trim()) continue
  if (JSON.parse(line).level === 'error') errors++
}
console.log('errors:', errors)`}</Code>

      <h2>Which Method Should You Use?</h2>
      <table>
        <thead>
          <tr><th>Situation</th><th>Use</th></tr>
        </thead>
        <tbody>
          <tr><td>Small script, CLI tool, config at startup</td><td><code>readFileSync</code> + <code>JSON.parse</code>, or <code>require</code> / <code>import</code></td></tr>
          <tr><td>Web server, file read while handling requests</td><td><code>fs/promises</code> <code>readFile</code></td></tr>
          <tr><td>File that changes while the app runs</td><td><code>readFile</code> each time, never <code>require</code></td></tr>
          <tr><td>Very large data</td><td>JSON Lines and <code>readline</code></td></tr>
        </tbody>
      </table>
      <p>
        Saving data back with <code>JSON.stringify</code>? If an object refers to itself, see
        <a href="/converting-circular-structure-to-json"> Converting Circular Structure to JSON</a>. If a file
        is empty or was cut off while writing, reading it fails with
        <a href="/unexpected-end-of-json-input"> Unexpected End of JSON Input</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideNodeJsonFile
