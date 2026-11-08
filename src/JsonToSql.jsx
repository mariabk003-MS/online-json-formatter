import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { parseJsonLenient } from './toolUtils.js'

const DIALECTS = {
  mysql: { name: 'MySQL', quote: (n) => `\`${n.replace(/`/g, '``')}\``, int: 'BIGINT', float: 'DOUBLE', bool: 'BOOLEAN', text: 'TEXT', varchar: (n) => `VARCHAR(${n})`, true: 'TRUE', false: 'FALSE' },
  postgresql: { name: 'PostgreSQL', quote: (n) => `"${n.replace(/"/g, '""')}"`, int: 'BIGINT', float: 'DOUBLE PRECISION', bool: 'BOOLEAN', text: 'TEXT', varchar: (n) => `VARCHAR(${n})`, true: 'TRUE', false: 'FALSE' },
  sqlite: { name: 'SQLite', quote: (n) => `"${n.replace(/"/g, '""')}"`, int: 'INTEGER', float: 'REAL', bool: 'INTEGER', text: 'TEXT', varchar: () => 'TEXT', true: '1', false: '0' },
  sqlserver: { name: 'SQL Server', quote: (n) => `[${n.replace(/]/g, ']]')}]`, int: 'BIGINT', float: 'FLOAT', bool: 'BIT', text: 'NVARCHAR(MAX)', varchar: (n) => `NVARCHAR(${n})`, true: '1', false: '0' },
}

function rowsFrom(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const inner = Object.values(data).find((value) => Array.isArray(value) && value.length)
    return inner || [data]
  }
  throw new Error('Please enter a JSON array of objects, or an object.')
}

// Picks a column type from all the values in that column.
function columnType(values, d) {
  const present = values.filter((v) => v !== null && v !== undefined)
  if (present.length === 0) return d.text
  if (present.every((v) => typeof v === 'boolean')) return d.bool
  if (present.every((v) => typeof v === 'number')) return present.every(Number.isInteger) ? d.int : d.float
  const longest = Math.max(...present.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v)).length))
  return longest <= 255 ? d.varchar(longest <= 50 ? 100 : 255) : d.text
}

function sqlValue(value, d) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? d.true : d.false
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return `'${text.replace(/'/g, "''")}'`
}

function jsonToSql(data, { dialect, table, createTable, multiRow }) {
  const d = DIALECTS[dialect]
  const rows = rowsFrom(data).map((row) => (row && typeof row === 'object' && !Array.isArray(row) ? row : { value: row }))
  if (rows.length === 0) throw new Error('The JSON array is empty.')
  const columns = []
  for (const row of rows) for (const key of Object.keys(row)) if (!columns.includes(key)) columns.push(key)
  const t = d.quote(table || 'my_table')
  const cols = columns.map(d.quote).join(', ')
  const lines = []
  if (createTable) {
    const defs = columns.map((c) => `  ${d.quote(c)} ${columnType(rows.map((r) => r[c]), d)}`)
    lines.push(`CREATE TABLE ${t} (\n${defs.join(',\n')}\n);`, '')
  }
  const tuples = rows.map((row) => `(${columns.map((c) => sqlValue(row[c], d)).join(', ')})`)
  if (multiRow) {
    lines.push(`INSERT INTO ${t} (${cols}) VALUES\n${tuples.map((tuple) => `  ${tuple}`).join(',\n')};`)
  } else {
    for (const tuple of tuples) lines.push(`INSERT INTO ${t} (${cols}) VALUES ${tuple};`)
  }
  return { sql: lines.join('\n'), rows: rows.length, columns: columns.length }
}

const SAMPLE = JSON.stringify(
  [
    { id: 1, name: 'Emily Clark', email: 'emily@example.com', balance: 2500.75, active: true, joined: '2024-03-15' },
    { id: 2, name: "James O'Neil", email: 'james@example.com', balance: 120, active: false, joined: '2025-01-02' },
    { id: 3, name: 'Olivia Brown', email: null, balance: 0, active: true, joined: '2025-07-21' },
  ],
  null,
  2
)

function JsonToSql() {
  const [dialect, setDialect] = useState('mysql')
  const [table, setTable] = useState('customers')
  const [createTable, setCreateTable] = useState(true)
  const [multiRow, setMultiRow] = useState(true)

  return (
    <ConverterPage
      h1="JSON to SQL Converter – CREATE TABLE & INSERT"
      intro="Turn a JSON array into SQL INSERT statements and a CREATE TABLE command for MySQL, PostgreSQL, SQLite or SQL Server."
      inputTitle="JSON Input"
      outputTitle="SQL"
      inputPlaceholder="Paste a JSON array of objects, or drop a .json file..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: `${table || 'data'}.sql`, mimeType: 'application/sql' }}
      actions={[
        {
          label: 'Convert to SQL',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const result = jsonToSql(data, { dialect, table, createTable, multiRow })
            return {
              output: result.sql,
              message: `${DIALECTS[dialect].name} SQL created for ${result.rows} rows and ${result.columns} columns.`,
            }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Database
            <select value={dialect} onChange={(event) => setDialect(event.target.value)}>
              {Object.entries(DIALECTS).map(([key, d]) => (
                <option key={key} value={key}>{d.name}</option>
              ))}
            </select>
          </label>
          <label className="option">
            Table
            <input type="text" value={table} onChange={(event) => setTable(event.target.value)} />
          </label>
          <label className="option">
            <input type="checkbox" checked={createTable} onChange={(event) => setCreateTable(event.target.checked)} />
            CREATE TABLE
          </label>
          <label className="option">
            <input type="checkbox" checked={multiRow} onChange={(event) => setMultiRow(event.target.checked)} />
            One INSERT for all rows
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON to SQL Converter?</h2>
        <p>
          A JSON to SQL converter turns JSON records into SQL statements you can
          run in a database. It writes a CREATE TABLE command with a column for
          every key and INSERT statements for every object, with text safely
          quoted so names like O&apos;Neil do not break your query.
        </p>

        <h2>How to Convert JSON to SQL</h2>
        <ol>
          <li>Paste your JSON array, or drop a .json file on the box.</li>
          <li>Choose your database and type a table name.</li>
          <li>Click Convert to SQL, or press Ctrl + Enter.</li>
          <li>Copy the SQL or download it as a .sql file and run it in your database.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>MySQL, PostgreSQL, SQLite and SQL Server syntax and column types.</li>
          <li>Column types are picked from your data: whole numbers, decimals, booleans or text.</li>
          <li>Quotes are escaped and missing values become NULL.</li>
          <li>One multi-row INSERT, or one INSERT per row.</li>
          <li>Runs in your browser. Your data is never uploaded.</li>
        </ul>

        <FaqSection faqs={FAQS['json-to-sql']} />

        <RelatedTools
          links={[
            ['/sql-to-json', 'SQL to JSON'],
            ['/json-to-csv', 'JSON to CSV'],
            ['/json-to-excel', 'JSON to Excel'],
            ['/', 'JSON Formatter'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToSql
