import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { parseJsonLenient } from './toolUtils.js'
import { makeXlsx } from './xlsx.js'

// { user: { name: 'Emily' } } → { 'user.name': 'Emily' }; arrays stay as JSON text.
function flatten(object, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) flatten(value, name, out)
    else out[name] = Array.isArray(value) ? JSON.stringify(value) : value
  }
  return out
}

// Finds the list of rows: an array, or the first array inside an object.
function findRows(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const inner = Object.values(data).find((value) => Array.isArray(value) && value.length)
    return inner || [data]
  }
  throw new Error('Please enter a JSON array of objects, or an object.')
}

function toTable(data) {
  const rows = findRows(data).map((row) =>
    row !== null && typeof row === 'object' && !Array.isArray(row) ? flatten(row) : { value: row }
  )
  if (rows.length === 0) throw new Error('The JSON array is empty, so there is nothing to put in Excel.')
  const headers = []
  for (const row of rows) for (const key of Object.keys(row)) if (!headers.includes(key)) headers.push(key)
  return { headers, rows }
}

// A short text preview of the sheet for the result box.
function preview({ headers, rows }) {
  const lines = [headers.join('\t'), ...rows.slice(0, 50).map((row) => headers.map((h) => row[h] ?? '').join('\t'))]
  if (rows.length > 50) lines.push(`… and ${rows.length - 50} more rows (all of them are in the Excel file)`)
  return lines.join('\n')
}

const SAMPLE = JSON.stringify(
  [
    { id: 1, name: 'Emily Clark', city: 'London', orders: 12, total: 1499.5, active: true, contact: { email: 'emily@example.com' } },
    { id: 2, name: 'James Smith', city: 'Manchester', orders: 3, total: 249.99, active: false, contact: { email: 'james@example.com' } },
    { id: 3, name: 'Olivia Brown', city: 'Bristol', orders: 7, total: 820, active: true, contact: { email: 'olivia@example.com' } },
  ],
  null,
  2
)

function JsonToExcel() {
  const [fileName, setFileName] = useState('data')

  return (
    <ConverterPage
      h1="JSON to Excel Converter – Download .xlsx"
      intro="Turn JSON into a real Excel spreadsheet (.xlsx) with a bold header row, frozen headers and proper numbers. No upload, no sign-up."
      inputTitle="JSON Input"
      outputTitle="Sheet Preview"
      inputPlaceholder="Paste a JSON array of objects, or drop a .json file..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${fileName || 'data'}-preview.tsv`, mimeType: 'text/tab-separated-values' }}
      actions={[
        {
          label: 'Download Excel',
          run: (text) => {
            const { data, report } = parseJsonLenient(text, 'JSON')
            const table = toTable(data)
            const name = (fileName || 'data').replace(/[\\/:*?"<>|]+/g, '-')
            return {
              output: preview(table),
              download: { blob: makeXlsx(table.headers, table.rows, name), fileName: `${name}.xlsx` },
              message: `Excel file "${name}.xlsx" created with ${table.rows.length} rows and ${table.headers.length} columns.${report ? ' Small JSON mistakes were fixed first.' : ''}`,
            }
          },
        },
      ]}
      options={
        <label className="option">
          File name
          <input type="text" value={fileName} onChange={(event) => setFileName(event.target.value)} />
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to Excel Converter?</h2>
        <p>
          A JSON to Excel converter turns JSON data, like an API response or an
          export from an app, into a spreadsheet you can open in Microsoft
          Excel, Google Sheets, Numbers or LibreOffice. Every object becomes a
          row and every key becomes a column.
        </p>

        <h2>How to Convert JSON to Excel</h2>
        <ol>
          <li>Paste your JSON array, click Upload, or drop a .json file on the box.</li>
          <li>Type a file name if you want.</li>
          <li>Click Download Excel, or press Ctrl + Enter. The .xlsx file downloads straight away.</li>
          <li>Open it in Excel or upload it to Google Sheets.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Creates a real .xlsx file, not a CSV, with a bold and frozen header row.</li>
          <li>Numbers and true/false are stored as real values, so you can sum and filter them.</li>
          <li>Nested objects become columns like contact.email.</li>
          <li>Finds the list automatically, even if it is inside an object like {'{"users": [...]}'}.</li>
          <li>Runs in your browser. Your data is never uploaded.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-excel']} />

        <RelatedTools
          links={[
            ['/json-to-csv', 'JSON to CSV'],
            ['/csv-to-json', 'CSV to JSON'],
            ['/convert-json-to-excel', 'JSON to Excel guide'],
            ['/', 'JSON Formatter'],
            ['/json-to-csv-python', 'JSON to CSV in Python'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToExcel
