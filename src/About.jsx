import './App.css'
import NavBar from './NavBar.jsx'

function About() {
  return (
    <div className="app">
      <NavBar />
      <h1>About Online JSON Formatter</h1>
      <p>Free, fast, and private tools for working with JSON data.</p>

      <section className="seo-content">
        <h2>What Is Online JSON Formatter?</h2>
        <p>
          Online JSON Formatter is a free set of browser-based tools for
          formatting, viewing, validating, minifying, and converting JSON data.
          No sign-up is needed, and your data is never uploaded to a server.
        </p>

        <h2>Who Built This Site</h2>
        <p>
          Hi, I'm Maria. I created Online JSON Formatter after seeing how many
          JSON tools were slow, cluttered with ads, or hard to use. I build and
          improve each tool on this site myself, so you can format, validate,
          and convert JSON in seconds.
        </p>

        <h2>How the Site Keeps Improving</h2>
        <p>
          Every feature here was added step by step: formatting, validation,
          minifying, file upload, a tree viewer, and converters between JSON
          and CSV. I keep adding new tools and improving existing ones based
          on what users need.
        </p>

        <h2>Tools Available</h2>
        <ul>
          <li>
            <a href="/">JSON Formatter &amp; Validator</a>: format, validate,
            and minify JSON, with automatic trailing-comma fixes.
          </li>
          <li>
            <a href="/json-viewer">JSON Viewer</a>: explore JSON as a
            collapsible tree with colored values and item counts.
          </li>
          <li>
            <a href="/json-validator">JSON Validator</a>: find the exact line
            and column of any JSON error, with tips to fix it.
          </li>
          <li>
            <a href="/json-to-csv">JSON to CSV Converter</a>: turn JSON data
            into a CSV file for Excel or Google Sheets.
          </li>
          <li>
            <a href="/csv-to-json">CSV to JSON Converter</a>: turn spreadsheet
            data into clean JSON, with nested objects and real data types.
          </li>
          <li>
            <a href="/common-json-errors">Common JSON Errors Guide</a>: wrong
            and correct examples of the mistakes that break JSON.
          </li>
        </ul>

        <h2>Your Privacy</h2>
        <p>
          All JSON processing happens in your browser. Read our{' '}
          <a href="/privacy-policy">Privacy Policy</a> to learn more.
        </p>
      </section>

      <footer className="site-footer">
        <a href="/">JSON Formatter</a>
        {' | '}
        <a href="/json-viewer">JSON Viewer</a>
        {' | '}
        <a href="/json-validator">JSON Validator</a>
        {' | '}
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/csv-to-json">CSV to JSON Converter</a>
        {' | '}
        <a href="/common-json-errors">JSON Errors Guide</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default About