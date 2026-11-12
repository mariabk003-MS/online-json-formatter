import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { inferModel, modelToJsonSchema } from './typeModel.js'

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@example.com',
    isActive: true,
    balance: 2500.75,
    manager: null,
    tags: ['admin', 'editor'],
    address: { city: 'London', postcode: 'SW1A 1AA' },
    orders: [
      { orderId: 'A-100', total: 49.99 },
      { orderId: 'A-101', total: 19.5, coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonSchemaGenerator() {
  const [title, setTitle] = useState('Customer')

  return (
    <ConverterPage
      h1="JSON Schema Generator – Create a Schema from JSON"
      intro="Paste example JSON and get a JSON Schema (draft 2020-12) with types, required fields and nested objects, ready to use for validation."
      inputTitle="JSON Input"
      outputTitle="JSON Schema"
      inputPlaceholder="Paste example JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'schema.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Generate Schema',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const schema = modelToJsonSchema(inferModel(data, title || 'Root'), title || 'Root')
            return {
              output: JSON.stringify(schema, null, 2),
              message: 'JSON Schema generated. Test it with the JSON Schema Validator.',
            }
          },
        },
      ]}
      options={
        <label className="option">
          Title
          <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON Schema Generator?</h2>
        <p>
          A JSON Schema describes what valid JSON looks like: which fields
          exist, their types and which ones are required. Writing a schema by
          hand takes time. A generator reads an example and writes the schema
          for you, so you can start validating API requests, config files and
          test data straight away.
        </p>

        <h2>How to Generate a JSON Schema</h2>
        <ol>
          <li>Paste a typical example of your JSON. More complete examples give better schemas.</li>
          <li>Give the schema a title.</li>
          <li>Click Generate Schema, or press Ctrl + Enter.</li>
          <li>Copy or download schema.json, then fine-tune it if needed.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Uses the current standard, JSON Schema draft 2020-12.</li>
          <li>Detects string, integer, number, boolean, null, arrays and nested objects.</li>
          <li>Fields missing from some array items are not marked as required.</li>
          <li>Mixed values become type lists, like [&quot;string&quot;, &quot;null&quot;].</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="JSON">{`{ "id": 1024, "name": "Emily Clark", "email": "emily@example.com", "active": true, "tags": ["admin"] }`}</Code>
        <Code label="Generated schema">{`{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string" },
    "active": { "type": "boolean" },
    "tags": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["id", "name", "email", "active", "tags"]
}`}</Code>

        <h2>Make the Schema Stricter</h2>
        <p>
          A generated schema only knows the types in your sample. Add the rules
          that matter for your data by hand:
        </p>
        <Code label="Extra rules">{`"id":    { "type": "integer", "minimum": 1 },
"name":  { "type": "string", "minLength": 2 },
"email": { "type": "string", "format": "email" },
"plan":  { "enum": ["free", "pro", "business"] }`}</Code>
        <p>
          Add <code>&quot;additionalProperties&quot;: false</code> to reject unknown
          fields, and remove names from <code>required</code> if they are optional.
          Then test real data against it with the
          <a href="/json-schema-validator"> JSON Schema Validator</a>.
        </p>

        <h2>What JSON Schema Is Used For</h2>
        <ul>
          <li><strong>API validation:</strong> reject requests with missing or wrong fields before they reach your code.</li>
          <li><strong>Documentation:</strong> OpenAPI specs describe request and response bodies with JSON Schema.</li>
          <li><strong>Editor help:</strong> VS Code uses schemas to autocomplete and check config files like package.json.</li>
          <li><strong>Forms and tests:</strong> generate forms or test data from one shared definition.</li>
        </ul>

        <FaqSection faqs={FAQS['json-schema-generator']} />

        <RelatedTools
          links={[
            ['/json-schema-validator', 'JSON Schema Validator'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-validator', 'JSON Validator'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonSchemaGenerator
