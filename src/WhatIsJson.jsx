import './App.css'
import NavBar from './NavBar.jsx'

function WhatIsJson() {
  return (
    <div className="app">
      <NavBar />
      <h1>What Is JSON? A Beginner's Guide with Examples</h1>
      <p>
        Learn what JSON means, how it is written, and where it is used,
        explained in simple words.
      </p>

      <section className="seo-content">
        <p>Last updated: November 12, 2026</p>

        <h2>What Is JSON?</h2>
        <p>
          JSON is a simple text format for storing and sharing data. It is easy
          for people to read and easy for computers to process. Today, most
          websites, mobile apps, and APIs use JSON to send data from one place
          to another.
        </p>

        <h2>What Does JSON Stand For?</h2>
        <p>
          JSON stands for JavaScript Object Notation. The name comes from
          JavaScript because the format looks like the way JavaScript writes
          objects. But JSON is not only for JavaScript. Almost every
          programming language, including Python, Java, PHP, and C#, can read
          and write JSON.
        </p>

        <h2>A Simple JSON Example</h2>
        <p>Here is a small JSON object that describes a person:</p>
        <pre className="result-output">{`{
  "name": "Ayesha",
  "age": 25,
  "city": "Lahore",
  "isStudent": false,
  "skills": ["HTML", "CSS", "JSON"]
}`}</pre>
        <p>
          Each line has a key (like "name") and a value (like "Ayesha"). The
          key and value are separated by a colon, and each pair is separated by
          a comma. Paste this example into our{' '}
          <a href="/json-viewer">JSON Viewer</a> to see it as a tree.
        </p>

        <h2>JSON Syntax Rules</h2>
        <ul>
          <li>Data is written as key/value pairs, for example "city": "Lahore".</li>
          <li>Keys must always be in double quotes.</li>
          <li>Text values must use double quotes, not single quotes.</li>
          <li>Pairs are separated by commas, with no comma after the last item.</li>
          <li>Curly braces {'{ }'} hold objects.</li>
          <li>Square brackets [ ] hold arrays (lists).</li>
          <li>Comments are not allowed.</li>
        </ul>

        <h2>JSON Data Types</h2>
        <p>A JSON value can be one of six types:</p>
        <ul>
          <li><strong>String:</strong> text in double quotes, such as "Hello".</li>
          <li><strong>Number:</strong> whole or decimal numbers, such as 42 or 3.14, without quotes.</li>
          <li><strong>Boolean:</strong> true or false, written without quotes.</li>
          <li><strong>Null:</strong> an empty value, written as null.</li>
          <li><strong>Object:</strong> a group of key/value pairs inside {'{ }'}.</li>
          <li><strong>Array:</strong> an ordered list of values inside [ ].</li>
        </ul>

        <h2>Objects and Arrays Together (Nested JSON)</h2>
        <p>
          Real JSON data often puts objects inside arrays, and arrays inside
          objects. This is called nested JSON. Here is an order from an online
          shop:
        </p>
        <pre className="result-output">{`{
  "orderId": 1052,
  "customer": {
    "name": "Ali",
    "email": "ali@example.com"
  },
  "items": [
    { "product": "Keyboard", "price": 2500, "quantity": 1 },
    { "product": "Mouse", "price": 1200, "quantity": 2 }
  ],
  "paid": true
}`}</pre>
        <p>
          Here, "customer" is an object inside the order, and "items" is an
          array of objects. Our <a href="/">JSON Formatter</a> can make messy
          nested JSON like this easy to read.
        </p>

        <h2>Where Is JSON Used?</h2>
        <ul>
          <li>
            <strong>APIs:</strong> when an app asks a server for data, such as
            weather or prices, the answer usually comes back as JSON.
          </li>
          <li>
            <strong>Configuration files:</strong> many tools store settings in
            JSON files, such as package.json in JavaScript projects.
          </li>
          <li>
            <strong>Saving data:</strong> apps and some databases store records
            in JSON or a JSON-like format.
          </li>
          <li>
            <strong>Sharing data between systems:</strong> programs written in
            different languages can exchange data easily.
          </li>
        </ul>

        <h2>JSON vs XML</h2>
        <p>
          XML is an older format that also stores data, but it uses opening and
          closing tags, so the same data takes more space:
        </p>
        <pre className="result-output">{`JSON:  { "name": "Ali", "age": 30 }

XML:   <person><name>Ali</name><age>30</age></person>`}</pre>
        <p>
          JSON is shorter and easier to read, which is why most modern APIs
          prefer it. XML is still used in some older systems and documents. If
          you need XML, use our{' '}
          <a href="/json-to-xml">JSON to XML Converter</a>.
        </p>

        <h2>How to Open and Read a JSON File</h2>
        <p>
          A JSON file ends with .json. You can open it in any text editor, such
          as Notepad or VS Code. Large files are hard to read as plain text, so
          these tools can help:
        </p>
        <ol>
          <li>
            Paste the content into our <a href="/">JSON Formatter</a> to add
            clean indentation.
          </li>
          <li>
            Use the <a href="/json-viewer">JSON Viewer</a> to open and close
            sections like folders.
          </li>
          <li>
            Use the <a href="/json-to-csv">JSON to CSV Converter</a> to open the
            data in Excel or Google Sheets.
          </li>
        </ol>

        <h2>Common JSON Mistakes</h2>
        <p>
          Small mistakes make JSON invalid, such as a missing comma, single
          quotes, or a comma after the last item. If your JSON shows an error,
          paste it into our <a href="/json-validator">JSON Validator</a> to find
          the exact line, or read our{' '}
          <a href="/common-json-errors">Common JSON Errors guide</a> for
          examples and fixes.
        </p>

        <h2>Where to Go Next</h2>
        <ul>
          <li>Learn every rule in <a href="/json-syntax-rules">JSON Syntax Rules</a>.</li>
          <li>Use JSON in code: <a href="/javascript-json-parse">JSON.parse in JavaScript</a> or <a href="/json-in-python">JSON in Python</a>.</li>
          <li>Make messy JSON readable: <a href="/pretty-print-json">How to Pretty Print JSON</a>.</li>
          <li>Compare formats: <a href="/json-vs-yaml">JSON vs YAML</a> and <a href="/json-vs-xml">JSON vs XML</a>.</li>
          <li>Got an error? Read <a href="/unexpected-token-in-json">Unexpected Token in JSON</a>.</li>
          <li>Practice with real data from the <a href="/datasets">free JSON datasets</a>.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>

        <h3>Is JSON a programming language?</h3>
        <p>
          No. JSON is a data format, not a programming language. It only stores
          data. It cannot run code or do calculations.
        </p>

        <h3>Is JSON hard to learn?</h3>
        <p>
          No. Once you understand keys, values, objects, and arrays, you can
          read most JSON in a few minutes.
        </p>

        <h3>What is the difference between a JSON object and a JSON array?</h3>
        <p>
          An object stores named values inside {'{ }'}, like "name": "Ali". An
          array stores a list of values in order inside [ ], like ["red",
          "green"].
        </p>

        <h3>Can JSON store images?</h3>
        <p>
          Not directly. JSON stores text, numbers, true/false, and null. Images
          are usually stored as a link (URL) or as encoded text.
        </p>

        <h3>What is the file extension for JSON?</h3>
        <p>JSON files use the .json extension.</p>
      </section>

      <footer className="site-footer">
        <a href="/convert-json-to-excel">JSON to Excel</a>{' | '}
        <a href="/json-vs-xml">JSON vs XML</a>{' | '}
        <a href="/how-to-open-json-file">How to Open JSON</a>{' | '}
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-viewer">JSON Viewer</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/json-to-xml">JSON to XML</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/about">About</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default WhatIsJson