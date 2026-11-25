// Runs after "vite build". Writes the full HTML of every page into dist/*.html,
// so Google, Bing and AI tools see the text, headings and FAQ straight away.
// The site looks and works the same: React takes over when the page loads.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, PATHS } = await import(pathToFileURL(`${root}dist-ssr/prerender-entry.js`).href)

// Applies the saved dark mode before the page is shown, so dark mode users
// do not see a flash of the light theme while the page loads.
// If you change this script, update its sha256 hash in the Content-Security-Policy in vercel.json.
const themeScript =
  "<script>try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.body.classList.add('dark')}catch(e){}</script>"

// Lets browsers, feed readers and search engines find the updates feed.
const feedLink = '<link rel="alternate" type="application/atom+xml" title="OnlineJSON: new and updated tools" href="/feed.xml" />'

let count = 0
for (const path of PATHS) {
  const file = `${root}dist/${path === '/' ? 'index' : path.slice(1)}.html`
  let html = readFileSync(file, 'utf8')
  const shell = html.match(/<main id="root"( data-page="[^"]*")?><\/main>/)
  if (!shell) {
    throw new Error(`${file} has no empty <main id="root"></main> to fill`)
  }
  html = html
    .replace(shell[0], `<main id="root"${shell[1] || ''}>${await render(path)}</main>`)
    .replace('<body>', `<body>\n    ${themeScript}`)
    .replace('</head>', `  ${feedLink}\n  </head>`)
  writeFileSync(file, html)
  count++
}

rmSync(`${root}dist-ssr`, { recursive: true, force: true })
console.log(`Prerendered ${count} pages.`)

// llms.txt (https://llmstxt.org): a short Markdown map of the site for AI assistants.
// Built from the same lists as the menu, with each page's own meta description.
const { TOOL_GROUPS, GUIDES, DATASETS } = await import(pathToFileURL(`${root}src/toolsList.js`).href)
const site = 'https://online-json-formatter-ten.vercel.app'
const describe = (href) => {
  const html = readFileSync(`${root}dist/${href === '/' ? 'index' : href.slice(1)}.html`, 'utf8')
  const match = html.match(/name="description"\s+content="([^"]*)"/)
  return match ? match[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>') : ''
}
const line = ({ href, label }) => `- [${label.replace(' →', '')}](${site}${href}): ${describe(href)}`
const llms = [
  '# Online JSON Formatter',
  '',
  '> Free JSON tools that run entirely in the browser: format, validate, repair, compare and convert JSON, plus guides on JSON syntax and errors. No sign-up, and data is never uploaded.',
  '',
  ...TOOL_GROUPS.flatMap((group) => ['', `## Tools: ${group.title}`, '', ...group.tools.map(line)]),
  '',
  '## Guides',
  '',
  ...GUIDES.map(line),
  '',
  '## Datasets',
  '',
  ...DATASETS.map(line),
  '',
].join('\n').replace(/\n{3,}/g, '\n\n')
writeFileSync(`${root}dist/llms.txt`, llms)
console.log(`Wrote llms.txt with ${(llms.match(/^- \[/gm) || []).length} links.`)

// feed.xml: an Atom feed of the newest and most recently updated pages, built
// from the sitemap dates. The hub link lets us ping Google's WebSub hub after a deploy.
const sitemap = readFileSync(`${root}public/sitemap-final.xml`, 'utf8')
const xml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const unescapeHtml = (text) =>
  text.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
  .map(([, loc, lastmod]) => {
    const path = new URL(loc).pathname
    const html = readFileSync(`${root}dist/${path === '/' ? 'index' : path.slice(1)}.html`, 'utf8')
    const title = unescapeHtml(html.match(/<title>([^<]*)<\/title>/)[1])
    const summary = unescapeHtml(html.match(/name="description"\s+content="([^"]*)"/)?.[1] || '')
    return { loc, lastmod, title, summary }
  })
  .sort((a, b) => b.lastmod.localeCompare(a.lastmod) || a.loc.localeCompare(b.loc))
  .slice(0, 40)
const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>OnlineJSON: new and updated tools and guides</title>
  <subtitle>Free JSON tools that run in your browser.</subtitle>
  <link href="${site}/feed.xml" rel="self" type="application/atom+xml" />
  <link href="https://pubsubhubbub.appspot.com/" rel="hub" />
  <link href="${site}/" rel="alternate" type="text/html" />
  <id>${site}/</id>
  <updated>${entries[0].lastmod}T00:00:00Z</updated>
  <author><name>Online JSON Formatter</name></author>
${entries
  .map(
    (e) => `  <entry>
    <title>${xml(e.title)}</title>
    <link href="${e.loc}" />
    <id>${e.loc}</id>
    <updated>${e.lastmod}T00:00:00Z</updated>
    <summary>${xml(e.summary)}</summary>
  </entry>`
  )
  .join('\n')}
</feed>
`
writeFileSync(`${root}dist/feed.xml`, feed)
console.log(`Wrote feed.xml with ${entries.length} entries.`)
