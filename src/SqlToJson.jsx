import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'

const unquote = (name) => name.trim().replace(/^[`"[]|[`"\]]$/g, '')

// Reads one value starting at text[i]. Returns [value, nextIndex].
function readValue(text, i) {
  const ch = text[i]
  if (ch === "'" || ch === '"') {
    let out = ''
    i++
    while (i < text.length) {
      const c = text[i]
      if (c === '\\' && i + 1 < text.length) {
        const next = text[i + 1]
        out += next === 'n' ? '\n' : next === 't' ? '\t' : next
        i += 2
      } else if (c === ch && text[i + 1] === ch) {
        out += ch
        i += 2
      } else if (c === ch) {
        return [out, i + 1]
      } else {
        out += c
        i++
      }
    }
    throw new Error('A quoted text value is not closed. Check for a missing quote.')
  }
  // Anything else (number, NULL, TRUE, NOW(), ...) until the next , or ) at this level.
  let depth = 0
  let start = i
  while (i < text.length) {
    const c = text[i]
    if (c === '(') depth++
    else if (c === ')') {
      if (depth === 0) break
      depth--
    } else if (c === ',' && depth === 0) break
    i++
  }
  const raw = text.slice(start, i).trim()
  if (/^null$/i.test(raw)) return [null, i]
  if (/^true$/i.test(raw)) return [true, i]
  if (/^false$/i.test(raw)) return [false, i]
  if (/^-?\d+(\.\d+)?(e[+-]?\d+)?$/i.test(raw)) return [Number(raw), i]
  return [raw, i]
}

const skipSpace = (text, i) => {
  while (i < text.length && /\s/.test(text[i])) i++
  return i
}

// Finds every INSERT INTO ... VALUES (...), (...); and turns the rows into objects.
function sqlToJson(sql) {
  const header = /INSERT\s+(?:IGNORE\s+)?INTO\s+([`"[\]\w.]+)\s*(?:\(([^)]*)\))?\s*VALUES\s*/gi
  const tables = {}
  let match
  while ((match = header.exec(sql))) {
    const table = unquote(match[1].split('.').pop())
    const columns = match[2] ? match[2].split(',').map(unquote) : null
    let i = header.lastIndex
    const rows = (tables[table] = tables[table] || [])
    for (;;) {
      i = skipSpace(sql, i)
      if (sql[i] !== '(') break
      i++
      const values = []
      for (;;) {
        i = skipSpace(sql, i)
        const [value, next] = readValue(sql, i)
        values.push(value)
        i = skipSpace(sql, next)
        if (sql[i] === ',') {
          i++
          continue
        }
        if (sql[i] === ')') {
          i++
          break
        }
        throw new Error(`Could not read the values of table "${table}". Check the commas and brackets.`)
      }
      const row = {}
      values.forEach((value, index) => {
        row[columns?.[index] || `column${index + 1}`] = value
      })
      rows.push(row)
      i = skipSpace(sql, i)
      if (sql[i] === ',') i++
      else break
    }
    header.lastIndex = i
  }
  const names = Object.keys(tables)
  if (names.length === 0) {
    throw new Error('No INSERT INTO ... VALUES statements were found. Paste SQL INSERT statements to convert.')
  }
  return names.length === 1 ? { data: tables[names[0]], names } : { data: tables, names }
}

const SAMPLE = `-- Customers table export
INSERT INTO customers (id, name, email, balance, active) VALUES
  (1, 'Emily Clark', 'emily@example.com', 2500.75, TRUE),
  (2, 'James O''Neil', 'james@example.com', 120, FALSE),
  (3, 'Olivia Brown', NULL, 0, TRUE);`

function SqlToJson() {
  return (
    <ConverterPage
      h1="SQL to JSON Converter – INSERT Statements to JSON"
      intro="Paste SQL INSERT statements and get a clean JSON array, with numbers, NULL and true/false converted to real JSON values."
      inputTitle="SQL Input"
      outputTitle="JSON Result"
      inputIsJson={false}
      inputPlaceholder="Paste SQL INSERT INTO ... VALUES ... statements, or drop a .sql file..."
      inputAccept=".sql,.txt,application/sql,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'data.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Convert to JSON',
          run: (text) => {
            const { data, names } = sqlToJson(text)
            const count = Array.isArray(data) ? data.length : Object.values(data).reduce((sum, rows) => sum + rows.length, 0)
            return {
              output: JSON.stringify(data, null, 2),
              message: `Converted ${count} rows from ${names.length === 1 ? `table "${names[0]}"` : `${names.length} tables`}.`,
            }
          },
        },
      ]}
    >
      <section className="seo-content">
        <h2>What Is a SQL to JSON Converter?</h2>
        <p>
          A SQL to JSON converter reads INSERT statements, like the ones in a
          database dump, and turns every row into a JSON object. This is handy
          for moving data into an API, a NoSQL database, test fixtures or a
          JavaScript app.
        </p>

        <h2>How to Convert SQL to JSON</h2>
        <ol>
          <li>Paste your INSERT statements, or drop a .sql file on the box.</li>
          <li>Click Convert to JSON, or press Ctrl + Enter.</li>
          <li>Copy the JSON or download it as data.json.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Reads single-row and multi-row INSERT statements.</li>
          <li>Uses the column names from the INSERT, or column1, column2 … when there are none.</li>
          <li>Handles quotes like O&apos;&apos;Neil, NULL, TRUE/FALSE and numbers.</li>
          <li>Several tables in one file become one JSON object with a list per table.</li>
          <li>Runs in your browser. Your data is never uploaded.</li>
        </ul>

        <FaqSection faqs={FAQS['sql-to-json']} />

        <RelatedTools
          links={[
            ['/json-to-sql', 'JSON to SQL'],
            ['/csv-to-json', 'CSV to JSON'],
            ['/', 'JSON Formatter'],
            ['/json-viewer', 'JSON Viewer'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default SqlToJson
