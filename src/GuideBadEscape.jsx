import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideBadEscape() {
  return (
    <ArticlePage
      h1="Bad Escaped Character and Bad Control Character in JSON (Fix)"
      intro="Why Windows paths, backslashes, line breaks and tabs break JSON strings, what every error message means in JavaScript and Python, and how to write strings that always parse. All messages were produced with Node.js 24 and Python 3.14."
      updated="November 23, 2026"
      faqKey="bad-escaped-character-in-json"
      related={[
        ['/json-escape', 'JSON Escape / Unescape'],
        ['/json-validator', 'JSON Validator'],
        ['/json-syntax-rules', 'JSON Syntax Rules'],
        ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
      ]}
    >
      <h2>The Rules for Text in JSON</h2>
      <p>
        A JSON string is written in double quotes, and a backslash starts an <strong>escape</strong>.
        Only these escapes are allowed:
      </p>
      <table>
        <thead>
          <tr><th>Escape</th><th>Means</th></tr>
        </thead>
        <tbody>
          <tr><td><code>\&quot;</code></td><td>A double quote</td></tr>
          <tr><td><code>\\</code></td><td>A backslash</td></tr>
          <tr><td><code>\/</code></td><td>A forward slash (optional; <code>/</code> works too)</td></tr>
          <tr><td><code>\n</code> <code>\r</code> <code>\t</code></td><td>Line break, carriage return, tab</td></tr>
          <tr><td><code>\b</code> <code>\f</code></td><td>Backspace, form feed</td></tr>
          <tr><td><code>\u00e9</code></td><td>Any character by its 4-digit hex code (here <code>é</code>)</td></tr>
        </tbody>
      </table>
      <p>
        Two things break the rules: a backslash followed by anything else, and a real control
        character (such as an actual line break or tab) typed inside the quotes.
      </p>

      <h2>Every Message and What Caused It</h2>
      <table>
        <thead>
          <tr><th>JSON text</th><th>JavaScript (Node.js 24, Chrome)</th><th>Python 3.14</th></tr>
        </thead>
        <tbody>
          <tr><td><code>{'{'}&quot;path&quot;: &quot;C:\Users\Emily&quot;{'}'}</code></td><td><code>Bad escaped character in JSON at position 13</code></td><td><code>Invalid \escape: line 1 column 13 (char 12)</code></td></tr>
          <tr><td>A real line break inside <code>&quot;line1 / line2&quot;</code></td><td><code>Bad control character in string literal in JSON at position 15</code></td><td><code>Invalid control character at: line 1 column 16 (char 15)</code></td></tr>
          <tr><td>A real tab inside a string</td><td><code>Bad control character in string literal</code></td><td><code>Invalid control character at</code></td></tr>
          <tr><td><code>&quot;\u12&quot;</code> (fewer than 4 hex digits)</td><td><code>Bad Unicode escape in JSON at position 11</code></td><td><code>Invalid \uXXXX escape</code></td></tr>
          <tr><td><code>&quot;\x41&quot;</code></td><td><code>Bad escaped character</code></td><td><code>Invalid \escape</code></td></tr>
          <tr><td><code>&quot;end\&quot;</code> (backslash before the closing quote)</td><td><code>Unterminated string in JSON</code></td><td><code>Unterminated string starting at</code></td></tr>
        </tbody>
      </table>
      <p>
        Both point at the same mistake: <code>\U</code> in <code>\Users</code> is not a JSON escape.
        JavaScript counts from 0 and points at the <code>U</code> after the backslash (position 13);
        Python points at the backslash itself (char 12, column 13).
      </p>

      <h2>Windows Paths: Double Every Backslash</h2>
      <Code label="Wrong">{`{"path": "C:\\Users\\Emily\\data.json"}`}</Code>
      <Code label="Right">{`{"path": "C:\\\\Users\\\\Emily\\\\data.json"}`}</Code>
      <Code label="Also right (Windows accepts forward slashes)">{`{"path": "C:/Users/Emily/data.json"}`}</Code>
      <p>
        <code>\\</code> in JSON means one backslash, so the parsed value is
        <code> C:\Users\Emily\data.json</code> again. Never write the escapes by hand when a program can
        do it: in Python, <code>json.dumps({'{'}&quot;path&quot;: r&quot;C:\Users\Emily&quot;{'}'})</code> produced
        <code> {'{'}&quot;path&quot;: &quot;C:\\Users\\Emily&quot;{'}'}</code>, and JavaScript&apos;s
        <code> JSON.stringify</code> gives the same.
      </p>

      <h2>Line Breaks and Tabs: Use \n and \t</h2>
      <Code label="Wrong: a real line break inside the quotes">{`{"note": "line1
line2"}`}</Code>
      <Code label="Right">{`{"note": "line1\\nline2"}`}</Code>
      <p>
        This often happens when text is copied from an editor or a spreadsheet cell into a JSON file,
        or when a template builds JSON by gluing strings together. Build the value as normal text and
        let <code>JSON.stringify</code> or <code>json.dumps</code> write it, or paste the text into
        <a href="/json-escape"> JSON Escape</a> to get a correctly escaped string.
      </p>
      <p>
        If you only need to <strong>read</strong> such a file in Python, <code>json.loads(text, strict=False)</code>
        accepts the raw line breaks: our test returned <code>{'{'}&apos;note&apos;: &apos;line1\nline2&apos;{'}'}</code>.
        JavaScript&apos;s <code>JSON.parse</code> has no such option.
      </p>

      <h2>Escaping Inside Code: The Double-Escape Trap</h2>
      <p>
        When JSON sits inside a string in your code, the language reads the backslashes first.
        In JavaScript, <code>JSON.parse(&apos;{'{'}&quot;a&quot;: &quot;x\ny&quot;{'}'}&apos;)</code> fails with
        <code> Bad control character</code>, because <code>\n</code> in the JavaScript string is already a
        real line break before <code>JSON.parse</code> sees it. Write <code>\\n</code> in the code, or use
        <code> String.raw</code> or a separate file. Python has the same trap; use a raw string
        (<code>r&apos;...&apos;</code>).
      </p>

      <h2>Quick Fixes</h2>
      <ul>
        <li>Paste the JSON into the <a href="/json-validator">JSON Validator</a> to see the exact line and column.</li>
        <li>Use <a href="/json-escape">JSON Escape</a> to turn any text, paths and line breaks included, into a valid JSON string.</li>
        <li>Generate JSON with <code>JSON.stringify</code> or <code>json.dumps</code> instead of string concatenation.</li>
        <li>For other syntax mistakes, see <a href="/unexpected-token-in-json">Unexpected Token in JSON</a> and <a href="/jsondecodeerror-expecting-value">JSONDecodeError in Python</a>.</li>
      </ul>
    </ArticlePage>
  )
}

export default GuideBadEscape
