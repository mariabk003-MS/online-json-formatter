import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonSyntax() {
  return (
    <ArticlePage
      h1="JSON Syntax Rules: Data Types and Format"
      intro="The complete JSON syntax on one page: the six data types, the rules for keys, strings and numbers, and the mistakes that make JSON invalid."
      updated="November 8, 2026"
      faqKey="json-syntax-rules"
      related={[
        ['/json-validator', 'JSON Validator'],
        ['/common-json-errors', 'Common JSON Errors'],
        ['/what-is-json', 'What Is JSON?'],
        ['/', 'JSON Formatter'],
      ]}
    >
      <h2>The Six JSON Data Types</h2>
      <table>
        <thead>
          <tr><th>Type</th><th>Example</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr><td>string</td><td><code>&quot;Hello&quot;</code></td><td>Always double quotes</td></tr>
          <tr><td>number</td><td><code>42</code>, <code>-3.14</code>, <code>1.5e3</code></td><td>No leading zeros, no NaN</td></tr>
          <tr><td>boolean</td><td><code>true</code>, <code>false</code></td><td>Lowercase only</td></tr>
          <tr><td>null</td><td><code>null</code></td><td>Lowercase only</td></tr>
          <tr><td>object</td><td><code>{'{"name": "Emily"}'}</code></td><td>Keys are strings</td></tr>
          <tr><td>array</td><td><code>[1, 2, 3]</code></td><td>Values can be mixed types</td></tr>
        </tbody>
      </table>

      <h2>A Valid JSON Example</h2>
      <Code label="Valid JSON">{`{
  "id": 1024,
  "name": "Emily Clark",
  "email": "emily.clark@example.com",
  "balance": 2500.75,
  "active": true,
  "manager": null,
  "skills": ["JSON", "React"],
  "address": { "city": "London", "country": "United Kingdom" }
}`}</Code>

      <h2>Rules for Objects and Arrays</h2>
      <ul>
        <li>Objects use curly braces <code>{'{ }'}</code>; arrays use square brackets <code>[ ]</code>.</li>
        <li>Each key and value is separated by a colon: <code>&quot;key&quot;: value</code>.</li>
        <li>Items are separated by commas, and there is <strong>no comma after the last item</strong>.</li>
        <li>Keys must be strings in double quotes. Keys should be unique in an object.</li>
        <li>The top level can be any value, but is usually an object or an array.</li>
      </ul>

      <h2>Rules for Strings</h2>
      <ul>
        <li>Use double quotes: <code>&quot;text&quot;</code>, never <code>&apos;text&apos;</code>.</li>
        <li>Real line breaks and tabs are not allowed inside a string; write <code>\n</code> and <code>\t</code>.</li>
        <li>Escape double quotes and backslashes: <code>\&quot;</code> and <code>\\</code>.</li>
        <li>Any character can be written as <code>\u</code> followed by four hex digits.</li>
      </ul>

      <h2>Rules for Numbers</h2>
      <ul>
        <li>Allowed: <code>0</code>, <code>-12</code>, <code>3.14</code>, <code>6.02e23</code>.</li>
        <li>Not allowed: leading zeros (<code>007</code>), a plus sign (<code>+1</code>), hex (<code>0xFF</code>), <code>.5</code>, <code>5.</code>, <code>NaN</code> or <code>Infinity</code>.</li>
        <li>Very large integers may lose precision in JavaScript; send them as strings if exact values matter.</li>
      </ul>

      <h2>Things JSON Does Not Allow</h2>
      <Code label="Invalid JSON (every line has a mistake)">{`{
  name: "Emily",            // key without quotes + a comment
  'city': 'London',         // single quotes
  "active": True,           // must be lowercase true
  "score": 007,             // leading zeros
  "tags": ["a", "b",],      // trailing comma
}`}</Code>
      <p>
        Paste that example into our <a href="/json-repair">JSON Repair</a> tool and
        it will fix every one of these problems automatically. To find the exact
        line of an error in your own data, use the <a href="/json-validator">JSON Validator</a>.
      </p>

      <h2>Whitespace and Encoding</h2>
      <p>
        Spaces, tabs and line breaks between values are ignored, so the same JSON
        can be minified or pretty printed. JSON text should be encoded as UTF-8,
        and the official media type is <code>application/json</code>.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonSyntax
