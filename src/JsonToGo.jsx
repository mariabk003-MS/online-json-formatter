import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToGo } from './goCsharpGen.js'

const SAMPLE = JSON.stringify(
  {
    id: 1024,
    first_name: 'Emily',
    email: 'emily@example.com',
    is_active: true,
    balance: 2500.75,
    manager: null,
    address: { city: 'London', postcode: 'SW1A 1AA' },
    orders: [
      { order_id: 'A-100', total: 49.99 },
      { order_id: 'A-101', total: 19.5, coupon: 'SAVE10' },
    ],
  },
  null,
  2
)

function JsonToGo() {
  const [rootName, setRootName] = useState('Customer')
  const [omitEmpty, setOmitEmpty] = useState(true)

  return (
    <ConverterPage
      h1="JSON to Go Struct Converter"
      intro="Paste JSON and get Go structs with json tags, nested types, slices and Go-style names like UserID. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Go"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'types.go', mimeType: 'text/x-go' }}
      actions={[
        {
          label: 'Generate Go',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToGo(data, rootName, omitEmpty)
            const count = (output.match(/^type /gm) || []).length
            return { output, message: `Generated ${count} Go type${count === 1 ? '' : 's'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Struct name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
          <label className="option">
            <input type="checkbox" checked={omitEmpty} onChange={(event) => setOmitEmpty(event.target.checked)} />
            omitempty on optional fields
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Go Converter?</h2>
        <p>
          A JSON to Go converter reads example JSON, like an API response or a
          config file, and writes Go structs that match it. Each field gets the
          right Go type and a <code>json</code> struct tag, so you can decode the
          data with <code>encoding/json</code> straight away instead of typing every
          field by hand.
        </p>

        <h2>How to Convert JSON to Go Structs</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Type a name for the main struct (Customer in the example).</li>
          <li>Click Generate Go, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as types.go.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "id": 1024,
  "first_name": "Emily",
  "email": "emily@example.com",
  "is_active": true,
  "balance": 2500.75,
  "manager": null,
  "address": { "city": "London", "postcode": "SW1A 1AA" },
  "orders": [
    { "order_id": "A-100", "total": 49.99 },
    { "order_id": "A-101", "total": 19.5, "coupon": "SAVE10" }
  ]
}`}</Code>
        <Code label="Go">{`type Customer struct {
	ID        int64   \`json:"id"\`
	FirstName string  \`json:"first_name"\`
	Email     string  \`json:"email"\`
	IsActive  bool    \`json:"is_active"\`
	Balance   float64 \`json:"balance"\`
	Manager   any     \`json:"manager"\`
	Address   Address \`json:"address"\`
	Orders    []Order \`json:"orders"\`
}

type Address struct {
	City     string \`json:"city"\`
	Postcode string \`json:"postcode"\`
}

type Order struct {
	OrderID string  \`json:"order_id"\`
	Total   float64 \`json:"total"\`
	Coupon  string  \`json:"coupon,omitempty"\`
}`}</Code>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>Go type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>string</code></td></tr>
            <tr><td>Whole number</td><td><code>int64</code>, so large IDs never overflow</td></tr>
            <tr><td>Number with decimals</td><td><code>float64</code></td></tr>
            <tr><td>true / false</td><td><code>bool</code></td></tr>
            <tr><td>Object</td><td>Its own named struct, like <code>Address</code></td></tr>
            <tr><td>Array</td><td>A slice, like <code>[]Order</code></td></tr>
            <tr><td>Sometimes null</td><td>A pointer, like <code>*string</code>, so nil means &quot;no value&quot;</td></tr>
            <tr><td>Only null, or mixed types</td><td><code>any</code>. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Field names follow Go conventions: keys become exported CamelCase
          names, and common initialisms stay in capitals, so <code>id</code> becomes
          <code> ID</code> and <code>order_id</code> becomes <code>OrderID</code>. Fields that
          are missing from some objects, like <code>coupon</code> above, get
          <code> omitempty</code>.
        </p>

        <h2>Decode JSON into the Structs</h2>
        <Code label="Go">{`package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func main() {
	data := []byte(\`{"id": 1024, "first_name": "Emily"}\`)

	var customer Customer
	if err := json.Unmarshal(data, &customer); err != nil {
		log.Fatal(err)
	}
	fmt.Println(customer.ID, customer.FirstName) // 1024 Emily
}`}</Code>
        <p>
          For an HTTP response, decode straight from the body with
          <code> json.NewDecoder(resp.Body).Decode(&amp;customer)</code>. If the JSON is an
          array at the top level, decode it into a slice such as
          <code> []Customer</code>.
        </p>

        <h2>Tips and Common Pitfalls</h2>
        <ul>
          <li><strong>Only exported fields are decoded.</strong> A field that starts with a lowercase letter is silently ignored by <code>encoding/json</code>. The generator always uses capitalized names.</li>
          <li><strong>Dates stay strings.</strong> If a value is an RFC 3339 timestamp like <code>2026-11-15T09:30:00Z</code>, you can change its type to <code>time.Time</code> and it will be parsed for you.</li>
          <li><strong>Numbers in <code>any</code> become float64.</strong> When you decode into <code>any</code> or <code>map[string]any</code>, every number is a float64. Use real struct types, or <code>Decoder.UseNumber()</code>, to keep large integers exact.</li>
          <li><strong>Catch typos in field names.</strong> Call <code>decoder.DisallowUnknownFields()</code> to get an error when the JSON has a field your struct does not know.</li>
          <li><strong>Use a complete sample.</strong> The generator only sees the fields in your example, so include an item with every optional field if you can.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real API
          responses. Need another language? Try <a href="/json-to-typescript">JSON to
          TypeScript</a>, <a href="/json-to-csharp">JSON to C#</a>, <a href="/json-to-java">JSON to Java</a>,
          <a href="/json-to-rust"> JSON to Rust</a> or <a href="/json-to-php">JSON to PHP</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-go']} />

        <RelatedTools
          links={[
            ['/json-to-csharp', 'JSON to C#'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-schema-generator', 'JSON Schema Generator'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToGo
