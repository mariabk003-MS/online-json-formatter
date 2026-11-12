import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient, describeFixes } from './toolUtils.js'

// A broken record with many typical mistakes, to show what the tool can fix.
const SAMPLE = [
  '{',
  '  // Customer record copied from JavaScript',
  '  id: 1024,',
  "  'name': 'Emily Clark',",
  '  "email": "emily.clark@example.com"',
  '  "isActive": True,',
  '  "manager": None,',
  '  "skills": ["JSON" "React", "API",],',
  '  "address": {"city": "London", "country": "United Kingdom",},',
  '}',
].join('\n')

function JsonRepair() {
  return (
    <ConverterPage
      h1="JSON Repair – Fix Broken JSON Online"
      intro="Paste broken JSON and repair it in one click. Missing commas, quotes, comments, brackets and more are fixed automatically."
      inputTitle="Broken JSON"
      outputTitle="Repaired JSON"
      inputPlaceholder="Paste your broken JSON here, or drop a file..."
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'repaired.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Repair JSON',
          run: (text) => {
            const { data, report } = parseJsonLenient(text, 'JSON')
            return {
              output: JSON.stringify(data, null, 2),
              message: report ? describeFixes(report) : 'Your JSON was already valid. It has been formatted.',
            }
          },
        },
      ]}
    >
      <section className="seo-content">
        <h2>What Is a JSON Repair Tool?</h2>
        <p>
          A JSON repair tool takes JSON that will not parse and fixes the
          mistakes for you. Broken JSON often comes from copying JavaScript
          objects, Python output, log files or AI answers. Instead of hunting
          for one missing comma, paste it here and get valid JSON back.
        </p>

        <h2>How to Repair JSON</h2>
        <ol>
          <li>Paste your broken JSON into the box, or click Sample to see an example.</li>
          <li>Click Repair JSON, or press Ctrl + Enter.</li>
          <li>Read the list of fixes that were made, then click Copy or Download.</li>
        </ol>

        <h2>What It Fixes</h2>
        <ul>
          <li>Missing commas between values, and trailing commas before {'}'} or ].</li>
          <li>Missing colons, and = or , used instead of a colon.</li>
          <li>Single quotes and curly quotes, and keys without quotes.</li>
          <li>// and /* */ comments.</li>
          <li>Real line breaks and tabs inside strings.</li>
          <li>Python True, False and None.</li>
          <li>Missing closing quotes and missing {'}'} or ] at the end.</li>
        </ul>
        <p>
          Text inside your strings is never changed. If something cannot be
          fixed safely, the broken line is marked in red so you can fix it by hand.
        </p>

        <h2>Example</h2>
        <Code label="Broken">{`{
  name: 'Emily Clark',
  "active": True,
  "tags": ["json" "api",],
}`}</Code>
        <Code label="Repaired">{`{
  "name": "Emily Clark",
  "active": true,
  "tags": [
    "json",
    "api"
  ]
}`}</Code>
        <p>
          The tool reports exactly what it changed: <em>Fixed 6 problems: quotes
          added around a key, single quote changed to double quote,
          True/False/None changed to true/false/null, missing comma added,
          trailing comma removed (×2).</em>
        </p>

        <h2>Where Broken JSON Comes From</h2>
        <ul>
          <li><strong>JavaScript objects</strong> copied from code or the browser console have unquoted keys, single quotes and trailing commas.</li>
          <li><strong>Python output</strong> from <code>print(dict)</code> uses single quotes and <code>True</code>, <code>False</code>, <code>None</code>. Use <code>json.dumps()</code> instead of <code>print()</code> to get real JSON.</li>
          <li><strong>AI chat answers</strong> often add comments, explanations or a missing bracket at the end.</li>
          <li><strong>Log files and cut-off responses</strong> lose their last characters, so closing brackets are missing.</li>
          <li><strong>Word processors and chat apps</strong> replace straight quotes with curly quotes (“ ”), which JSON does not accept.</li>
        </ul>

        <h2>Repair, Then Check</h2>
        <p>
          After repairing, read the list of fixes to make sure the result is
          what you meant, especially when a bracket was added at the end. Then
          explore the data in the <a href="/json-viewer">JSON Viewer</a> or check it
          against a schema with the <a href="/json-schema-validator">JSON Schema Validator</a>.
          To understand a specific error message, see
          <a href="/unexpected-token-in-json"> Unexpected Token in JSON</a>.
        </p>

        <FaqSection faqs={FAQS['json-repair']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-validator', 'JSON Validator'],
            ['/common-json-errors', 'Common JSON Errors'],
            ['/json-minifier', 'JSON Minifier'],
            ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonRepair
