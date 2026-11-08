// Footer with links to every tool and guide (used by the newer pages).
import { TOOL_GROUPS, GUIDES, DATASETS } from './toolsList.js'

function SiteFooter() {
  return (
    <footer className="site-footer site-footer-grid">
      {TOOL_GROUPS.map((group) => (
        <div key={group.title}>
          <h3>{group.title}</h3>
          {group.tools.map((tool) => (
            <a key={tool.href} href={tool.href}>{tool.label}</a>
          ))}
        </div>
      ))}
      <div>
        <h3>Guides</h3>
        {GUIDES.map((guide) => (
          <a key={guide.href} href={guide.href}>{guide.label}</a>
        ))}
      </div>
      <div>
        <h3>Datasets</h3>
        {DATASETS.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </div>
      <div>
        <h3>Site</h3>
        <a href="/tools">All Tools</a>
        <a href="/about">About</a>
        <a href="/privacy-policy">Privacy Policy</a>
      </div>
    </footer>
  )
}

export default SiteFooter
