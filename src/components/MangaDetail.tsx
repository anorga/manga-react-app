import { Link, useParams } from 'react-router-dom'
import { getMangaBySlug, manga } from '../data'
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
  const pct = Math.min(100, Math.round((currentChapter / title.chapters) * 100))
  const similar = manga.filter((item) => item.slug !== title.slug && item.genres.some((g) => title.genres.includes(g)))

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
          <div className="detail-stats">
            <div><strong>{title.chapters}</strong><span>chapters</span></div>
            <div><strong>{title.endYear ? `${title.year}–${title.endYear}` : title.year}</strong><span>published</span></div>
            <div><strong>★ {title.rating.toFixed(1)}</strong><span>community</span></div>
            <div><strong>{title.status}</strong><span>status</span></div>
          </div>
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
              onChange={(event) => {
                const status = event.target.value as ReadingStatus
                if (status === 'completed') {
                  update(title.slug, { status, currentChapter: title.chapters }, { chapterTotal: title.chapters })
                } else {
                  setStatus(title.slug, status)
                }
              }}
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
              <button aria-label="Previous chapter" onClick={() => update(title.slug, { currentChapter: currentChapter - 1, status: 'reading' }, { chapterTotal: title.chapters })}>−</button>
              <input
                id="current-chapter"
                type="number"
                min="0"
                max={title.chapters}
                value={currentChapter}
                onChange={(event) => update(title.slug, { currentChapter: Number(event.target.value), status: 'reading' }, { chapterTotal: title.chapters })}
              />
              <button aria-label="Next chapter" onClick={() => update(title.slug, { currentChapter: currentChapter + 1, status: 'reading' }, { chapterTotal: title.chapters })}>+</button>
            </div>
            <div className="progress" role="progressbar" aria-label={`Reading progress for ${title.title}`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Chapter ${currentChapter} of ${title.chapters}`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <p>{currentChapter} of {title.chapters} chapters · {pct}% complete</p>
          </div>
        </div>

        <div className="official-source">
          <div><p className="eyebrow">Official source</p><h3>Read through {title.publisher}</h3></div>
          <a href={title.officialUrl} target="_blank" rel="noreferrer">Visit publisher <span aria-hidden="true">↗</span></a>
        </div>

        {similar.length > 0 ? (
          <div className="similar">
            <p className="eyebrow">Because you liked this</p>
            <div className="similar-grid">
              {similar.map((item) => (
                <Link className="similar-card" key={item.slug} to={`/${item.slug}`}>
                  <img src={item.cover} alt="" loading="lazy" decoding="async" />
                  <span className="similar-title">{item.title}</span>
                  <span className="similar-meta">{item.author}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </article>
  )
}
