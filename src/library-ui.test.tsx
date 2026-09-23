import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Home } from './components/Home'
import { LibraryPage } from './components/LibraryPage'
import { LibraryProvider } from './components/LibraryProvider'
import { MangaDetail } from './components/MangaDetail'
import { manga } from './data'
import { createLibraryEntry, LIBRARY_STORAGE_KEY, normalizeChapter, type LibraryState } from './library'
import { migrateLibrary } from './library-migration'

function entry(slug: string, status: 'want-to-read' | 'reading' | 'completed', currentChapter: number) {
  const e = createLibraryEntry(slug)
  return { ...e, status, currentChapter }
}

function seed(state: LibraryState) {
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(state))
}

function clear() {
  localStorage.removeItem(LIBRARY_STORAGE_KEY)
}

function renderWithLibrary(ui: React.ReactElement, { route = '/' } = {}) {
  // Mount through real routes so useParams() resolves for MangaDetail.
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LibraryProvider>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/library" element={ui} />
          <Route path="/:slug" element={ui} />
        </Routes>
      </LibraryProvider>
    </MemoryRouter>,
  )
}

function getStorage() {
  return JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '{}') as LibraryState
}

function setChapter(input: HTMLInputElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

describe('chapter normalization', () => {
  it('never caps an ongoing series at the catalog count', () => {
    expect(normalizeChapter(999, 140, false)).toBe(999)
  })

  it('caps a finished series at its final chapter', () => {
    expect(normalizeChapter(999, 139, true)).toBe(139)
  })

  it('floors non-integer and negative input to zero', () => {
    expect(normalizeChapter(2.9)).toBe(2)
    expect(normalizeChapter(-5)).toBe(0)
    expect(normalizeChapter(Number.NaN)).toBe(0)
  })
})

describe('legacy migration', () => {
  it('heals a stale completed entry to the final chapter', () => {
    const state = { chainsaw: entry('chainsaw', 'completed', 89) }
    expect(migrateLibrary(state).chainsaw.currentChapter).toBe(232)
  })

  it('leaves ongoing and already-correct entries untouched', () => {
    const state = {
      // ongoing series: "completed" above the catalog count is intentional user data, never rewritten
      onepunch: entry('onepunch', 'completed', 239),
      // finished title already at its final chapter: unchanged
      attack: entry('attack', 'completed', 139),
      // non-completed status: ignored
      jujutsu: entry('jujutsu', 'reading', 10),
    }
    expect(migrateLibrary(state).onepunch.currentChapter).toBe(239)
    expect(migrateLibrary(state).jujutsu.currentChapter).toBe(10)
    // Nothing to heal -> the very same object is returned (no-op).
    expect(migrateLibrary(state)).toBe(state)
  })

  it('only syncs forward legacy entries at or below the final chapter', () => {
    // legacy: finished title saved "completed" under the old low ceiling
    const legacy = { chainsaw: entry('chainsaw', 'completed', 89) }
    expect(migrateLibrary(legacy).chainsaw.currentChapter).toBe(232)
    // finished title saved completed *above* its total (user read extras) is left alone
    const above = { attack: entry('attack', 'completed', 145) }
    expect(migrateLibrary(above)).toBe(above)
  })
})

describe('library + progress state', () => {
  beforeEach(() => {
    cleanup()
    clear()
  })
  it('saves a title from a card and persists it to the local library', () => {
    renderWithLibrary(<Home />)
    const target = manga[1]

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`Save ${target.title}`) }))

    expect(Object.keys(getStorage())).toEqual([target.slug])
  })

  it('shows a progress bar on a card once a chapter is recorded', () => {
    seed({ chainsaw: entry('chainsaw', 'want-to-read', 10) })
    renderWithLibrary(<Home />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4') // 10 / 232
    clear()
  })

  it('keeps ongoing series uncapped and shows a latest-known label', () => {
    seed({
      spyfamily: entry('spyfamily', 'reading', 141),
      onepunch: entry('onepunch', 'reading', 239),
    })
    renderWithLibrary(<MangaDetail />, { route: '/onepunch' })

    // Ongoing series are never capped, even past the catalog's latest-known count.
    const input = screen.getByRole('spinbutton', { name: 'Current chapter' }) as HTMLInputElement
    expect(input).toHaveValue(239)
    expect(input).not.toHaveAttribute('max') // ongoing: no hard ceiling
    expect(screen.getByText(/237 published so far/)).toBeInTheDocument()
    expect(screen.getByText(/Reading through chapter 239/)).toBeInTheDocument()

    // Marking an ongoing series completed must NOT clamp to the catalog count.
    const select = screen.getByRole('combobox', { name: 'Reading status' })
    fireEvent.change(select, { target: { value: 'completed' } })
    expect(getStorage().onepunch.currentChapter).toBe(239) // unchanged, not clamped to 237

    // Ongoing series show the latest-known label on the library page too.
    renderWithLibrary(<LibraryPage />, { route: '/library' })
    expect(screen.getByText('of 140+')).toBeInTheDocument()
    clear()
  })

  it('clamps a finished title to its final chapter', () => {
    seed({ attack: entry('attack', 'reading', 1) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    const input = screen.getByRole('spinbutton', { name: 'Current chapter for Attack on Titan' }) as HTMLInputElement
    expect(input).toHaveAttribute('max', '139') // finished: hard ceiling
    setChapter(input, '5')
    expect(getStorage().attack.currentChapter).toBe(5)

    // Finished titles hard-cap at the final chapter (AOT has 139).
    setChapter(input, '999')
    expect(getStorage().attack.currentChapter).toBe(139)

    // Negative input clamps to zero.
    setChapter(input, '-5')
    expect(getStorage().attack.currentChapter).toBe(0)
    clear()
  })

  it('syncs progress to the final chapter when a finished title is marked completed', () => {
    seed({ attack: entry('attack', 'reading', 40) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    fireEvent.change(screen.getByRole('combobox', { name: 'Status for Attack on Titan' }), { target: { value: 'completed' } })
    expect(getStorage().attack.status).toBe('completed')
    expect(getStorage().attack.currentChapter).toBe(139) // synced to total
    clear()
  })

  it('heals a stale completed entry on mount (legacy ceiling)', () => {
    // A user saved "completed @ 89" back when the ceiling was 125 — mounting must sync it to the true final chapter.
    seed({ chainsaw: entry('chainsaw', 'completed', 89) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    expect(getStorage().chainsaw.currentChapter).toBe(232)
    clear()
  })

  it('removes a title from the library page', () => {
    seed({ jujutsu: entry('jujutsu', 'completed', 0) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    fireEvent.click(screen.getByRole('button', { name: 'Remove Jujutsu Kaisen from library' }))
    expect(Object.keys(getStorage())).toEqual([])
    clear()
  })

  it('summarizes saved titles in library stats', () => {
    seed({
      attack: entry('attack', 'reading', 89),
      chainsaw: entry('chainsaw', 'reading', 30),
      jujutsu: entry('jujutsu', 'want-to-read', 0),
    })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    expect(screen.getByText('3 titles saved')).toBeInTheDocument()
    const stats = document.querySelector('.library-stats')!
    expect(stats.textContent).toContain('119') // 89 + 30 chapters read
    clear()
  })
})
