import { useState, useEffect, useRef } from 'react'
import './NavBar.css'

const items = [
  { href: '/', label: 'JSON Formatter' },
  { href: '/json-viewer', label: 'JSON Viewer' },
  { href: '/json-validator', label: 'JSON Validator' },
  {
    label: 'Converters',
    children: [
      { href: '/json-to-csv', label: 'JSON to CSV' },
      { href: '/csv-to-json', label: 'CSV to JSON' },
      { href: '/json-to-xml', label: 'JSON to XML' },
    ],
  },
  {
    label: 'Guides',
    children: [
      { href: '/what-is-json', label: 'What Is JSON?' },
      { href: '/how-to-open-json-file', label: 'How to Open a JSON File' },
      { href: '/common-json-errors', label: 'Common JSON Errors' },
    ],
  },
  { href: '/about', label: 'About' },
]

function NavBar() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const [openMenu, setOpenMenu] = useState(null)
  const navRef = useRef(null)

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
          </div>
        )
      })}
    </nav>
  )
}

export default NavBar