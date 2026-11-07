import { useState, useEffect, useRef } from 'react'
import './NavBar.css'
import { TOOL_GROUPS, GUIDES } from './toolsList.js'

// The "More Tools" menu shows the Convert / Compare / Clean up groups in columns.
const moreToolGroups = TOOL_GROUPS.filter((group) => group.title !== 'Format & check')

const items = [
  { href: '/', label: 'JSON Formatter' },
  { href: '/json-viewer', label: 'JSON Viewer' },
  { href: '/json-validator', label: 'JSON Validator' },
  { href: '/json-compare', label: 'JSON Compare' },
  {
    label: 'More Tools',
    groups: moreToolGroups,
    children: [...moreToolGroups.flatMap((group) => group.tools), { href: '/tools', label: 'All tools' }],
  },
  { label: 'Guides', children: GUIDES },
  { href: '/about', label: 'About' },
]

// Light or dark: the saved choice, else the computer's setting.
function getStartTheme() {
  let saved = ''
  try {
    saved = localStorage.getItem('theme') || ''
  } catch {
    // Storage can be blocked (private window). Then we just use the default.
  }
  const theme =
    saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
  // Set it right away, so the page does not flash light before turning dark.
  document.body.classList.toggle('dark', theme === 'dark')
  return theme
}

function NavBar() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const [openMenu, setOpenMenu] = useState(null)
  const [theme, setTheme] = useState(getStartTheme)
  const [mobileOpen, setMobileOpen] = useState(false) // ☰ menu on phones
  const navRef = useRef(null)

  // Dark mode for every page: a class on <body> switches the colors.
  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Storage can be blocked. Dark mode still works until the page is closed.
    }
  }, [theme])

  // Close the open list when clicking outside the menu or pressing Escape.
  useEffect(() => {
    function handleClick(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null)
      }
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <header className={'site-header' + (mobileOpen ? ' menu-open' : '')}>
    <a href="/" className="brand" aria-label="Online JSON Formatter home">
      <span className="brand-mark" aria-hidden="true">{'{ }'}</span>
      <span className="brand-name">
        Online<span className="brand-accent">JSON</span>
      </span>
    </a>
    <nav className="site-nav" aria-label="Main" ref={navRef}>
      {items.map((item) => {
        if (!item.children) {
          const active = path === item.href
          return (
            <a
              key={item.href}
              href={item.href}
              className={active ? 'active' : undefined}
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </a>
          )
        }

        const groupActive = item.children.some((child) => child.href === path)
        const isOpen = openMenu === item.label

        return (
          <div
            key={item.label}
            className={'nav-group' + (isOpen ? ' is-open' : '')}
          >
            <button
              type="button"
              className={'nav-group-button' + (groupActive ? ' active' : '')}
              aria-expanded={isOpen}
              onClick={() => setOpenMenu(isOpen ? null : item.label)}
            >
              {item.label} <span aria-hidden="true">▾</span>
            </button>
            {item.groups ? (
              <div className="nav-dropdown nav-mega">
                <div className="nav-mega-columns">
                  {item.groups.map((group) => (
                    <div key={group.title} className="nav-mega-column">
                      <p className="nav-mega-title">{group.title}</p>
                      {group.tools.map((tool) => (
                        <a
                          key={tool.href}
                          href={tool.href}
                          className={path === tool.href ? 'active' : undefined}
                          aria-current={path === tool.href ? 'page' : undefined}
                        >
                          {tool.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
                <a href="/tools" className="nav-mega-all">All tools →</a>
              </div>
            ) : (
            <div className="nav-dropdown">
              {item.children.map((child) => {
                const active = path === child.href
                return (
                  <a
                    key={child.href}
                    href={child.href}
                    className={active ? 'active' : undefined}
                    aria-current={active ? 'page' : undefined}
                  >
                    {child.label}
                  </a>
                )
              })}
            </div>
            )}
          </div>
        )
      })}
    </nav>
    <button
      type="button"
      className="menu-button"
      onClick={() => setMobileOpen(!mobileOpen)}
      aria-expanded={mobileOpen}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
    >
      {mobileOpen ? '✕' : '☰'}
    </button>
    <button
      type="button"
      className="theme-switch"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
    </header>
  )
}

export default NavBar