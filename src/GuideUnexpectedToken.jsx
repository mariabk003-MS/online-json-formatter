import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideUnexpectedToken() {
  return (
    <ArticlePage
      h1="Unexpected Token in JSON: What It Means and How to Fix It"
      intro="&quot;SyntaxError: Unexpected token&quot; is the most common JSON error. Here is what each version of the message means, how to find the exact cause, and how to fix it in seconds."
      updated="November 14, 2026"
      faqKey="unexpected-token-in-json"
      related={[
        ['/json-repair', 'JSON Repair'],
        ['/', 'JSON Formatter'],
        ['/json-validator', 'JSON Validator'],
        ['/common-json-errors', 'Common JSON Errors'],
      ]}
    >
      <h2>What the Error Means</h2>
      <p>
        A JSON parser reads your text one character at a time. When it finds
        a character that is not allowed at that spot, it stops and reports an
        <strong> unexpected token</strong>. The character in the message is the
        clue: it tells you what the parser found instead of what it expected.
      </p>
      <Code label="Error examples">{`SyntaxError: Unexpected token ' in JSON at position 1
SyntaxError: Unexpected token < in JSON at position 0
SyntaxError: Unexpected token } in JSON at position 42
SyntaxError: Unexpected token u in JSON at position 0
SyntaxError: Unexpected end of JSON input`}</Code>
      <p>
        Newer browsers word it a little differently, for example
        <code> Unexpected token &apos;&lt;&apos;, &quot;&lt;!DOCTYPE &quot;... is not valid JSON</code>,
        but the meaning is the same.
      </p>

      <h2>Fix It Fast</h2>
      <p>
        Paste your JSON into the <a href="/">JSON Formatter</a>. It shows the exact
        line and column of the problem and can repair quotes, commas, comments
        and Python values automatically. For badly broken files, use
        <a href="/json-repair"> JSON Repair</a>. Everything runs in your browser,
        so your data is never uploaded.
      </p>

      <h2>Unexpected token &apos; (single quote)</h2>
      <p>JSON only allows double quotes around keys and strings.</p>
      <Code label="Wrong">{`{'name': 'Emily'}`}</Code>
      <Code label="Right">{`{"name": "Emily"}`}</Code>

      <h2>Unexpected token &lt; (HTML instead of JSON)</h2>
      <p>
        The text starts with <code>&lt;</code>, so it is HTML, not JSON. This
        almost always comes from <code>fetch</code> or an API call: the server
        returned an error page, a login page or a 404 page.
      </p>
      <Code label="JavaScript">{`const response = await fetch('/api/users')
console.log(response.status)          // 404? 500? 401?
const text = await response.text()
console.log(text.slice(0, 200))       // see what really came back`}</Code>
      <p>
        Check the URL, the status code and that the server sends
        <code> Content-Type: application/json</code>.
      </p>

      <h2>Unexpected token Followed by a Word: the Server Sent a Text Error</h2>
      <p>
        Newer browsers show the first characters of what they received, like
        <code> Unexpected token &apos;u&apos;, &quot;upstream c&quot;... is not valid JSON</code>.
        When those characters are a normal English word, the server did not send
        JSON at all: it sent a plain-text error message, and your code tried to
        parse it. The first letter of the message becomes the &quot;unexpected
        token&quot;:
      </p>
      <table>
        <thead>
          <tr><th>Error you see</th><th>What the server actually sent</th></tr>
        </thead>
        <tbody>
          <tr><td><code>&apos;u&apos;, &quot;upstream c&quot;...</code></td><td>&quot;upstream connect error or disconnect/reset before headers&quot;, from a proxy or load balancer (often Envoy, for example in Kubernetes or a service mesh) that could not reach your backend</td></tr>
          <tr><td><code>&apos;I&apos;, &quot;Internal S&quot;...</code></td><td>&quot;Internal Server Error&quot; (HTTP 500): the backend crashed</td></tr>
          <tr><td><code>&apos;B&apos;, &quot;Bad Gateway&quot;</code></td><td>HTTP 502: a proxy got no valid answer from the server behind it</td></tr>
          <tr><td><code>&apos;S&apos;, &quot;Service Unavailable&quot;</code></td><td>HTTP 503: the service is down or overloaded</td></tr>
          <tr><td><code>&apos;N&apos;, &quot;Not Found&quot;</code></td><td>HTTP 404: wrong URL or route</td></tr>
          <tr><td><code>&apos;F&apos;, &quot;Forbidden&quot;</code></td><td>HTTP 403: missing permission, API key or login</td></tr>
          <tr><td><code>&apos;T&apos;, &quot;Too Many Requests&quot;</code></td><td>HTTP 429: you hit a rate limit</td></tr>
          <tr><td><code>&apos;R&apos;, &quot;Request En&quot;...</code></td><td>&quot;Request Entity Too Large&quot; (HTTP 413): the request body is over the server&apos;s size limit</td></tr>
          <tr><td><code>&apos;&lt;&apos;, &quot;&lt;html&gt; &lt;he&quot;...</code></td><td>An HTML error page, often a 502 or 504 page from nginx or a CDN</td></tr>
        </tbody>
      </table>
      <p>
        The fix is never in the JSON parsing. Check <code>response.ok</code> and the
        status code before parsing, and log the text so you can see the real
        error:
      </p>
      <Code label="JavaScript">{`const response = await fetch(url)
const text = await response.text()

if (!response.ok) {
  throw new Error(\`HTTP \${response.status}: \${text.slice(0, 200)}\`)
}
const data = JSON.parse(text)`}</Code>
      <p>
        Then fix the real cause: a backend that is down, a wrong URL, a missing
        API key, a rate limit, or a payload that is too big.
      </p>

      <h2>Unexpected token {'}'} or ] (trailing comma)</h2>
      <p>A comma after the last item is not allowed in JSON.</p>
      <Code label="Wrong">{`{
  "name": "Emily",
  "city": "London",
}`}</Code>
      <Code label="Right">{`{
  "name": "Emily",
  "city": "London"
}`}</Code>

      <h2>Unexpected token u (undefined)</h2>
      <p>
        You passed <code>undefined</code> to <code>JSON.parse</code>. It is turned
        into the text &quot;undefined&quot;, and the parser chokes on the
        <code> u</code>. A typical cause is reading a missing value from
        <code> localStorage</code> or a variable that was never set.
      </p>
      <p>
        Older browsers show <code>Unexpected token u in JSON at position 0</code>.
        Newer Chrome and Node.js show <code>&quot;undefined&quot; is not valid JSON</code>
        instead. If you see <code>&apos;u&apos;, &quot;upstream c&quot;...</code>, it is
        not this problem: see the section about text errors above.
      </p>
      <Code label="JavaScript">{`const saved = localStorage.getItem('settings')   // null or a string
const settings = saved ? JSON.parse(saved) : {}`}</Code>

      <h2>Unexpected token o (object already parsed)</h2>
      <p>
        <code>JSON.parse</code> was given an object instead of a string. The
        object becomes &quot;[object Object]&quot; and the parser fails on the
        <code> o</code>. The data is already parsed, so just use it.
      </p>

      <h2>Unexpected token T, F or N (Python values)</h2>
      <p>
        <code>True</code>, <code>False</code> and <code>None</code> are Python,
        not JSON. Use <code>true</code>, <code>false</code> and <code>null</code>,
        or create the text with <code>json.dumps()</code> instead of
        <code> str()</code>.
      </p>

      <h2>Unexpected token / (comments)</h2>
      <p>
        Standard JSON has no comments. Remove <code>//</code> and
        <code> /* */</code> lines, or read more in our
        <a href="/json-comments"> JSON comments guide</a>.
      </p>

      <h2>Unexpected end of JSON input</h2>
      <p>
        The text is empty or cut off: a missing closing <code>{'}'}</code> or
        <code> ]</code>, an empty response body, or a file that was not fully
        written. Check that the server really sends a body and that every
        bracket is closed.
      </p>

      <h2>Use the Position Number</h2>
      <p>
        &quot;At position 42&quot; means the 43rd character (counting starts at 0).
        Instead of counting by hand, paste the text into the
        <a href="/json-validator"> JSON Validator</a>, which turns the position into
        a line and column and highlights it.
      </p>

      <h2>Quick Checklist</h2>
      <ul>
        <li>Double quotes around every key and string</li>
        <li>No comma after the last item</li>
        <li><code>true</code>, <code>false</code>, <code>null</code> in lowercase</li>
        <li>No comments, no <code>undefined</code>, no <code>NaN</code></li>
        <li>The response is really JSON, not an HTML page</li>
        <li>Every <code>{'{'}</code> and <code>[</code> is closed</li>
      </ul>
      <p>
        See all other mistakes in <a href="/common-json-errors">Common JSON Errors</a>.
      </p>
    </ArticlePage>
  )
}

export default GuideUnexpectedToken
