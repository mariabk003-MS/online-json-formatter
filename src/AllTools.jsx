import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import { TOOL_GROUPS, GUIDES, DATASETS } from './toolsList.js'

function AllTools() {
  return (
    <div className="app tool-page">
      <NavBar />
      <h1>Free Online JSON Tools</h1>
      <p>
        Every tool you need to format, check, convert, compare and clean up
        JSON. Free, fast, no sign-up, and your data never leaves your browser.
      </p>

      {TOOL_GROUPS.map((group) => (
        <section key={group.title} className="tools-group">
          <h2>{group.title}</h2>
          <div className="tools-grid">
            {group.tools.map((tool) => (
              <a key={tool.href} href={tool.href} className="tool-card">
                <strong>{tool.label}</strong>
                <span>{tool.text}</span>
              </a>
            ))}
          </div>
        </section>
      ))}

      <section className="tools-group">
        <h2>Guides</h2>
        <div className="tools-grid">
          {GUIDES.map((guide) => (
            <a key={guide.href} href={guide.href} className="tool-card">
              <strong>{guide.label}</strong>
              <span>Read the guide →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="tools-group">
        <h2>Free JSON Datasets <a className="section-link" href="/datasets">See all →</a></h2>
        <div className="tools-grid">
          {DATASETS.filter((item) => item.href !== "/datasets").map((item) => (
            <a key={item.href} href={item.href} className="tool-card">
              <strong>{item.label}</strong>
              <span>{item.text}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="seo-content">
        <h2>Why Use These JSON Tools?</h2>
        <ul>
          <li>Private: every tool runs in your browser, so your JSON is never uploaded.</li>
          <li>Smart: common mistakes like missing commas and single quotes are fixed automatically.</li>
          <li>Fast: line numbers, live error checking, colored results and one-click copy or download.</li>
          <li>Free: no sign-up, no limits and no installation.</li>
        </ul>
      </section>

      <SiteFooter />
    </div>
  )
}

export default AllTools
