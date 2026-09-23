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

  it('carries a positive chapter count and a 5-point rating', () => {
    manga.forEach((item) => {
      expect(item.chapters).toBeGreaterThan(0)
      expect(item.rating).toBeGreaterThan(0)
      expect(item.rating).toBeLessThanOrEqual(5)
      expect(item.year).toBeGreaterThan(1950)
    })
  })

  it('contains the 12-title catalog with verified catalog facts', () => {
    expect(manga).toHaveLength(12)
    expect(new Set(manga.map((item) => item.slug)).size).toBe(12)

    // Lock in the verified catalog facts so they cannot silently regress.
    expect(getMangaBySlug('attack')?.chapters).toBe(139) // final serialized chapter
    expect(getMangaBySlug('vinland')?.publisher).toBe('Kodansha') // English publisher
    expect(getMangaBySlug('drstone')?.author).toContain('Inagaki') // correct author spelling
  })
})
