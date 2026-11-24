import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToMarkdownTable, markdownTableToHtml } from './markdownTable.js'

const SAMPLE = JSON.stringify(
  [
    { id: 1, name: 'Emily Clark', role: 'Admin', address: { city: 'London' }, tags: ['api', 'docs'], score: 98.5 },
    { id: 2, name: 'James Smith', role: 'Editor', address: { city: 'Leeds' }, tags: ['web'], score: 87 },
    { id: 3, name: 'Olivia Brown', role: 'Viewer', address: { city: 'Bristol' }, tags: [], score: 91.25 },
  ],
  null,
  2
)

function JsonToMarkdownTable() {
  const [align, setAlign] = useState('none')
  const [pad, setPad] = useState(true)
  const [flat, setFlat] = useState(true)

  return (
    <ConverterPage
      h1="JSON to Markdown Table Converter"
      intro="Turn a JSON array or object into a GitHub Flavored Markdown table for README files, issues, docs and AI prompts. Columns line up, pipes and line breaks are escaped, and a live preview shows the result. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="Markdown"
      inputPlaceholder="Paste a JSON array of objects, or an object..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'table.md', mimeType: 'text/markdown' }}
      preview={markdownTableToHtml}
      actions={[
        {
          label: 'Convert to Markdown',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const { markdown, rowCount, columnCount } = jsonToMarkdownTable(data, { align, pad, flat })
            return {
              output: markdown,
              message: `Created a Markdown table with ${rowCount} row${rowCount === 1 ? '' : 's'} and ${columnCount} column${columnCount === 1 ? '' : 's'}.`,
            }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Alignment
            <select value={align} onChange={(event) => setAlign(event.target.value)}>
              <option value="none">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="numbers">Numbers right, text left</option>
            </select>
          </label>
          <label className="option">
            <input type="checkbox" checked={pad} onChange={(event) => setPad(event.target.checked)} />
            Line up columns
          </label>
          <label className="option">
            <input type="checkbox" checked={flat} onChange={(event) => setFlat(event.target.checked)} />
            Nested keys as columns
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Does This Converter Do?</h2>
        <p>
          It writes a Markdown table from JSON: a header row from the keys, the delimiter row
          (<code>| --- |</code>) and one row per item. The result follows GitHub Flavored Markdown (GFM),
          the table syntax used by GitHub, GitLab, Obsidian, many static site generators and
          most Markdown editors. Paste it into a README, a pull request, a wiki page or a prompt for
          an AI assistant.
        </p>

        <h2>How to Convert JSON to a Markdown Table</h2>
        <ol>
          <li>Paste your JSON, drop a .json file on the box, or load it from a link with URL.</li>
          <li>Choose the alignment and whether the columns should line up.</li>
          <li>Click Convert to Markdown, or press Ctrl + Enter.</li>
          <li>Check the preview, then copy the table or download it as a .md file.</li>
        </ol>

        <h2>Example</h2>
        <Code label="JSON">{`[
  { "id": 1, "name": "Emily Clark", "address": { "city": "London" }, "tags": ["api", "docs"] },
  { "id": 2, "name": "James Smith", "address": { "city": "Leeds" }, "tags": ["web"] }
]`}</Code>
        <Code label="Markdown">{`| id  | name        | address.city | tags      |
| --- | ----------- | ------------ | --------- |
| 1   | Emily Clark | London       | api, docs |
| 2   | James Smith | Leeds        | web       |`}</Code>

        <h2>Options</h2>
        <table>
          <thead>
            <tr><th>Option</th><th>What you get</th></tr>
          </thead>
          <tbody>
            <tr><td>Alignment</td><td>Adds colons to the delimiter row: <code>:---</code> left, <code>:---:</code> center, <code>---:</code> right. &quot;Numbers right, text left&quot; right-aligns only columns that contain nothing but numbers, like a spreadsheet.</td></tr>
            <tr><td>Line up columns</td><td>Pads every cell with spaces so the raw Markdown reads like a grid. Turn it off for the shortest text; the rendered table looks the same either way.</td></tr>
            <tr><td>Nested keys as columns</td><td>On: <code>{'{'} &quot;address&quot;: {'{'} &quot;city&quot;: &quot;London&quot; {'}'} {'}'}</code> becomes an <code>address.city</code> column. Off: the whole object is written as compact JSON in one cell.</td></tr>
          </tbody>
        </table>
        <p>
          A single JSON object becomes a two-column <strong>Key | Value</strong> table. An array of plain values,
          like <code>[1, 2, 3]</code>, becomes one <code>value</code> column. Lists of plain values are joined with
          commas, keys that appear only in some items still get a column, and <code>null</code> becomes an empty cell.
        </p>

        <h2>Special Characters Are Escaped</h2>
        <p>
          In a Markdown table a <code>|</code> ends the cell and a line break ends the row, so either one inside a
          value would break the table. The converter writes <code>|</code> as <code>\|</code>, a backslash as
          <code> \\</code>, and line breaks as <code>&lt;br&gt;</code>, which GitHub shows as a new line inside the cell.
        </p>
        <Code label="A value with a pipe, a backslash and a line break">{`| note                |
| ------------------- |
| a \\| b<br>C:\\\\Users |`}</Code>

        <h2>Tips</h2>
        <ul>
          <li><strong>Wide tables:</strong> Markdown has no column widths. If a table has many columns, consider fewer keys, or use <a href="/json-to-html-table">JSON to HTML Table</a> or <a href="/json-to-excel">JSON to Excel</a>.</li>
          <li><strong>Find the list first:</strong> if your rows sit inside an object such as <code>{'{'} &quot;data&quot;: [ ... ] {'}'}</code>, paste only the array, or pick it out with the <a href="/json-path">JSONPath Tester</a> (<code>$.data</code>).</li>
          <li><strong>AI prompts:</strong> a Markdown table is shorter than the same data as pretty JSON and is easy for both people and AI assistants to read, which makes it handy for sharing tabular examples in a prompt.</li>
          <li><strong>Broken JSON?</strong> The converter repairs common mistakes like trailing commas and single quotes. For anything else, use <a href="/json-repair">JSON Repair</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-markdown-table']} />

        <RelatedTools
          links={[
            ['/json-to-html-table', 'JSON to HTML Table'],
            ['/json-to-csv', 'JSON to CSV'],
            ['/json-to-yaml', 'JSON to YAML'],
            ['/json-viewer', 'JSON Viewer'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToMarkdownTable
