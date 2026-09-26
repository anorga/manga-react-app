import type { Manga } from '../data'

const SITE_URL = 'https://manga-react-app.vercel.app'

export function bookSchema(title: Manga) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title.title,
    image: new URL(title.cover, SITE_URL).toString(),
    description: title.description,
    inLanguage: 'en',
    url: new URL(`/${title.slug}`, SITE_URL).toString(),
    genre: title.genres.join(', '),
    author: { '@type': 'Person', name: title.author },
    publisher: { '@type': 'Organization', name: title.publisher },
    datePublished: String(title.year),
    ...(title.endYear ? { dateModified: String(title.endYear) } : {}),
    numberOfPages: title.chapters
  }
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Read Manga',
  url: `${SITE_URL}/`,
  description: 'Curated manga discovery and a private reading tracker — no accounts, no ads.',
  inLanguage: 'en'
}
