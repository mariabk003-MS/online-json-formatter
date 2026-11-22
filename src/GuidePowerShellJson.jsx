import { ArticlePage, Code } from './ArticlePage.jsx'

function GuidePowerShellJson() {
  return (
    <ArticlePage
      h1="JSON in PowerShell: ConvertFrom-Json, ConvertTo-Json and the Depth Trap"
      intro="How to read, change and write JSON in PowerShell, plus the surprises that break scripts: the -Depth limit, single-item arrays, dates, key order and file encodings. Every example was run in Windows PowerShell 5.1."
      updated="November 22, 2026"
      faqKey="powershell-json"
      related={[
        ['/', 'JSON Formatter'],
        ['/json-validator', 'JSON Validator'],
        ['/curl-post-json', 'Send JSON with curl'],
        ['/read-json-file-nodejs', 'Read a JSON File in Node.js'],
      ]}
    >
      <h2>Read JSON: ConvertFrom-Json</h2>
      <p>
        <code>ConvertFrom-Json</code> turns JSON text into objects you can use with dot notation:
      </p>
      <Code label="PowerShell">{`$json = '{"name":"Emily","roles":["admin","editor"],"address":{"city":"London"}}'
$user = $json | ConvertFrom-Json

$user.name            # Emily
$user.roles[1]        # editor
$user.address.city    # London`}</Code>
      <p>
        The result is a <code>PSCustomObject</code>. Arrays become PowerShell arrays, and nested
        objects become nested objects.
      </p>

      <h2>Read a JSON File</h2>
      <Code label="PowerShell">{`$config = Get-Content .\\config.json -Raw -Encoding UTF8 | ConvertFrom-Json`}</Code>
      <ul>
        <li><strong>-Raw</strong> reads the file as one string instead of an array of lines, so <code>ConvertFrom-Json</code> receives the whole document at once.</li>
        <li>
          <strong>-Encoding UTF8</strong> matters in Windows PowerShell 5.1: it reads UTF-8 files
          without a BOM as the old ANSI code page. A file containing <code>José</code> came back as
          <code> JosÃ©</code> without the option and correctly with it.
        </li>
      </ul>

      <h2>Get JSON from an API</h2>
      <Code label="PowerShell">{`$user = Invoke-RestMethod -Uri 'https://api.example.com/users/1'
$user.name`}</Code>
      <p>
        <code>Invoke-RestMethod</code> parses a JSON response for you, so you do not need
        <code> ConvertFrom-Json</code>. To send JSON, see the PowerShell section of
        <a href="/curl-post-json"> how to send JSON with curl</a>.
      </p>

      <h2>Write JSON: ConvertTo-Json</h2>
      <Code label="PowerShell">{`$data = [ordered]@{ name = 'Emily'; roles = @('admin', 'editor') }
$data | ConvertTo-Json -Depth 10`}</Code>
      <p>
        Two habits save a lot of trouble: always pass <code>-Depth</code>, and use
        <code> [ordered]</code> when the order of keys matters. The next sections show why.
      </p>

      <h2>The -Depth Trap</h2>
      <p>
        <code>ConvertTo-Json</code> only goes <strong>2 levels deep</strong> by default. Anything
        deeper is replaced by its type name. We converted a three-level hashtable:
      </p>
      <Code label="PowerShell">{`@{ a = @{ b = @{ c = @{ d = 1 } } } } | ConvertTo-Json -Compress`}</Code>
      <Code label="Output">{`{"a":{"b":{"c":"System.Collections.Hashtable"}}}`}</Code>
      <p>
        Windows PowerShell 5.1 did this <strong>without any warning</strong>, so the broken JSON can
        end up in a file or an API request unnoticed. The fix is to raise the limit:
      </p>
      <Code label="PowerShell">{`$data | ConvertTo-Json -Depth 10`}</Code>
      <p>
        The maximum is 100. PowerShell 7 still uses a default depth of 2 but, according to its
        documentation, prints a warning when it cuts data off.
      </p>

      <h2>Single-Item Arrays Become a Single Value</h2>
      <p>
        When you pipe an array into <code>ConvertTo-Json</code>, PowerShell sends its items one by
        one. With one item, the array disappears:
      </p>
      <Code label="PowerShell">{`@(1) | ConvertTo-Json -Compress                 # 1
ConvertTo-Json -InputObject @(1) -Compress      # [1]`}</Code>
      <p>
        If an API expects a list, use <code>-InputObject</code> instead of the pipeline. The same applies
        to empty arrays: <code>ConvertTo-Json -InputObject @()</code> gives <code>[]</code>.
      </p>

      <h2>Key Order, Dates and Escaping</h2>
      <table>
        <thead>
          <tr><th>Input</th><th>Windows PowerShell 5.1 output</th><th>Fix</th></tr>
        </thead>
        <tbody>
          <tr><td><code>@{'{'} zeta = 1; alpha = 2; mid = 3 {'}'}</code></td><td><code>{'{'}&quot;alpha&quot;:2,&quot;zeta&quot;:1,&quot;mid&quot;:3{'}'}</code> (order changed)</td><td>Use <code>[ordered]@{'{'} ... {'}'}</code>, which kept <code>zeta, alpha, mid</code></td></tr>
          <tr><td>A <code>[datetime]</code> value</td><td><code>&quot;\/Date(1795321800000)\/&quot;</code></td><td>Convert it first: <code>$date.ToString(&apos;o&apos;)</code> gives ISO 8601</td></tr>
          <tr><td><code>&quot;a&lt;b&gt;&amp;&apos;c&apos;&quot;</code></td><td><code>{'"a\\u003cb\\u003e\\u0026\\u0027c\\u0027"'}</code></td><td>Valid JSON that every parser reads correctly; no fix needed</td></tr>
        </tbody>
      </table>
      <p>
        The 5.1 output is also indented in an unusual way, with wide gaps after colons. It is valid
        JSON. Use <code>-Compress</code> for one line, or paste it into the <a href="/">JSON Formatter</a> for
        clean indentation.
      </p>

      <h2>Save a JSON File Other Tools Can Read</h2>
      <p>
        This is the problem that breaks the most pipelines. In a default Windows PowerShell 5.1
        session we saved the same JSON in different ways and checked the first bytes of each file:
      </p>
      <table>
        <thead>
          <tr><th>Command</th><th>File starts with</th><th>Result</th></tr>
        </thead>
        <tbody>
          <tr><td><code>... | ConvertTo-Json &gt; data.json</code></td><td><code>FF FE</code> (UTF-16)</td><td>Python: <code>UnicodeDecodeError: &apos;utf-8&apos; codec can&apos;t decode byte 0xff</code></td></tr>
          <tr><td><code>... | Set-Content -Encoding utf8 data.json</code></td><td><code>EF BB BF</code> (UTF-8 with BOM)</td><td>Node.js: <code>{"Unexpected token '\uFEFF'"}</code> (the invisible BOM)</td></tr>
          <tr><td><code>... | Set-Content data.json</code></td><td>ANSI code page</td><td>Fine for plain English, but <code>José</code> failed in Python with <code>UnicodeDecodeError</code></td></tr>
        </tbody>
      </table>
      <p>Write UTF-8 without a BOM, which every tool accepts:</p>
      <Code label="Windows PowerShell 5.1">{`$json = $data | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$PWD\\data.json", $json, $utf8NoBom)`}</Code>
      <Code label="PowerShell 7+">{`$data | ConvertTo-Json -Depth 10 | Set-Content data.json   # UTF-8 without BOM by default`}</Code>
      <p>
        <code>WriteAllText</code> needs a full path, which is why the example uses <code>$PWD</code>. The
        BOM error in Node.js is explained in
        <a href="/read-json-file-nodejs"> how to read a JSON file in Node.js</a>.
      </p>

      <h2>Invalid JSON and Other Errors</h2>
      <p>
        For <code>{'{'}&quot;name&quot;: &quot;Emily&quot;,{'}'}</code> (a trailing comma), Windows PowerShell 5.1 reported
        <code> Invalid JSON primitive: .</code>, which does not say much. Paste the text into the
        <a href="/json-validator"> JSON Validator</a> to see the exact line and column.
      </p>
      <p>
        Be careful the other way too: Windows PowerShell 5.1 accepted
        <code> {'{'}&apos;name&apos;: &apos;Emily&apos;{'}'}</code> with single quotes, which is not valid JSON. A file that
        works in your script can still fail in Python, JavaScript or an API. Validate JSON that
        other programs will read.
      </p>

      <h2>Windows PowerShell 5.1 vs PowerShell 7</h2>
      <p>
        Everything above was tested in Windows PowerShell 5.1, the version built into Windows.
        PowerShell 7 (<code>pwsh</code>) is installed separately and, according to its documentation,
        changes a few things: dates are written as ISO 8601 strings, files are saved as UTF-8 without
        a BOM, output is indented normally, a warning appears when <code>-Depth</code> cuts data, and
        <code> ConvertFrom-Json -AsHashtable</code> returns a hashtable instead of a
        <code> PSCustomObject</code>. Check your version with <code>$PSVersionTable.PSVersion</code>.
      </p>
    </ArticlePage>
  )
}

export default GuidePowerShellJson
