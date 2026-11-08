import { StrictMode, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// All site styles load with the page HTML (not later with each page's code),
// so the prerendered page never shows without its design.
import './App.css'
import './NavBar.css'
import './ToolPage.css'
import './JsonViewer.css'
import './PrivacyPolicy.css'
import { PAGES } from './pages.js'

// Each page's HTML is already written at build time (for Google and other
// search engines). Here we load only the code for the current page, then
// React takes over and makes it interactive.
const path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'
const loadPage = PAGES[path] || PAGES['/']

loadPage().then(({ default: Page }) => {
  createRoot(document.getElementById('root')).render(createElement(StrictMode, null, createElement(Page)))
})
