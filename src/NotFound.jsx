// Shown by Vercel for any address that does not exist (dist/404.html).
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import { TOOL_GROUPS, GUIDES } from './toolsList.js'

function NotFound() {
  return (
    <div className="app tool-page">
      <NavBar />
      <h1>Page Not Found</h1>
      <p>This page does not exist or has moved. Every tool on the site is listed below.</p>

      <section className="seo-content">
        <p>
          Looking for the JSON formatter? <a href="/">Open the JSON Formatter</a>. You can also
          see <a href="/tools">all tools on one page</a>.
        </p>
        {TOOL_GROUPS.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.tools.map((tool) => (
                <li key={tool.href}>
                  <a href={tool.href}>{tool.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <h2>Guides</h2>
        <ul>
          {GUIDES.map((guide) => (
            <li key={guide.href}>
              <a href={guide.href}>{guide.label.replace(' →', '')}</a>
            </li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </div>
  )
}

export default NotFound
