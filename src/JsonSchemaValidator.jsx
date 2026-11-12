import { useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import CodeEditor from './CodeEditor.jsx'
import { ToolPanel, Tool, StatusBadge, EmptyBox, Messages, FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { useLiveJsonCheck, describeText, parseJsonOrThrow } from './toolUtils.js'

// The validator library (Ajv) is only downloaded when someone clicks Validate,
// so the rest of the site stays fast.
async function makeValidator(schema) {
  const version = String(schema.$schema || '')
  const Ajv = version.includes('2020-12')
    ? (await import('ajv/dist/2020.js')).default
    : version.includes('2019-09')
      ? (await import('ajv/dist/2019.js')).default
      : (await import('ajv')).default
  const addFormats = (await import('ajv-formats')).default
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  return ajv.compile(schema)
}

function describeError(error) {
  const where = error.instancePath || '(root)'
  let message = error.message
  if (error.keyword === 'additionalProperties') message = `has an extra field "${error.params.additionalProperty}" that is not allowed`
  if (error.keyword === 'required') message = `is missing the required field "${error.params.missingProperty}"`
  if (error.keyword === 'enum') message = `must be one of: ${error.params.allowedValues.map((v) => JSON.stringify(v)).join(', ')}`
  return { where, message, keyword: SHORT_LABELS[error.keyword] || error.keyword }
}

// Short, friendly labels for the most common schema rules.
const SHORT_LABELS = {
  additionalProperties: 'extra field',
  required: 'missing',
  minimum: 'too small',
  maximum: 'too big',
  exclusiveMinimum: 'too small',
  exclusiveMaximum: 'too big',
  minLength: 'too short',
  maxLength: 'too long',
  minItems: 'too few',
  maxItems: 'too many',
  uniqueItems: 'duplicate',
  pattern: 'pattern',
  format: 'format',
  enum: 'not allowed',
  const: 'not allowed',
  type: 'wrong type',
}

const SAMPLE_SCHEMA = JSON.stringify(
  {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Customer',
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'integer', minimum: 1 },
      name: { type: 'string', minLength: 2 },
      email: { type: 'string', format: 'email' },
      age: { type: 'integer', minimum: 0, maximum: 130 },
      plan: { enum: ['free', 'pro', 'business'] },
      tags: { type: 'array', items: { type: 'string' } },
    },
    additionalProperties: false,
  },
  null,
  2
)

const SAMPLE_DATA = JSON.stringify(
  { id: 1024, name: 'Emily Clark', email: 'emily.clark@example', age: 150, plan: 'gold', tags: ['admin', 7], nickname: 'Em' },
  null,
  2
)

