import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonToCsvPython() {
  return (
    <ArticlePage
      h1="How to Convert JSON to CSV in Python (pandas and csv module)"
      intro="Three ways to turn JSON into a CSV file in Python: with pandas, with the built-in csv module, and for nested JSON. Copy-ready code for each."
      updated="November 12, 2026"
      faqKey="json-to-csv-python"
      related={[
        ['/json-to-csv', 'JSON to CSV (online)'],
        ['/json-to-excel', 'JSON to Excel'],
        ['/json-in-python', 'JSON in Python'],
        ['/csv-to-json', 'CSV to JSON'],
      ]}
    >
      <h2>The Example Data</h2>
      <p>All examples use this file, <code>users.json</code>: a list of objects.</p>
      <Code label="users.json">{`[
  { "id": 1, "name": "Emily Clark", "city": "London", "orders": 12 },
  { "id": 2, "name": "James Smith", "city": "Manchester", "orders": 3 },
  { "id": 3, "name": "Sara Ahmed", "city": "Leeds", "orders": 7 }
]`}</Code>

      <h2>No Code? Convert Online</h2>
      <p>
        For a one-off file, paste it into the <a href="/json-to-csv">JSON to CSV</a> converter,
        or download a real spreadsheet with <a href="/json-to-excel">JSON to Excel</a>.
        Both run in your browser, so the data is never uploaded.
      </p>

      <h2>Method 1: pandas (Easiest)</h2>
      <Code label="Python">{`import pandas as pd   # pip install pandas

df = pd.read_json("users.json")
df.to_csv("users.csv", index=False)`}</Code>
      <p>
        <code>index=False</code> stops pandas from adding an extra column of row
        numbers.
      </p>

      <h2>Method 2: The Built-in csv Module (No Install)</h2>
      <Code label="Python">{`import csv, json

with open("users.json", encoding="utf-8") as f:
    rows = json.load(f)

with open("users.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)`}</Code>
      <p>
        Always open the CSV file with <code>newline=&quot;&quot;</code>, otherwise
        Windows adds an empty line between rows.
      </p>

      <h2>When Objects Have Different Keys</h2>
      <p>
        If some objects have extra fields, collect every key first, or
        <code> DictWriter</code> raises a <code>ValueError</code>.
      </p>
      <Code label="Python">{`fieldnames = []
for row in rows:
    for key in row:
        if key not in fieldnames:
            fieldnames.append(key)

writer = csv.DictWriter(f, fieldnames=fieldnames, restval="")`}</Code>

      <h2>Method 3: Nested JSON</h2>
      <p>
        CSV is flat, so nested objects must be flattened into columns like
        <code> address.city</code>. pandas does this with <code>json_normalize</code>.
      </p>
      <Code label="Python">{`import json
import pandas as pd

data = [
    {"id": 1, "name": "Emily", "address": {"city": "London", "zip": "SW1A"}},
    {"id": 2, "name": "James", "address": {"city": "Leeds", "zip": "LS1"}},
]

df = pd.json_normalize(data)          # columns: id, name, address.city, address.zip
df.to_csv("users.csv", index=False)`}</Code>
      <p>
        If the list you want is inside a bigger object, point to it with
        <code> record_path</code>, for example
        <code> pd.json_normalize(data, record_path=&quot;users&quot;)</code>.
      </p>

      <h2>Opening the CSV in Excel</h2>
      <p>
        Excel sometimes shows accented letters wrongly in a UTF-8 CSV. Save
        with <code>encoding=&quot;utf-8-sig&quot;</code> to fix it:
      </p>
      <Code label="Python">{`df.to_csv("users.csv", index=False, encoding="utf-8-sig")`}</Code>

      <h2>Common Errors</h2>
      <ul>
        <li><strong>ValueError: Trailing data</strong> (pandas): the file is JSON Lines, one object per line. Use <code>pd.read_json(&quot;file.json&quot;, lines=True)</code>.</li>
        <li><strong>json.decoder.JSONDecodeError</strong>: the JSON itself is invalid. Check it with the <a href="/json-validator">JSON Validator</a>.</li>
        <li><strong>dict contains fields not in fieldnames</strong>: some rows have extra keys. Collect all keys first, as shown above.</li>
      </ul>
    </ArticlePage>
  )
}

export default GuideJsonToCsvPython
