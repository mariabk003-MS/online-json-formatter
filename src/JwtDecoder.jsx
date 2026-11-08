import ConverterPage from './ConverterPage.jsx'
import { FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'

// Base64url → text (JWT parts use URL-safe Base64 without padding).
function decodePart(part, name) {
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64 + '==='.slice((base64.length + 3) % 4))
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new Error(`The ${name} of this token could not be decoded. Please check that the whole token was copied.`)
  }
}

function describeTime(seconds) {
  if (typeof seconds !== 'number') return null
  const date = new Date(seconds * 1000)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().replace('.000Z', 'Z')
}

function timeFromNow(seconds) {
  const diff = Math.round(seconds - Date.now() / 1000)
  const abs = Math.abs(diff)
  const text =
    abs < 3600 ? `${Math.round(abs / 60)} minutes` : abs < 172800 ? `${Math.round(abs / 3600)} hours` : `${Math.round(abs / 86400)} days`
  return diff >= 0 ? `in ${text}` : `${text} ago`
}

function decodeJwt(text) {
  const token = text.trim().replace(/^Bearer\s+/i, '')
  const parts = token.split('.')
  if (parts.length < 2 || parts.length > 3) {
    throw new Error('A JWT has 2 or 3 parts separated by dots (header.payload.signature). This text does not look like a JWT.')
  }
  const header = decodePart(parts[0], 'header')
  const payload = decodePart(parts[1], 'payload')

  const dates = {}
  for (const claim of ['exp', 'iat', 'nbf', 'auth_time']) {
    const readable = describeTime(payload[claim])
    if (readable) dates[claim] = readable
  }

  let status = 'This token has no expiry time (exp).'
  if (typeof payload.exp === 'number') {
    status =
      payload.exp * 1000 < Date.now()
        ? `⚠️ This token EXPIRED ${timeFromNow(payload.exp)} (${dates.exp}).`
        : `✓ This token is not expired. It expires ${timeFromNow(payload.exp)} (${dates.exp}).`
  }

  const result = { header, payload }
  if (Object.keys(dates).length) result.readable_dates = dates
  result.signature = parts[2] ? `${parts[2].slice(0, 16)}… (not verified)` : '(none)'
  return { output: JSON.stringify(result, null, 2), message: `Decoded. Algorithm: ${header.alg || 'unknown'}. ${status}` }
}

// A harmless example token (made up for this page, signature is not real).
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDI0IiwibmFtZSI6IkVtaWx5IENsYXJrIiwiZW1haWwiOiJlbWlseS5jbGFya0BleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjU2MDAwMCwiZXhwIjoxOTIwMzI2NDAwfQ.c2FtcGxlLXNpZ25hdHVyZS1ub3QtcmVhbA'

function JwtDecoder() {
  return (
    <ConverterPage
      h1="JWT Decoder – Decode JSON Web Tokens Online"
      intro="Paste a JWT to see its header and payload as readable JSON, with expiry dates in plain English. Decoding happens only in your browser."
      inputTitle="JWT Input"
      outputTitle="Decoded Token"
      inputIsJson={false}
      inputPlaceholder="Paste your JWT here (eyJhbGciOi...). A leading 'Bearer ' is removed automatically."
      inputAccept=".txt,text/plain"
      sample={SAMPLE}
      outputType="json"
      download={{ fileName: 'jwt.json', mimeType: 'application/json' }}
      actions={[{ label: 'Decode JWT', run: decodeJwt }]}
    >
      <section className="seo-content">
        <h2>What Is a JWT?</h2>
        <p>
          A JWT (JSON Web Token) is a short, signed piece of text used for
          logins and API access. It has three parts separated by dots: a
          header, a payload with the user&apos;s claims (like user id, role and
          expiry time) and a signature. The header and payload are just
          Base64url-encoded JSON, so anyone can read them.
        </p>

        <h2>How to Decode a JWT</h2>
        <ol>
          <li>Copy the token, for example from an Authorization header or your browser&apos;s storage.</li>
          <li>Paste it into the box and click Decode JWT, or press Ctrl + Enter.</li>
          <li>Read the header, payload and the expiry dates shown in plain English.</li>
        </ol>

        <h2>Common JWT Claims</h2>
        <ul>
          <li><strong>sub</strong>: the subject, usually the user id.</li>
          <li><strong>exp</strong>: expiry time. After this moment the token should be rejected.</li>
          <li><strong>iat</strong>: issued at, the time the token was created.</li>
          <li><strong>nbf</strong>: not before, the token is not valid before this time.</li>
          <li><strong>iss</strong> and <strong>aud</strong>: who issued the token and who it is for.</li>
        </ul>
        <p>
          <strong>Important:</strong> decoding is not the same as verifying. This
          tool does not check the signature, so never trust a token just because
          it decodes. Never share real tokens from production systems.
        </p>

        <FaqSection faqs={FAQS['jwt-decoder']} />

        <RelatedTools
          links={[
            ['/base64-encode-decode', 'Base64 Decode'],
            ['/', 'JSON Formatter'],
            ['/json-viewer', 'JSON Viewer'],
            ['/url-encode-decode', 'URL Decode'],
          ]}
        />
      </section>
    </ConverterPage>
  )
}

export default JwtDecoder
