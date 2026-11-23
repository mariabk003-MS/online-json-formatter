import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'
import { parseJsonLenient } from './toolUtils.js'
import { jsonToPhpArray, jsonToPhpClasses } from './phpGen.js'

const SAMPLE = JSON.stringify(
  { order_id: 'A-2045', total: 89.97, paid: true, note: null, customer: { name: "James O'Brien", email: 'james@example.com' }, items: [{ sku: 'KB-01', qty: 1, price: 59.99 }, { sku: 'MS-02', qty: 2, price: 14.99, gift: true }] },
  null,
  2
)

function JsonToPhp() {
  const [mode, setMode] = useState('array')
  const [syntax, setSyntax] = useState('short')
  const [name, setName] = useState('order')

  return (
    <ConverterPage
      h1="JSON to PHP Array and Class Converter"
      intro="Convert JSON to a PHP array literal with correct escaping, or to PHP 8 classes with typed properties and a fromArray() method. Runs in your browser, so your data is never uploaded."
      inputTitle="JSON Input"
      outputTitle="PHP"
      inputPlaceholder="Paste a sample of your JSON here, for example an API response..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: mode === 'array' ? 'data.php' : `${(name || 'Root').replace(/^./, (c) => c.toUpperCase())}.php`, mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Convert to PHP',
          run: (text) => {
            const { data } = parseJsonLenient(text, 'JSON')
            if (mode === 'array') {
              return { output: jsonToPhpArray(data, { variable: name, long: syntax === 'long' }), message: 'Converted to a PHP array.' }
            }
            const output = jsonToPhpClasses(data, name)
            const count = (output.match(/^final class /gm) || []).length
            return { output, message: count ? `Generated ${count} PHP class${count === 1 ? '' : 'es'}.` : 'No classes needed for this JSON.' }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            Output
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              <option value="array">PHP array</option>
              <option value="classes">PHP 8 classes</option>
            </select>
          </label>
          {mode === 'array' ? (
            <>
              <label className="option">
                Variable
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="option">
                Syntax
                <select value={syntax} onChange={(event) => setSyntax(event.target.value)}>
                  <option value="short">[ ] short</option>
                  <option value="long">array( ) long</option>
                </select>
              </label>
            </>
          ) : (
            <label className="option">
              Class name
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          )}
        </>
      }
    >
      <section className="seo-content">
        <h2>What Does This Converter Do?</h2>
        <p>
          PHP works with JSON as arrays: <code>json_decode($json, true)</code> turns it into nested
          associative arrays. This tool writes that structure as PHP code, which is handy for
          config files, test fixtures, seeders and hard-coded data. It can also generate typed
          PHP 8 classes, so your code gets autocompletion and type checks instead of string keys.
        </p>

        <h2>How to Convert JSON to PHP</h2>
        <ol>
          <li>Paste your JSON, or drop a .json file on the box.</li>
          <li>Choose PHP array or PHP 8 classes, and a variable or class name.</li>
          <li>Click Convert to PHP, or press Ctrl + Enter.</li>
          <li>Copy the code, or download it as a .php file.</li>
        </ol>

        <h2>Example: PHP Array</h2>
        <Code label="JSON">{`{
  "order_id": "A-2045",
  "total": 89.97,
  "paid": true,
  "note": null,
  "customer": { "name": "James O'Brien" },
  "tags": ["new", "vip"]
}`}</Code>
        <Code label="PHP">{`<?php

$order = [
    'order_id' => 'A-2045',
    'total' => 89.97,
    'paid' => true,
    'note' => null,
    'customer' => [
        'name' => 'James O\\'Brien',
    ],
    'tags' => [
        'new',
        'vip',
    ],
];`}</Code>
        <p>
          JSON objects become associative arrays with <code>=&gt;</code>, JSON arrays become lists,
          and <code>true</code>, <code>false</code> and <code>null</code> stay as they are. The apostrophe
          in <code>O&apos;Brien</code> is escaped so the string stays valid.
        </p>

        <h2>How Strings Are Escaped</h2>
        <table>
          <thead>
            <tr><th>Text</th><th>PHP</th><th>Why</th></tr>
          </thead>
          <tbody>
            <tr><td><code>it&apos;s</code></td><td><code>&apos;it\&apos;s&apos;</code></td><td>Single quotes need <code>\&apos;</code></td></tr>
            <tr><td><code>C:\new\folder</code></td><td><code>&apos;C:\\new\\folder&apos;</code></td><td>Every backslash is doubled, so it never starts an escape</td></tr>
            <tr><td><code>price $5</code></td><td><code>&apos;price $5&apos;</code></td><td>Single quotes do not replace <code>$</code> variables</td></tr>
            <tr><td>Text with a line break</td><td><code>&quot;line1\nline2&quot;</code></td><td>Double quotes are used only when needed, with <code>$</code> written as <code>\$</code></td></tr>
          </tbody>
        </table>
        <p>
          Every escape was checked by decoding the PHP literal again and comparing it with the
          original text, including backslashes, quotes, <code>$</code>, tabs, emoji and control characters.
        </p>

        <h2>PHP 8 Classes</h2>
        <p>
          Choose <strong>PHP 8 classes</strong> to get one <code>final class</code> per object, with
          constructor property promotion, typed properties (<code>string</code>, <code>int</code>,
          <code>float</code>, <code>bool</code>, nullable <code>?</code> types, nested classes) and a
          <code> fromArray()</code> factory that maps snake_case keys to camelCase properties:
        </p>
        <Code label="Usage">{`$data = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
$order = Order::fromArray($data);

echo $order->customer->name;   // James O'Brien`}</Code>
        <p>
          The classes use named arguments and promoted properties, so they need PHP 8.0 or newer.
          Arrays of objects are mapped with <code>array_map</code>, and a docblock such as
          <code> /** @var Item[] */</code> tells your IDE what the array holds. Values whose type the
          sample does not show become <code>mixed</code>.
        </p>

        <h2>Tips</h2>
        <ul>
          <li><strong>Number-like keys:</strong> PHP turns array keys such as <code>&apos;1&apos;</code> into the integer <code>1</code>. That is normal PHP behaviour and usually harmless.</li>
          <li><strong>Back to JSON:</strong> <code>json_encode($order, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)</code> turns the array back into readable JSON.</li>
          <li><strong>Broken JSON?</strong> <code>json_decode</code> returns <code>null</code> on invalid JSON unless you pass <code>JSON_THROW_ON_ERROR</code>. Check the input in the <a href="/json-validator">JSON Validator</a> or fix it with <a href="/json-repair">JSON Repair</a>.</li>
        </ul>
        <p>
          Your JSON never leaves your browser. Need another language? Try
          <a href="/json-to-typescript"> JSON to TypeScript</a>, <a href="/json-to-java">JSON to Java</a> or
          <a href="/json-to-python"> JSON to Python</a>.
        </p>

        <FaqSection faqs={FAQS['json-to-php']} />

        <RelatedTools
          links={[
            ['/json-to-typescript', 'JSON to TypeScript'],
            ['/json-to-java', 'JSON to Java'],
            ['/json-to-sql', 'JSON to SQL'],
            ['/json-escape', 'JSON Escape'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JsonToPhp
