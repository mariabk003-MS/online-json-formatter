// Shared layouts for Learn guides and Datasets pages.
import { useState } from 'react'
import './App.css'
import './ToolPage.css'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import JsonHighlight from './JsonHighlight.jsx'
import { JsonTreeView } from './JsonTree.jsx'
import { ToolPanel, Tool, Tabs, FaqSection, RelatedTools } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { formatSize, downloadText } from './toolUtils.js'

// A code example inside a guide. Write the code as a plain string.
export function Code({ children, label }) {
  return (
    <figure className="code-sample">
      {label && <figcaption>{label}</figcaption>}
      <pre className="result-output">{children}</pre>
    </figure>
  )
}

// A guide / tutorial page: heading, intro, article text, FAQ, related links.
export function ArticlePage({ h1, intro, updated, faqKey, related, children }) {
  return (
    <div className="app tool-page article-page">
      <NavBar />
      <h1>{h1}</h1>
      <p>{intro}</p>
      <article className="seo-content article-body">
        {updated && <p className="article-meta">Last updated: {updated}</p>}
        {children}
        {faqKey && FAQS[faqKey] && <FaqSection faqs={FAQS[faqKey]} />}
        {related && <RelatedTools links={related} />}
      </article>
      <SiteFooter />
    </div>
  )
}

// A dataset page: the JSON in a viewer with Copy / Download, then the explanation.
export function DatasetPage({ h1, intro, data, fileName, faqKey, related, children }) {
  const text = JSON.stringify(data, null, 2)
  const [view, setView] = useState('code')
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="app tool-page article-page">
      <NavBar />
      <h1>{h1}</h1>
      <p>{intro}</p>
      <ToolPanel
        title={fileName}
        tabs={
          <Tabs
            value={view}
            onChange={setView}
            options={[
              { value: 'code', label: 'Code' },
              { value: 'tree', label: 'Tree' },
            ]}
          />
        }
        tools={
          <>
            <Tool onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</Tool>
            <Tool onClick={() => downloadText(text, fileName, 'application/json')}>Download</Tool>
          </>
        }
        statusLeft={`${text.split('\n').length} lines`}
        statusRight={formatSize(text)}
      >
        {view === 'code' ? <JsonHighlight text={text} /> : <JsonTreeView data={data} />}
      </ToolPanel>
      <article className="seo-content article-body">
        {children}
        {faqKey && FAQS[faqKey] && <FaqSection faqs={FAQS[faqKey]} />}
        {related && <RelatedTools links={related} />}
      </article>
      <SiteFooter />
    </div>
  )
}
