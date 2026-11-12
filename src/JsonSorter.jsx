import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'

const compareText = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })

// Sorts the keys of every object. Arrays keep their order unless sortArrays is on
// (then only arrays of plain text/numbers are sorted).
function sortJson(value, descending, sortArrays) {
  if (Array.isArray(value)) {
    const items = value.map((item) => sortJson(item, descending, sortArrays))
    const simple = items.every((item) => typeof item === 'string' || typeof item === 'number')
    if (sortArrays && simple) {
      items.sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b : compareText(String(a), String(b))
      )
      if (descending) items.reverse()
    }
    return items
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort(compareText)
    if (descending) keys.reverse()
    const sorted = {}
    for (const key of keys) sorted[key] = sortJson(value[key], descending, sortArrays)
    return sorted
  }
  return value
}

const SAMPLE = JSON.stringify(
  {
    name: 'Emily Clark',
    id: 1024,
    tags: ['react', 'api', 'json'],
    address: { postcode: 'SW1A 1AA', city: 'London', country: 'United Kingdom' },
    email: 'emily.clark@example.com',
    active: true,
  },
  null,
  2
)

function JsonSorter() {
  const [order, setOrder] = useState('asc')
  const [sortArrays, setSortArrays] = useState(false)

  return (
    <ConverterPage
      h1="JSON Sorter – Sort JSON Keys Online"
      intro="Sort the keys of your JSON from A to Z or Z to A, at every level. Great for comparing and reviewing JSON."
      inputTitle="JSON Input"
      outputTitle="Sorted JSON"
      inputPlaceholder="Paste your JSON here, or drop a .json file..."
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'sorted.json', mimeType: 'application/json' }}
      actions={[
        {
          label: 'Sort JSON',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            return {
              output: JSON.stringify(sortJson(data, order === 'desc', sortArrays), null, 2),
              message: `Keys sorted ${order === 'desc' ? 'Z to A' : 'A to Z'} at every level.`,
            }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Order
            <select value={order} onChange={(event) => setOrder(event.target.value)}>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
            </select>
          </label>
          <label className="option">
            <input
              type="checkbox"
              checked={sortArrays}
              onChange={(event) => setSortArrays(event.target.checked)}
            />
            Also sort simple arrays (text / numbers)
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is a JSON Sorter?</h2>
        <p>
          A JSON sorter puts the keys of every object in alphabetical order.
          Sorted JSON is easier to read, makes changes easy to spot in Git, and
          gives you the same key order every time, which is perfect before
          comparing two files.
        </p>

        <h2>How to Sort JSON</h2>
        <ol>
          <li>Paste your JSON, click Upload, or drop a .json file on the box.</li>
          <li>Choose A to Z or Z to A.</li>
          <li>Click Sort JSON, or press Ctrl + Enter.</li>
          <li>Click Copy or Download to save the sorted JSON.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Sorts keys at every level, including objects inside arrays.</li>
          <li>Natural order, so &quot;item2&quot; comes before &quot;item10&quot;.</li>
          <li>Keeps array order, with an option to sort simple arrays too.</li>
          <li>Fixes small JSON mistakes automatically before sorting.</li>
          <li>Runs in your browser. Your JSON is never uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="Before">{`{ "zip": "SW1A", "item10": 1, "Name": "Emily", "item2": 2, "age": 30 }`}</Code>
        <Code label="After (A to Z)">{`{
  "age": 30,
  "item2": 2,
  "item10": 1,
  "Name": "Emily",
  "zip": "SW1A"
}`}</Code>
        <p>
          Sorting ignores upper and lower case, so <code>Name</code> sits between
          <code> item10</code> and <code>zip</code>, and numbers inside keys are
          compared as numbers, so <code>item2</code> comes before <code>item10</code>.
        </p>

        <h2>Why Sort JSON Keys?</h2>
        <ul>
          <li><strong>Cleaner Git diffs:</strong> when every file uses the same key order, a diff only shows real changes, not keys that moved around.</li>
          <li><strong>Easier comparing:</strong> sort two files before comparing them by eye. (The <a href="/json-compare">JSON Compare</a> tool already ignores key order.)</li>
          <li><strong>Finding keys fast:</strong> in a config with dozens of settings, alphabetical order makes each one easy to find.</li>
          <li><strong>Translation files:</strong> keeping language files like en.json and de.json in the same order makes missing keys obvious.</li>
        </ul>

        <h2>Does Key Order Matter in JSON?</h2>
        <p>
          No. The JSON standard says an object is an unordered set of keys, so
          sorting never changes what the data means. Array order is different:
          <code> [1, 2, 3]</code> and <code>[3, 2, 1]</code> are different values, which
          is why arrays keep their order unless you turn on sorting for simple
          arrays.
        </p>
        <Code label="Sort keys in code">{`json.dumps(data, sort_keys=True, indent=2)   # Python, every level
jq -S . data.json                            # command line, every level`}</Code>

        <FaqSection faqs={FAQS['json-sorter']} />

        <RelatedTools
          links={[
            ['/json-compare', 'JSON Compare'],
            ['/', 'JSON Formatter'],
            ['/json-minifier', 'JSON Minifier'],
            ['/json-viewer', 'JSON Viewer'],
            ['/pretty-print-json', 'How to Pretty Print JSON'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonSorter
