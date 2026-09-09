import { Link, NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to="/" aria-label="Read Manga home">
          <span className="brand-mark" aria-hidden="true">読</span>
          <span>Read Manga</span>
        </NavLink>
        <nav aria-label="Primary navigation">
          <NavLink to="/">Discover</NavLink>
          <Link to="/#library">Library</Link>
        </nav>
      </div>
    </header>
  )
}
