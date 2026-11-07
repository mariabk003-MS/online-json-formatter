import { useState } from 'react'
import yaml from 'js-yaml'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { yamlError } from './toolUtils.js'

// Reads every YAML document in the text, or throws an error with a line number.
function readDocuments(text) {
  try {
    return yaml.loadAll(text).filter((doc) => doc !== undefined)
  } catch (err) {
    throw yamlError(err, text)
  }
}

const SAMPLE = `# Docker Compose example
services:
    web:
        image:   "nginx:latest"
        ports: [ "80:80", "443:443" ]
        environment:
          - NODE_ENV=production
          - API_URL=https://api.example.com
    db:
      image: postgres:16
      restart:   always
`

function YamlFormatter() {
  const [indent, setIndent] = useState('2')

  return (
    <ConverterPage
      h1="YAML Formatter & Validator Online"
      intro="Check YAML for errors and beautify it with clean, consistent indentation. Errors are shown with the exact line."
      inputTitle="YAML Input"
      outputTitle="Formatted YAML"
      inputIsJson={false}
      inputPlaceholder="Paste your YAML here, or drop a .yaml / .yml file..."
      inputAccept=".yaml,.yml,.txt,application/yaml,text/yaml,text/plain"
      sample={SAMPLE}
      outputType="yaml"
      download={{ fileName: 'formatted.yaml', mimeType: 'application/yaml' }}
      actions={[
        {
          label: 'Format YAML',
          run: (text) => {
            const docs = readDocuments(text)
            if (docs.length === 0) throw new Error('The YAML is empty.')
            const output = docs
              .map((doc) => yaml.dump(doc, { indent: Number(indent), lineWidth: -1, noRefs: true }).trimEnd())
              .join('\n---\n')
            return { output, message: 'Valid YAML. Formatted with clean indentation (comments are not kept).' }
          },
        },
        {
          label: 'Validate',
          run: (text) => {
            const docs = readDocuments(text)
            if (docs.length === 0) throw new Error('The YAML is empty.')
            return {
              output: text,
              message: `✓ Valid YAML${docs.length > 1 ? ` (${docs.length} documents)` : ''}. Your YAML was not changed.`,
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
        <h2>What Is a YAML Formatter?</h2>
        <p>
          A YAML formatter checks YAML for mistakes and rewrites it with
          consistent indentation. YAML depends on spaces, so one wrong indent
          can break a Docker Compose, Kubernetes or GitHub Actions file. This
          tool finds the problem line for you and cleans up the layout.
        </p>

        <h2>How to Format and Validate YAML</h2>
        <ol>
          <li>Paste your YAML, click Upload, or drop a .yaml file on the box.</li>
          <li>Click Validate to only check it, or Format YAML to clean it up.</li>
          <li>If there is an error, the broken line is marked in red with the line and column.</li>
          <li>Click Copy or Download to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Finds YAML errors with the exact line and column.</li>
          <li>Rewrites YAML with 2 or 4 space indentation.</li>
          <li>Supports files with several documents separated by ---.</li>
          <li>Validate mode keeps your YAML and comments unchanged.</li>
          <li>Runs in your browser. Your YAML is never uploaded.</li>
        </ul>

        <FaqSection faqs={FAQS['yaml-formatter']} />

        <RelatedTools
          links={[
            ['/yaml-to-json', 'YAML to JSON'],
            ['/json-to-yaml', 'JSON to YAML'],
            ['/xml-formatter', 'XML Formatter'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default YamlFormatter
