import { NavLink } from 'react-router-dom'
import { useLibrary } from '../hooks/useLibrary'

export function Header() {
  const { entries } = useLibrary()
  const savedCount = Object.keys(entries).length

  return (
    <header className="site-header">
      <div className="header-inner">
        <NavLink className="brand" to="/" aria-label="Read Manga home">
          <span className="brand-mark" aria-hidden="true">読</span>
          <span>Read Manga</span>
        </NavLink>
        <nav aria-label="Primary navigation">
          <NavLink to="/">Discover</NavLink>
          <NavLink to="/library">Library{savedCount > 0 ? <span className="library-count">{savedCount}</span> : null}</NavLink>
        </nav>
      </div>
    </header>
  )
}
