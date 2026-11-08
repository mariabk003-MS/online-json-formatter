import { useState } from 'react'
import NavBar from './NavBar.jsx'
import SiteFooter from './SiteFooter.jsx'
import { FaqSection } from './ToolLayout.jsx'
import { FAQS } from './pageFaqs.js'
import { DATASET_CATALOG, DATASET_CATEGORIES } from './datasetCatalog.js'
import { formatSize, downloadText, makeShareCode } from './toolUtils.js'

function describe(dataset) {
  const { data } = dataset
  const records = Array.isArray(data) ? data.length : 1
  const sample = Array.isArray(data) ? data[0] : data
  const fields = sample && typeof sample === 'object' ? Object.keys(sample) : []
  const text = JSON.stringify(data, null, 2)
  return { records, fields, text }
}

function DatasetCard({ dataset }) {
  const { records, fields, text } = describe(dataset)
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

  // Opens the data in the JSON Formatter using a share link (nothing is uploaded).
  async function openInFormatter() {
    const code = await makeShareCode(text)
    window.open(`/#json=${code}`, '_blank', 'noopener')
  }

  return (
    <article className="dataset-card">
      <div className="dataset-card-top">
        <span className={`dataset-tag dataset-tag-${dataset.category.replace(/\s+/g, '-').toLowerCase()}`}>{dataset.category}</span>
        <span className="dataset-records">
          {records} {records === 1 ? 'record' : 'records'}
        </span>
      </div>
      <h3>{dataset.page ? <a href={dataset.page}>{dataset.title}</a> : dataset.title}</h3>
      <p>{dataset.description}</p>
      <p className="dataset-fields">
        <span>Fields:</span> {fields.slice(0, 4).join(', ')}
        {fields.length > 4 ? ` +${fields.length - 4} more` : ''}
      </p>
      <p className="dataset-size">
        {dataset.fileName} · {formatSize(text)}
      </p>
      <div className="dataset-actions">
        <button type="button" className="tool" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
        <button type="button" className="tool" onClick={openInFormatter} title="Open in the JSON Formatter">Open</button>
        <button type="button" className="tool" onClick={() => downloadText(text, dataset.fileName, 'application/json')}>
          Download
        </button>
      </div>
    </article>
  )
}

function DatasetsLibrary() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = DATASET_CATALOG.filter(
    (d) =>
      (category === 'All' || d.category === category) &&
      (!q || `${d.title} ${d.description} ${d.category}`.toLowerCase().includes(q))
  )
  const count = (name) => DATASET_CATALOG.filter((d) => d.category === name).length

  return (
    <div className="app tool-page">
      <NavBar />
      <h1>Free JSON Datasets</h1>
      <p>
        Ready-to-use JSON data for apps, tests and demos: countries, airports,
        currencies, colors, config templates and mock API data. Copy, open or download.
      </p>

      <div className="dataset-filters">
        <input
          type="search"
          className="dataset-search"
          placeholder="Search datasets…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search datasets"
        />
        <div className="dataset-chips" role="tablist" aria-label="Dataset categories">
          {['All', ...DATASET_CATEGORIES].map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={category === name}
              className={category === name ? 'dataset-chip active' : 'dataset-chip'}
              onClick={() => setCategory(name)}
            >
              {name} ({name === 'All' ? DATASET_CATALOG.length : count(name)})
            </button>
          ))}
        </div>
      </div>

      <div className="dataset-grid">
        {shown.map((dataset) => (
          <DatasetCard key={dataset.id} dataset={dataset} />
        ))}
      </div>
      {shown.length === 0 && <p className="hint-box">No datasets match “{query}”.</p>}

      <section className="seo-content">
        <h2>Free JSON Data for Developers</h2>
        <p>
          Every dataset on this page is free to use in your projects, tests,
          tutorials and prototypes. Reference data uses official codes such as
          ISO 3166 country codes, ISO 4217 currency codes, ISO 639-1 language
          codes and IATA airport codes. The mock API data is made up, so it is
          safe to use in demos and screenshots.
        </p>

        <h2>How to Use These Datasets</h2>
        <ol>
          <li>Find a dataset with the search box or the category buttons.</li>
          <li>Click Copy to put the JSON on your clipboard, or Download to save the .json file.</li>
          <li>Click Open to explore it in the JSON Formatter as code, a tree or a graph.</li>
          <li>Convert it with our tools, for example <a href="/json-to-csv">JSON to CSV</a>, <a href="/json-to-excel">JSON to Excel</a> or <a href="/json-to-typescript">JSON to TypeScript</a>.</li>
        </ol>

        <FaqSection faqs={FAQS.datasets} />
      </section>

      <SiteFooter />
    </div>
  )
}

export default DatasetsLibrary
