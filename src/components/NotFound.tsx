import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFound() {
  usePageMeta('Page not found', 'The story you were looking for is not in this collection.', '/404')

  return (
    <section className="not-found page-width">
      <p className="eyebrow">404 · Lost panel</p>
      <h1>This story slipped<br />between the pages.</h1>
      <p>Return to the collection and find another world to explore.</p>
      <Link className="primary-button" to="/">Back to discover <span aria-hidden="true">→</span></Link>
    </section>
  )
}
