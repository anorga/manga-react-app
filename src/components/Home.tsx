import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { manga } from '../data'

export function Home() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const results = manga.filter((item) =>
    `${item.title} ${item.genres.join(' ')}`.toLowerCase().includes(deferredQuery),
  )

  return (
    <>
      <section className="hero page-width">
        <p className="eyebrow">Your next obsession is waiting</p>
        <h1>Stories that stay<br />with you.</h1>
        <p className="hero-copy">Explore a hand-picked collection of unforgettable worlds, fierce heroes, and impossible choices.</p>
        <a className="primary-button" href="#library">Browse the collection <span aria-hidden="true">↓</span></a>
      </section>

      <section className="library page-width" id="library">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Curated library</p>
            <h2>Choose your story</h2>
          </div>
          <label className="search">
            <span className="sr-only">Search manga</span>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles or genres" />
          </label>
        </div>

        {results.length > 0 ? (
          <div className="manga-grid">
            {results.map((item) => (
              <Link className="manga-card" to={`/${item.slug}`} key={item.slug} style={{ '--accent': item.accent } as React.CSSProperties}>
                <div className="cover-wrap">
                  <img src={item.cover} alt="" />
                  <span className="card-number">{String(manga.indexOf(item) + 1).padStart(2, '0')}</span>
                  <span className="card-arrow" aria-hidden="true">↗</span>
                </div>
                <div className="card-copy">
                  <div className="card-meta"><span>{item.status}</span><span>25 chapters</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="genre-list">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state"><p>No stories found.</p><button onClick={() => setQuery('')}>Clear search</button></div>
        )}
      </section>
    </>
  )
}
