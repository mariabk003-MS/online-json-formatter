import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonVsCsv() {
  return (
    <ArticlePage
      h1="JSON vs CSV: Differences and When to Use Each"
      intro="CSV is a simple table, JSON is a flexible tree. Here is the same data in both formats, a side-by-side comparison, and a simple rule for choosing the right one."
      updated="November 12, 2026"
      faqKey="json-vs-csv"
      related={[
        ['/json-to-csv', 'JSON to CSV'],
        ['/csv-to-json', 'CSV to JSON'],
        ['/json-to-excel', 'JSON to Excel'],
        ['/json-vs-xml', 'JSON vs XML'],
      ]}
    >
      <h2>The Same Data in Both Formats</h2>
      <Code label="CSV">{`id,name,city,active
1,Emily Clark,London,true
2,James Smith,Leeds,false`}</Code>
      <Code label="JSON">{`[
  { "id": 1, "name": "Emily Clark", "city": "London", "active": true },
  { "id": 2, "name": "James Smith", "city": "Leeds", "active": false }
]`}</Code>
      <p>
        For flat data like this, both work well. CSV is shorter because the
        column names appear only once. JSON repeats every key, but it knows that
        <code> 1</code> is a number and <code>true</code> is a boolean.
      </p>

      <h2>Where They Differ: Nested Data</h2>
      <p>
        Real data often has lists and objects inside each record. JSON handles
        that naturally:
      </p>
      <Code label="JSON">{`{
  "id": 1,
  "name": "Emily Clark",
  "address": { "city": "London", "zip": "SW1A 1AA" },
  "orders": [
    { "id": "A-100", "total": 49.99 },
    { "id": "A-101", "total": 19.5 }
  ]
}`}</Code>
      <p>
        CSV has no way to show this directly. You have to flatten it into
        columns like <code>address.city</code>, store the orders as text in one
        cell, or split them into a second file. That is the main reason APIs use
        JSON.
      </p>

      <h2>Quick Comparison</h2>
      <table>
        <thead>
          <tr><th></th><th>CSV</th><th>JSON</th></tr>
        </thead>
        <tbody>
          <tr><td>Shape</td><td>Flat table of rows and columns</td><td>Tree of objects and arrays</td></tr>
          <tr><td>Data types</td><td>Everything is text</td><td>String, number, boolean, null, object, array</td></tr>
          <tr><td>Nested data</td><td>Not supported</td><td>Built in</td></tr>
          <tr><td>File size</td><td>Smaller for flat data</td><td>Larger, keys repeat in every record</td></tr>
          <tr><td>Opens in Excel</td><td>Yes, double-click</td><td>Needs conversion or Power Query</td></tr>
          <tr><td>Standard</td><td>Loose (RFC 4180, many variations)</td><td>Strict (RFC 8259)</td></tr>
          <tr><td>Typical use</td><td>Spreadsheets, exports, data analysis</td><td>APIs, web apps, config, NoSQL databases</td></tr>
        </tbody>
      </table>

      <h2>CSV Pitfalls</h2>
      <ul>
        <li><strong>Commas inside values</strong> must be wrapped in quotes: <code>&quot;Lahore, Pakistan&quot;</code>. Quotes inside values are doubled: <code>&quot;She said &quot;&quot;Hi&quot;&quot;&quot;</code>.</li>
        <li><strong>Different separators:</strong> many European versions of Excel use semicolons instead of commas.</li>
        <li><strong>Encoding:</strong> letters like é or Urdu text can look broken unless the file is saved as UTF-8.</li>
        <li><strong>Lost types:</strong> Excel may turn <code>00123</code> into 123 or a long ID into scientific notation like 1.23E+15.</li>
      </ul>

      <h2>JSON Pitfalls</h2>
      <ul>
        <li><strong>Strict syntax:</strong> one missing comma or a trailing comma breaks the whole file. <a href="/json-repair">JSON Repair</a> fixes these automatically.</li>
        <li><strong>Not spreadsheet friendly:</strong> people who work in Excel need it converted first.</li>
        <li><strong>Bigger files:</strong> repeated keys add up in large exports, although compression (gzip) removes most of the difference.</li>
      </ul>

      <h2>Which One Should You Use?</h2>
      <ul>
        <li><strong>Choose CSV</strong> when the data is a simple table and people will open it in Excel or Google Sheets, or when you import it into a database or analysis tool.</li>
        <li><strong>Choose JSON</strong> when the data has nested parts, needs real types, is sent between programs, or comes from or goes to an API.</li>
        <li>For very large data processed line by line, consider <a href="/json-lines">JSON Lines</a>: one JSON record per line, easy to stream like CSV.</li>
      </ul>

      <h2>Convert Between Them</h2>
      <p>
        Use <a href="/json-to-csv">JSON to CSV</a> and <a href="/csv-to-json">CSV to JSON</a> to
        convert instantly in your browser. Nested objects become columns like
        <code> address.city</code>, and columns like that turn back into nested
        objects. For a real spreadsheet with numbers and a bold header, use
        <a href="/json-to-excel"> JSON to Excel</a>. In code, see
        <a href="/json-to-csv-python"> How to Convert JSON to CSV in Python</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonVsCsv
