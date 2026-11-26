import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { formatJson5 } from './json5Format.js'

const SAMPLE = `// tsconfig.json for a small web app
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022", "lib": ["ES2022", "DOM"],
    "module": "ESNext",   // bundler decides the rest
    "moduleResolution": "Bundler",

    /* Type Checking */
    "strict": true,
    // "noUnusedLocals": true,
    "skipLibCheck": true,
  },
  "include": ["src"],
}`

const OUTPUT_NAMES = { jsonc: 'JSONC', json5: 'JSON5', json: 'JSON' }

function Json5Formatter() {
  const [output, setOutput] = useState('jsonc')
  const [indent, setIndent] = useState('2')
  const [trailingCommas, setTrailingCommas] = useState(false)

  return (
    <ConverterPage
      h1="JSON5 and JSONC Formatter (Keeps Your Comments)"
      intro="Format and validate JSON with comments, such as tsconfig.json or VS Code settings.json, and JSON5 files. Comments, blank lines and end-of-line notes stay where they are. You can also turn JSON5 into JSONC or into plain JSON. Runs in your browser, so your files are never uploaded."
      inputTitle="JSON5 / JSONC Input"
      outputTitle="Formatted"
      inputIsJson={false}
      inputPlaceholder="Paste JSON with comments, or JSON5, here..."
      inputAccept=".json,.jsonc,.json5,.txt,application/json,text/plain"
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'formatted.jsonc', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Format',
          run: (text) => {
            const { text: formatted, comments } = formatJson5(text, {
              output,
              indent: indent === 'tab' ? '\t' : Number(indent),
              trailingCommas: output !== 'json' && trailingCommas,
            })
            const note =
              output === 'json'
                ? comments
                  ? ` ${comments} comment${comments === 1 ? '' : 's'} removed, because plain JSON cannot hold comments.`
                  : ''
                : comments
                  ? ` ${comments} comment${comments === 1 ? '' : 's'} kept.`
                  : ''
            return { output: formatted, message: `Valid! Formatted as ${OUTPUT_NAMES[output]}.${note}` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Output
            <select value={output} onChange={(event) => setOutput(event.target.value)}>
              <option value="jsonc">JSONC: keep comments, standard JSON values</option>
              <option value="json5">JSON5: keep comments and JSON5 syntax</option>
              <option value="json">Plain JSON: remove comments</option>
            </select>
          </label>
          <label className="option">
            Indent
            <select value={indent} onChange={(event) => setIndent(event.target.value)}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
          <label className="option" title="Plain JSON never has trailing commas">
            <input
              type="checkbox"
              checked={trailingCommas}
              disabled={output === 'json'}
              onChange={(event) => setTrailingCommas(event.target.checked)}
            />
            Trailing commas
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>Why a Separate Formatter for JSON with Comments?</h2>
        <p>
          Standard JSON has no comments, so most JSON formatters, including our main
          <a href="/"> JSON Formatter</a>, remove them or report an error. But many config files
          are written in <strong>JSONC</strong> (JSON with Comments) or <strong>JSON5</strong>, where
          comments are allowed and often important, like a disabled setting kept for later. This
          formatter fixes the indentation and checks the syntax while every comment stays in place.
        </p>

        <h2>How to Format JSONC or JSON5</h2>
        <ol>
          <li>Paste your file, drop it on the box, or load it from a link with URL.</li>
          <li>Pick the output: JSONC, JSON5, or plain JSON without comments.</li>
          <li>Click Format, or press Ctrl + Enter. Errors show the exact line and column.</li>
          <li>Copy the result or download it.</li>
        </ol>

        <h2>Example</h2>
        <Code label="Before">{`{ "compilerOptions": { /* checks */ "strict": true, // all strict checks
"target": "ES2022", }, }`}</Code>
        <Code label="After (JSONC)">{`{
  "compilerOptions": { /* checks */
    "strict": true, // all strict checks
    "target": "ES2022"
  }
}`}</Code>

        <h2>JSON vs JSONC vs JSON5</h2>
        <table>
          <thead>
            <tr><th>Feature</th><th>JSON</th><th>JSONC</th><th>JSON5</th></tr>
          </thead>
          <tbody>
            <tr><td><code>// line</code> and <code>/* block */</code> comments</td><td>No</td><td>Yes</td><td>Yes</td></tr>
            <tr><td>Trailing commas</td><td>No</td><td>Allowed by most tools</td><td>Yes</td></tr>
            <tr><td>Unquoted keys, like <code>name: 1</code></td><td>No</td><td>No</td><td>Yes</td></tr>
            <tr><td>Single-quoted strings</td><td>No</td><td>No</td><td>Yes</td></tr>
            <tr><td>Hex numbers, <code>.5</code>, <code>+1</code>, <code>Infinity</code>, <code>NaN</code></td><td>No</td><td>No</td><td>Yes</td></tr>
            <tr><td>Strings over several lines (with <code>\</code>)</td><td>No</td><td>No</td><td>Yes</td></tr>
          </tbody>
        </table>
        <p>
          The <strong>JSONC</strong> output keeps your comments but writes every key and value in standard
          JSON form: keys get double quotes, <code>&apos;text&apos;</code> becomes <code>&quot;text&quot;</code> and
          <code> 0x1F</code> becomes <code>31</code>. Use it to turn a JSON5 file into a file that VS Code or
          TypeScript can read. The <strong>JSON5</strong> output only fixes the layout and leaves the syntax as
          you wrote it.
        </p>

        <h2>Where You Meet These Files</h2>
        <ul>
          <li><strong>JSONC:</strong> VS Code <code>settings.json</code>, <code>keybindings.json</code> and <code>launch.json</code>; TypeScript&apos;s <code>tsconfig.json</code> and <code>jsconfig.json</code>; Deno&apos;s <code>deno.jsonc</code>.</li>
          <li><strong>JSON5:</strong> Babel&apos;s <code>.babelrc</code>, and apps that read config with the <code>json5</code> package.</li>
          <li><strong>Plain JSON only:</strong> <code>package.json</code> and API data. A comment there breaks <code>npm</code> and <code>JSON.parse</code>, so use the &quot;Plain JSON&quot; output to strip them.</li>
        </ul>

        <h2>Tips</h2>
        <ul>
          <li>Comments at the end of a line stay at the end of that line, and blank lines between groups of settings are kept (one at most).</li>
          <li><code>Infinity</code> and <code>NaN</code> exist only in JSON5. Choosing JSONC or plain JSON for such a file shows an error instead of quietly changing the value.</li>
          <li>Want to know why JSON itself has no comments, and the workarounds? Read <a href="/json-comments">JSON Comments</a>.</li>
          <li>Need strict, comment-free JSON checked against a schema? Use the <a href="/json-validator">JSON Validator</a> or the <a href="/json-schema-validator">JSON Schema Validator</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json5-formatter']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-comments', 'JSON Comments guide'],
            ['/tsconfig-json-template', 'tsconfig.json Template'],
            ['/json-repair', 'JSON Repair'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default Json5Formatter
