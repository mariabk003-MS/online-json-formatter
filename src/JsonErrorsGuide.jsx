import './App.css'
import NavBar from './NavBar.jsx'

function ErrorExample({ wrong, right }) {
  return (
    <>
      <p><strong>Wrong:</strong></p>
      <pre className="result-output">{wrong}</pre>
      <p><strong>Correct:</strong></p>
      <pre className="result-output">{right}</pre>
    </>
  )
}

function JsonErrorsGuide() {
  return (
    <div className="app">
      <NavBar />
      <h1>Common JSON Errors and How to Fix Them</h1>
      <p>Clear examples of the mistakes that break JSON, and the quick fix for each one.</p>

      <section className="seo-content">
        <p>
          JSON looks simple, but one small mistake makes the whole file
          invalid. Most errors come from the same few problems. This guide
          shows each one with a wrong and a correct example. If you want to
          find the exact line of an error in your own data, paste it into
          our <a href="/json-validator">JSON Validator</a>.
        </p>

        <h2>1. Missing Comma</h2>
        <p>
          Every property in an object, and every item in an array, must be
          separated by a comma. Browsers usually report this error on the
          line after the missing comma, so check the end of the line above.
        </p>
        <ErrorExample
          wrong={`{
  "name": "Ayesha"
  "city": "Lahore"
}`}
          right={`{
  "name": "Ayesha",
  "city": "Lahore"
}`}
        />

        <h2>2. Trailing Comma</h2>
        <p>
          JavaScript allows a comma after the last item, but JSON does not.
          Remove the comma before a closing bracket or brace.
        </p>
        <ErrorExample
          wrong={`{
  "skills": ["JSON", "CSV",],
}`}
          right={`{
  "skills": ["JSON", "CSV"]
}`}
        />
        <p>
          Tip: our <a href="/">JSON Formatter</a> removes trailing commas
          automatically when you click Fix &amp; Format JSON.
        </p>

        <h2>3. Single Quotes Instead of Double Quotes</h2>
        <p>
          JSON only accepts double quotes for keys and text values. Single
          quotes are a common habit from JavaScript or Python.
        </p>
        <ErrorExample
          wrong={`{
  'name': 'Ayesha'
}`}
          right={`{
  "name": "Ayesha"
}`}
        />

        <h2>4. Keys Without Quotes</h2>
        <p>
          In JavaScript objects, keys can be written without quotes. In JSON,
          every key must be a string in double quotes.
        </p>
        <ErrorExample
          wrong={`{
  name: "Ayesha",
  age: 25
}`}
          right={`{
  "name": "Ayesha",
  "age": 25
}`}
        />
        <h2>5. Comments in JSON</h2>
        <p>
          Standard JSON does not support comments of any kind. Remove them,
          or store the note as a normal property if you need to keep it.
        </p>
        <ErrorExample
          wrong={`{
  // user details
  "name": "Ayesha"
}`}
          right={`{
  "note": "user details",
  "name": "Ayesha"
}`}
        />

        <h2>6. Missing or Mismatched Brackets</h2>
        <p>
          Every opening brace must have a closing brace, and every opening
          square bracket must have a closing square bracket. This often
          happens when copying only part of a file.
        </p>
        <ErrorExample
          wrong={`{
  "skills": ["JSON", "CSV"
}`}
          right={`{
  "skills": ["JSON", "CSV"]
}`}
        />

        <h2>7. Invalid Values</h2>
        <p>
          JSON only allows strings, numbers, true, false, null, objects, and
          arrays. Values like undefined or NaN are not allowed, and true,
          false, and null must be written in lowercase.
        </p>
        <ErrorExample
          wrong={`{
  "active": True,
  "score": NaN,
  "phone": undefined
}`}
          right={`{
  "active": true,
  "score": null,
  "phone": null
}`}
        />

        <h2>8. Unescaped Quotes and Backslashes</h2>
        <p>
          A double quote inside a text value must be written with a backslash
          before it, and a backslash itself must be written twice. Windows
          file paths are a very common cause of this error.
        </p>
        <ErrorExample
          wrong={`{
  "quote": "She said "hello"",
  "path": "C:\\new\\data.json"
}`}
          right={`{
  "quote": "She said \\"hello\\"",
  "path": "C:\\\\new\\\\data.json"
}`}
        />

        <h2>9. Numbers With Leading Zeros</h2>
        <p>
          Numbers in JSON cannot start with a zero, unless the number is
          exactly 0 or a decimal like 0.5. Store values such as ZIP codes or
          phone numbers as text instead.
        </p>
        <ErrorExample
          wrong={`{
  "code": 007
}`}
          right={`{
  "code": "007"
}`}
        />
        <h2>How to Find JSON Errors Quickly</h2>
        <ol>
          <li>Paste your data into the <a href="/json-validator">JSON Validator</a>.</li>
          <li>Read the line and column number of the error.</li>
          <li>Check the end of the line above as well, especially for missing commas.</li>
          <li>Fix the problem and validate again until the JSON is valid.</li>
          <li>Use the <a href="/">JSON Formatter</a> to make the result easy to read.</li>
        </ol>

        <h2>Frequently Asked Questions</h2>

        <h3>Why does the error point to the wrong line?</h3>
        <p>
          The parser only notices a problem when it reads something it does
          not expect. For a missing comma, that is usually the start of the
          next line, so the real mistake is often on the line before.
        </p>

        <h3>Is JSON the same as a JavaScript object?</h3>
        <p>
          No. JSON is stricter. It needs double quotes, does not allow
          comments or trailing commas, and only supports a few value types.
        </p>

        <h3>Can I convert fixed JSON to a spreadsheet?</h3>
        <p>
          Yes. Once your JSON is valid, use the{' '}
          <a href="/json-to-csv">JSON to CSV Converter</a> to open it in Excel
          or Google Sheets.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/json-viewer">JSON Viewer</a>{' | '}
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default JsonErrorsGuide