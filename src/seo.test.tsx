import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LibraryProvider } from './components/LibraryProvider'
import { MangaDetail } from './components/MangaDetail'
import { Home } from './components/Home'
import { manga } from './data'
import { bookSchema, websiteSchema } from './lib/seo'

function jsonLdScripts() {
  return Array.from(document.head.querySelectorAll('script#page-json-ld'))
}

afterEach(() => {
  cleanup()
  document.head.querySelectorAll('script#page-json-ld').forEach(node => node.remove())
})

describe('bookSchema', () => {
  it('maps a manga title onto schema.org Book fields', () => {
    const schema = bookSchema(manga[0])
    expect(schema['@type']).toBe('Book')
    expect(schema.name).toBe(manga[0].title)
    expect(schema.author).toEqual({ '@type': 'Person', name: manga[0].author })
    expect(schema.publisher).toEqual({ '@type': 'Organization', name: manga[0].publisher })
    expect(schema.numberOfPages).toBe(manga[0].chapters)
    expect(schema.url).toContain(manga[0].slug)
    expect(schema.image).toMatch(/^https:\/\//)
  })

  it('emits only facts the catalog actually has (no invented ratings)', () => {
    const schema = bookSchema(manga[0])
    expect('aggregateRating' in schema).toBe(false)
    expect(schema.datePublished).toBe(String(manga[0].year))
  })
})

describe('JSON-LD injection', () => {
  it('injects a Book schema on the detail page', () => {
    render(
      <MemoryRouter initialEntries={['/chainsaw']}>
        <LibraryProvider>
          <Routes>
            <Route path="/:slug" element={<MangaDetail />} />
          </Routes>
        </LibraryProvider>
      </MemoryRouter>
    )
    const scripts = jsonLdScripts()
    expect(scripts).toHaveLength(1)
    const data = JSON.parse(scripts[0].textContent ?? '{}')
    expect(data['@type']).toBe('Book')
    expect(data.name).toBe('Chainsaw Man')
    expect(() => JSON.parse(scripts[0].textContent ?? '')).not.toThrow()
  })

  it('injects a WebSite schema on home', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <LibraryProvider>
          <Home />
        </LibraryProvider>
      </MemoryRouter>
    )
    const scripts = jsonLdScripts()
    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0].textContent ?? '{}')).toEqual(websiteSchema)
  })

  it('removes the schema when the page unmounts', () => {
    const view = render(
      <MemoryRouter initialEntries={['/chainsaw']}>
        <LibraryProvider>
          <Routes>
            <Route path="/:slug" element={<MangaDetail />} />
          </Routes>
        </LibraryProvider>
      </MemoryRouter>
    )
    expect(jsonLdScripts()).toHaveLength(1)
    view.unmount()
    expect(jsonLdScripts()).toHaveLength(0)
  })
})
