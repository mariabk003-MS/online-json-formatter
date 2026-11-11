import { ArticlePage, Code } from './ArticlePage.jsx'

function GuidePrettyPrint() {
  return (
    <ArticlePage
      h1="How to Pretty Print JSON (Python, JavaScript, Command Line and VS Code)"
      intro="Turn one long line of JSON into clean, indented text that is easy to read. Copy-ready examples for every popular language and tool, plus the fastest way online."
      updated="November 11, 2026"
      faqKey="pretty-print-json"
      related={[
        ['/', 'JSON Formatter'],
        ['/json-minifier', 'JSON Minifier'],
        ['/json-sorter', 'JSON Sorter'],
        ['/json-viewer', 'JSON Viewer'],
      ]}
    >
      <h2>What Pretty Printing Does</h2>
      <p>
        APIs and files often store JSON on a single line to save space.
        Pretty printing adds line breaks and indentation, without changing the
        data.
      </p>
      <Code label="Before">{`{"name":"Emily Clark","city":"London","tags":["admin","editor"],"active":true}`}</Code>
      <Code label="After">{`{
  "name": "Emily Clark",
  "city": "London",
  "tags": ["admin", "editor"],
  "active": true
}`}</Code>

      <h2>The Fastest Way: Online</h2>
      <p>
        Paste your JSON into the <a href="/">JSON Formatter</a> and it is formatted
        instantly, with a choice of 2, 3 or 4 spaces or tabs. It also finds and
        fixes errors, and you can switch to a tree or graph view. Your data stays
        in your browser.
      </p>

      <h2>Python</h2>
      <Code label="Python">{`import json

data = {"name": "Emily Clark", "tags": ["admin", "editor"]}
print(json.dumps(data, indent=2))

# keep accents and non-English letters as they are
print(json.dumps(data, indent=2, ensure_ascii=False))

# write a formatted file
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)`}</Code>
      <p>
        Add <code>sort_keys=True</code> to sort keys from A to Z. More in our
        <a href="/json-in-python"> JSON in Python guide</a>.
      </p>

      <h2>JavaScript and Node.js</h2>
      <Code label="JavaScript">{`const data = { name: 'Emily Clark', tags: ['admin', 'editor'] }

console.log(JSON.stringify(data, null, 2))     // 2 spaces
console.log(JSON.stringify(data, null, '\\t'))  // tabs

// pretty print a JSON string
const text = '{"name":"Emily","age":30}'
console.log(JSON.stringify(JSON.parse(text), null, 2))`}</Code>

      <h2>Command Line</h2>
      <Code label="Terminal">{`# Python (installed on most systems)
python -m json.tool data.json

# jq (also adds colors)
jq . data.json

# Node.js
node -e "console.log(JSON.stringify(require('./data.json'), null, 2))"

# format the response of an API
curl -s https://api.example.com/users/1 | jq .`}</Code>

      <h2>VS Code</h2>
      <ol>
        <li>Open the <code>.json</code> file.</li>
        <li>Press <strong>Shift + Alt + F</strong> on Windows, <strong>Shift + Option + F</strong> on Mac, or <strong>Ctrl + Shift + I</strong> on Linux.</li>
        <li>Or right-click and choose <strong>Format Document</strong>.</li>
      </ol>
      <p>
        If the text is not in a .json file, first set the language to JSON in the
        bottom-right corner of the window.
      </p>

      <h2>Other Languages</h2>
      <Code label="PHP">{`echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);`}</Code>
      <Code label="Java (Jackson)">{`String pretty = new ObjectMapper()
    .writerWithDefaultPrettyPrinter()
    .writeValueAsString(data);`}</Code>
      <Code label="C# (System.Text.Json)">{`var pretty = JsonSerializer.Serialize(data,
    new JsonSerializerOptions { WriteIndented = true });`}</Code>
      <Code label="Go">{`pretty, _ := json.MarshalIndent(data, "", "  ")
fmt.Println(string(pretty))`}</Code>

      <h2>2 Spaces, 4 Spaces or Tabs?</h2>
      <p>
        All three are valid JSON. 2 spaces is the most common choice for web
        projects and keeps deep data narrow. 4 spaces is popular in Python and
        Java projects. Pick one and use it everywhere.
      </p>

      <h2>The Opposite: Minify</h2>
      <p>
        To send JSON over the network or save space, remove all extra spaces
        with the <a href="/json-minifier">JSON Minifier</a>, or use
        <code> JSON.stringify(data)</code> and <code>json.dumps(data, separators=(&quot;,&quot;, &quot;:&quot;))</code>.
      </p>
    </ArticlePage>
  )
}

export default GuidePrettyPrint
