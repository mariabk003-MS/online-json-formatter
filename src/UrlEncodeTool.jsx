import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'

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
