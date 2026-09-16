import { useEffect } from 'react'

const SITE_NAME = 'Read Manga'
const SITE_URL = 'https://manga-react-app.vercel.app'

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export function usePageMeta(title: string, description: string, path = '/') {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? `${SITE_NAME} — Track your next story` : `${title} — ${SITE_NAME}`
    const canonicalUrl = new URL(path, SITE_URL).toString()
    document.title = fullTitle

    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = canonicalUrl
  }, [description, path, title])
}
