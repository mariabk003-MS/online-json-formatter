import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
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
