import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { Code } from './ArticlePage.jsx'

// Text → UTF-8 bytes → Base64 (works with emoji and every language).
function encodeBase64(text, urlSafe) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  const base64 = btoa(binary)
  return urlSafe ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : base64
}

// Base64 (normal or URL-safe) → text. Throws a friendly error if it is not Base64 text.
function decodeBase64(text) {
  const cleaned = text.trim().replace(/^data:[^,]*,/, '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error('This is not valid Base64. It may only contain letters, numbers, +, /, - , _ and = at the end.')
  }
  let binary
  try {
    binary = atob(cleaned + '==='.slice((cleaned.length + 3) % 4))
  } catch {
    throw new Error('This is not valid Base64. Please check that nothing is missing.')
  }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('The Base64 was decoded, but the result is a binary file (like an image), not text.')
  }
}

const SAMPLE = '{"name": "Emily Clark", "city": "London", "message": "Hello 👋"}'

function Base64Tool() {
  const [urlSafe, setUrlSafe] = useState(false)
  const [formatJson, setFormatJson] = useState(true)

  return (
    <ConverterPage
      h1="Base64 Encode & Decode Online"
      intro="Encode text or JSON to Base64, or decode Base64 back to readable text. Supports emoji and URL-safe Base64."
      inputTitle="Text Input"
      outputTitle="Result"
      inputIsJson={false}
      inputPlaceholder="Paste text to encode, or Base64 to decode..."
      sample={SAMPLE}
      outputType="plain"
      download={{ fileName: 'result.txt', mimeType: 'text/plain' }}
      actions={[
        {
          label: 'Encode',
          run: (text) => ({
            output: encodeBase64(text, urlSafe),
            type: 'plain',
            message: `Encoded to ${urlSafe ? 'URL-safe ' : ''}Base64.`,
          }),
        },
        {
          label: 'Decode',
          run: (text) => {
            const decoded = decodeBase64(text)
            if (formatJson) {
              try {
                const data = JSON.parse(decoded)
                if (data !== null && typeof data === 'object') {
                  return {
                    output: JSON.stringify(data, null, 2),
                    type: 'json',
                    message: 'Decoded from Base64. The result is JSON, so it was formatted.',
                  }
                }
              } catch {
                // Not JSON: show it as plain text.
              }
            }
            return { output: decoded, type: 'plain', message: 'Decoded from Base64.' }
          },
        },
      ]}
      options={
        <>
          <label className="option">
            <input type="checkbox" checked={urlSafe} onChange={(event) => setUrlSafe(event.target.checked)} />
            URL-safe Base64 (- and _ instead of + and /)
          </label>
          <label className="option">
            <input type="checkbox" checked={formatJson} onChange={(event) => setFormatJson(event.target.checked)} />
            Format decoded JSON
          </label>
        </>
      }
    >
      <section className="seo-content">
        <h2>What Is Base64 Encoding?</h2>
        <p>
          Base64 turns any data into plain text made of letters, numbers, + and
          /. It is used to send data safely in places that only accept text,
          such as JSON fields, URLs, HTTP headers (like Basic Auth), emails and
          data URLs. Decoding turns the Base64 back into the original text.
        </p>

        <h2>How to Encode or Decode Base64</h2>
        <ol>
          <li>Paste your text, JSON or Base64 into the box.</li>
          <li>Click Encode to make Base64, or Decode to read Base64.</li>
          <li>Click Copy or Download to save the result.</li>
        </ol>

        <h2>Features</h2>
        <ul>
          <li>Full UTF-8 support, so emoji and all languages work.</li>
          <li>URL-safe Base64 option for links and file names.</li>
          <li>Decodes Base64 with or without = padding, line breaks or a data: prefix.</li>
          <li>Formats the result automatically when the decoded text is JSON.</li>
          <li>Runs in your browser. Nothing is uploaded.</li>
        </ul>

        <h2>Examples</h2>
        <Code label="Text → Base64">{`Hello, World!   →   SGVsbG8sIFdvcmxkIQ==
Café ☕          →   Q2Fmw6kg4piV
user:pass123    →   dXNlcjpwYXNzMTIz`}</Code>
        <p>
          The last one is what a browser sends in a Basic Auth header:
          <code> Authorization: Basic dXNlcjpwYXNzMTIz</code>. Anyone can decode
          it, which is why Basic Auth must only be used over HTTPS.
        </p>

        <h2>Base64 Is Not Encryption</h2>
        <p>
          Base64 only changes how data looks; it does not hide it. Anyone can
          decode it in one click, so never use Base64 to protect passwords, API
          keys or personal data. To keep data secret, use real encryption, and
          to store passwords, use a password hashing function such as bcrypt
          or Argon2.
        </p>

        <h2>Standard vs URL-safe Base64</h2>
        <p>
          Standard Base64 uses <code>+</code> and <code>/</code>, which have a
          special meaning in URLs. URL-safe Base64 replaces them with
          <code> -</code> and <code>_</code> and usually drops the <code>=</code> padding.
          For example, the text <code>??&gt;&gt;</code> becomes <code>Pz8+Pg==</code> in
          standard Base64 and <code>Pz8-Pg</code> in URL-safe Base64. JWT tokens use
          URL-safe Base64; you can read one with the <a href="/jwt-decoder">JWT Decoder</a>.
        </p>

        <h2>Why Is Base64 Bigger?</h2>
        <p>
          Base64 turns every 3 bytes into 4 characters, so encoded data is about
          33% larger than the original. That is fine for small values, but
          avoid embedding large images or files as Base64 in JSON or HTML when
          a normal file link would work.
        </p>

        <h2>Base64 in Code</h2>
        <Code label="JavaScript (UTF-8 safe)">{`const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(text)))
const decoded = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)))`}</Code>
        <Code label="Python">{`import base64
encoded = base64.b64encode(text.encode("utf-8")).decode("ascii")
decoded = base64.b64decode(encoded).decode("utf-8")`}</Code>
        <p>
          Plain <code>btoa(text)</code> fails with an error on emoji and letters
          like é, which is why the example above encodes to UTF-8 first.
        </p>

        <FaqSection faqs={FAQS['base64-encode-decode']} />

        <RelatedTools
          links={[
            ['/url-encode-decode', 'URL Encode / Decode'],
            ['/json-escape', 'JSON Escape'],
            ['/', 'JSON Formatter'],
            ['/json-minifier', 'JSON Minifier'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default Base64Tool
