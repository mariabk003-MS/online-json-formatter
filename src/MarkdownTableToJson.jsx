import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { markdownTablesToJson } from './markdownToJson.js'

const SAMPLE = `## Team

| Name         | Role   | Started    | Remote | Projects |
| ------------ | ------ | ---------- | :----: | -------: |
| Emily Clark  | Admin  | 2021-03-14 | true   | 12       |
| James Smith  | Editor | 2023-07-01 | false  | 5        |
| Olivia Brown | Viewer | 2024-01-22 | true   |          |`

function MarkdownTableToJson() {
  const [types, setTypes] = useState(true)
  const [empty, setEmpty] = useState('string')
  const [strip, setStrip] = useState(false)
  const [breaks, setBreaks] = useState(true)

  return (
    <ConverterPage
      h1="Markdown Table to JSON Converter"
      intro="Paste a Markdown table, or a whole README with tables in it, and get clean JSON: one object per row, with the header row as keys. Numbers and true / false are detected, and escaped pipes and <br> line breaks are handled. Runs in your browser, so your text is never uploaded."
      inputTitle="Markdown Input"
      outputTitle="JSON Result"
      inputIsJson={false}
      inputPlaceholder="Paste a Markdown table, for example from a README or a GitHub issue..."
      inputAccept=".md,.markdown,.txt,text/markdown,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'table.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Convert to JSON',
          run: (text) => {
            const { tables } = markdownTablesToJson(text, { types, empty, strip, breaks })
            const rows = tables.reduce((n, t) => n + t.length, 0)
            const one = tables.length === 1
            return {
              output: JSON.stringify(one ? tables[0] : tables, null, 2),
              message: one
                ? `Converted ${rows} row${rows === 1 ? '' : 's'} to JSON.`
                : `Found ${tables.length} tables (${rows} rows). Each table is one array in the result.`,
            }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            <input type="checkbox" checked={types} onChange={(event) => setTypes(event.target.checked)} />
            Convert numbers and true / false
          </label>
          <label className="option">
            Empty cells
            <select value={empty} onChange={(event) => setEmpty(event.target.value)}>
              <option value="string">Empty text &quot;&quot;</option>
              <option value="null">null</option>
              <option value="skip">Leave the key out</option>
            </select>
          </label>
          <label className="option">
            <input type="checkbox" checked={breaks} onChange={(event) => setBreaks(event.target.checked)} />
            &lt;br&gt; as line break
          </label>
          <label className="option">
            <input type="checkbox" checked={strip} onChange={(event) => setStrip(event.target.checked)} />
            Remove **bold**, links and `code`
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Does This Converter Do?</h2>
        <p>
          It reads tables written in GitHub Flavored Markdown (GFM), the format used in README files,
          GitHub issues, wikis, Obsidian notes and AI chat answers, and turns each row into a JSON object.
          The header row gives the keys. Paste just the table, or a whole document: the converter finds
          every table and ignores the text around it.
        </p>

        <h2>How to Convert a Markdown Table to JSON</h2>
        <ol>
          <li>Paste the Markdown, drop a .md file on the box, or load it from a link with URL.</li>
          <li>Choose how numbers and empty cells should be written.</li>
          <li>Click Convert to JSON, or press Ctrl + Enter.</li>
          <li>Copy or download the JSON, or send it to another tool with Open in.</li>
        </ol>

        <h2>Example</h2>
        <Code label="Markdown">{`| Name  | Age | City   |
| ----- | --: | ------ |
| Emily | 34  | London |
| James | 29  | Leeds  |`}</Code>
        <Code label="JSON">{`[
  {
    "Name": "Emily",
    "Age": 34,
    "City": "London"
  },
  {
    "Name": "James",
    "Age": 29,
    "City": "Leeds"
  }
]`}</Code>

        <h2>How the Table Is Read</h2>
        <table>
          <thead>
            <tr><th>In the Markdown</th><th>In the JSON</th></tr>
          </thead>
          <tbody>
            <tr><td>Header row</td><td>The keys. A repeated header becomes <code>Name_2</code>, an empty one <code>column3</code>.</td></tr>
            <tr><td><code>| --- | :---: |</code> line</td><td>Marks the table; the colons (alignment) are not needed in JSON.</td></tr>
            <tr><td><code>34</code>, <code>9.5</code>, <code>true</code>, <code>false</code>, <code>null</code></td><td>Numbers, booleans and null (turn this off to keep everything as text)</td></tr>
            <tr><td><code>007</code>, phone numbers, very long numbers</td><td>Stay text, so no digits change</td></tr>
            <tr><td><code>\|</code> inside a cell</td><td>A normal <code>|</code> character</td></tr>
            <tr><td><code>&lt;br&gt;</code></td><td>A line break (<code>\n</code>)</td></tr>
            <tr><td>A row with fewer cells</td><td>The missing cells count as empty</td></tr>
            <tr><td>Several tables in one text</td><td>An array with one array of rows per table</td></tr>
          </tbody>
        </table>
        <p>
          Rows without the outer pipes, like <code>Emily | 34 | London</code>, are read too, because GFM allows
          both styles. A table must have the <code>---</code> line under the header; without it, GitHub does not
          show a table either.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Tables from ChatGPT or Claude:</strong> copy the answer as Markdown (the copy button) rather than selecting the rendered table, so the pipes come along.</li>
          <li><strong>Need the other direction?</strong> <a href="/json-to-markdown-table">JSON to Markdown Table</a> turns JSON back into a table.</li>
          <li><strong>Spreadsheet data?</strong> For CSV use <a href="/csv-to-json">CSV to JSON</a>, and for .xlsx files <a href="/excel-to-json">Excel to JSON</a>.</li>
          <li><strong>Check the result</strong> as a tree in the <a href="/json-viewer">JSON Viewer</a>, or turn it into a schema with <a href="/json-to-zod">JSON to Zod</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['markdown-table-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-markdown-table', 'JSON to Markdown Table'],
            ['/csv-to-json', 'CSV to JSON'],
            ['/excel-to-json', 'Excel to JSON'],
            ['/json-viewer', 'JSON Viewer'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default MarkdownTableToJson
