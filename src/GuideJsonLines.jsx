import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonLines() {
  return (
    <ArticlePage
      h1="JSON Lines (JSONL) and NDJSON Explained"
      intro="What JSON Lines is, why it is used for logs and big data, and how to read and write .jsonl files in Python and JavaScript."
      updated="November 14, 2026"
      faqKey="json-lines"
      related={[
        ['/', 'JSON Formatter'],
        ['/json-validator', 'JSON Validator'],
        ['/json-to-csv', 'JSON to CSV'],
        ['/json-in-python', 'JSON in Python'],
      ]}
    >
      <h2>What Is JSON Lines?</h2>
      <p>
        JSON Lines is a text format where <strong>every line is one complete
        JSON value</strong>, usually an object. Lines are separated by a
        newline. The file extension is <code>.jsonl</code>. NDJSON
        (newline-delimited JSON, <code>.ndjson</code>) is practically the same
        format.
      </p>
      <Code label="users.jsonl">{`{"id": 1, "name": "Emily Clark", "city": "London"}
{"id": 2, "name": "James Smith", "city": "Manchester"}
{"id": 3, "name": "Olivia Brown", "city": "Bristol"}`}</Code>
      <p>The same data as a normal JSON array would look like this:</p>
      <Code label="users.json">{`[
  {"id": 1, "name": "Emily Clark", "city": "London"},
  {"id": 2, "name": "James Smith", "city": "Manchester"},
  {"id": 3, "name": "Olivia Brown", "city": "Bristol"}
]`}</Code>

      <h2>Why Use JSON Lines?</h2>
      <ul>
        <li><strong>Streaming:</strong> you can read and process one record at a time, without loading the whole file.</li>
        <li><strong>Appending:</strong> add new records by writing new lines; no need to rewrite brackets.</li>
        <li><strong>Robust:</strong> one broken line does not make the whole file unreadable.</li>
        <li><strong>Tools love it:</strong> logs, BigQuery, Elasticsearch bulk imports, data pipelines and AI training datasets often use JSONL.</li>
      </ul>

      <h2>Rules</h2>
      <ul>
        <li>Each line must be valid JSON on its own. No pretty printing across lines.</li>
        <li>Use UTF-8 and a newline (<code>\n</code>) between records.</li>
        <li>No commas between lines and no surrounding [ ].</li>
        <li>Empty lines are best avoided; many readers skip them.</li>
      </ul>

      <h2>Read and Write JSONL in Python</h2>
      <Code label="Python">{`import json

# Write
users = [{"id": 1, "name": "Emily"}, {"id": 2, "name": "James"}]
with open("users.jsonl", "w", encoding="utf-8") as f:
    for user in users:
        f.write(json.dumps(user, ensure_ascii=False) + "\\n")

# Read, one line at a time
with open("users.jsonl", encoding="utf-8") as f:
    for line in f:
        if line.strip():
            user = json.loads(line)
            print(user["name"])`}</Code>

      <h2>Find the Broken Line in a Big JSONL File</h2>
      <p>
        One bad line stops the whole loop with an error like
        <code> Expecting value: line 1 column 14</code>. Because every line is parsed
        on its own, &quot;line 1&quot; there means the first line of that record,
        not of the file. Count the lines yourself to find the real one, and keep
        going instead of crashing:
      </p>
      <Code label="Python">{`import json

with open("questions.jsonl", encoding="utf-8") as f:
    for number, line in enumerate(f, start=1):
        if not line.strip():
            continue                      # skip empty lines
        try:
            item = json.loads(line)
        except json.JSONDecodeError as error:
            print(f"Line {number} is not valid JSON: {error}")
            continue
        print(item["question"])`}</Code>
      <p>
        If the third line of the file is <code>{'{"question": broken}'}</code> (the
        text is missing its quotes), this prints the good records and
        <code> Line 3 is not valid JSON: Expecting value: line 1 column 14 (char 13)</code>.
        Paste the bad line into the <a href="/json-validator">JSON Validator</a> to see
        exactly what is wrong with it.
      </p>

      <h2>Read JSONL in JavaScript</h2>
      <Code label="JavaScript">{`const text = await (await fetch('/users.jsonl')).text()

const users = text
  .split('\\n')
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line))`}</Code>

      <h2>Convert JSONL to a JSON Array</h2>
      <p>
        Parse every line and collect the results in a list, as shown above, then
        save the list with <code>json.dump</code> or <code>JSON.stringify</code>.
        To check a single line, paste it into our <a href="/json-validator">JSON Validator</a>.
      </p>

      <h2>Convert JSON Lines to CSV</h2>
      <Code label="Python (pandas)">{`import pandas as pd

df = pd.read_json("events.jsonl", lines=True)
df.to_csv("events.csv", index=False)`}</Code>
      <p>
        <code>lines=True</code> tells pandas to read one JSON object per line.
        Without it, pandas reports &quot;Trailing data&quot;. More examples are in
        <a href="/json-to-csv-python"> How to Convert JSON to CSV in Python</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonLines
