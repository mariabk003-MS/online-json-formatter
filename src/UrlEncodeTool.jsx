import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'

// Encodes every line on its own, so a list of values stays a list.
function encodeUrl(text, fullUrl) {
  return text
    .split('\n')
    .map((line) => (fullUrl ? encodeURI(line) : encodeURIComponent(line)))
    .join('\n')
}

function decodeUrl(text) {
  return text
    .split('\n')
    .map((line, index) => {
      try {
        return decodeURIComponent(line.replace(/\+/g, ' '))
      } catch {
        throw new Error(
          `Line ${index + 1} could not be decoded. It has a % that is not followed by two valid hex digits (like %20).`
        )
      }
    })
    .join('\n')
}

const SAMPLE = 'https://example.com/search?q=JSON formatter & validator&city=London&lang=en-GB'

function UrlEncodeTool() {
  const [fullUrl, setFullUrl] = useState(false)

  return (
    <ConverterPage
      h1="URL Encode & Decode Online"
      intro="Percent-encode text so it is safe to use in links and query strings, or decode %20-style text back to normal."
      inputTitle="Text Input"
      outputTitle="Result"
      inputIsJson={false}
      inputPlaceholder="Paste a URL or text to encode, or encoded text to decode..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'result.txt', mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Encode',
          run: (text) => ({
            output: encodeUrl(text, fullUrl),
            type: 'plain',
            message: fullUrl
              ? 'Encoded as a full URL (: / ? & = were kept).'
              : 'Encoded as a URL component (every special character was encoded).',
          }),
        },
        {
          label: 'Decode',
          run: (text) => ({ output: decodeUrl(text), type: 'plain', message: 'Decoded successfully.' }),
        },
      ]}
      options={
        <label className="option">
          <input type="checkbox" checked={fullUrl} onChange={(event) => setFullUrl(event.target.checked)} />
          Encode a full URL (keep : / ? &amp; =)
        </label>
      }
    >
      <section className="seo-content">
        <h2>What Is URL Encoding?</h2>
        <p>
          URL encoding, also called percent-encoding, replaces characters that
          are not allowed in a web address with a % followed by two hex digits.
          For example a space becomes %20 and &amp; becomes %26. This keeps
          links and query strings working, especially when they contain
          spaces, symbols, other languages or emoji.
        </p>

        <h2>How to Encode or Decode a URL</h2>
        <ol>
          <li>Paste a URL, a query value or encoded text into the box.</li>
          <li>Click Encode, or Decode to turn %20-style text back to normal.</li>
          <li>Turn on Encode a full URL to keep the parts that give a link its structure.</li>
          <li>Click Copy or Download to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Component mode for single values, full URL mode for whole links.</li>
          <li>Decodes + as a space, as in forms and query strings.</li>
          <li>Each line is handled on its own, so you can encode a list at once.</li>
          <li>Runs in your browser. Nothing is uploaded.</li>
        </ul>

        <h2>Example</h2>
        <Code label="Value → encoded">{`Café & Co / 50% off
→ Caf%C3%A9%20%26%20Co%20%2F%2050%25%20off`}</Code>
        <p>
          The letter é becomes two bytes in UTF-8, so it turns into
          <code> %C3%A9</code>. The space, &amp;, / and % are encoded too, because they
          would otherwise break the link or change its meaning.
        </p>

        <h2>Encode a Value or a Full URL?</h2>
        <p>
          This is the most common mistake. When you encode a <strong>single value</strong>,
          like a search term, every special character must be encoded. When you
          encode a <strong>full URL</strong>, the characters that give the link its
          structure, such as <code>:</code>, <code>/</code>, <code>?</code>, <code>&amp;</code> and
          <code> =</code>, must stay as they are.
        </p>
        <Code label="Full URL mode (encodeURI)">{`https://example.com/search?q=Caf%C3%A9%20&%20Co`}</Code>
        <Code label="Component mode (encodeURIComponent), wrong for a whole link">{`https%3A%2F%2Fexample.com%2Fsearch%3Fq%3DCaf%C3%A9%20%26%20Co`}</Code>
        <p>
          Notice that full URL mode left the <code>&amp;</code> alone, so the server
          would now read <code>Co</code> as a separate parameter. The right way is
          to encode each value on its own and then build the URL:
          <code> ?q=Caf%C3%A9%20%26%20Co</code>.
        </p>

        <h2>%20 or +?</h2>
        <p>
          Both can mean a space. <code>%20</code> works everywhere in a URL. The
          <code> +</code> sign means a space only in query strings and HTML form data.
          This tool decodes both.
        </p>

        <h2>URL Encoding in Code</h2>
        <Code label="JavaScript">{`encodeURIComponent('Café & Co')     // for one value
encodeURI('https://example.com/a b')  // for a whole URL
new URLSearchParams({ q: 'Café & Co' }).toString()   // q=Caf%C3%A9+%26+Co`}</Code>
        <Code label="Python">{`from urllib.parse import quote, urlencode
quote("Café & Co", safe="")      # one value
urlencode({"q": "Café & Co"})    # q=Caf%C3%A9+%26+Co`}</Code>

        <FaqSection faqs={FAQS['url-encode-decode']} />

        <RelatedTools
          links={[
            ['/base64-encode-decode', 'Base64 Encode / Decode'],
            ['/json-escape', 'JSON Escape'],
            ['/', 'JSON Formatter'],
            ['/text-compare', 'Text Compare'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default UrlEncodeTool
