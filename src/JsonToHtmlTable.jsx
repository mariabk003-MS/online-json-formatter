import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToHtmlTable } from './htmlTable.js'

const SAMPLE = JSON.stringify(
  [
    { id: 1, name: 'Emily Clark', email: 'emily@example.com', address: { city: 'London', zip: 'E1 6AN' }, tags: ['admin', 'editor'] },
    { id: 2, name: 'James Smith', email: 'james@example.com', address: { city: 'Leeds', zip: 'LS1 4DY' }, tags: ['viewer'] },
    { id: 3, name: 'Olivia Brown', email: 'olivia@example.com', address: { city: 'Bristol', zip: 'BS1 5TR' }, tags: [] },
  ],
  null,
  2
)

function JsonToHtmlTable() {
  const [mode, setMode] = useState('flat')
  const [css, setCss] = useState(false)

  return (
    <ConverterPage
      h1="JSON to HTML Table Converter"
      intro="Turn a JSON array or object into a clean HTML table, with nested objects as extra columns or as tables inside cells. See a live preview, then copy the code. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="HTML"
      inputPlaceholder="Paste a JSON array of objects, or an object..."
      sample={SAMPLE}
      outputType="xml"
      download={{ fileName: 'table.html', mimeType: 'text/html' }}
      preview={(output) => output}
      actions={[
        {
          label: 'Convert to HTML',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const { html, rowCount } = jsonToHtmlTable(data, { mode, css })
            return { output: html, message: `Created an HTML table with ${rowCount} row${rowCount === 1 ? '' : 's'}.` }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Nested data
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="flat">Extra columns (address.city)</option>
              <option value="nested">Tables inside cells</option>
            </select>
          </label>
          <label className="option">
            <input type="checkbox" checked={css} onChange={(event) => setCss(event.target.checked)} />
            Add CSS styles
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Does This Converter Do?</h2>
        <p>
          It takes JSON, such as an API response or an export, and writes the HTML
          <code> &lt;table&gt;</code> markup for it: a header row from the keys and one row per item.
          Paste the code into a web page, an email template, a CMS or documentation. The preview
          under the result shows exactly how the table looks.
        </p>

        <h2>How to Convert JSON to an HTML Table</h2>
        <ol>
          <li>Paste your JSON, or drop a .json file on the box.</li>
          <li>Choose how nested objects should appear, and whether to add CSS.</li>
          <li>Click Convert to HTML, or press Ctrl + Enter.</li>
          <li>Check the preview, then copy the code or download it as an .html file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`[
  { "id": 1, "name": "Emily Clark", "address": { "city": "London" } },
  { "id": 2, "name": "James Smith", "address": { "city": "Leeds" } }
]`}</Code>
        <Code label="HTML (extra columns)">{`<table>
  <thead>
    <tr>
      <th>id</th>
      <th>name</th>
      <th>address.city</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Emily Clark</td>
      <td>London</td>
    </tr>
    <tr>
      <td>2</td>
      <td>James Smith</td>
      <td>Leeds</td>
    </tr>
  </tbody>
</table>`}</Code>

        <h2>Options</h2>
        <table>
          <thead>
            <tr><th>Option</th><th>What you get</th></tr>
          </thead>
          <tbody>
            <tr><td>Extra columns</td><td>Nested objects become columns named with dots, like <code>address.city</code>. Best for simple, flat tables and for copying into spreadsheets.</td></tr>
            <tr><td>Tables inside cells</td><td>Each nested object becomes a small key/value table inside its cell, arrays of objects become their own tables, and lists of values are joined with commas. Best for deeply nested data.</td></tr>
            <tr><td>Add CSS styles</td><td>Adds a short <code>&lt;style&gt;</code> block and <code>class=&quot;json-table&quot;</code> with borders, padding and a shaded header.</td></tr>
          </tbody>
        </table>
        <p>
          A single JSON object becomes a two-column table of keys and values. An array of plain values,
          like <code>[1, 2, 3]</code>, becomes a one-column table. Keys that appear only in some items still
          get a column, with empty cells where they are missing. <code>null</code> becomes an empty cell.
        </p>

        <h2>Safe to Paste</h2>
        <p>
          Every value is HTML-escaped: <code>&lt;</code>, <code>&gt;</code>, <code>&amp;</code> and quotes become
          entities such as <code>&amp;lt;</code>. A value like <code>&lt;b&gt;Clark&lt;/b&gt;</code> is shown as text
          in the table instead of turning into bold text or running as code, so JSON from users or
          APIs cannot inject HTML into your page.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Big tables:</strong> for thousands of rows, a spreadsheet is easier to read. Use <a href="/json-to-excel">JSON to Excel</a> or <a href="/json-to-csv">JSON to CSV</a>. For README files and GitHub, <a href="/json-to-markdown-table">JSON to Markdown Table</a> writes the same table in Markdown.</li>
          <li><strong>Find the list first:</strong> if your rows are inside an object, such as <code>{'{'} &quot;data&quot;: [ ... ] {'}'}</code>, paste only the array, or pick it out with the <a href="/json-path">JSONPath Tester</a> (<code>$.data</code>).</li>
          <li><strong>Broken JSON?</strong> Fix it first with <a href="/json-repair">JSON Repair</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-html-table']} />

        <RelatedTools
          links={[
            ['/json-to-csv', 'JSON to CSV'],
            ['/json-to-excel', 'JSON to Excel'],
            ['/json-viewer', 'JSON Viewer'],
            ['/json-to-xml', 'JSON to XML'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToHtmlTable
