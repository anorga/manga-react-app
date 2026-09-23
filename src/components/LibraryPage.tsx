import { Link } from 'react-router-dom'
import { manga } from '../data'
import { useLibrary } from '../hooks/useLibrary'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ReadingStatus } from '../library'

const emptyCopy = 'Your library is empty. Browse the collection and save the titles you want to follow.'

export function LibraryPage() {
  const { entries, remove, setStatus, update } = useLibrary()
  usePageMeta('My library', 'Your personal manga library, stored privately in this browser.')

  const saved = manga
    .filter((item) => entries[item.slug])
    .map((item) => ({ item, entry: entries[item.slug] }))
    .filter((pair) => pair.entry)

  const completed = saved.filter((pair) => pair.entry.status === 'completed').length
  const reading = saved.filter((pair) => pair.entry.status === 'reading').length
  const want = saved.filter((pair) => pair.entry.status === 'want-to-read').length
  const chaptersRead = saved.reduce((sum, pair) => sum + Math.min(pair.entry.currentChapter, pair.item.chapters), 0)
  const topGenres = topOf(saved.flatMap((pair) => pair.item.genres))

  if (saved.length === 0) {
    return (
      <section className="page-width library-empty">
        <p className="eyebrow">My library</p>
        <h1>Nothing saved yet</h1>
        <p className="hero-copy">{emptyCopy}</p>
        <Link className="primary-button" to="/">Browse the collection <span aria-hidden="true">→</span></Link>
      </section>
    )
  }

  return (
    <section className="page-width library-page">
      <div className="library-head">
        <div>
          <p className="eyebrow">My library</p>
          <h1>{saved.length} {saved.length === 1 ? 'title' : 'titles'} saved</h1>
        </div>
        <div className="library-stats">
          <div><strong>{completed}</strong><span>completed</span></div>
          <div><strong>{reading}</strong><span>reading</span></div>
          <div><strong>{want}</strong><span>to read</span></div>
          <div><strong>{chaptersRead}</strong><span>chapters read</span></div>
        </div>
      </div>

      {topGenres.length > 0 ? <div className="library-top-genres">{topGenres.map((g) => <span key={g}>{g}</span>)}</div> : null}

      <div className="library-list">
        {saved.map(({ item, entry }) => {
          const pct = Math.min(100, Math.round((entry.currentChapter / item.chapters) * 100))
          return (
            <article className="library-card" key={item.slug} style={{ '--accent': item.accent } as React.CSSProperties}>
              <img src={item.cover} alt="" loading="lazy" decoding="async" />
              <div className="library-card-body">
                <div className="library-card-top">
                  <Link className="library-title" to={`/${item.slug}`}>{item.title}</Link>
                  <button className="library-remove" onClick={() => remove(item.slug)} aria-label={`Remove ${item.title} from library`}>Remove</button>
                </div>
                <p className="library-card-meta">{item.author} · {item.publisher}</p>
                <div className="progress" role="progressbar" aria-label={`Reading progress for ${item.title}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Chapter ${entry.currentChapter} of ${item.chapters}`}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="library-controls">
                  <select
                    value={entry.status}
                    onChange={(event) => {
                      const status = event.target.value as ReadingStatus
                      if (status === 'completed') {
                        // Marking completed syncs progress to the final chapter so stats stay consistent.
                        update(item.slug, { status, currentChapter: item.chapters }, { chapterTotal: item.chapters })
                      } else {
                        setStatus(item.slug, status)
                      }
                    }}
                    aria-label={`Status for ${item.title}`}
                  >
                    <option value="want-to-read">Want to read</option>
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="chapter-input">
                    <input
                      type="number"
                      min="0"
                      max={item.chapters}
                      value={entry.currentChapter}
                      onChange={(event) => update(item.slug, { currentChapter: Number(event.target.value), status: 'reading' }, { chapterTotal: item.chapters })}
                      aria-label={`Current chapter for ${item.title}`}
                    />
                    <span>of {item.chapters}</span>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      {saved.length > 0 && reading === 0 ? (
        <p className="library-hint">Tip: set a title to “Reading” and advance the chapter to build your progress stats.</p>
      ) : null}
    </section>
  )
}

function topOf(values: string[], limit = 4) {
  const counts = new Map<string, number>()
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k]) => k)
}
