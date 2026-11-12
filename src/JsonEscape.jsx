import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'

// Turns any text into an escaped JSON string ("..." with \" \n \\ ...).
function escapeText(text, keepQuotes) {
  const escaped = JSON.stringify(text)
  return keepQuotes ? escaped : escaped.slice(1, -1)
}

// Turns an escaped string back into normal text. Works with or without outer quotes.
function unescapeText(text) {
  const trimmed = text.trim()
  const quoted = trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1
  try {
    const value = JSON.parse(quoted ? trimmed : `"${trimmed}"`)
    if (typeof value !== 'string') throw new Error('not a string')
    return value
  } catch {
    throw new Error(
      'This text could not be unescaped. Check for a lone backslash (\\) or an unescaped quote (").'
    )
  }
}

const SAMPLE = JSON.stringify(
  {
    name: 'Emily Clark',
    message: 'She said "Hello!"',
    path: 'C:\\Users\\Emily',
    tags: ['json', 'escape'],
  },
  null,
  2
)

function JsonEscape() {
  const [keepQuotes, setKeepQuotes] = useState(true)
  const [prettyResult, setPrettyResult] = useState(true)

  return (
    <ConverterPage
      h1="JSON Escape / Unescape Online"
      intro="Escape JSON into a safe string for code, APIs and config values, or unescape a JSON string back to normal JSON."
      inputTitle="Text Input"
      outputTitle="Result"
      inputIsJson={false}
      inputPlaceholder="Paste JSON to escape, or an escaped string to unescape..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'result.txt', mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Escape',
          run: (text) => ({
            output: escapeText(text, keepQuotes),
            type: 'plain',
            message: 'Escaped successfully! Quotes, backslashes and line breaks are now safe.',
          }),
        },
        {
          label: 'Unescape',
          run: (text) => {
            const value = unescapeText(text)
            // If the unescaped text is JSON, show it formatted and colored.
            if (prettyResult) {
              try {
                const data = JSON.parse(value)
                if (data !== null && typeof data === 'object') {
                  return {
                    output: JSON.stringify(data, null, 2),
                    type: 'json',
                    message: 'Unescaped successfully! The result is JSON, so it was formatted.',
                  }
                }
              } catch {
                // Not JSON: show the plain text below.
              }
            }
            return { output: value, type: 'plain', message: 'Unescaped successfully!' }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            <input
              type="checkbox"
              checked={keepQuotes}
              onChange={(event) => setKeepQuotes(event.target.checked)}
            />
            Add outer quotes when escaping
          </label>
          <label className="option">
            <input
              type="checkbox"
              checked={prettyResult}
              onChange={(event) => setPrettyResult(event.target.checked)}
            />
            Format the result if it is JSON
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is JSON Escaping?</h2>
        <p>
          Escaping JSON means turning it into one safe text string. Every
          double quote becomes \&quot;, every line break becomes \n, and every
          backslash becomes \\. You need escaped JSON when you store JSON inside
          another JSON value, put it in a code string, send it in an API field
          or save it in an environment variable.
        </p>

        <h2>How to Escape or Unescape JSON</h2>
        <ol>
          <li>Paste your JSON or text into the Text Input box.</li>
          <li>Click Escape to turn it into a string, or Unescape to turn a string back into JSON.</li>
          <li>Click Copy or Download to save the result.</li>
        </ol>

        <h2>Example</h2>
        <p>This JSON:</p>
        <pre className="result-output">{'{"message": "She said \\"Hi\\""}'}</pre>
        <p>escaped becomes:</p>
        <pre className="result-output">{'"{\\"message\\": \\"She said \\\\\\"Hi\\\\\\"\\"}"'}</pre>

        <h2>Features</h2>
        <ul>
          <li>Escapes quotes, backslashes, tabs, line breaks and other control characters.</li>
          <li>Unescapes strings with or without the outer quotes.</li>
          <li>Formats the result automatically when the unescaped text is JSON.</li>
          <li>Runs in your browser. Nothing is uploaded.</li>
        </ul>

        <h2>When You Need Escaped JSON</h2>
        <ul>
          <li><strong>JSON inside JSON:</strong> some APIs and message queues expect a field whose value is a JSON string, for example a <code>payload</code> or <code>metadata</code> field.</li>
          <li><strong>Code:</strong> putting a JSON example inside a JavaScript, Java or C# string.</li>
          <li><strong>Environment variables and CLI arguments:</strong> passing a JSON config on one line.</li>
          <li><strong>Databases and logs:</strong> some systems store JSON as escaped text in a single column or log line.</li>
        </ul>

        <h2>Escape and Unescape in Code</h2>
        <Code label="JavaScript">{String.raw`const obj = { user: 'Emily', note: 'Line 1\nLine 2' }

const escaped = JSON.stringify(JSON.stringify(obj))
// "{\"user\":\"Emily\",\"note\":\"Line 1\\nLine 2\"}"

const back = JSON.parse(JSON.parse(escaped))   // the original object`}</Code>
        <Code label="Python">{String.raw`import json
escaped = json.dumps(json.dumps(obj))
back = json.loads(json.loads(escaped))`}</Code>
        <p>
          Calling <code>JSON.stringify</code> twice is the trick: the first call
          turns the object into JSON text, the second turns that text into a
          string with every quote and backslash escaped.
        </p>

        <h2>Common Mistakes</h2>
        <ul>
          <li><strong>Double escaping:</strong> if you see <code>\\\&quot;</code> in your data, the JSON was escaped twice. Unescape it once more.</li>
          <li><strong>Escaping by hand:</strong> replacing quotes yourself easily misses backslashes, tabs or line breaks. Let a tool or <code>JSON.stringify</code> do it.</li>
          <li><strong>Using it for HTML or URLs:</strong> JSON escaping does not make text safe for HTML pages or links. For links, use <a href="/url-encode-decode">URL Encode</a>.</li>
        </ul>

        <FaqSection faqs={FAQS['json-escape']} />

        <RelatedTools
          links={[
            ['/', 'JSON Formatter'],
            ['/json-minifier', 'JSON Minifier'],
            ['/json-repair', 'JSON Repair'],
            ['/json-validator', 'JSON Validator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonEscape
