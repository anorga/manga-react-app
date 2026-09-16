import { Link, useParams } from 'react-router-dom'
import { getMangaBySlug } from '../data'
import { useLibrary } from '../hooks/useLibrary'
import { usePageMeta } from '../hooks/usePageMeta'
import type { ReadingStatus } from '../library'
import { NotFound } from './NotFound'

export function MangaDetail() {
  const { slug } = useParams()
  const title = getMangaBySlug(slug)
  const { entries, remove, save, setStatus, update } = useLibrary()
  usePageMeta(title?.title ?? 'Page not found', title?.description ?? 'The requested title is not in this collection.', title ? `/${title.slug}` : '/404')

  if (!title) return <NotFound />

  const entry = entries[title.slug]
  const currentChapter = entry?.currentChapter ?? 0

  return (
    <article className="detail-page page-width" style={{ '--accent': title.accent } as React.CSSProperties}>
      <Link className="back-link" to="/">← Back to library</Link>
      <section className="detail-hero">
        <img src={title.banner} alt="" fetchPriority="high" decoding="async" />
        <div className="detail-shade" />
        <div className="detail-copy">
          <div className="genre-list">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <h1>{title.title}</h1>
          <p>{title.description}</p>
          <p className="creator-line">By {title.author} · {title.publisher}</p>
        </div>
      </section>

      <section className="tracker-section">
        <div className="tracker-intro">
          <div><p className="eyebrow">Private reading tracker</p><h2>Keep your place</h2></div>
          <button className={`save-pill ${entry ? 'saved' : ''}`} onClick={() => entry ? remove(title.slug) : save(title.slug)}>
            {entry ? '✓ Saved to library' : '+ Add to library'}
          </button>
        </div>

        <div className="tracker-grid">
          <div className="tracker-card">
            <label htmlFor="reading-status">Reading status</label>
            <select
              id="reading-status"
              value={entry?.status ?? 'want-to-read'}
              onChange={(event) => setStatus(title.slug, event.target.value as ReadingStatus)}
            >
              <option value="want-to-read">Want to read</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
            </select>
            <p>Saved only in this browser.</p>
          </div>

          <div className="tracker-card">
            <label htmlFor="current-chapter">Current chapter</label>
            <div className="chapter-stepper">
              <button aria-label="Previous chapter" onClick={() => update(title.slug, { currentChapter: currentChapter - 1, status: 'reading' })}>−</button>
              <input
                id="current-chapter"
                type="number"
                min="0"
                value={currentChapter}
                onChange={(event) => update(title.slug, { currentChapter: Number(event.target.value), status: 'reading' })}
              />
              <button aria-label="Next chapter" onClick={() => update(title.slug, { currentChapter: currentChapter + 1, status: 'reading' })}>+</button>
            </div>
            <p>Update manually until live catalog data is connected.</p>
          </div>
        </div>

        <div className="official-source">
          <div><p className="eyebrow">Official source</p><h3>Read through {title.publisher}</h3></div>
          <a href={title.officialUrl} target="_blank" rel="noreferrer">Visit publisher <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </article>
  )
}
