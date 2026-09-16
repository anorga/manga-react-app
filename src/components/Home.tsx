import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { manga } from '../data'
import { useLibrary } from '../hooks/useLibrary'
import { usePageMeta } from '../hooks/usePageMeta'

type Shelf = 'all' | 'saved' | 'reading'

export function Home() {
  const [query, setQuery] = useState('')
  const [shelf, setShelf] = useState<Shelf>('all')
  const { entries, remove, save } = useLibrary()
  usePageMeta('Read Manga', 'Discover manga, save titles, and track your reading progress locally.')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const results = manga.filter((item) => {
    const matchesSearch = `${item.title} ${item.author} ${item.genres.join(' ')}`.toLowerCase().includes(deferredQuery)
    const entry = entries[item.slug]
    const matchesShelf = shelf === 'all' || (shelf === 'saved' ? Boolean(entry) : entry?.status === 'reading')
    return matchesSearch && matchesShelf
  })

  return (
    <>
      <section className="hero page-width">
        <p className="eyebrow">Your next obsession is waiting</p>
        <h1>Stories that stay<br />with you.</h1>
        <p className="hero-copy">Explore a hand-picked collection, build your private library, and keep your place without creating an account.</p>
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

        <div className="shelf-tabs" aria-label="Filter library">
          {(['all', 'saved', 'reading'] as const).map((option) => (
            <button className={shelf === option ? 'active' : ''} key={option} onClick={() => setShelf(option)}>
              {option === 'all' ? 'All titles' : option === 'saved' ? `My library (${Object.keys(entries).length})` : 'Reading now'}
            </button>
          ))}
        </div>

        {results.length > 0 ? (
          <div className="manga-grid">
            {results.map((item) => (
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
                    {entries[item.slug] ? <p className="progress-copy">{entries[item.slug].status.replaceAll('-', ' ')} · Chapter {entries[item.slug].currentChapter}</p> : null}
                    <div className="genre-list">{item.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
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
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{shelf === 'all' ? 'No stories found.' : 'Nothing on this shelf yet.'}</p>
            <button onClick={() => { setQuery(''); setShelf('all') }}>Show all titles</button>
          </div>
        )}
      </section>
    </>
  )
}
