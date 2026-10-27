import './App.css'

function About() {
  return (
    <div className="app">
      <h1>About Online JSON Formatter</h1>
      <p>Free, fast, and private tools for working with JSON data.</p>

      <section className="seo-content">
        <h2>What Is Online JSON Formatter?</h2>
        <p>
          Online JSON Formatter is a free set of browser-based tools for
          formatting, validating, minifying, and converting JSON data. No
          sign-up is needed, and your data is never uploaded to a server.
        </p>

        <h2>Who Built This Site</h2>
        <p>
          Hi, I'm Maria. I am learning web development and search engine
          optimization (SEO), and this website is my hands-on project.
          Instead of only reading about how websites work, I decided to build
          a real tool that people can use every day.
        </p>

        <h2>Why I Built It</h2>
        <p>
          Many JSON tools are full of ads, slow, or confusing. My goal is to
          keep this site simple, fast, and private, so you can format or
          convert JSON in seconds.
        </p>

        <h2>How the Site Keeps Improving</h2>
        <p>
          Every feature here was added step by step: formatting, validation,
          minifying, file upload, and a JSON to CSV converter. I keep adding
          new tools and improving existing ones based on what users need.
        </p>

        <h2>Tools Available</h2>
        <ul>
          <li>
            <a href="/">JSON Formatter &amp; Validator</a>: format, validate,
            and minify JSON, with automatic trailing-comma fixes.
          </li>
          <li>
            <a href="/json-to-csv">JSON to CSV Converter</a>: turn JSON data
            into a CSV file for Excel or Google Sheets.
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
        <a href="/json-to-csv">JSON to CSV Converter</a>
        {' | '}
        <a href="/privacy-policy">Privacy Policy</a>
      </footer>
    </div>
  )
}

export default About