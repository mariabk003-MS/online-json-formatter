import { useState } from 'react'
import yaml from 'js-yaml'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient, describeFixes } from './toolUtils.js'

const SAMPLE = JSON.stringify(
  {
    name: 'my-web-app',
    version: '1.4.0',
    private: true,
    port: 8080,
    database: { host: 'localhost', user: 'admin', ssl: false },
    services: ['api', 'worker', 'scheduler'],
    owner: { name: 'Emily Clark', city: 'London' },
  },
  null,
  2
)

function JsonToYaml() {
  const [indent, setIndent] = useState('2')

  return (
    <ConverterPage
      h1="JSON to YAML Converter"
      intro="Convert JSON into clean, readable YAML for config files like Docker Compose, Kubernetes and GitHub Actions."
      inputTitle="JSON Input"
      outputTitle="YAML Result"
      inputPlaceholder="Paste your JSON here, or drop a .json file..."
      sample={SAMPLE}
      outputType="yaml"
      download={{ fileName: 'converted.yaml', mimeType: 'application/yaml' }}
      actions={[
        {
          label: 'Convert to YAML',
          run: (text) => {
            const { data, report } = parseJsonLenient(text, 'JSON')
            const output = yaml.dump(data, { indent: Number(indent), lineWidth: -1, noRefs: true }).trimEnd()
            return {
              output,
              message: report
                ? `Converted to YAML. Your JSON had small mistakes that were fixed first: ${describeFixes(report)}`
                : 'Converted to YAML successfully!',
            }
          },
        },
      ]}
      options={
        <label className="option">
          Indent
          <select value={indent} onChange={(event) => setIndent(event.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to YAML Converter?</h2>
        <p>
          A JSON to YAML converter rewrites JSON data in YAML format. YAML holds
          the same data as JSON, but uses indentation instead of brackets and
          quotes, so it is much easier for people to read and edit. That is why
          most config files are written in YAML.
        </p>

        <h2>How to Convert JSON to YAML</h2>
        <ol>
          <li>Paste your JSON into the JSON Input box, click Upload, or drop a .json file.</li>
          <li>Choose 2 or 4 spaces of indentation.</li>
          <li>Click Convert to YAML, or press Ctrl + Enter.</li>
          <li>Click Copy or Download to save your .yaml file.</li>
        </ol>

        <h2>JSON vs YAML Example</h2>
        <p>This JSON:</p>
        <pre className="result-output">{'{\n  "name": "my-web-app",\n  "port": 8080,\n  "services": ["api", "worker"]\n}'}</pre>
        <p>becomes this YAML:</p>
        <pre className="result-output">{'name: my-web-app\nport: 8080\nservices:\n  - api\n  - worker'}</pre>

        <h2>Features</h2>
        <ul>
          <li>Keeps numbers, true/false, null, lists and nested objects.</li>
          <li>Puts text in quotes when it could be mistaken for a number or boolean.</li>
          <li>Fixes small JSON mistakes (like trailing commas) automatically before converting.</li>
          <li>Colored YAML result with line numbers, Copy and Download.</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Why Some Values Get Quotes</h2>
        <p>
          YAML guesses the type of unquoted values, so the converter adds quotes
          wherever a guess could change your data:
        </p>
        <Code label="JSON">{`{ "country": "NO", "version": "1.10", "zip": "01234", "enabled": true, "note": "Line 1\\nLine 2" }`}</Code>
        <Code label="YAML">{`country: 'NO'
version: '1.10'
zip: '01234'
enabled: true
note: |-
  Line 1
  Line 2`}</Code>
        <p>
          Without quotes, <code>1.10</code> would be read back as the number 1.1 and
          <code> 01234</code> as 1234, and some older YAML tools read <code>NO</code> as
          false. Text with line breaks uses the <code>|-</code> block style, which keeps
          each line readable instead of using <code>\n</code>.
        </p>

        <h2>Where You Need YAML</h2>
        <ul>
          <li><strong>Kubernetes</strong> manifests and Helm values</li>
          <li><strong>Docker Compose</strong> files (docker-compose.yml)</li>
          <li><strong>CI/CD pipelines</strong> such as GitHub Actions, GitLab CI and Azure Pipelines</li>
          <li><strong>OpenAPI / Swagger</strong> specs and app config files</li>
        </ul>
        <p>
          A handy workflow: generate or edit the data as JSON, convert it here,
          then add comments in the YAML. Read <a href="/json-vs-yaml">JSON vs YAML</a> for
          a full comparison, and check the result with the <a href="/yaml-formatter">YAML Formatter</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-yaml']} />

        <RelatedTools
          links={[
            ['/yaml-to-json', 'YAML to JSON'],
            ['/json-to-xml', 'JSON to XML'],
            ['/', 'JSON Formatter'],
            ['/json-validator', 'JSON Validator'],
            ['/json-vs-yaml', 'JSON vs YAML'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToYaml
