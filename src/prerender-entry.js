// Build-time only: turns each page into HTML text, so search engines and AI
// tools can read the page content without running JavaScript.
// Used by scripts/prerender.mjs after "vite build".
import { StrictMode, createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { ROUTES } from './routes.js'

export { ROUTES }

export function render(path) {
  const route = ROUTES.find(([routePath]) => routePath === path)
  if (!route) throw new Error(`No page for ${path}`)
  globalThis.__PRERENDER_PATH__ = path // NavBar uses this to mark the current page
  return renderToString(createElement(StrictMode, null, createElement(route[1])))
}
