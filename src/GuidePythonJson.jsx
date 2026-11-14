import { ArticlePage, Code } from './ArticlePage.jsx'

function GuidePythonJson() {
  return (
    <ArticlePage
      h1="How to Use JSON in Python (json.loads, json.dumps)"
      intro="A practical guide to reading, writing and pretty printing JSON in Python with the built-in json module, with copy-ready examples."
      updated="November 14, 2026"
      faqKey="json-in-python"
      related={[
        ['/json-to-python', 'JSON to Python classes'],
        ['/', 'JSON Formatter'],
        ['/json-validator', 'JSON Validator'],
        ['/javascript-json-parse', 'JSON in JavaScript'],
      ]}
    >
      <h2>The json Module</h2>
      <p>
        Python comes with a <code>json</code> module, so you do not need to
        install anything. It has four main functions. The ones ending in
        <strong> s</strong> work with strings; the others work with files.
      </p>
      <table>
        <thead>
          <tr><th>Function</th><th>What it does</th></tr>
        </thead>
        <tbody>
          <tr><td><code>json.loads(text)</code></td><td>JSON string → Python object</td></tr>
          <tr><td><code>json.dumps(obj)</code></td><td>Python object → JSON string</td></tr>
          <tr><td><code>json.load(file)</code></td><td>Read JSON from a file</td></tr>
          <tr><td><code>json.dump(obj, file)</code></td><td>Write JSON to a file</td></tr>
        </tbody>
      </table>

      <h2>Parse a JSON String</h2>
      <Code label="Python">{`import json

text = '{"name": "Emily", "age": 30, "active": true, "tags": ["admin"]}'
data = json.loads(text)

print(data["name"])     # Emily
print(data["active"])   # True  (JSON true becomes Python True)
print(type(data))       # <class 'dict'>`}</Code>
      <p>JSON types become Python types like this:</p>
      <table>
        <thead>
          <tr><th>JSON</th><th>Python</th></tr>
        </thead>
        <tbody>
          <tr><td>object</td><td>dict</td></tr>
          <tr><td>array</td><td>list</td></tr>
          <tr><td>string</td><td>str</td></tr>
          <tr><td>number</td><td>int or float</td></tr>
          <tr><td>true / false</td><td>True / False</td></tr>
          <tr><td>null</td><td>None</td></tr>
        </tbody>
      </table>

      <h2>Convert Python to JSON</h2>
      <Code label="Python">{`import json

user = {"name": "Emily", "city": "London", "verified": True, "manager": None}

print(json.dumps(user))
# {"name": "Emily", "city": "London", "verified": true, "manager": null}

print(json.dumps(user, indent=2))   # pretty printed with 2 spaces`}</Code>

      <h2>Read and Write JSON Files</h2>
      <Code label="Python">{`import json

# Read
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)

# Change something
data["city"] = "Manchester"

# Write (pretty, and keep characters like é and 😊 as they are)
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)`}</Code>

      <h2>Loop Over the Items in a JSON File</h2>
      <p>
        Most JSON files hold a list of objects. After loading, it is a normal
        Python list of dictionaries:
      </p>
      <Code label="Python">{`import json

with open("groups.json", "r", encoding="utf-8") as f:
    groups = json.load(f)

for group in groups:
    print(group["name"], len(group.get("members", [])))`}</Code>
      <p>
        <code>group.get(&quot;members&quot;, [])</code> returns an empty list instead
        of crashing with a <code>KeyError</code> when a record has no
        <code> members</code> field.
      </p>

      <h2>Errors When Reading JSON Files</h2>
      <table>
        <thead>
          <tr><th>Error</th><th>Cause and fix</th></tr>
        </thead>
        <tbody>
          <tr><td><code>FileNotFoundError: [Errno 2] No such file or directory</code></td><td>The path is wrong, or the script runs from another folder. Use a full path, or build it with <code>pathlib.Path(__file__).parent / &quot;data.json&quot;</code>.</td></tr>
          <tr><td><code>UnicodeDecodeError: &apos;charmap&apos; codec can&apos;t decode byte 0x81...</code></td><td>On Windows, <code>open()</code> without an encoding uses an old code page. Always pass <code>encoding=&quot;utf-8&quot;</code>.</td></tr>
          <tr><td><code>JSONDecodeError: Unexpected UTF-8 BOM (decode using utf-8-sig)</code></td><td>The file was saved with a byte order mark, common from Excel and Notepad. Open it with <code>encoding=&quot;utf-8-sig&quot;</code>.</td></tr>
          <tr><td><code>JSONDecodeError: Expecting value: line 1 column 1 (char 0)</code></td><td>The file is empty, or it is not JSON at all (for example an HTML page you downloaded by mistake).</td></tr>
          <tr><td><code>JSONDecodeError: Extra data: line 2 column 1</code></td><td>The file has one JSON object per line. That is <a href="/json-lines">JSON Lines</a>: read it line by line with <code>json.loads</code>.</td></tr>
        </tbody>
      </table>
      <p>
        For other syntax errors, such as a missing comma or a trailing comma,
        see <a href="/common-json-errors">Common JSON Errors</a>, or fix the file
        automatically with <a href="/json-repair">JSON Repair</a>.
      </p>

      <h2>Handle Invalid JSON</h2>
      <p>
        If the text is not valid JSON, <code>json.loads</code> raises a
        <code> json.JSONDecodeError</code> that tells you the line and column.
      </p>
      <Code label="Python">{`import json

try:
    data = json.loads('{"name": "Emily",}')   # trailing comma
except json.JSONDecodeError as error:
    print(f"Invalid JSON at line {error.lineno}, column {error.colno}: {error.msg}")`}</Code>
      <p>
        Tip: paste broken JSON into our <a href="/json-repair">JSON Repair</a> tool
        to fix trailing commas, single quotes and Python values like True and None automatically.
      </p>

      <h2>Dates and Other Types</h2>
      <p>
        JSON only knows strings, numbers, booleans, null, lists and objects. Values
        like <code>datetime</code>, <code>Decimal</code> or sets raise
        <code> TypeError: Object of type ... is not JSON serializable</code>.
        The quick fix is <code>default=str</code>:
      </p>
      <Code label="Python">{`import json
from datetime import datetime

event = {"title": "Launch", "starts": datetime(2026, 11, 8, 9, 30)}
print(json.dumps(event, default=str))
# {"title": "Launch", "starts": "2026-11-08 09:30:00"}`}</Code>

      <h2>Useful Options</h2>
      <ul>
        <li><code>indent=2</code>: pretty print with 2 spaces.</li>
        <li><code>sort_keys=True</code>: sort keys alphabetically.</li>
        <li><code>ensure_ascii=False</code>: keep non-English characters readable.</li>
        <li><code>separators=(",", ":")</code>: the smallest possible output (minified).</li>
      </ul>
      <p>
        Want typed classes instead of dictionaries? Generate dataclasses or
        Pydantic models with our <a href="/json-to-python">JSON to Python</a> tool.
      </p>

      <h2>Save JSON as CSV</h2>
      <p>
        A list of dictionaries can be written to a CSV file with the built-in
        <code> csv</code> module, no extra packages needed:
      </p>
      <Code label="Python">{`import csv, json

with open("users.json", encoding="utf-8") as f:
    rows = json.load(f)

with open("users.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)`}</Code>
      <p>
        For nested JSON and pandas, see
        <a href="/json-to-csv-python"> How to Convert JSON to CSV in Python</a>.
      </p>
    </ArticlePage>
  )
}

export default GuidePythonJson
