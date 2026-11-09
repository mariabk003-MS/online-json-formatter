import { useEffect } from 'react'
import './App.css'
import './PrivacyPolicy.css'
import NavBar from './NavBar.jsx'

function PrivacyPolicy() {
  useEffect(() => {
    const oldTitle = document.title
    const meta = document.querySelector('meta[name="description"]')
    const oldDescription = meta ? meta.getAttribute('content') : ''
    const canonical = document.querySelector('link[rel="canonical"]')
    const oldCanonical = canonical ? canonical.getAttribute('href') : ''

    document.title = 'Privacy Policy - Online JSON Formatter'
    if (meta) {
      meta.setAttribute(
        'content',
        'Read the Privacy Policy of Online JSON Formatter. Your JSON data is processed in your browser and is not uploaded to our servers.'
      )
    }
    if (canonical) {
      canonical.setAttribute(
        'href',
        'https://online-json-formatter-ten.vercel.app/privacy-policy'
      )
    }

    return () => {
      document.title = oldTitle
      if (meta) meta.setAttribute('content', oldDescription)
      if (canonical) canonical.setAttribute('href', oldCanonical)
    }
  }, [])

  return (
    <>
      <NavBar />
      <main className="privacy-policy">
        <h1>Privacy Policy</h1>
        <p>Last updated: November 9, 2026</p>

        <h2>Your Privacy Matters</h2>
        <p>
          Online JSON Formatter helps you format and validate JSON data.
          We value your privacy and aim to keep your data safe.
        </p>

        <h2>How Your JSON Data Is Processed</h2>
        <p>
          JSON data you enter into the tool is processed directly in your
          browser. The tool is designed to format, validate, and correct
          supported JSON syntax issues without uploading your JSON content
          to our servers.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We do not ask you to provide an account or submit personal
          information to use the JSON formatting features. Our hosting
          provider or website analytics services, if enabled, may process
          basic technical information according to their own policies.
        </p>

        <h2>Cookies and Analytics</h2>
        <p>
          We use Vercel Web Analytics to count page visits, so we can see
          which tools are popular and improve the site. It does not use
          cookies and does not identify you personally. It records
          anonymous information such as the page visited, the referring
          website, the country, and the browser and device type.
        </p>
        <p>
          The JSON, CSV, XML, YAML or other text you type, paste or upload
          into our tools is never sent to Vercel Analytics or to any other
          service. It stays in your browser.
        </p>
        <p>
          We only store one small setting in your browser: your light or
          dark mode choice. You can clear it at any time in your browser
          settings.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          This website is hosted by Vercel. Its infrastructure may process
          technical information needed to deliver the website. Please review
          Vercel's privacy policy for details.
        </p>
        <p>
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            Vercel Privacy Policy
          </a>
        </p>

        <h2>Children's Privacy</h2>
        <p>
          This tool is intended for general use and does not knowingly
          request personal information from children.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this policy when our website or its services change.
          Please review this page periodically.
        </p>

        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please use the
          contact information provided on our website, if available.
        </p>

        <p>
          <a href="/">Back to Online JSON Formatter</a>
        </p>
      </main>
    </>
  )
}

export default PrivacyPolicy