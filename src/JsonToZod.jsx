import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToZod } from './zodGen.js'

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    name: 'Emily Clark',
    email: 'emily.clark@example.com',
    website: 'https://emily.example.com',
    isActive: true,
    joined: '2026-03-14',
    lastLogin: '2026-11-24T09:15:00Z',
    address: { city: 'London', country: 'United Kingdom' },
    orders: [
      { orderId: 'A-100', total: 49.99, items: ['Keyboard'] },
      { orderId: 'A-101', total: 19.5, items: ['Mouse', 'Pad'], coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonToZod() {
  const [rootName, setRootName] = useState('User')
  const [version, setVersion] = useState('4')
  const [formats, setFormats] = useState(true)
  const [inline, setInline] = useState(false)
  const [types, setTypes] = useState(true)

  return (
    <ConverterPage
      h1="JSON to Zod Schema Generator"
      intro="Paste JSON, such as an API response, and get a ready-to-use Zod schema with TypeScript types. Supports Zod 4 and Zod 3, detects emails, URLs, UUIDs and dates, and marks optional and nullable fields. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Zod schema"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'schema.ts', mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate Zod',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToZod(data, rootName, { version: Number(version), formats, inline, types })
            const count = (output.match(/^export const /gm) || []).length
            return { output, message: `Generated ${count} Zod schema${count === 1 ? '' : 's'} for Zod ${version}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Root name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} size={10} spellCheck={false} />
          </label>
          <label className="option">
            Zod version
            <select value={version} onChange={(event) => setVersion(event.target.value)}>
              <option value="4">Zod 4</option>
              <option value="3">Zod 3</option>
            </select>
          </label>
          <label className="option">
            <input type="checkbox" checked={formats} onChange={(event) => setFormats(event.target.checked)} />
            Detect email, URL, UUID, dates
          </label>
          <label className="option">
            <input type="checkbox" checked={types} onChange={(event) => setTypes(event.target.checked)} />
            Export TypeScript types
          </label>
          <label className="option">
            <input type="checkbox" checked={inline} onChange={(event) => setInline(event.target.checked)} />
            One nested schema
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is Zod?</h2>
        <p>
          Zod is a TypeScript library that checks data while your app runs. A TypeScript type disappears
          after compiling, so it cannot stop a bad API response; a Zod schema can. You describe the shape
          once, call <code>schema.parse(data)</code>, and get both a clear error for wrong data and a
          TypeScript type with <code>z.infer</code>. This generator writes that schema for you from an
          example of your JSON.
        </p>

        <h2>How to Generate a Zod Schema from JSON</h2>
        <ol>
          <li>Paste a sample of your JSON, drop a .json file on the box, or load it from a link with URL.</li>
          <li>Pick a root name and your Zod version (Zod 4 is the current one).</li>
          <li>Click Generate Zod, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as schema.ts, and install Zod with <code>npm install zod</code>.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 1024,
  "email": "emily@example.com",
  "address": { "city": "London" },
  "tags": ["admin", "editor"]
}`}</Code>
        <Code label="Zod 4">{`import { z } from 'zod'

export const AddressSchema = z.object({
  city: z.string(),
})
export type Address = z.infer<typeof AddressSchema>

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  address: AddressSchema,
  tags: z.array(z.string()),
})
export type User = z.infer<typeof UserSchema>`}</Code>
        <Code label="Using it">{`const user = UserSchema.parse(await response.json())
// user is typed as User, and a wrong response throws a ZodError`}</Code>

        <h2>How JSON Becomes Zod</h2>
        <table>
          <thead>
            <tr><th>JSON</th><th>Zod 4</th><th>Zod 3</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>z.string()</code></td><td><code>z.string()</code></td></tr>
            <tr><td>Email address</td><td><code>z.email()</code></td><td><code>z.string().email()</code></td></tr>
            <tr><td>Web link (http / https)</td><td><code>z.url()</code></td><td><code>z.string().url()</code></td></tr>
            <tr><td>UUID</td><td><code>z.uuid()</code></td><td><code>z.string().uuid()</code></td></tr>
            <tr><td>Date and time, e.g. <code>2026-11-24T09:15:00Z</code></td><td><code>z.iso.datetime()</code></td><td><code>z.string().datetime()</code></td></tr>
            <tr><td>Date, e.g. <code>2026-03-14</code></td><td><code>z.iso.date()</code></td><td><code>z.string().date()</code></td></tr>
            <tr><td>Whole number / decimal</td><td colSpan={2}><code>z.number().int()</code> / <code>z.number()</code></td></tr>
            <tr><td>true / false</td><td colSpan={2}><code>z.boolean()</code></td></tr>
            <tr><td>Nested object</td><td colSpan={2}>Its own schema, such as <code>AddressSchema</code>, or nested inline</td></tr>
            <tr><td>Array</td><td colSpan={2}><code>z.array(...)</code>; different item types become <code>z.union([...])</code></td></tr>
            <tr><td>Sometimes <code>null</code></td><td colSpan={2}><code>.nullable()</code></td></tr>
            <tr><td>Missing in some array items</td><td colSpan={2}><code>.optional()</code></td></tr>
          </tbody>
        </table>
        <p>
          A format such as email is only used when <strong>every</strong> value of that field matches it,
          so a field with one odd value stays a plain <code>z.string()</code>. Date-times with an offset like
          <code> +05:00</code> get <code>{'{'} offset: true {'}'}</code>, because Zod accepts only <code>Z</code> by default.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Use several examples:</strong> paste an array with a few real items. Fields missing from some items become optional, and a field that is <code>null</code> in one item becomes nullable.</li>
          <li><strong>A field that is only ever null</strong> in your example becomes <code>z.null()</code>. Replace it with the real type once you know it.</li>
          <li><strong>Zod 3 or 4?</strong> Check <code>zod</code> in your package.json: version 4.x uses the Zod 4 output. The Zod 3 option writes the older <code>z.string().email()</code> style.</li>
          <li><strong>New to runtime validation?</strong> <a href="/json-in-typescript">JSON in TypeScript</a> compares casts, type guards and Zod with tested examples.</li>
          <li>Only need types, no runtime checks? Use <a href="/json-to-typescript">JSON to TypeScript</a>. Need a standard schema for other languages? Use the <a href="/json-schema-generator">JSON Schema Generator</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-zod']} />

        <RelatedTools
          links={[
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-schema-generator', 'JSON Schema Generator'],
            ['/json-schema-validator', 'JSON Schema Validator'],
            ['/json-validator', 'JSON Validator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToZod
