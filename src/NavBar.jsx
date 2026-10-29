const links = [
  ['/', 'JSON Formatter'],
  ['/json-validator', 'JSON Validator'],
  ['/json-to-csv', 'JSON to CSV'],
  ['/csv-to-json', 'CSV to JSON'],
  ['/about', 'About'],
]

function NavBar() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'

  return (
    <nav className="site-nav" aria-label="Tools">
      {links.map(([href, label]) => (
        <a
          key={href}
          href={href}
          className={path === href ? 'active' : undefined}
          aria-current={path === href ? 'page' : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}

export default NavBar