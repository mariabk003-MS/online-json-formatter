import { useState } from 'react'
import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'

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
