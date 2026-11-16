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

let count = 0
for (const path of PATHS) {
  const file = `${root}dist/${path === '/' ? 'index' : path.slice(1)}.html`
  let html = readFileSync(file, 'utf8')
  if (!html.includes('<main id="root"></main>')) {
    throw new Error(`${file} has no empty <main id="root"></main> to fill`)
  }
  html = html
    .replace('<main id="root"></main>', `<main id="root">${await render(path)}</main>`)
    .replace('<body>', `<body>\n    ${themeScript}`)
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
