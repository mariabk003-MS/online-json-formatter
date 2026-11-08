import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsParse() {
  return (
    <ArticlePage
      h1="JSON.parse() and JSON.stringify() in JavaScript"
      intro="Everything you need to read and write JSON in JavaScript: parsing safely, pretty printing, dates, revivers and the most common errors."
      updated="November 8, 2026"
      faqKey="javascript-json-parse"
      related={[
        ['/', 'JSON Formatter'],
        ['/json-validator', 'JSON Validator'],
        ['/common-json-errors', 'Common JSON Errors'],
        ['/json-to-typescript', 'JSON to TypeScript'],
      ]}
    >
      <h2>JSON.parse: Text to Object</h2>
      <Code label="JavaScript">{`const text = '{"name": "Emily", "age": 30, "tags": ["admin", "editor"]}'
const user = JSON.parse(text)

console.log(user.name)      // "Emily"
console.log(user.tags[1])   // "editor"`}</Code>

      <h2>JSON.stringify: Object to Text</h2>
      <Code label="JavaScript">{`const user = { name: 'Emily', city: 'London', active: true }

JSON.stringify(user)
// '{"name":"Emily","city":"London","active":true}'

JSON.stringify(user, null, 2)   // pretty printed with 2 spaces`}</Code>
      <p>
        <code>JSON.stringify</code> skips <code>undefined</code> values and
        functions inside objects, and turns <code>NaN</code> and
        <code> Infinity</code> into <code>null</code>.
      </p>

      <h2>Parse Safely with try...catch</h2>
      <p>
        <code>JSON.parse</code> throws a <code>SyntaxError</code> for invalid
        JSON, which can crash your app. Always wrap it when the text comes
        from a user, a file or an API.
      </p>
      <Code label="JavaScript">{`function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text)
  } catch (error) {
    console.warn('Invalid JSON:', error.message)
    return fallback
  }
}

safeParse('{"ok": true}')    // { ok: true }
safeParse("{'ok': true}")    // null  (single quotes are not valid JSON)`}</Code>

      <h2>Fetching JSON from an API</h2>
      <Code label="JavaScript">{`const response = await fetch('https://api.example.com/users/1024')
if (!response.ok) throw new Error('Request failed: ' + response.status)
const user = await response.json()   // parses the JSON for you`}</Code>

      <h2>Dates and the Reviver Function</h2>
      <p>
        JSON has no date type, so dates are sent as text like
        <code> &quot;2026-11-08T09:30:00.000Z&quot;</code>. A reviver lets you turn
        them back into <code>Date</code> objects while parsing.
      </p>
      <Code label="JavaScript">{`const text = '{"title": "Launch", "startsAt": "2026-11-08T09:30:00.000Z"}'

const event = JSON.parse(text, (key, value) =>
  key.endsWith('At') && typeof value === 'string' ? new Date(value) : value
)

event.startsAt.getFullYear()   // 2026`}</Code>

      <h2>Choosing What to Stringify</h2>
      <Code label="JavaScript">{`const user = { id: 1, name: 'Emily', password: 'secret' }

JSON.stringify(user, ['id', 'name'])                       // only these keys
JSON.stringify(user, (k, v) => (k === 'password' ? undefined : v))   // hide one key`}</Code>

      <h2>Common Errors</h2>
      <ul>
        <li><strong>Unexpected token &apos; in JSON</strong>: single quotes; JSON needs double quotes.</li>
        <li><strong>Unexpected end of JSON input</strong>: the text is empty or cut off.</li>
        <li><strong>Unexpected token &lt; in JSON</strong>: the server sent HTML (often an error page) instead of JSON.</li>
        <li><strong>Converting circular structure to JSON</strong>: an object refers to itself and cannot be stringified.</li>
      </ul>
      <p>
        Paste broken JSON into the <a href="/">JSON Formatter</a> to see the exact
        line of the error and fix common mistakes automatically.
      </p>
    </ArticlePage>
  )
}

export default GuideJsParse
