import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonVsYaml() {
  return (
    <ArticlePage
      h1="JSON vs YAML: Differences and When to Use Each"
      intro="JSON and YAML can hold the same data, but they look and behave differently. Here is a side-by-side comparison, the pitfalls of each, and a simple rule for choosing."
      updated="November 12, 2026"
      faqKey="json-vs-yaml"
      related={[
        ['/json-to-yaml', 'JSON to YAML'],
        ['/yaml-to-json', 'YAML to JSON'],
        ['/yaml-formatter', 'YAML Formatter'],
        ['/json-vs-xml', 'JSON vs XML'],
      ]}
    >
      <h2>The Same Data in Both Formats</h2>
      <Code label="JSON">{`{
  "name": "Emily Clark",
  "active": true,
  "roles": ["admin", "editor"],
  "address": {
    "city": "London",
    "country": "United Kingdom"
  }
}`}</Code>
      <Code label="YAML">{`name: Emily Clark
active: true
roles:
  - admin
  - editor
address:
  city: London
  country: United Kingdom`}</Code>
      <p>
        YAML uses indentation instead of braces and does not need quotes
        around most strings, so it is shorter and easier to read. JSON is
        stricter, which makes it easier for programs to read without mistakes.
      </p>

      <h2>Quick Comparison</h2>
      <table>
        <thead>
          <tr><th></th><th>JSON</th><th>YAML</th></tr>
        </thead>
        <tbody>
          <tr><td>Structure</td><td>Braces and brackets</td><td>Indentation</td></tr>
          <tr><td>Comments</td><td>Not allowed</td><td>Allowed with #</td></tr>
          <tr><td>Quotes</td><td>Required for keys and strings</td><td>Usually optional</td></tr>
          <tr><td>Multi-line text</td><td>Needs \n escapes</td><td>Built in with | and &gt;</td></tr>
          <tr><td>Parsing speed</td><td>Very fast, built into browsers</td><td>Slower, needs a library</td></tr>
          <tr><td>Typical use</td><td>APIs, data exchange, storage</td><td>Config files, CI pipelines, Kubernetes</td></tr>
        </tbody>
      </table>

      <h2>YAML Is a Superset of JSON</h2>
      <p>
        Almost every valid JSON file is also valid YAML (YAML 1.2). That
        means a YAML parser can read your JSON, but not the other way around.
      </p>

      <h2>Common YAML Pitfalls</h2>
      <ul>
        <li><strong>Tabs:</strong> YAML indentation must use spaces. A single tab breaks the file.</li>
        <li><strong>The Norway problem:</strong> in older YAML parsers, <code>NO</code>, <code>yes</code> and <code>on</code> turn into booleans, so the country code <code>NO</code> becomes <code>false</code>. Quote values like this.</li>
        <li><strong>Numbers that are not numbers:</strong> <code>version: 1.10</code> becomes the number 1.1, and a ZIP code like <code>01234</code> may lose its leading zero. Quote them.</li>
        <li><strong>Indentation mistakes:</strong> one extra space can silently move a key to a different parent.</li>
      </ul>

      <h2>Common JSON Pitfalls</h2>
      <ul>
        <li>No comments, so config files cannot explain themselves.</li>
        <li>A trailing comma or a single quote makes the whole file invalid.</li>
        <li>Long text needs <code>\n</code> escapes, which are hard to read.</li>
      </ul>
      <p>
        If your JSON is broken, the <a href="/json-repair">JSON Repair</a> tool fixes
        these mistakes automatically.
      </p>

      <h2>Which One Should You Use?</h2>
      <ul>
        <li><strong>Use JSON</strong> when programs talk to each other: APIs, web apps, databases, log files and anything sent over the network.</li>
        <li><strong>Use YAML</strong> when people edit the file by hand: Docker Compose, Kubernetes, GitHub Actions, and app settings where comments help.</li>
      </ul>

      <h2>Convert Between Them</h2>
      <p>
        Use <a href="/json-to-yaml">JSON to YAML</a> and <a href="/yaml-to-json">YAML to JSON</a> to
        convert instantly in your browser, or check a file with the
        <a href="/yaml-formatter"> YAML Formatter</a>. In code:
      </p>
      <Code label="Python">{`import json, yaml   # pip install pyyaml

data = yaml.safe_load(open("config.yaml"))     # YAML -> Python
print(json.dumps(data, indent=2))               # Python -> JSON
print(yaml.safe_dump(data, sort_keys=False))    # Python -> YAML`}</Code>
      <Code label="JavaScript">{`import yaml from 'js-yaml'   // npm install js-yaml

const data = yaml.load(text)        // YAML -> object
const json = JSON.stringify(data, null, 2)
const back = yaml.dump(data)        // object -> YAML`}</Code>
    </ArticlePage>
  )
}

export default GuideJsonVsYaml
