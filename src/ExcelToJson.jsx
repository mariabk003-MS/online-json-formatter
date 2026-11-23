import { useRef, useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { ToolPanel, Tool, EmptyBox, Messages, FaqSection, RelatedTools, OpenInMenu } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { formatSize, downloadText } from './toolUtils.js'
import { readXlsx, rowsToJson } from './xlsxRead.js'
import { makeXlsx } from './xlsx.js'

const SAMPLE_HEADERS = ['id', 'name', 'email', 'city', 'active', 'balance']
const SAMPLE_ROWS = [
  { id: 1, name: 'Emily Clark', email: 'emily@example.com', city: 'London', active: true, balance: 2500.75 },
  { id: 2, name: 'James Smith', email: 'james@example.com', city: 'Manchester', active: false, balance: 0 },
  { id: 3, name: 'Olivia Brown', email: 'olivia@example.com', city: 'Bristol', active: true, balance: 120.5 },
]

function ExcelToJson() {
  const [book, setBook] = useState(null) // { fileName, sheets }
  const [sheet, setSheet] = useState(0) // index, or -1 for all sheets
  const [header, setHeader] = useState(true)
  const [empty, setEmpty] = useState('skip')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  function convert(current = book, options = { sheet, header, empty }) {
    if (!current) {
      setError('Please choose an Excel file (.xlsx) first, or click Sample.')
      return
    }
    const pick = (s) => rowsToJson(s.rows, { header: options.header, empty: options.empty })
    let data
    let count
    if (options.sheet === -1) {
      data = Object.fromEntries(current.sheets.map((s) => [s.name, pick(s)]))
      count = Object.values(data).reduce((sum, rows) => sum + rows.length, 0)
    } else {
      data = pick(current.sheets[options.sheet] || current.sheets[0])
      count = data.length
    }
    setOutput(JSON.stringify(data, null, 2))
    setError('')
    setSuccess(`Converted ${count} row${count === 1 ? '' : 's'} to JSON.`)
  }

  async function load(buffer, fileName) {
    try {
      const { sheets } = await readXlsx(buffer)
      const next = { fileName, sheets }
      setBook(next)
      setSheet(0)
      convert(next, { sheet: 0, header, empty })
    } catch (err) {
      setBook(null)
      setOutput('')
      setSuccess('')
      setError(err.message || 'Could not read this file.')
    }
  }

  async function openFile(file) {
    if (!file) return
    if (/\.xls$/i.test(file.name)) {
      setError('This is an old .xls file. Open it in Excel and save it as .xlsx (Excel Workbook), then try again.')
      return
    }
    if (/\.csv$/i.test(file.name)) {
      setError('This is a CSV file. Use the CSV to JSON tool for CSV files.')
      return
    }
    await load(await file.arrayBuffer(), file.name)
  }

  async function loadSample() {
    const blob = makeXlsx(SAMPLE_HEADERS, SAMPLE_ROWS, 'Customers')
    await load(await blob.arrayBuffer(), 'sample.xlsx')
  }

  function change(next) {
    const options = { sheet, header, empty, ...next }
    if (next.sheet !== undefined) setSheet(next.sheet)
    if (next.header !== undefined) setHeader(next.header)
    if (next.empty !== undefined) setEmpty(next.empty)
    if (book) convert(book, options)
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(output)
      setSuccess('JSON copied!')
    } catch {
      setError('Could not copy. Please select the result and copy it manually.')
    }
  }

  const baseName = (book?.fileName || 'data.xlsx').replace(/\.[^.]+$/, '')
  const rowsInSheet = book && sheet >= 0 ? (book.sheets[sheet]?.rows.length ?? 0) : 0

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>Excel to JSON Converter</h1>
      <p>
        Convert an Excel spreadsheet (.xlsx) to JSON: one object per row, with the first row as keys, real numbers,
        true/false and dates. The file is read in your browser and never uploaded.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          openFile(file)
        }}
      />

      <div className="editor-layout">
        <ToolPanel
          title="Excel file"
          tools={
            <>
              <Tool onClick={loadSample}>Sample</Tool>
              <Tool onClick={() => fileInputRef.current?.click()}>Upload</Tool>
              <Tool
                onClick={() => {
                  setBook(null)
                  setOutput('')
                  setError('')
                  setSuccess('')
                }}
              >
                Clear
              </Tool>
            </>
          }
          statusLeft={book ? book.fileName : 'No file yet'}
          statusRight={book ? `${book.sheets.length} sheet${book.sheets.length === 1 ? '' : 's'}${sheet >= 0 ? ` · ${rowsInSheet} rows` : ''}` : ''}
          footer={
            <>
              <div className="action-bar">
                <button type="button" className="action-primary" onClick={() => convert()}>
                  Convert to JSON
                </button>
              </div>
              <div className="options-row">
                {book && book.sheets.length > 1 && (
                  <label className="option">
                    Sheet
                    <select value={sheet} onChange={(event) => change({ sheet: Number(event.target.value) })}>
                      {book.sheets.map((s, i) => (
                        <option key={s.name} value={i}>{s.name}</option>
                      ))}
                      <option value={-1}>All sheets</option>
                    </select>
                  </label>
                )}
                <label className="option">
                  <input type="checkbox" checked={header} onChange={(event) => change({ header: event.target.checked })} />
                  First row is the header
                </label>
                <label className="option">
                  Empty cells
                  <select value={empty} onChange={(event) => change({ empty: event.target.value })}>
                    <option value="skip">Leave out</option>
                    <option value="null">Write null</option>
                  </select>
                </label>
              </div>
            </>
          }
        >
          <div
            className={`result-empty excel-drop${dragging ? ' excel-drop-active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              openFile(event.dataTransfer.files?.[0])
            }}
          >
            {book ? (
              <span>
                <strong>{book.fileName}</strong>
                <br />
                {book.sheets.map((s) => s.name).join(', ')}
                <br />
                Drop another file to replace it.
              </span>
            ) : (
              <span>
                <strong>Drop an .xlsx file here</strong>
                <br />
                or click to choose one
              </span>
            )}
          </div>
        </ToolPanel>

        <ToolPanel
          title="JSON"
          tools={
            <>
              <Tool onClick={copyResult} disabled={!output}>Copy</Tool>
              <Tool
                onClick={() => {
                  downloadText(output, `${baseName}.json`, 'application/json')
                  setSuccess('JSON file downloaded!')
                }}
                disabled={!output}
              >
                Download
              </Tool>
              <OpenInMenu getText={() => output} disabled={!output} onError={setError} />
            </>
          }
          statusLeft={output ? `${output.split('\n').length} lines` : 'No result yet'}
          statusRight={output ? formatSize(output) : ''}
        >
          {output ? <JsonHighlight text={output} /> : <EmptyBox>Your JSON will appear here.</EmptyBox>}
        </ToolPanel>
      </div>

      <Messages error={error} success={success} />

      <section className="seo-content">
        <h2>How to Convert Excel to JSON</h2>
        <ol>
          <li>Drop your .xlsx file on the box, or click Upload.</li>
          <li>Pick the sheet if the workbook has more than one, or choose All sheets.</li>
          <li>Keep &quot;First row is the header&quot; on to get one object per row.</li>
          <li>Copy the JSON, or download it as a .json file.</li>
        </ol>

        <h2>Example</h2>
        <table>
          <thead>
            <tr><th>id</th><th>name</th><th>signup_date</th><th>active</th><th>balance</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Emily Clark</td><td>2026-01-15</td><td>TRUE</td><td>2500.75</td></tr>
            <tr><td>2</td><td>José García</td><td>2026-03-02</td><td>FALSE</td><td>0</td></tr>
          </tbody>
        </table>
        <Code label="JSON">{`[
  {
    "id": 1,
    "name": "Emily Clark",
    "signup_date": "2026-01-15",
    "active": true,
    "balance": 2500.75
  },
  {
    "id": 2,
    "name": "José García",
    "signup_date": "2026-03-02",
    "active": false,
    "balance": 0
  }
]`}</Code>
        <p>
          This is the output for a workbook saved by Microsoft Excel. Numbers stay numbers, TRUE and FALSE
          become <code>true</code> and <code>false</code>, and the date column, stored by Excel as a serial
          number, becomes a readable <code>YYYY-MM-DD</code> date.
        </p>

        <h2>How Cells Are Converted</h2>
        <table>
          <thead>
            <tr><th>Excel cell</th><th>JSON value</th></tr>
          </thead>
          <tbody>
            <tr><td>Text</td><td>A string. Text-formatted numbers such as <code>0042</code> keep their leading zeros.</td></tr>
            <tr><td>Number</td><td>A number, like <code>2500.75</code> or <code>-12.5</code></td></tr>
            <tr><td>TRUE / FALSE</td><td><code>true</code> / <code>false</code></td></tr>
            <tr><td>Date</td><td><code>&quot;2026-01-15&quot;</code></td></tr>
            <tr><td>Date and time</td><td><code>&quot;2026-11-21T18:00:00&quot;</code></td></tr>
            <tr><td>Time only</td><td><code>&quot;12:00:00&quot;</code></td></tr>
            <tr><td>Formula</td><td>The last calculated result, for example <code>2488.25</code> for <code>=SUM(F2:F4)</code></td></tr>
            <tr><td>Empty cell</td><td>Left out of the object, or <code>null</code> if you choose Write null</td></tr>
          </tbody>
        </table>
        <p>
          Missing or empty headers become <code>Column A</code>, <code>Column B</code> and so on, and repeated
          headers get a number (<code>name_2</code>), so no value is lost. Line breaks inside a cell are kept as
          <code> \n</code>.
        </p>

        <h2>Good to Know</h2>
        <ul>
          <li><strong>Private:</strong> the file is opened with JavaScript in your browser. Nothing is uploaded, so it is safe for customer lists and finance sheets.</li>
          <li><strong>.xlsx only:</strong> old .xls files use a different format. Open them in Excel and save as Excel Workbook (.xlsx). For .csv files, use <a href="/csv-to-json">CSV to JSON</a>.</li>
          <li><strong>Values, not formatting:</strong> colors, merged cells, comments and charts are not part of JSON. A merged cell&apos;s value appears in its first cell.</li>
          <li><strong>Need the other direction?</strong> <a href="/json-to-excel">JSON to Excel</a> turns JSON into a real .xlsx file.</li>
        </ul>

        <h2>Excel to JSON in Code</h2>
        <p>
          For repeated jobs, a script is easier. With Python, pandas reads Excel files (it needs the
          <code> openpyxl</code> package for .xlsx):
        </p>
        <Code label="Python">{`import pandas as pd

df = pd.read_excel("customers.xlsx", sheet_name="Customers")
df.to_json("customers.json", orient="records", indent=2, date_format="iso")`}</Code>
        <p>
          <code>orient=&quot;records&quot;</code> gives one object per row, the same shape this tool produces.
          Check the result in the <a href="/json-validator">JSON Validator</a> or explore it in the
          <a href="/json-viewer"> JSON Viewer</a>.
        </p>

        <FaqSection faqs={FAQS['excel-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-excel', 'JSON to Excel'],
            ['/csv-to-json', 'CSV to JSON'],
            ['/json-to-csv', 'JSON to CSV'],
            ['/json-viewer', 'JSON Viewer'],
          ]}
        />
      </section>

      <SiteFooter />
    </div>
  )
}

export default ExcelToJson
