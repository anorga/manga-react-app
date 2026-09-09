import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { chapters, manga } from '../data'

export function MangaDetail() {
  const { slug } = useParams()
  const title = manga.find((item) => item.slug === slug)
  const [chapterQuery, setChapterQuery] = useState('')

  useEffect(() => {
    document.title = title ? `${title.title} — Read Manga` : 'Read Manga'
    return () => { document.title = 'Read Manga — Find your next story' }
  }, [title])

  if (!title) return <Navigate to="/" replace />

  const visibleChapters = chapters.filter((chapter) => String(chapter).includes(chapterQuery.trim()))

  return (
    <article className="detail-page page-width" style={{ '--accent': title.accent } as React.CSSProperties}>
      <Link className="back-link" to="/">← Back to library</Link>
      <section className="detail-hero">
        <img src={title.banner} alt="" />
        <div className="detail-shade" />
        <div className="detail-copy">
          <div className="genre-list">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <h1>{title.title}</h1>
          <p>{title.description}</p>
        </div>
      </section>

      <section className="chapter-section">
        <div className="chapter-heading">
          <div><p className="eyebrow">Reading list</p><h2>Chapters</h2></div>
          <label className="search compact">
            <span className="sr-only">Find a chapter</span>
            <span aria-hidden="true">#</span>
            <input inputMode="numeric" value={chapterQuery} onChange={(event) => setChapterQuery(event.target.value)} placeholder="Find chapter" />
          </label>
        </div>
        <p className="external-note">Chapter links open on independent third-party websites.</p>
        <ol className="chapter-list">
          {visibleChapters.map((chapter) => (
            <li key={chapter}>
              <span><small>Chapter</small>{String(chapter).padStart(2, '0')}</span>
              <a href={title.chapterUrl(chapter)} target="_blank" rel="noreferrer">Read chapter <span aria-hidden="true">↗</span></a>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}
