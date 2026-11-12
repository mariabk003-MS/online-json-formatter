import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient, describeFixes } from './toolUtils.js'

function bytes(text) {
  return new Blob([text]).size
}

function sizeText(count) {
  return count < 1024 ? `${count} B` : `${(count / 1024).toFixed(1)} KB`
}

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@example.com',
    isActive: true,
    skills: ['JSON', 'React', 'API'],
    address: { city: 'London', country: 'United Kingdom' },
  },
  null,
  4
)

function JsonMinifier() {
  return (
    <ConverterPage
      h1="JSON Minifier Online"
      intro="Minify JSON by removing spaces and line breaks. Make your JSON smaller and faster to send, with the same data."
      inputTitle="JSON Input"
      outputTitle="Minified JSON"
      inputPlaceholder="Paste your JSON here, or drop a .json file..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'minified.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Minify JSON',
          run: (text) => {
            const { data, report } = parseJsonLenient(text, 'JSON')
            const output = JSON.stringify(data)
            const before = bytes(text)
            const after = bytes(output)
            const saved = before > 0 ? Math.max(0, Math.round((1 - after / before) * 100)) : 0
            const fixed = report ? ` ${describeFixes(report)}` : ''
            return {
              output,
              type: 'plain',
              message: `Minified! ${sizeText(before)} → ${sizeText(after)} (${saved}% smaller).${fixed}`,
            }
          },
        },
        {
          label: 'Beautify',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            return { output: JSON.stringify(data, null, 2), type: 'json', message: 'JSON formatted with 2 spaces.' }
          },
        },
      ]}
    >
      <section className="seo-content">
        <h2>What Is a JSON Minifier?</h2>
        <p>
          A JSON minifier removes every space, tab and line break that JSON does
          not need. The result is one compact line with exactly the same data.
          Minified JSON is smaller, so it loads faster, costs less bandwidth and
          is ideal for APIs, web apps and config files.
        </p>

        <h2>How to Minify JSON</h2>
        <ol>
          <li>Paste your JSON into the JSON Input box, click Upload, or drop a .json file.</li>
          <li>Click Minify JSON, or press Ctrl + Enter.</li>
          <li>See how much smaller your JSON became, then click Copy or Download.</li>
          <li>Need it readable again? Click Beautify.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Shows the size before and after, and the percentage saved.</li>
          <li>Fixes common mistakes (trailing commas, single quotes, comments) before minifying.</li>
          <li>Beautify button to turn minified JSON back into readable JSON.</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Before and After</h2>
        <Code label="Formatted (103 bytes)">{`{
  "id": 1024,
  "name": "Emily Clark",
  "roles": [
    "admin",
    "editor"
  ],
  "active": true
}`}</Code>
        <Code label="Minified (73 bytes)">{`{"id":1024,"name":"Emily Clark","roles":["admin","editor"],"active":true}`}</Code>
        <p>
          The data is identical, but the minified version is about 30% smaller,
          and the savings grow with deeper nesting. Only spaces and line breaks outside of strings are removed, so
          the text inside your values, like &quot;Emily Clark&quot;, is never changed.
        </p>

        <h2>When to Minify JSON (and When Not To)</h2>
        <ul>
          <li><strong>Minify</strong> JSON that is sent over the network, stored in a database or cache, embedded in a web page, or saved in large numbers of files.</li>
          <li><strong>Keep it formatted</strong> in files people read and edit, such as config files in a Git repository, so changes are easy to review.</li>
          <li>Servers usually also compress responses with gzip or Brotli. Minifying and compressing together give the smallest result. See both sizes with the <a href="/json-size-calculator">JSON Size Calculator</a>.</li>
        </ul>

        <h2>Minify JSON in Code</h2>
        <Code label="JavaScript">{`const minified = JSON.stringify(JSON.parse(text))`}</Code>
        <Code label="Python">{`import json
minified = json.dumps(data, separators=(",", ":"))`}</Code>
        <Code label="Command line (jq)">{`jq -c . data.json > data.min.json`}</Code>
        <p>
          To do the opposite and make JSON readable again, see
          <a href="/pretty-print-json"> how to pretty print JSON</a>.
        </p>

        <FaqSection faqs={FAQS['json-minifier']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-repair', 'JSON Repair'],
            ['/json-validator', 'JSON Validator'],
            ['/json-escape', 'JSON Escape'],
            ['/pretty-print-json', 'How to Pretty Print JSON'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonMinifier
