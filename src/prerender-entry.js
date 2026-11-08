// Build-time only: turns each page into HTML text, so search engines and AI
// tools can read the page content without running JavaScript.
// Used by scripts/prerender.mjs after "vite build".
import { StrictMode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { PAGES } from './pages.js'

export const PATHS = Object.keys(PAGES)

export async function render(path) {
  const load = PAGES[path]
  if (!load) throw new Error(`No page for ${path}`)
  const { default: Page } = await load()
  globalThis.__PRERENDER_PATH__ = path // NavBar uses this to mark the current page
  return renderToString(createElement(StrictMode, null, createElement(Page)))
}
