import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { parseJsonLenient } from './toolUtils.js'

const bytes = (text) => new TextEncoder().encode(text).length

function human(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

async function gzipSize(text) {
  if (typeof CompressionStream === 'undefined') return null
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  return (await new Response(stream).arrayBuffer()).byteLength
}

// Counts what the JSON is made of.
function countParts(value) {
  const counts = { objects: 0, arrays: 0, keys: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, depth: 0 }
  function walk(item, level) {
    if (level > counts.depth) counts.depth = level
    if (Array.isArray(item)) {
      counts.arrays++
      item.forEach((child) => walk(child, level + 1))
    } else if (item !== null && typeof item === 'object') {
      counts.objects++
      for (const [, child] of Object.entries(item)) {
        counts.keys++
        walk(child, level + 1)
      }
    } else if (typeof item === 'string') counts.strings++
    else if (typeof item === 'number') counts.numbers++
    else if (typeof item === 'boolean') counts.booleans++
    else counts.nulls++
  }
  walk(value, 0)
  return counts
}

async function measure(text) {
  const { data } = parseJsonLenient(text, 'JSON')
  const minified = JSON.stringify(data)
  const pretty = JSON.stringify(data, null, 2)
  const original = bytes(text)
  const min = bytes(minified)
  const gz = await gzipSize(minified)
  const c = countParts(data)

  const lines = [
    'SIZE',
    `  As pasted:            ${human(original)}  (${original.toLocaleString('en')} bytes)`,
    `  Minified:             ${human(min)}  (${Math.round((1 - min / original) * 100)}% smaller than pasted)`,
    `  Pretty (2 spaces):    ${human(bytes(pretty))}`,
    gz !== null ? `  Minified + gzip:      ${human(gz)}  (about what an API sends over the network)` : '',
    '',
    'CONTENT',
    `  Objects: ${c.objects}   Arrays: ${c.arrays}   Keys: ${c.keys}`,
    `  Strings: ${c.strings}   Numbers: ${c.numbers}   Booleans: ${c.booleans}   Nulls: ${c.nulls}`,
    `  Nesting depth: ${c.depth}`,
  ]

  // The biggest top-level parts, to see what makes the file large.
  if (data && typeof data === 'object') {
    const parts = Object.entries(data)
      .map(([key, value]) => [key, bytes(JSON.stringify(value))])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
    if (parts.length > 1) {
      lines.push('', Array.isArray(data) ? 'LARGEST ITEMS (minified)' : 'LARGEST TOP-LEVEL FIELDS (minified)')
      for (const [key, size] of parts) {
        const label = Array.isArray(data) ? `[${key}]` : `"${key}"`
        lines.push(`  ${label.padEnd(24)} ${human(size).padStart(10)}  ${Math.round((size / min) * 100)}%`)
      }
    }
  }
  return {
    output: lines.filter((line, index) => line !== '' || lines[index - 1] !== '').join('\n'),
    message: `Your JSON is ${human(original)}. Minified it would be ${human(min)}${gz !== null ? `, and about ${human(gz)} when gzipped` : ''}.`,
  }
}

const SAMPLE = JSON.stringify(
  {
    users: Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: ['Emily', 'James', 'Olivia', 'Harry', 'Amelia'][i], active: i % 2 === 0, tags: ['json', 'api'] })),
    settings: { theme: 'dark', language: 'en-GB', notifications: true },
    version: '2.4.1',
  },
  null,
  4
)

function JsonSizeCalculator() {
  return (
    <ConverterPage
      h1="JSON Size Calculator – Check JSON File Size"
      intro="See how big your JSON is in bytes and KB, how much smaller it gets when minified or gzipped, and which fields take the most space."
      inputTitle="JSON Input"
      outputTitle="Size Report"
      inputPlaceholder="Paste your JSON here, or drop a .json file..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'json-size-report.txt', mimeType: 'text/plain' }}
      actions={[{ label: 'Calculate Size', run: measure }]}
    >
      <section className="seo-content">
        <h2>What Is a JSON Size Calculator?</h2>
        <p>
          A JSON size calculator measures how many bytes your JSON takes. This
          matters for API limits, database fields, browser storage, message
          queues and page speed. It also shows how much you save by minifying
          and compressing, and which fields make the file big.
        </p>

        <h2>How to Check the Size of JSON</h2>
        <ol>
          <li>Paste your JSON, or drop a .json file on the box.</li>
          <li>Click Calculate Size, or press Ctrl + Enter.</li>
          <li>Read the size report: original, minified, gzipped and the largest fields.</li>
        </ol>

        <h2>Useful Size Limits</h2>
        <ul>
          <li>Many APIs and serverless functions limit request bodies to a few MB.</li>
          <li>Browser localStorage usually allows about 5 MB per site.</li>
          <li>Message queues and some databases limit single messages or documents (for example 256 KB or 16 MB).</li>
        </ul>
        <p>Use the <a href="/json-minifier">JSON Minifier</a> to make your JSON smaller.</p>

        <h2>Why Characters and Bytes Differ</h2>
        <p>
          Sizes are measured in bytes of UTF-8 text, the same way files and
          network requests are counted. English letters and digits take 1 byte
          each, but many other characters take more: <code>é</code> takes 2 bytes,
          most Chinese, Arabic and Urdu letters take 2–3 bytes, and an emoji like
          😀 takes 4 bytes. That is why a short message can be bigger than it looks.
        </p>

        <h2>Ways to Make JSON Smaller</h2>
        <ul>
          <li><strong>Minify</strong> it: removing spaces and line breaks often saves 20–40% on formatted JSON.</li>
          <li><strong>Compress</strong> it: servers can send JSON with gzip or Brotli, which usually shrinks it by 70–90% because JSON repeats the same keys.</li>
          <li><strong>Remove unused fields</strong> from API responses, or let clients choose the fields they need.</li>
          <li><strong>Shorten repeated data:</strong> send IDs instead of full nested objects when the client already has them.</li>
          <li><strong>Paginate</strong> long lists instead of sending everything at once.</li>
        </ul>
        <p>
          To find which part of your data is the biggest, open it in the
          <a href="/json-viewer"> JSON Viewer</a>: the item counts on each branch show
          where the bulk is.
        </p>

        <FaqSection faqs={FAQS['json-size-calculator']} />

        <RelatedTools
          links={[
            ['/json-minifier', 'JSON Minifier'],
            ['/', 'JSON Formatter'],
            ['/json-viewer', 'JSON Viewer'],
            ['/json-path', 'JSONPath Tester'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonSizeCalculator
