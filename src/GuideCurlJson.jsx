import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideCurlJson() {
  return (
    <ArticlePage
      h1="How to Send JSON with curl (POST, PUT, Files and Windows)"
      intro="Copy-ready curl commands for posting JSON to an API: the right headers, sending a file, the newer --json option, and the quoting rules that break JSON on Windows."
      updated="November 19, 2026"
      faqKey="curl-post-json"
      related={[
        ['/json-validator', 'JSON Validator'],
        ['/', 'JSON Formatter'],
        ['/unexpected-token-in-json', 'Unexpected Token in JSON'],
        ['/json-escape', 'JSON Escape'],
      ]}
    >
      <h2>The Basic Command</h2>
      <p>
        To send JSON, give curl the data with <code>-d</code> and tell the server it is JSON
        with a <code>Content-Type</code> header:
      </p>
      <Code label="macOS, Linux, Git Bash">{`curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Emily","age":30}'`}</Code>
      <p>
        <code>-d</code> already makes the request a POST, so <code>-X POST</code> is optional. The
        single quotes around the JSON keep the shell from touching the double quotes inside it.
      </p>

      <h2>Don&apos;t Forget the Content-Type Header</h2>
      <p>
        Without <code>-H &quot;Content-Type: application/json&quot;</code>, curl labels the body as a
        web form. We sent <code>-d &apos;{'{'}&quot;name&quot;:&quot;Emily&quot;{'}'}&apos;</code> with no header to a test
        server, and it received:
      </p>
      <Code label="What the server saw">{`Content-Type: application/x-www-form-urlencoded
Body: {"name":"Emily"}`}</Code>
      <p>
        The body is fine, but many frameworks (Express, Flask, Spring, ASP.NET) only parse JSON
        when the header says so. The usual symptom is an empty body on the server, a
        <strong> 400 Bad Request</strong> or a <strong>415 Unsupported Media Type</strong>.
      </p>

      <h2>The Shortcut: --json</h2>
      <p>
        curl 7.82 and newer have <code>--json</code>, which sends the data as a POST and sets both
        headers for you:
      </p>
      <Code label="curl 7.82+">{`curl --json '{"name":"Emily","age":30}' https://api.example.com/users`}</Code>
      <Code label="Headers --json adds">{`Content-Type: application/json
Accept: application/json`}</Code>
      <p>
        Check your version with <code>curl --version</code>. Windows 10 and 11 include curl as
        <code> curl.exe</code>; older versions may not have <code>--json</code> yet, so use
        <code> -H</code> and <code>-d</code> there.
      </p>

      <h2>Send JSON from a File</h2>
      <p>
        For anything longer than one line, put the JSON in a file and add <code>@</code> before
        the file name. This also avoids every quoting problem.
      </p>
      <Code label="user.json">{`{
  "name": "Emily"
}`}</Code>
      <Code label="Send the file">{`curl -H "Content-Type: application/json" --data-binary @user.json https://api.example.com/users

# or, with curl 7.82+
curl --json @user.json https://api.example.com/users`}</Code>
      <p>
        Prefer <code>--data-binary</code> over <code>-d</code> for files. <code>-d @file</code> removes the
        line breaks: our test server received <code>{'{'}  &quot;name&quot;: &quot;Emily&quot;{'}'}</code> with
        <code> -d</code>, but the file exactly as written with <code>--data-binary</code>. For JSON both
        still parse, but the exact bytes matter if the API checks a signature of the body.
        <code> --json</code> keeps the line breaks too. To read the JSON from another command, use
        <code> @-</code> for standard input: <code>cat user.json | curl --json @- URL</code>.
      </p>

      <h2>PUT, PATCH and Authorization Headers</h2>
      <Code label="Update a record with PUT">{`curl -X PUT https://api.example.com/users/1 \\
  -H "Content-Type: application/json" \\
  -d '{"age":31}'`}</Code>
      <Code label="With a bearer token">{`curl --json '{"name":"Emily"}' \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.example.com/users`}</Code>
      <p>
        Use <code>-X PATCH</code> the same way for partial updates. Add as many <code>-H</code> lines as
        the API needs.
      </p>

      <h2>Sending JSON with curl on Windows</h2>
      <p>
        This is where most &quot;invalid JSON&quot; errors come from. The single-quote command above
        does not survive the Windows shells. We ran it on Windows 11 against a test server:
      </p>
      <table>
        <thead>
          <tr><th>Shell</th><th>What the server received</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr><td>PowerShell 5.1, single quotes</td><td><code>{'{'}name:Emily,age:30{'}'}</code> (the double quotes were removed)</td><td><code>Expected property name or &apos;{'}'}&apos; in JSON at position 1</code></td></tr>
          <tr><td>cmd.exe, single quotes</td><td><code>&apos;{'{'}name:Emily{'}'}&apos;</code> (single quotes kept, double quotes removed)</td><td><code>Unexpected token &apos;&apos;&apos;, &quot;&apos;{'{'}name:Emily{'}'}&apos;&quot; is not valid JSON</code></td></tr>
        </tbody>
      </table>
      <p>
        Escape every double quote inside the JSON with a backslash. This worked in both shells:
      </p>
      <Code label="PowerShell">{`curl.exe -H 'Content-Type: application/json' -d '{\\"name\\":\\"Emily\\",\\"age\\":30}' https://api.example.com/users`}</Code>
      <Code label="cmd.exe">{`curl.exe -H "Content-Type: application/json" -d "{\\"name\\":\\"Emily\\",\\"age\\":30}" https://api.example.com/users`}</Code>
      <p>
        Two more Windows details. In Windows PowerShell 5.1, <code>curl</code> is an alias for
        <code> Invoke-WebRequest</code>, which takes different options, so type <code>curl.exe</code>. And
        the easiest fix of all is the file method above (<code>--data-binary @user.json</code>),
        which needs no escaping in any shell. PowerShell 7.3 and newer pass the quotes through
        as written, so single quotes work there.
      </p>
      <p>
        In PowerShell you can also skip curl and let PowerShell build the JSON (more in
        <a href="/powershell-json">JSON in PowerShell</a>):
      </p>
      <Code label="PowerShell without curl">{`$body = @{ name = 'Emily'; age = 30 } | ConvertTo-Json
Invoke-RestMethod -Uri https://api.example.com/users -Method Post -ContentType 'application/json' -Body $body`}</Code>

      <h2>Read and Check the Response</h2>
      <Code label="Useful options">{`# show the status line and response headers
curl -i --json '{"a":1}' https://api.example.com/users

# print only the status code
curl -s -o /dev/null -w "%{http_code}\\n" --json '{"a":1}' https://api.example.com/users

# pretty print the JSON response (Python is often already installed)
curl -s --json '{"a":1}' https://api.example.com/users | python -m json.tool`}</Code>
      <p>
        On Windows, use <code>NUL</code> instead of <code>/dev/null</code> in cmd.exe. You can also paste
        the response into the <a href="/">JSON Formatter</a> to read it as a tree.
      </p>

      <h2>Common Problems</h2>
      <ul>
        <li><strong>Server says the body is empty or not JSON:</strong> the <code>Content-Type: application/json</code> header is missing.</li>
        <li><strong>&quot;Unexpected token&quot; or &quot;Expected property name&quot; from the server:</strong> the JSON was mangled by shell quoting, usually on Windows. Use a file or escape the quotes. See <a href="/unexpected-token-in-json">Unexpected Token in JSON</a> for every version of the message.</li>
        <li><strong>The JSON itself is invalid:</strong> a trailing comma or single quotes inside the JSON. Check it in the <a href="/json-validator">JSON Validator</a> before sending.</li>
        <li><strong>The value contains quotes or line breaks:</strong> escape it as a JSON string first with <a href="/json-escape">JSON Escape</a>.</li>
      </ul>
    </ArticlePage>
  )
}

export default GuideCurlJson
