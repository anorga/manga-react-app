import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allGenres, manga } from '../data'
import { useLibrary } from '../hooks/useLibrary'
import { usePageMeta } from '../hooks/usePageMeta'

type Shelf = 'all' | 'saved' | 'reading'
type Sort = 'featured' | 'rating' | 'newest' | 'az'

function progressPct(current: number, total: number) {
  if (total <= 0) return 0
  return Math.min(100, Math.round((current / total) * 100))
}

export function Home() {
  const [query, setQuery] = useState('')
  const [shelf, setShelf] = useState<Shelf>('all')
  const [genre, setGenre] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('featured')
  const { entries, remove, save } = useLibrary()
  usePageMeta('Read Manga', 'Discover manga, save titles, and track your reading progress locally.')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const continueReading = useMemo(
    () =>
      manga
        .filter((item) => entries[item.slug]?.status === 'reading')
        .map((item) => ({ item, entry: entries[item.slug] }))
        .filter((pair) => pair.entry),
    [entries],
  )

  const results = useMemo(() => {
    const filtered = manga.filter((item) => {
      const entry = entries[item.slug]
      const matchesSearch = `${item.title} ${item.author} ${item.genres.join(' ')}`.toLowerCase().includes(deferredQuery)
      const matchesShelf = shelf === 'all' || (shelf === 'saved' ? Boolean(entry) : entry?.status === 'reading')
      const matchesGenre = !genre || item.genres.includes(genre)
      return matchesSearch && matchesShelf && matchesGenre
    })
    const sorted = [...filtered]
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating)
    else if (sort === 'newest') sorted.sort((a, b) => b.year - a.year)
    else if (sort === 'az') sorted.sort((a, b) => a.title.localeCompare(b.title))
    return sorted
  }, [deferredQuery, shelf, genre, sort, entries])

  const hasFilters = Boolean(query) || Boolean(genre) || shelf !== 'all'
  const clearFilters = () => {
    setQuery('')
    setGenre(null)
    setShelf('all')
    setSort('featured')
  }

  return (
    <>
      <section className="hero page-width">
        <p className="eyebrow">Your next obsession is waiting</p>
        <h1>Stories that stay<br />with you.</h1>
        <p className="hero-copy">Explore a hand-picked collection, build your private library, and keep your place without creating an account.</p>
        <a className="primary-button" href="#library">Browse the collection <span aria-hidden="true">↓</span></a>
      </section>

      {continueReading.length > 0 ? (
        <section className="continue page-width">
          <p className="eyebrow">Pick up where you left off</p>
          <div className="continue-list">
            {continueReading.map(({ item, entry }) => (
              <Link className="continue-card" key={item.slug} to={`/${item.slug}`} style={{ '--accent': item.accent } as React.CSSProperties}>
                <img src={item.cover} alt="" loading="lazy" decoding="async" />
                <div className="continue-copy">
                  <span className="continue-title">{item.title}</span>
                  <div className="progress" role="progressbar" aria-label={`Reading progress for ${item.title}`} aria-valuenow={progressPct(entry.currentChapter, item.chapters)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Chapter ${entry.currentChapter} of ${item.chapters}`}>
                    <span style={{ width: `${progressPct(entry.currentChapter, item.chapters)}%` }} />
                  </div>
                  <span className="continue-meta">Chapter {entry.currentChapter} of {item.chapters}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="library page-width" id="library">
        {Object.keys(entries).length > 0 ? (
          <div className="library-cta">
            <p><strong>{Object.keys(entries).length} {Object.keys(entries).length === 1 ? 'title' : 'titles'}</strong> in your library — manage your reading progress</p>
            <Link to="/library">My library →</Link>
          </div>
        ) : null}
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

        <div className="shelf-tabs" aria-label="Filter library">
          {(['all', 'saved', 'reading'] as const).map((option) => (
            <button
              className={shelf === option ? 'active' : ''}
              key={option}
              onClick={() => setShelf(option)}
              aria-pressed={shelf === option}
            >
              {option === 'all' ? 'All titles' : option === 'saved' ? `My library (${Object.keys(entries).length})` : 'Reading now'}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="genre-chips" role="group" aria-label="Filter by genre">
            {allGenres.map((g) => (
              <button key={g} className={genre === g ? 'active' : ''} onClick={() => setGenre(genre === g ? null : g)} aria-pressed={genre === g}>
                {g}
              </button>
            ))}
          </div>
          <div className="sort-control">
            <span className="sr-only">Sort by</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} aria-label="Sort titles">
              <option value="featured">Featured</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="manga-grid">
            {results.map((item) => {
              const entry = entries[item.slug]
              const pct = entry ? progressPct(entry.currentChapter, item.chapters) : 0
              return (
                <article className="manga-card" key={item.slug} style={{ '--accent': item.accent } as React.CSSProperties}>
                  <Link className="card-link" to={`/${item.slug}`}>
                    <div className="cover-wrap">
                      <img src={item.cover} alt="" loading="lazy" decoding="async" />
                      <span className="card-number">{String(manga.indexOf(item) + 1).padStart(2, '0')}</span>
                      <span className="card-arrow" aria-hidden="true">↗</span>
                    </div>
                    <div className="card-copy">
                      <div className="card-meta"><span>{item.status}</span><span>{item.author}</span></div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      {entry ? <p className="progress-copy">{entry.status.replaceAll('-', ' ')} · Chapter {entry.currentChapter}</p> : null}
                      <div className="card-stats">
                        <span title="Chapters">{item.chapters} ch</span>
                        <span title="Rating" aria-label={`Rated ${item.rating} out of 5`}>★ {item.rating.toFixed(1)}</span>
                        <span title="Years">{item.endYear ? `${item.year}–${item.endYear}` : `${item.year}`}</span>
                      </div>
                      {entry ? (
                        <div className="progress card-progress" role="progressbar" aria-label={`Reading progress for ${item.title}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Chapter ${entry.currentChapter} of ${item.chapters}`}>
                          <span style={{ width: `${pct}%` }} />
                        </div>
                      ) : null}
                      <div className="genre-list">{item.genres.map((g) => <span key={g}>{g}</span>)}</div>
                    </div>
                  </Link>
                  <button
                    className={`save-button ${entries[item.slug] ? 'saved' : ''}`}
                    onClick={() => entries[item.slug] ? remove(item.slug) : save(item.slug)}
                    aria-label={entries[item.slug] ? `Remove ${item.title} from library` : `Save ${item.title} to library`}
                  >
                    <span aria-hidden="true">{entries[item.slug] ? '✓' : '+'}</span>{entries[item.slug] ? 'Saved' : 'Save'}
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>{hasFilters ? 'No titles match your filters.' : 'No stories found.'}</p>
            <button onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>
    </>
  )
}
