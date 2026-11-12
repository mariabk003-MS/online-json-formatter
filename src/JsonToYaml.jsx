import { useState } from 'react'
import yaml from 'js-yaml'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
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
