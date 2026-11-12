import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { queryJsonPath } from './jsonPath.js'

const SAMPLE = JSON.stringify(
  {
    store: {
      name: 'City Books',
      book: [
        { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
        { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99 },
        { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', isbn: '0-395-19395-8', price: 22.99 },
      ],
      bicycle: { color: 'red', price: 19.95 },
    },
  },
  null,
  2
)

const EXAMPLES = [
  ['$.store.book[*].title', 'All book titles'],
  ['$..price', 'Every price'],
  ['$.store.book[0]', 'First book'],
  ['$.store.book[-1].author', 'Author of the last book'],
  ['$..book[?(@.price < 10)].title', 'Books under 10'],
  ["$..book[?(@.category == 'fiction')].author", 'Fiction authors'],
  ['$..book[?(@.isbn)]', 'Books that have an ISBN'],
]

function JsonPathPage() {
  const [query, setQuery] = useState('$..book[?(@.price < 10)].title')
  const [showPaths, setShowPaths] = useState(false)

  return (
    <ConverterPage
      h1="JSONPath Tester – Query JSON Online"
      intro="Find values inside JSON with a JSONPath expression like $.store.book[*].title, with filters, wildcards and deep search."
      inputTitle="JSON Input"
      outputTitle="Matches"
      inputPlaceholder="Paste your JSON here, or click Sample to try the bookstore example..."
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'matches.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Run Query',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            const matches = queryJsonPath(data, query)
            const output = showPaths ? matches.map((m) => ({ path: m.path, value: m.value })) : matches.map((m) => m.value)
            return {
              output: JSON.stringify(output, null, 2),
              message: matches.length ? `${matches.length} match${matches.length === 1 ? '' : 'es'} found for ${query}` : `No matches for ${query}`,
            }
          },
        },
      ]}
      options={
        <>
          <label className="option option-wide">
            JSONPath
            <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} spellCheck={false} />
          </label>
          <label className="option">
            <input type="checkbox" checked={showPaths} onChange={(event) => setShowPaths(event.target.checked)} />
            Show paths
          </label>
          <span className="option-examples">
            Try:{' '}
            {EXAMPLES.slice(0, 4).map(([example, label]) => (
              <button key={example} type="button" className="tool" title={label} onClick={() => setQuery(example)}>
                {example}
              </button>
            ))}
          </span>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is JSONPath?</h2>
        <p>
          JSONPath is a small query language for JSON, like XPath is for XML. It
          lets you point at the exact values you need, for example every price
          in a big API response, without writing code. It is used in tools like
          Postman, Kubernetes (kubectl), AWS and many JSON libraries.
        </p>

        <h2>How to Use the JSONPath Tester</h2>
        <ol>
          <li>Paste your JSON, or click Sample for the bookstore example.</li>
          <li>Type a JSONPath expression, or click one of the examples.</li>
          <li>Click Run Query, or press Ctrl + Enter, to see every match.</li>
          <li>Turn on Show paths to see where each match is.</li>
        </ol>

        <h2>JSONPath Cheat Sheet</h2>
        <ul>
          <li><code>$</code> the root of the document</li>
          <li><code>.name</code> or <code>[&apos;name&apos;]</code> a child by name</li>
          <li><code>[0]</code>, <code>[-1]</code> an array item (first, last)</li>
          <li><code>[*]</code> or <code>.*</code> all children</li>
          <li><code>..name</code> search at every level</li>
          <li><code>[0,2]</code> several items, <code>[1:3]</code> a range</li>
          <li><code>[?(@.price &lt; 10)]</code> a filter; <code>@</code> is the current item</li>
        </ul>
        <h3>More examples</h3>
        <ul>
          {EXAMPLES.map(([example, label]) => (
            <li key={example}>
              <code>{example}</code>: {label}
            </li>
          ))}
        </ul>

        <h2>JSONPath Syntax Cheat Sheet</h2>
        <ul>
          <li><code>$</code>: the root of the document.</li>
          <li><code>.key</code> or <code>[&apos;key&apos;]</code>: a child by name. Use the bracket form for keys with spaces or dashes.</li>
          <li><code>[0]</code>: an array item by position (0 is the first); <code>[-1]</code> is the last.</li>
          <li><code>[*]</code>: every item or every child.</li>
          <li><code>..</code>: search at any depth, for example <code>$..price</code>.</li>
          <li><code>[0:2]</code>: a slice, the first two items.</li>
          <li><code>[?(@.price &lt; 10)]</code>: a filter; <code>@</code> is the current item.</li>
        </ul>

        <h2>Worked Example</h2>
        <Code label="JSON">{`{ "store": { "books": [
  { "title": "Learn JSON", "price": 12.99, "author": "Emily Clark" },
  { "title": "XML Basics", "price": 9.5, "author": "James Smith" },
  { "title": "APIs", "price": 15, "author": "Emily Clark" }
] } }`}</Code>
        <Code label="Queries and results">{`$.store.books[0].title                 →  "Learn JSON"
$.store.books[*].title                 →  "Learn JSON", "XML Basics", "APIs"
$..author                              →  "Emily Clark", "James Smith", "Emily Clark"
$.store.books[?(@.price < 13)].title   →  "Learn JSON", "XML Basics"`}</Code>

        <h2>Where JSONPath Is Used</h2>
        <ul>
          <li><strong>API testing</strong> in Postman, REST Assured and Karate to check values in responses.</li>
          <li><strong>Kubernetes:</strong> <code>kubectl get pods -o jsonpath=&apos;&#123;.items[*].metadata.name&#125;&apos;</code>.</li>
          <li><strong>Data pipelines and no-code tools</strong> that pick fields out of webhook payloads.</li>
          <li><strong>Databases:</strong> PostgreSQL, MySQL and SQL Server have JSON path functions to query JSON columns.</li>
        </ul>

        <FaqSection faqs={FAQS['json-path']} />

        <RelatedTools
          links={[
            ['/json-viewer', 'JSON Viewer'],
            ['/', 'JSON Formatter'],
            ['/json-compare', 'JSON Compare'],
            ['/json-schema-validator', 'JSON Schema Validator'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonPathPage
