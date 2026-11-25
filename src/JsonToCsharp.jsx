import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToCSharp } from './goCsharpGen.js'

const SAMPLE = JSON.stringify(
  {"order_id":"A-2045","created_at":"2026-11-15T09:30:00Z","is_paid":true,"total":89.97,"discount":null,"customer":{"name":"James Smith","email":"james@example.com"},"items":[{"sku":"KB-01","quantity":1,"price":59.99},{"sku":"MS-02","quantity":2,"price":14.99,"gift_wrap":true}]},
  null,
  2
)

function JsonToCsharp() {
  const [rootName, setRootName] = useState('Order')
  const [style, setStyle] = useState('class')
  const [library, setLibrary] = useState('system')

  return (
    <ConverterPage
      h1="JSON to C# Class Generator"
      intro="Paste JSON and get C# classes or records with nested types, List<T>, nullable types and System.Text.Json or Newtonsoft attributes. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="C#"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${rootName || 'Root'}.cs`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Generate C#',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const output = jsonToCSharp(data, rootName, style, library)
            const count = (output.match(/^public (class|record) /gm) || []).length
            return { output, message: `Generated ${count} C# ${style === 'record' ? 'record' : 'class'}${count === 1 ? '' : 'es'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Class name
            <input type="text" value={rootName} onChange={(event) => setRootName(event.target.value)} />
          </label>
          <label className="option">
            Style
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="class">Class</option>
              <option value="record">Record (C# 9+)</option>
            </select>
          </label>
          <label className="option">
            Attributes
            <select value={library} onChange={(event) => setLibrary(event.target.value)}>
              <option value="system">System.Text.Json</option>
              <option value="newtonsoft">Newtonsoft.Json</option>
              <option value="none">None</option>
            </select>
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to C# Converter?</h2>
        <p>
          A JSON to C# converter reads example JSON, like an API response, and
          writes C# classes that match it, with the right types, nested classes
          and lists. You paste the result into your project and deserialize the
          JSON with System.Text.Json or Newtonsoft.Json, instead of typing every
          property by hand.
        </p>

        <h2>How to Convert JSON to C# Classes</h2>
        <ol>
          <li>Paste a sample of your JSON, or drop a .json file on the box.</li>
          <li>Choose a class name, classes or records, and System.Text.Json or Newtonsoft attributes.</li>
          <li>Click Generate C#, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .cs file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`{
  "order_id": "A-2045",
  "created_at": "2026-11-15T09:30:00Z",
  "is_paid": true,
  "total": 89.97,
  "discount": null,
  "customer": {
    "name": "James Smith",
    "email": "james@example.com"
  },
  "items": [
    {
      "sku": "KB-01",
      "quantity": 1,
      "price": 59.99
    },
    {
      "sku": "MS-02",
      "quantity": 2,
      "price": 14.99,
      "gift_wrap": true
    }
  ]
}`}</Code>
        <Code label="C# (class, System.Text.Json)">{`using System.Collections.Generic;
using System.Text.Json.Serialization;

public class Order
{
    [JsonPropertyName("order_id")]
    public string OrderId { get; set; } = "";

    [JsonPropertyName("created_at")]
    public string CreatedAt { get; set; } = "";

    [JsonPropertyName("is_paid")]
    public bool IsPaid { get; set; }

    [JsonPropertyName("total")]
    public double Total { get; set; }

    [JsonPropertyName("discount")]
    public object? Discount { get; set; }

    [JsonPropertyName("customer")]
    public Customer Customer { get; set; } = new();

    [JsonPropertyName("items")]
    public List<Item> Items { get; set; } = new();
}

public class Customer
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = "";

    [JsonPropertyName("email")]
    public string Email { get; set; } = "";
}

public class Item
{
    [JsonPropertyName("sku")]
    public string Sku { get; set; } = "";

    [JsonPropertyName("quantity")]
    public long Quantity { get; set; }

    [JsonPropertyName("price")]
    public double Price { get; set; }

    [JsonPropertyName("gift_wrap")]
    public bool? GiftWrap { get; set; }
}`}</Code>
        <p>
          The nested <code>customer</code> object becomes its own <code>Customer</code> class, the
          <code> items</code> array becomes <code>List&lt;Item&gt;</code>, and <code>gift_wrap</code> is
          <code> bool?</code> because only one item has it. <code>created_at</code> stays a
          <code> string</code>: change it to <code>DateTimeOffset</code> to get a real date (see the tips below).
        </p>

        <h2>How the Types Are Chosen</h2>
        <table>
          <thead>
            <tr><th>JSON value</th><th>C# type</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td><code>string</code></td></tr>
            <tr><td>Whole number</td><td><code>long</code>, so large IDs never overflow</td></tr>
            <tr><td>Number with decimals</td><td><code>double</code>. Use <code>decimal</code> for money if you need exact sums.</td></tr>
            <tr><td>true / false</td><td><code>bool</code></td></tr>
            <tr><td>Object</td><td>Its own class, like <code>Address</code></td></tr>
            <tr><td>Array</td><td><code>List&lt;T&gt;</code>, like <code>List&lt;Order&gt;</code></td></tr>
            <tr><td>Missing in some items, or null</td><td>A nullable type, like <code>string?</code> or <code>long?</code></td></tr>
            <tr><td>Only null, or mixed types</td><td><code>object?</code>. Replace it with the real type if you know it.</td></tr>
          </tbody>
        </table>
        <p>
          Required strings, lists and objects get a default value (<code>= &quot;&quot;</code> or
          <code> = new()</code>), so the code compiles without nullable warnings in projects
          that have nullable reference types turned on.
        </p>

        <h2>Deserialize JSON in C#</h2>
        <Code label="System.Text.Json (.NET 6+)">{`using System.Text.Json;

string json = File.ReadAllText("order.json");
Order? order = JsonSerializer.Deserialize<Order>(json);

Console.WriteLine(order?.Customer.Name);   // James Smith`}</Code>
        <p>
          System.Text.Json matches property names <strong>case-sensitively</strong> by
          default, which is why the generator adds <code>[JsonPropertyName]</code> to every
          renamed property. If you turn attributes off, pass
          <code> new JsonSerializerOptions(JsonSerializerDefaults.Web)</code> to match names
          like <code>firstName</code> to <code>FirstName</code>. Note that it still will not match
          <code> first_name</code>; for snake_case keys, keep the attributes.
        </p>
        <Code label="Newtonsoft.Json">{`// dotnet add package Newtonsoft.Json
using Newtonsoft.Json;

Order? order = JsonConvert.DeserializeObject<Order>(json);`}</Code>
        <p>
          If the JSON is an array at the top level, deserialize it as
          <code> List&lt;Order&gt;</code>.
        </p>

        <h2>Classes or Records?</h2>
        <ul>
          <li><strong>Classes</strong> work everywhere, including older .NET Framework projects, and let you change values after loading.</li>
          <li><strong>Records</strong> (C# 9 / .NET 5 and newer) are short and immutable, which suits API responses you only read. System.Text.Json fills them through their constructor.</li>
        </ul>

        <h2>Tips</h2>
        <ul>
          <li><strong>Dates:</strong> date strings stay <code>string</code>. If they are ISO 8601, like <code>2026-11-15T09:30:00Z</code>, change the type to <code>DateTime</code> or <code>DateTimeOffset</code> and both libraries parse them for you.</li>
          <li><strong>Use a complete sample.</strong> The generator only sees the fields in your example. Include an item with every optional field if you can.</li>
          <li><strong>Check the JSON first.</strong> Broken JSON stops deserialization with a JsonException. Fix it with <a href="/json-repair">JSON Repair</a> or check it in the <a href="/json-validator">JSON Validator</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser, so it is safe to paste real API
          responses. Need another language? Try <a href="/json-to-go">JSON to Go</a>,
          <a href="/json-to-java"> JSON to Java</a>, <a href="/json-to-typescript">JSON to TypeScript</a> or <a href="/json-to-php">JSON to PHP</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-csharp']} />

        <RelatedTools
          links={[
            ['/json-to-go', 'JSON to Go'],
            ['/json-to-java', 'JSON to Java'],
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-to-sql', 'JSON to SQL'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToCsharp
