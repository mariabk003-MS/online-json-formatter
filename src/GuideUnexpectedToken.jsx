import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideUnexpectedToken() {
  return (
    <ArticlePage
      h1="Unexpected Token in JSON: What It Means and How to Fix It"
      intro="&quot;SyntaxError: Unexpected token&quot; is the most common JSON error. Here is what each version of the message means, how to find the exact cause, and how to fix it in seconds."
      updated="November 20, 2026"
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

      <h2>The Same Error in Chrome, Firefox and Safari</h2>
      <p>
        Every browser words the error differently, so it helps to know which
        message belongs to which mistake. Chrome, Edge and Node.js share the
        same engine:
      </p>
      <table>
        <thead>
          <tr><th>Mistake</th><th>Chrome, Edge, Node.js</th><th>Firefox</th></tr>
        </thead>
        <tbody>
          <tr><td>HTML page instead of JSON</td><td><code>Unexpected token &apos;&lt;&apos;, &quot;&lt;!DOCTYPE &quot;... is not valid JSON</code></td><td><code>JSON.parse: unexpected character at line 1 column 1 of the JSON data</code></td></tr>
          <tr><td>Empty or cut-off response</td><td><code>Unexpected end of JSON input</code></td><td><code>JSON.parse: unexpected end of data at line 1 column 1 of the JSON data</code></td></tr>
          <tr><td>Key without quotes</td><td><code>Expected property name or &apos;{'}'}&apos; in JSON at position 1 (line 1 column 2)</code></td><td><code>JSON.parse: expected property name or &apos;{'}'}&apos; at line 1 column 2 of the JSON data</code></td></tr>
          <tr><td>Trailing comma</td><td><code>Expected double-quoted property name in JSON at position 7 (line 1 column 8)</code></td><td><code>JSON.parse: expected double-quoted property name at line 1 column 8 of the JSON data</code></td></tr>
          <tr><td>Missing comma</td><td><code>Expected &apos;,&apos; or &apos;{'}'}&apos; after property value in JSON at position 7 (line 1 column 8)</code></td><td><code>JSON.parse: expected &apos;,&apos; or &apos;{'}'}&apos; after property value in object at line 1 column 8 of the JSON data</code></td></tr>
          <tr><td>Extra text after the JSON</td><td><code>Unexpected non-whitespace character after JSON at position 7 (line 1 column 8)</code></td><td><code>JSON.parse: unexpected non-whitespace character after JSON data at line 1 column 8 of the JSON data</code></td></tr>
        </tbody>
      </table>
      <p>
        <strong>Safari</strong> uses shorter messages: <code>JSON Parse error: Unrecognized token &apos;&lt;&apos;</code> means
        HTML instead of JSON, and <code>JSON Parse error: Unexpected EOF</code> means the
        text is empty or cut off. Using Python? Its messages are listed in
        <a href="/common-json-errors"> Common JSON Errors</a>.
      </p>
      <p>
        Whatever the wording, the line and column point to the problem. Paste
        the JSON into the <a href="/json-validator">JSON Validator</a> to see that spot
        highlighted.
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
      <p>
        Seeing this from an API after sending a request with curl on Windows? cmd.exe sends
        single quotes as part of the body, so the server gets <code>&apos;{'{'}...{'}'}&apos;</code>. See
        <a href="/curl-post-json"> how to send JSON with curl</a> for the fix.
      </p>

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

      <h3>It starts with &lt;?xml: the server sent XML</h3>
      <p>
        If the message reads
        <code> Unexpected token &apos;&lt;&apos;, &quot;&lt;?xml vers&quot;... is not valid JSON</code>,
        the response is an XML document, not an HTML page. Some APIs (older
        REST and SOAP services, RSS feeds, many error pages from gateways)
        answer in XML unless you ask for JSON.
      </p>
      <Code label="Ask for JSON">{`const response = await fetch(url, {
  headers: { Accept: 'application/json' },
})`}</Code>
      <p>
        If the API only speaks XML, read it as XML instead of calling
        <code> JSON.parse</code>:
      </p>
      <Code label="Read XML in the browser">{`const text = await response.text()
const xml = new DOMParser().parseFromString(text, 'application/xml')
console.log(xml.querySelector('name')?.textContent)`}</Code>
      <p>
        Or paste the XML into <a href="/xml-to-json">XML to JSON</a> to turn it
        into JSON you can work with.
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
          <tr><td><code>&apos;t&apos;, &quot;too large&quot;</code> (Chrome shows <code>&apos;o&apos;</code>)</td><td>A short size-limit message. The request or file is bigger than the server or service allows. Chrome names the <code>o</code> because it first reads the <code>t</code> as the start of <code>true</code>.</td></tr>
          <tr><td><code>&apos;d&apos;, &quot;denied.&quot;</code> or <code>&apos;A&apos;, &quot;Access denied.&quot;</code></td><td>An access-denied message (often HTTP 401 or 403) from the server, a firewall or a web application firewall that blocked the request. Check the API key, login and IP allow-list.</td></tr>
          <tr><td><code>&apos;f&apos;, &quot;failed to fetch&quot;</code> (Chrome shows <code>&apos;i&apos;</code>)</td><td>The server could not get data from another service and returned that error as plain text. This is not the browser&apos;s own <code>TypeError: Failed to fetch</code>, which means no response arrived at all (network or CORS) and happens before any JSON parsing.</td></tr>
          <tr><td>An invisible or strange character, like <code>&apos;\u001f&apos;</code>, followed by garbled text</td><td>Compressed or binary data, not text. Gzip data always starts with the byte <code>1F</code>. See the next section.</td></tr>
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

      <h2>Unexpected Token from a PHP Backend</h2>
      <p>
        PHP sends everything a script prints, so debug output or a warning ends up in
        front of the JSON. The first characters give it away:
      </p>
      <table>
        <thead>
          <tr><th>Error you see</th><th>What PHP printed before the JSON</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Unexpected token &apos;s&apos;, &quot;string(3) &quot;...</code></td><td>A leftover <code>var_dump()</code>, which prints <code>string(3) &quot;out&quot;</code></td></tr>
          <tr><td><code>Unexpected token &apos;A&apos;, &quot;Array (&quot;...</code></td><td>A leftover <code>print_r()</code> of an array</td></tr>
          <tr><td><code>Unexpected token &apos;&lt;&apos;, &quot;&lt;br /&gt; &lt;b&gt;&quot;...</code></td><td>A PHP warning or notice, such as <code>Undefined variable</code>, printed as HTML</td></tr>
        </tbody>
      </table>
      <p>
        Remove the debug lines, keep warnings out of the response, and send only the
        JSON:
      </p>
      <Code label="PHP">{`<?php
ini_set('display_errors', '0');   // log errors instead of printing them
header('Content-Type: application/json');

echo json_encode($data);
exit;`}</Code>
      <p>
        Also check for a blank line or spaces before <code>&lt;?php</code> in any included
        file, and a closing <code>?&gt;</code> followed by a newline: both add text to the
        response. Open the API URL directly in the browser to see exactly what it returns.
      </p>

      <h2>Unexpected Token with Garbled Characters: Compressed or Binary Data</h2>
      <p>
        If the error shows symbols like <code>�</code>, <code>×</code> or empty boxes,
        your code is reading bytes that are not text at all. The most common
        cause is gzip: the response or file is compressed, but it was read as
        plain text. A gzip stream always starts with the bytes <code>1F 8B</code>,
        so the first &quot;token&quot; is the invisible character <code>\u001f</code>.
      </p>
      <ul>
        <li><strong>From an API:</strong> the server compressed the body but did not send <code>Content-Encoding: gzip</code>, or it compressed it twice. Browsers and <code>fetch</code> decompress automatically only when that header is correct, so fix the server or proxy configuration.</li>
        <li><strong>From a file:</strong> you may be opening <code>data.json.gz</code> or a binary file by mistake. Decompress it first.</li>
        <li><strong>Encrypted or encoded data:</strong> Base64, protobuf or encrypted payloads also look like gibberish. Decode them with the right tool; for Base64, try the <a href="/base64-encode-decode">Base64 Decoder</a>.</li>
      </ul>
      <Code label="Node.js: read a gzipped JSON file">{`import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

const data = JSON.parse(gunzipSync(readFileSync('data.json.gz')).toString('utf8'))`}</Code>

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

      <h2>Unexpected Token in a MongoDB Query</h2>
      <p>
        A query like <code>db.movies.find({'{'}rating{'{'}$gt:80{'}'}{'}'})</code> is
        JavaScript, not JSON, but the cause is the same kind of typo: the colon
        after <code>rating</code> is missing. The MongoDB shell (mongosh) reads
        queries with the Babel parser, so it reports the spot as line:column:
      </p>
      <Code label="Error">{`SyntaxError: Unexpected token, expected "," (1:22)`}</Code>
      <Code label="Wrong">{`db.movies.find({rating{$gt:80}})`}</Code>
      <Code label="Right">{`db.movies.find({ rating: { $gt: 80 } })`}</Code>
      <p>
        Babel counts columns from 0, so column 22 is the 23rd character: the
        second <code>{'{'}</code>, right where the colon should be. Every field in a filter needs <code>name: value</code>, and operators
        like <code>$gt</code> sit inside their own braces.
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
