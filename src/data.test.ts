import { describe, expect, it } from 'vitest'
import { getMangaBySlug, manga } from './data'

describe('manga catalog', () => {
  it('uses unique slugs and secure official sources', () => {
    expect(new Set(manga.map((item) => item.slug)).size).toBe(manga.length)
    manga.forEach((item) => expect(item.officialUrl).toMatch(/^https:\/\//))
  })

  it('finds titles by slug', () => {
    expect(getMangaBySlug('chainsaw')?.title).toBe('Chainsaw Man')
    expect(getMangaBySlug('missing')).toBeUndefined()
  })
})
