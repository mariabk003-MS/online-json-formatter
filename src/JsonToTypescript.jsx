import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

// "user_address" → "UserAddress"
function toPascalCase(text) {
  const name = String(text)
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, next) => (next ? next.toUpperCase() : ''))
    .replace(/^[a-z]/, (first) => first.toUpperCase())
  if (!name) return 'Item'
  return /^[A-Za-z_]/.test(name) ? name : `T${name}`
}

// "companies" → "company", "users" → "user" (for the type of array items)
function singular(text) {
  if (/ies$/i.test(text)) return text.slice(0, -3) + 'y'
  if (/(ss|us)$/i.test(text)) return text
  if (/s$/i.test(text)) return text.slice(0, -1)
  return text + 'Item'
}

// Writes TypeScript interfaces that describe the JSON.
function jsonToTypescript(data, rootName) {
  const interfaces = new Map() // name → [{ key, type, optional }]

  function uniqueName(base) {
    let name = base
    let n = 2
    while (interfaces.has(name)) name = `${base}${n++}`
    return name
  }

  // One interface for one or more objects (e.g. all items of an array).
  function objectType(objects, hint) {
    const name = uniqueName(toPascalCase(hint))
    interfaces.set(name, []) // reserve the name now, so parents are listed first
    const keys = []
    for (const object of objects) {
      for (const key of Object.keys(object)) if (!keys.includes(key)) keys.push(key)
    }
    const fields = keys.map((key) => {
      const values = objects.filter((object) => key in object).map((object) => object[key])
      return { key, type: unionType(values, key), optional: values.length < objects.length }
    })
    interfaces.set(name, fields)
    return name
  }

  // The type of a set of values, e.g. "string | null" or "Address[]".
  function unionType(values, hint) {
    const types = []
    const add = (type) => {
      if (!types.includes(type)) types.push(type)
    }
    const objects = values.filter(isPlainObject)
    if (objects.length) add(objectType(objects, hint))
    const arrays = values.filter(Array.isArray)
    if (arrays.length) {
      const items = arrays.flat()
      if (items.length === 0) add('unknown[]')
      else {
        const itemType = unionType(items, singular(hint))
        add(itemType.includes('|') ? `(${itemType})[]` : `${itemType}[]`)
      }
    }
    for (const value of values) {
      if (value === null) add('null')
      else if (typeof value === 'string') add('string')
      else if (typeof value === 'number') add('number')
      else if (typeof value === 'boolean') add('boolean')
    }
    return types.length ? types.join(' | ') : 'unknown'
  }

  const root = toPascalCase(rootName || 'Root')
  let header = ''
  if (isPlainObject(data)) {
    objectType([data], root)
  } else {
    header = `export type ${root} = ${unionType([data], root + 'Item')}\n\n`
  }

  const blocks = [...interfaces].map(([name, fields]) => {
    const lines = fields.map(({ key, type, optional }) => {
      const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
      return `  ${safeKey}${optional ? '?' : ''}: ${type}`
    })
    return `export interface ${name} {\n${lines.join('\n')}\n}`
  })
  return (header + blocks.join('\n\n')).trim()
}

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@example.com',
    isActive: true,
    manager: null,
    address: { city: 'London', country: 'United Kingdom' },
    orders: [
      { orderId: 'A-100', total: 49.99, items: ['Keyboard'] },
      { orderId: 'A-101', total: 19.5, items: ['Mouse', 'Pad'], coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonToTypescript() {
  const [rootName, setRootName] = useState('Root')

  return (
    <ConverterPage
      h1="JSON to TypeScript Interface Generator"
      intro="Paste JSON and get ready-to-use TypeScript interfaces, with nested types, arrays and optional fields."
      inputTitle="JSON Input"
      outputTitle="TypeScript"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'types.ts', mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate TypeScript',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToTypescript(data, rootName)
            const count = (output.match(/^export interface/gm) || []).length
            return { output, message: `Generated ${count} interface${count === 1 ? '' : 's'}.` }
          },
        },
      ]}
      options={
        <label className="option">
          Root name
          <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to TypeScript Converter?</h2>
        <p>
          A JSON to TypeScript converter reads example JSON, like an API
          response, and writes TypeScript interfaces that describe its shape.
          Instead of typing every field by hand, you get correct types in one
          click and can paste them straight into your project.
        </p>

        <h2>How to Generate TypeScript Interfaces</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a name for the main interface (Root by default).</li>
          <li>Click Generate TypeScript, or press Ctrl + Enter.</li>
          <li>Click Copy, or Download the types.ts file.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Detects string, number, boolean, null, arrays and nested objects.</li>
          <li>Creates a named interface for each nested object, like Address or Order.</li>
          <li>Merges array items and marks fields that are not always present as optional.</li>
          <li>Union types such as string | null when values differ.</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 1024,
  "name": "Emily Clark",
  "manager": null,
  "address": { "city": "London", "zip": "SW1A 1AA" },
  "orders": [
    { "id": 1, "total": 49.5 },
    { "id": 2, "total": 12, "coupon": "SAVE10" }
  ]
}`}</Code>
        <Code label="TypeScript">{`export interface Root {
  id: number
  name: string
  manager: null
  address: Address
  orders: Order[]
}

export interface Address {
  city: string
  zip: string
}

export interface Order {
  id: number
  total: number
  coupon?: string
}`}</Code>
        <p>
          The nested object becomes its own <code>Address</code> interface, the
          array becomes <code>Order[]</code>, and <code>coupon</code> is marked
          optional with <code>?</code> because only one order has it.
        </p>

        <h2>Tips for Better Types</h2>
        <ul>
          <li><strong>Use a complete sample.</strong> The tool can only see the fields in your example. Include an item with every optional field if you can.</li>
          <li><strong>Check null values.</strong> A field that is <code>null</code> in your sample becomes <code>null</code>. If it can also be a string, change it to <code>string | null</code>.</li>
          <li><strong>Types are not checked at runtime.</strong> TypeScript types disappear after compiling. To validate real API data, use a JSON Schema with the <a href="/json-schema-generator">JSON Schema Generator</a> and <a href="/json-schema-validator">JSON Schema Validator</a>, or a library like Zod.</li>
        </ul>

        <h2>Interface or Type?</h2>
        <p>
          Both describe the shape of an object, and for API data they work the
          same. Interfaces can be extended and merged, and many teams use them for
          object shapes; <code>type</code> is needed for unions like
          <code> &apos;admin&apos; | &apos;editor&apos;</code>. Using another language? Try
          <a href="/json-to-python"> JSON to Python</a> or <a href="/json-to-java">JSON to Java</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-typescript']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-validator', 'JSON Validator'],
            ['/json-viewer', 'JSON Viewer'],
            ['/json-to-yaml', 'JSON to YAML'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToTypescript
