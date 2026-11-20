import { ArticlePage, Code } from './ArticlePage.jsx'

function GuideJsonDecodeError() {
  return (
    <ArticlePage
      h1="JSONDecodeError: Expecting Value (Python) and How to Fix It"
      intro="What json.decoder.JSONDecodeError means, why 'Expecting value: line 1 column 1 (char 0)' almost always points to an empty or non-JSON response, and the fix for every other JSONDecodeError message."
      updated="November 20, 2026"
      faqKey="jsondecodeerror-expecting-value"
      related={[
        ['/json-in-python', 'JSON in Python'],
        ['/json-validator', 'JSON Validator'],
        ['/json-repair', 'JSON Repair'],
        ['/unexpected-token-in-json', 'Unexpected Token in JSON (JavaScript)'],
      ]}
    >
      <h2>What the Error Means</h2>
      <p>
        <code>json.loads()</code> and <code>json.load()</code> raise
        <code> json.JSONDecodeError</code> when the text is not valid JSON. The message says what
        the parser expected and where it stopped:
      </p>
      <Code label="Error">{`json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)`}</Code>
      <p>
        <strong>&quot;Expecting value&quot;</strong> means the parser wanted a JSON value (an object,
        array, string, number, <code>true</code>, <code>false</code> or <code>null</code>) and found
        something else. <strong>line 1 column 1 (char 0)</strong> means it failed on the very first
        character, so the problem is not a small typo: the text is empty or is not JSON at all.
      </p>

      <h2>Cause 1: The Text Is Empty</h2>
      <p>
        An empty string, an empty file or a body with only spaces all give this error. We tested
        <code> json.loads(&quot;&quot;)</code> and reading an empty <code>.json</code> file on Python
        3.14: both raised <code>Expecting value: line 1 column 1 (char 0)</code>. A body of only
        whitespace reports the position after the spaces, for example <code>line 2 column 1 (char 4)</code>.
      </p>
      <p>
        This happens when an API returns <strong>204 No Content</strong>, when a request fails
        without a body, or when a file was created but never written. Check before parsing:
      </p>
      <Code label="Python">{`if not text.strip():
    print("Nothing to parse: the response or file is empty")
else:
    data = json.loads(text)`}</Code>

      <h2>Cause 2: The Response Is HTML, Not JSON</h2>
      <p>
        When an API call fails, many servers send an HTML error or login page. The first
        character is <code>&lt;</code>, which is not a JSON value, so parsing
        <code> &lt;!DOCTYPE html&gt;...</code> raises the same <code>Expecting value: line 1 column 1 (char 0)</code>.
        Look at what really came back:
      </p>
      <Code label="Python (requests)">{`import requests

response = requests.get("https://api.example.com/users/1", timeout=10)
print(response.status_code)                    # 404? 401? 500?
print(response.headers.get("Content-Type"))    # text/html instead of application/json?
print(response.text[:200])                     # the start of the real body

response.raise_for_status()
data = response.json()`}</Code>
      <p>
        Common reasons: a wrong URL (404 page), a missing or expired API key (login page), a
        server error (500 page), or a proxy or firewall answering instead of the API. Fix the
        request, not the JSON parsing.
      </p>

      <h2>Cause 3: It Is a Python Dictionary, Not JSON</h2>
      <p>
        Printing a dict with <code>print()</code> or <code>str()</code> gives Python syntax, not
        JSON: single quotes and <code>True</code>, <code>False</code>, <code>None</code>. These are the
        errors Python 3.14 gave us:
      </p>
      <table>
        <thead>
          <tr><th>Text</th><th>Error</th></tr>
        </thead>
        <tbody>
          <tr><td><code>{'{'}&apos;name&apos;: &apos;Emily&apos;{'}'}</code></td><td><code>Expecting property name enclosed in double quotes: line 1 column 2 (char 1)</code></td></tr>
          <tr><td><code>{'{'}&quot;active&quot;: True{'}'}</code></td><td><code>Expecting value: line 1 column 12 (char 11)</code>, pointing at the <code>T</code></td></tr>
        </tbody>
      </table>
      <p>
        The real fix is to create the text with <code>json.dumps()</code> in the first place. If you
        only have the Python-style text, <code>ast.literal_eval</code> reads it safely:
      </p>
      <Code label="Python">{`import ast, json

text = "{'name': 'Emily', 'active': True, 'manager': None}"
data = ast.literal_eval(text)       # a real dict
print(json.dumps(data))
# {"name": "Emily", "active": true, "manager": null}`}</Code>
      <p>
        Or paste the text into <a href="/json-repair">JSON Repair</a>, which converts single quotes,
        <code> True</code>, <code>False</code> and <code>None</code> for you.
      </p>

      <h2>Cause 4: A BOM at the Start of the File</h2>
      <p>
        Files saved by Excel or some Windows editors can start with an invisible byte order mark.
        Python names it in the error:
      </p>
      <Code label="Error">{`JSONDecodeError: Unexpected UTF-8 BOM (decode using utf-8-sig): line 1 column 1 (char 0)`}</Code>
      <Code label="Fix">{`with open("data.json", encoding="utf-8-sig") as f:
    data = json.load(f)`}</Code>

      <h2>Every JSONDecodeError Message and Its Fix</h2>
      <p>All messages below are from Python 3.14 with the text shown.</p>
      <table>
        <thead>
          <tr><th>Message</th><th>Example text</th><th>Cause and fix</th></tr>
        </thead>
        <tbody>
          <tr><td><code>Expecting value</code></td><td><code>&quot;&quot;</code>, <code>&lt;!DOCTYPE html&gt;</code>, <code>True</code></td><td>Empty text, HTML, or a Python value. See the causes above.</td></tr>
          <tr><td><code>Expecting property name enclosed in double quotes</code></td><td><code>{'{'}&apos;name&apos;: &apos;Emily&apos;{'}'}</code></td><td>Single quotes or a key without quotes. Use double quotes.</td></tr>
          <tr><td><code>Illegal trailing comma before end of object</code></td><td><code>{'{'}&quot;name&quot;: &quot;Emily&quot;,{'}'}</code></td><td>A comma after the last item. Remove it. Older Python versions report this as <code>Expecting property name enclosed in double quotes</code>.</td></tr>
          <tr><td><code>Expecting &apos;,&apos; delimiter</code></td><td><code>{'{'}&quot;a&quot;: 1 &quot;b&quot;: 2{'}'}</code></td><td>A missing comma between items.</td></tr>
          <tr><td><code>Extra data</code></td><td>two objects on two lines</td><td>More than one JSON value, often a <a href="/json-lines">JSON Lines</a> file. Parse each line with <code>json.loads</code>.</td></tr>
          <tr><td><code>Unterminated string starting at</code></td><td><code>{'{'}&quot;name&quot;: &quot;Emily{'}'}</code></td><td>A missing closing quote.</td></tr>
          <tr><td><code>Invalid control character at</code></td><td>a real line break inside a string</td><td>Write it as <code>\n</code>, or pass <code>strict=False</code> to accept it.</td></tr>
        </tbody>
      </table>
      <p>
        Not a JSONDecodeError but just as common:
        <code> TypeError: the JSON object must be str, bytes or bytearray, not TextIOWrapper</code> means
        you passed a file to <code>json.loads</code>. Use <code>json.load(f)</code> for files and
        <code> json.loads(text)</code> for strings. The same message ending in <code>NoneType</code> means
        the variable you parsed is <code>None</code>.
      </p>

      <h2>Find the Exact Spot</h2>
      <p>
        The exception has <code>lineno</code>, <code>colno</code> and <code>pos</code> attributes. Show the text
        around <code>pos</code> to see the mistake at a glance:
      </p>
      <Code label="Python">{`import json

def parse_json(text):
    if not text or not text.strip():
        raise ValueError("Empty response: nothing to parse")
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        snippet = text[max(0, e.pos - 20): e.pos + 20]
        raise ValueError(
            f"Invalid JSON at line {e.lineno}, column {e.colno}: {e.msg}. Near: {snippet!r}"
        ) from e`}</Code>
      <Code label="Output for {&quot;a&quot;: 1 &quot;b&quot;: 2}">{`ValueError: Invalid JSON at line 1, column 9: Expecting ',' delimiter. Near: '{"a": 1 "b": 2}'`}</Code>
      <p>
        <code>JSONDecodeError</code> is a subclass of <code>ValueError</code>, so <code>except ValueError</code>
        catches it too. For a quick check without code, paste the text into the
        <a href="/json-validator"> JSON Validator</a>: it highlights the same line and column.
      </p>
    </ArticlePage>
  )
}

export default GuideJsonDecodeError