function JsonSchemaValidator() {
  const [schemaText, setSchemaText] = useState('')
  const [dataText, setDataText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [errorLocation, setErrorLocation] = useState(null)
  const [busy, setBusy] = useState(false)
  const schemaCheck = useLiveJsonCheck(schemaText)
  const dataCheck = useLiveJsonCheck(dataText)

  function reset() {
    setResult(null)
    setError('')
    setErrorLocation(null)
  }

  async function validate() {
    reset()
    if (!schemaText.trim() || !dataText.trim()) {
      setError('Please paste a JSON Schema on the left and your JSON on the right.')
      return
    }
    setBusy(true)
    try {
      const schema = parseJsonOrThrow(schemaText, 'schema')
      const data = parseJsonOrThrow(dataText, 'JSON data')
      let check
      try {
        check = await makeValidator(schema)
      } catch (err) {
        throw new Error(`The schema itself has a problem: ${err.message}`, { cause: err })
      }
      const valid = check(data)
      setResult({ valid, errors: valid ? [] : check.errors.map(describeError) })
    } catch (err) {
      setError(err.message)
      setErrorLocation(err.location || null)
    } finally {
      setBusy(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      validate()
    }
  }

  return (
    <div className="app tool-page compare-page">
      <NavBar />
      <h1>JSON Schema Validator Online</h1>
      <p>
        Check that your JSON matches a JSON Schema. See every problem with its
        location in plain English. Supports draft-07, 2019-09 and 2020-12.
      </p>

      <div className="editor-layout">
        <ToolPanel
          title="JSON Schema"
          badge={<StatusBadge check={schemaCheck} />}
          tools={<Tool onClick={() => { setSchemaText(''); reset() }}>Clear</Tool>}
          statusRight={describeText(schemaText)}
        >
          <CodeEditor
            value={schemaText}
            placeholder={'Paste your JSON Schema here...'}
            onChange={(text) => {
              setSchemaText(text)
              reset()
            }}
            onKeyDown={handleKeyDown}
            errorLine={schemaCheck?.location?.line || null}
            onFileDrop={async (file) => setSchemaText(await file.text())}
          />
        </ToolPanel>
        <ToolPanel
          title="JSON Data"
          badge={<StatusBadge check={dataCheck} />}
          tools={<Tool onClick={() => { setDataText(''); reset() }}>Clear</Tool>}
          statusRight={describeText(dataText)}
        >
          <CodeEditor
            value={dataText}
            placeholder={'Paste the JSON to check here...\n\nTip: press Ctrl + Enter to validate.'}
            onChange={(text) => {
              setDataText(text)
              reset()
            }}
            onKeyDown={handleKeyDown}
            errorLine={dataCheck?.location?.line || null}
            onFileDrop={async (file) => setDataText(await file.text())}
          />
        </ToolPanel>
      </div>

      <div className="action-bar">
        <button type="button" className="action-primary" onClick={validate} disabled={busy} title="Shortcut: Ctrl + Enter">
          {busy ? 'Checking…' : 'Validate JSON'}
        </button>
        <Tool
          onClick={() => {
            setSchemaText(SAMPLE_SCHEMA)
            setDataText(SAMPLE_DATA)
            reset()
          }}
        >
          Sample
        </Tool>
        <Tool onClick={() => { setSchemaText(''); setDataText(''); reset() }}>Clear all</Tool>
        <a className="action-link" href="/json-schema-generator">No schema yet? Generate one →</a>
      </div>

      <Messages error={error} location={errorLocation} />

      <ToolPanel
        title="Result"
        badge={
          result && (
            <span className={`status-badge ${result.valid ? 'status-ok' : 'status-bad'}`}>
              {result.valid ? '✓ Valid' : `✗ ${result.errors.length} problem${result.errors.length > 1 ? 's' : ''}`}
            </span>
          )
        }
        statusLeft={result ? (result.valid ? 'The JSON matches the schema' : 'The JSON does not match the schema') : 'Not checked yet'}
      >
        {!result && <EmptyBox>The validation result will appear here.</EmptyBox>}
        {result?.valid && <EmptyBox>✓ Your JSON is valid against this schema. No problems found.</EmptyBox>}
        {result && !result.valid && (
          <div className="diff-list">
            {result.errors.map((item, index) => (
              <div key={index} className="diff-row diff-removed schema-row">
                <span className="diff-type">{item.keyword}</span>
                <code className="diff-path">{item.where}</code>
                <span className="diff-values">
                  <span className="schema-message">{item.message}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </ToolPanel>

      <section className="seo-content">
        <h2>What Is a JSON Schema Validator?</h2>
        <p>
          A JSON Schema is a JSON document that describes what valid data must
          look like: required fields, types, allowed values, number ranges and
          text formats like email or date. A validator checks your JSON against
          that schema and tells you exactly what does not match.
        </p>

        <h2>How to Validate JSON Against a Schema</h2>
        <ol>
          <li>Paste your JSON Schema on the left and your JSON data on the right, or click Sample.</li>
          <li>Click Validate JSON, or press Ctrl + Enter.</li>
          <li>Fix each problem shown in the result. The path, like /tags/1, shows where it is.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Supports JSON Schema draft-07, 2019-09 and 2020-12 (picked from $schema).</li>
          <li>Checks formats such as email, date, date-time, uri, uuid and ipv4.</li>
          <li>Shows all problems at once, in plain English, with their location.</li>
          <li>Powered by Ajv, the most widely used JSON Schema validator.</li>
          <li>Runs in your browser. Your schema and data are never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="Schema">{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "email"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "integer", "maximum": 130 }
  }
}`}</Code>
        <Code label="Data">{`{ "email": "emily@example", "age": 150 }`}</Code>
        <Code label="Problems found">{`(root)  is missing the required field "id"
/email  must match format "email"
/age    must be <= 130`}</Code>
        <p>
          The location on the left tells you where each problem is:
          <code> (root)</code> is the top-level object and <code>/age</code> is the
          <code> age</code> field. A path like <code>/orders/0/total</code> points to the
          total of the first order.
        </p>

        <h2>Most Useful Schema Keywords</h2>
        <ul>
          <li><code>type</code>: string, integer, number, boolean, object, array or null.</li>
          <li><code>required</code>: fields that must be present.</li>
          <li><code>minimum</code> / <code>maximum</code> and <code>minLength</code> / <code>maxLength</code>: limits for numbers and text.</li>
          <li><code>enum</code>: a fixed list of allowed values.</li>
          <li><code>format</code>: email, date, date-time, uri, uuid, ipv4 and more.</li>
          <li><code>pattern</code>: a regular expression the text must match.</li>
          <li><code>additionalProperties: false</code>: reject fields that are not listed.</li>
        </ul>
        <p>
          No schema yet? Create one from a sample in seconds with the
          <a href="/json-schema-generator"> JSON Schema Generator</a>.
        </p>

        <FaqSection faqs={FAQS['json-schema-validator']} />

        <RelatedTools
          links={[
            ['/json-schema-generator', 'JSON Schema Generator'],
            ['/json-validator', 'JSON Validator'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>

      <SiteFooter />
    </div>
  )
}

export default JsonSchemaValidator
