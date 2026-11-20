import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideUnexpectedEnd() {
  return (
    <ArticlePage
      h1="SyntaxError: Unexpected End of JSON Input (How to Fix It)"
      intro="'Unexpected end of JSON input' means JavaScript reached the end of the text before the JSON was complete. Usually the text is empty: an API returned no body. Here are the causes, tested in Node.js 24 and Chrome's engine, and the fix for each."
      updated="November 20, 2026"
      faqKey="unexpected-end-of-json-input"
      related={[
        ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
        ['/json-validator', 'JSON Validator'],
        ['/javascript-json-parse', 'JSON.parse in JavaScript'],
        ['/json-repair', 'JSON Repair'],
      ]}
    >
      <h2>What the Error Means</h2>
      <p>
        <code>JSON.parse</code> and <code>response.json()</code> read the text from start to end. If the
        text stops while a value is still open, or there is no text at all, they throw:
      </p>
      <Code label="Chrome, Edge, Node.js">{`SyntaxError: Unexpected end of JSON input`}</Code>
      <p>
        Firefox says <code>JSON.parse: unexpected end of data at line 1 column 1 of the JSON data</code>,
        and Safari says <code>JSON Parse error: Unexpected EOF</code>. Same problem, different words.
      </p>

      <h2>Cause 1: The Response Body Is Empty</h2>
      <p>
        This is the cause most of the time. We made a test server and called <code>response.json()</code>
        on two empty responses. Both threw <code>Unexpected end of JSON input</code>:
      </p>
      <ul>
        <li><strong>204 No Content</strong>, the normal answer for many DELETE and PUT endpoints. A 204 never has a body.</li>
        <li><strong>200 with an empty body</strong>, for example an Express route that calls <code>res.end()</code> or <code>res.status(500).end()</code> without sending JSON.</li>
      </ul>
      <p>Read the body as text first, and only parse it when there is something to parse:</p>
      <Code label="JavaScript">{`const response = await fetch('/api/users/1', { method: 'DELETE' })

if (!response.ok) {
  throw new Error(\`HTTP \${response.status}\`)
}

const text = await response.text()
const data = text ? JSON.parse(text) : null   // null for 204 / empty bodies`}</Code>
      <p>
        On the server, send JSON every time the client expects it, even for errors:
        <code> res.status(500).json({'{'} error: &apos;Something went wrong&apos; {'}'})</code> instead of
        <code> res.status(500).end()</code>.
      </p>

      <h2>Cause 2: JSON.parse(&quot;&quot;) on an Empty String</h2>
      <p>
        Parsing an empty string, or a string with only spaces, gives the same error. It often comes
        from a value that was never filled in: an empty form field, an empty file, or a
        <code> localStorage</code> entry set to <code>&quot;&quot;</code>.
      </p>
      <Code label="JavaScript">{`JSON.parse('')      // SyntaxError: Unexpected end of JSON input
JSON.parse('   ')   // SyntaxError: Unexpected end of JSON input`}</Code>
      <p>
        Watch out for two look-alikes. <code>JSON.parse(null)</code> does <strong>not</strong> throw: it returns
        <code> null</code>, so a missing <code>localStorage</code> key slips through quietly and fails later.
        And <code>JSON.parse(undefined)</code> throws a different message,
        <code> &quot;undefined&quot; is not valid JSON</code>. See
        <a href="/unexpected-token-in-json"> Unexpected Token in JSON</a> for that one.
      </p>
      <Code label="Safe localStorage read">{`function readJson(key, fallback = null) {
  const text = localStorage.getItem(key)
  if (!text) return fallback
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}`}</Code>

      <h2>Cause 3: The JSON Was Cut Off</h2>
      <p>
        A response or file that stops halfway is also &quot;incomplete&quot;, but the message depends on
        where it stops. These are the errors Node.js 24 gave us:
      </p>
      <table>
        <thead>
          <tr><th>Cut-off text</th><th>Error</th></tr>
        </thead>
        <tbody>
          <tr><td><code>{'{'}&quot;name&quot;: &quot;Emily&quot;, &quot;age&quot;:</code></td><td><code>Unexpected end of JSON input</code></td></tr>
          <tr><td><code>[1, 2, 3</code></td><td><code>Expected &apos;,&apos; or &apos;]&apos; after array element in JSON at position 8</code></td></tr>
          <tr><td><code>{'{'}&quot;name&quot;: &quot;Emi</code></td><td><code>Unterminated string in JSON at position 13</code></td></tr>
        </tbody>
      </table>
      <p>
        So if the position in the error equals the length of the text, the JSON is truncated.
        Typical reasons: the server crashed or timed out while sending, a proxy or serverless function
        hit a size limit, a file is read while another process is still writing it, or a string was
        cut with <code>.slice()</code> or a database column that is too short.
      </p>
      <p>
        To check, compare the <code>Content-Length</code> header with what you received, look at the
        last characters of the text, or paste it into the <a href="/json-validator">JSON Validator</a> to
        see where it stops. If you only need to rescue the data,
        <a href="/json-repair"> JSON Repair</a> can close missing brackets for you.
      </p>

      <h2>Quick Checklist</h2>
      <ol>
        <li>Log <code>response.status</code>. Is it 204, or an error code?</li>
        <li>Log the raw text with <code>await response.text()</code> before parsing. Is it empty?</li>
        <li>Does the server send JSON on every path, including errors?</li>
        <li>If the text is not empty, does it end where it should, with <code>{'}'}</code> or <code>]</code>?</li>
        <li>Parsing <code>localStorage</code> or a file? Check for an empty value first.</li>
      </ol>
    </ArticlePage>
  )
}

export default GuideUnexpectedEnd
