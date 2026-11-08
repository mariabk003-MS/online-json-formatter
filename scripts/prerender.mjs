// Runs after "vite build". Writes the full HTML of every page into dist/*.html,
// so Google, Bing and AI tools see the text, headings and FAQ straight away.
// The site looks and works the same: React takes over when the page loads.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const { render, PATHS } = await import(pathToFileURL(`${root}dist-ssr/prerender-entry.js`).href)

// Applies the saved dark mode before the page is shown, so dark mode users
// do not see a flash of the light theme while the page loads.
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
