import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Home } from './components/Home'
import { LibraryPage } from './components/LibraryPage'
import { LibraryProvider } from './components/LibraryProvider'
import { CapsuleProvider } from './components/CapsuleProvider'
import { MangaDetail } from './components/MangaDetail'
import { useLibrary } from './hooks/useLibrary'
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
        <CapsuleProvider>
          <Routes>
            <Route path="/" element={ui} />
            <Route path="/library" element={ui} />
            <Route path="/:slug" element={ui} />
          </Routes>
        </CapsuleProvider>
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

describe('library persistence failures', () => {
  let api: ReturnType<typeof useLibrary> | undefined
  // Togglable, counted storage mock: setItem fails for the library key only
  // while `fail` is true, and records every persist attempt.
  let fail = false
  let persistCalls = 0
  let backing: Record<string, string> = {}

  function installMock() {
    fail = false
    persistCalls = 0
    backing = {}
    const real = window.localStorage
    for (let i = 0; i < real.length; i++) {
      const k = real.key(i)!
      backing[k] = real.getItem(k)!
    }
    const mock: Storage = {
      getItem: (k: string) => (k in backing ? backing[k] : null),
      setItem(k: string, v: string) {
        persistCalls += 1
        if (k === LIBRARY_STORAGE_KEY && fail) throw new Error('QuotaExceededError')
        backing[k] = String(v)
      },
      removeItem(k: string) { delete backing[k] },
      clear() { backing = {} },
      key(i: number) { return Object.keys(backing)[i] ?? null },
      get length() { return Object.keys(backing).length },
    }
    vi.stubGlobal('localStorage', mock)
  }

  function fireStorageEvent(key: string | null) {
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }))
    })
  }

  function Probe() {
    api = useLibrary()
    return null
  }

  beforeEach(() => {
    cleanup()
    clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps every entry when updates are batched in one React commit', () => {
    render(
      <MemoryRouter>
        <LibraryProvider>
          <CapsuleProvider>
            <Probe />
          </CapsuleProvider>
        </LibraryProvider>
      </MemoryRouter>,
    )
    act(() => {
      api!.update('attack', { currentChapter: 10 })
      api!.update('naruto', { currentChapter: 5 })
      api!.update('attack', { currentChapter: 99 })
    })
    const stored = getStorage()
    // The middle write must survive the batch (stale-snapshot clobber regression).
    expect(stored.attack.currentChapter).toBe(99)
    expect(stored.naruto.currentChapter).toBe(5)
    clear()
  })

  it('shows a warning when migration cannot persist', () => {
    seed({ attack: entry('attack', 'completed', 1) })
    installMock()
    fail = true
    renderWithLibrary(<LibraryPage />, { route: '/library' })
    // In-memory is healed to the final chapter even though the write failed.
    expect(screen.getByRole('spinbutton', { name: 'Current chapter for Attack on Titan' })).toHaveValue(139)
    expect(getStorage().attack.currentChapter).toBe(1)
    expect(screen.getByRole('alert')).toHaveTextContent(/kept for this session/i)
    clear()
  })

  it('persists a failed migration and clears its warning on later success', () => {
    seed({ attack: entry('attack', 'completed', 1) })
    installMock()
    fail = true
    renderWithLibrary(<LibraryPage />, { route: '/library' })
    expect(screen.getByRole('alert')).toBeInTheDocument()
    fail = false
    fireEvent.change(screen.getByRole('combobox', { name: 'Status for Attack on Titan' }), { target: { value: 'reading' } })
    expect(getStorage().attack.currentChapter).toBe(139)
    expect(getStorage().attack.status).toBe('reading')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    clear()
  })

  it('preserves a remote write that arrived before its storage event', () => {
    seed({ attack: entry('attack', 'reading', 10) })
    installMock()
    render(
      <MemoryRouter>
        <LibraryProvider>
        <CapsuleProvider>
          <Probe />
        </CapsuleProvider>
        </LibraryProvider>
      </MemoryRouter>,
    )
    // Another tab added a note before this tab's storage event arrives.
    backing[LIBRARY_STORAGE_KEY] = JSON.stringify({
      attack: entry('attack', 'reading', 10),
      naruto: entry('naruto', 'reading', 5),
    })
    act(() => { api!.update('attack', { currentChapter: 11 }) })
    // The local edit and the remote write must both survive (no clobber).
    const stored = getStorage()
    expect(stored.attack.currentChapter).toBe(11)
    expect(stored.naruto.currentChapter).toBe(5)
    clear()
  })

  it('keeps a failed local edit and a remote write, then retries on the next event', () => {
    seed({ attack: entry('attack', 'reading', 10) })
    installMock()
    render(
      <MemoryRouter>
        <LibraryProvider>
          <CapsuleProvider>
            <Probe />
          </CapsuleProvider>
        </LibraryProvider>
      </MemoryRouter>,
    )
    // Local edit fails to persist.
    fail = true
    act(() => { api!.update('attack', { currentChapter: 11 }) })
    expect(api!.persistFailed).toBe(true)
    // Another tab writes while local writes still fail.
    backing[LIBRARY_STORAGE_KEY] = JSON.stringify({
      attack: entry('attack', 'reading', 10),
      naruto: entry('naruto', 'reading', 5),
    })
    fireStorageEvent(LIBRARY_STORAGE_KEY)
    // Memory must contain BOTH the unsaved local edit and the remote entry;
    // the warning stays up while the write is still failing.
    expect(api!.entries.attack.currentChapter).toBe(11)
    expect(api!.entries.naruto.currentChapter).toBe(5)
    expect(api!.persistFailed).toBe(true)
    // Writes recover: a storage event retries and persists the union.
    fail = false
    fireStorageEvent(LIBRARY_STORAGE_KEY)
    const stored = getStorage()
    expect(stored.attack.currentChapter).toBe(11)
    expect(stored.naruto.currentChapter).toBe(5)
    expect(api!.persistFailed).toBe(false)
    clear()
  })

  it('retries a failed deletion and preserves remote entries', () => {
    seed({ attack: entry('attack', 'reading', 10), naruto: entry('naruto', 'reading', 5) })
    installMock()
    render(
      <MemoryRouter>
        <LibraryProvider>
          <CapsuleProvider>
            <Probe />
          </CapsuleProvider>
        </LibraryProvider>
      </MemoryRouter>,
    )
    fail = true
    act(() => { api!.remove('attack') })
    // Storage still holds the entry; a retry must delete it, keep the rest.
    fail = false
    fireStorageEvent(LIBRARY_STORAGE_KEY)
    const stored = getStorage()
    expect(stored.attack).toBeUndefined()
    expect(stored.naruto.currentChapter).toBe(5)
    expect(api!.persistFailed).toBe(false)
    clear()
  })

  it('a clean storage event only observes, it never writes', () => {
    seed({ attack: entry('attack', 'reading', 10) })
    installMock()
    renderWithLibrary(<LibraryPage />, { route: '/library' })
    fireStorageEvent(LIBRARY_STORAGE_KEY)
    const before = persistCalls
    fireStorageEvent(LIBRARY_STORAGE_KEY)
    expect(persistCalls).toBe(before) // observation caused no storage write
    clear()
  })

  it('adapts to a full storage clear (key === null)', () => {
    seed({ attack: entry('attack', 'reading', 10) })
    installMock()
    renderWithLibrary(<LibraryPage />, { route: '/library' })
    backing = {} // another tab cleared ALL storage
    fireStorageEvent(null)
    expect(getStorage()).toEqual({})
    clear()
  })
})
