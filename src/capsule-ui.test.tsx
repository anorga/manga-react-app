import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CapsuleProvider } from './components/CapsuleProvider'
import { LibraryProvider } from './components/LibraryProvider'
import { MangaDetail } from './components/MangaDetail'
import { useCapsules } from './hooks/useCapsules'
import { CAPSULE_STORAGE_KEY } from './capsules'
import { LIBRARY_STORAGE_KEY } from './library'

function seedLibrary(override: Partial<{ currentChapter: number; status: 'want-to-read' | 'reading' | 'completed' }> = {}) {
  const entry = { slug: 'chainsaw', status: 'reading' as const, currentChapter: 30, updatedAt: '2026-01-01T00:00:00.000Z', ...override }
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify({ chainsaw: entry }))
}

function seedCapsule(store: unknown) {
  localStorage.setItem(CAPSULE_STORAGE_KEY, JSON.stringify(store))
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/chainsaw']}>
      <LibraryProvider>
        <CapsuleProvider>
          <Routes>
            <Route path="/:slug" element={<MangaDetail />} />
          </Routes>
        </CapsuleProvider>
      </LibraryProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
})

describe('time capsule UI', () => {
  it('shows the seal form for a saved title and rejects an unreachable unlock', () => {
    seedLibrary()
    renderDetail()
    expect(screen.getByRole('button', { name: /Seal note/i })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Reveal at chapter' }), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Your note'), { target: { value: 'It ends on a cliffhanger.' } })
    fireEvent.submit(screen.getByRole('button', { name: /Seal note/i }).closest('form')!)
    expect(screen.getByRole('alert')).toHaveTextContent(/beyond your current progress/i)
  })

  it('seals a note, then shows it as sealed (text kept out of the DOM)', () => {
    seedLibrary()
    renderDetail()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Reveal at chapter' }), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Your note'), { target: { value: 'The devil wins, I think.' } })
    fireEvent.submit(screen.getByRole('button', { name: /Seal note/i }).closest('form')!)

    expect(screen.getByText(/Sealed until chapter 60/i)).toBeInTheDocument()
    expect(screen.queryByText('The devil wins, I think.')).not.toBeInTheDocument()
  })

  it('reveals a note only on explicit press once the milestone is reached', () => {
    seedLibrary({ currentChapter: 60 })
    seedCapsule({
      version: 1,
      bySlug: {
        chainsaw: {
          id: 'c', slug: 'chainsaw', writtenAtChapter: 30, unlockAtChapter: 60,
          body: 'The devil wins, I think.', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    })
    renderDetail()
    expect(screen.getByText(/is ready/i)).toBeInTheDocument()
    expect(screen.queryByText('The devil wins, I think.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Open note/i }))
    expect(screen.getByText('The devil wins, I think.')).toBeInTheDocument()
  })

  it('keeps a note after the library entry is removed (re-seal path)', () => {
    // A sealed capsule with no library entry still renders as "sealed", not a form.
    seedCapsule({
      version: 1,
      bySlug: {
        chainsaw: {
          id: 'c', slug: 'chainsaw', writtenAtChapter: 0, unlockAtChapter: 10,
          body: 'hello', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    })
    renderDetail()
    expect(screen.getByText(/Sealed until chapter 10/i)).toBeInTheDocument()
    cleanup()
  })
})

describe('capsule provider sequential writes', () => {
  const make = (slug: string) => ({
    id: slug, slug, writtenAtChapter: 1, unlockAtChapter: 2,
    body: slug, createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
  })

  it('keeps both notes when two seals land in the same React batch', async () => {
    let api: ReturnType<typeof useCapsules>
    function Probe() {
      api = useCapsules()
      return null
    }
    render(
      <StrictMode>
        <LibraryProvider>
          <CapsuleProvider>
            <Probe />
          </CapsuleProvider>
        </LibraryProvider>
      </StrictMode>,
    )
    act(() => {
      api!.seal(make('chainsaw'))
      api!.seal(make('naruto'))
    })
    const stored = JSON.parse(localStorage.getItem(CAPSULE_STORAGE_KEY) ?? '{}')
    expect(Object.keys(stored.bySlug)).toEqual(expect.arrayContaining(['chainsaw', 'naruto']))
    cleanup()
  })

  it('preserves an earlier persisted seal before its storage event arrives', () => {
    let tabA: ReturnType<typeof useCapsules>
    let tabB: ReturnType<typeof useCapsules>
    function TabA() { tabA = useCapsules(); return null }
    function TabB() { tabB = useCapsules(); return null }
    render(
      <LibraryProvider>
        <CapsuleProvider><TabA /></CapsuleProvider>
        <CapsuleProvider><TabB /></CapsuleProvider>
      </LibraryProvider>,
    )
    act(() => { tabA!.seal(make('attack')) })
    // A second tab, whose in-memory store predates the first seal, seals its own note.
    act(() => { tabB!.seal(make('naruto')) })
    const stored = JSON.parse(localStorage.getItem(CAPSULE_STORAGE_KEY) ?? '{}')
    // The other tab's note must survive, not be clobbered by the stale tab's write.
    expect(Object.keys(stored.bySlug)).toEqual(expect.arrayContaining(['attack', 'naruto']))
    cleanup()
  })
})

describe('capsule failure paths', () => {
  function Probe() {
    api = useCapsules()
    return null
  }
  let api: ReturnType<typeof useCapsules> | undefined

  function mountProbe() {
    render(
      <LibraryProvider>
        <CapsuleProvider>
          <Probe />
        </CapsuleProvider>
      </LibraryProvider>,
    )
  }

  // happy-dom's localStorage does not route through Storage.prototype, so a
  // prototype-level spy is invisible to the app. Swap in a key-scoped failing
  // mock of the global instead, seeded from the current contents.
  function breakWrites(brokenKey: string) {
    const real = window.localStorage
    const data: Record<string, string> = {}
    for (let i = 0; i < real.length; i++) {
      const k = real.key(i)!
      data[k] = real.getItem(k)!
    }
    const mock: Storage = {
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem(k: string, v: string) {
        if (k === brokenKey) throw new Error('QuotaExceededError')
        data[k] = String(v)
      },
      removeItem(k: string) { delete data[k] },
      clear() { for (const k of Object.keys(data)) delete data[k] },
      key(i: number) { return Object.keys(data)[i] ?? null },
      get length() { return Object.keys(data).length },
    }
    vi.stubGlobal('localStorage', mock)
    return () => vi.unstubAllGlobals()
  }

  it('seal: a failed write surfaces an error and the note is not persisted', () => {
    seedLibrary()
    const restore = breakWrites(CAPSULE_STORAGE_KEY)
    renderDetail()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Reveal at chapter' }), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Your note'), { target: { value: 'will be lost' } })
    fireEvent.submit(screen.getByRole('button', { name: /Seal note/i }).closest('form')!)

    expect(screen.getByRole('alert')).toHaveTextContent(/could not save to this device/i)
    expect(localStorage.getItem(CAPSULE_STORAGE_KEY)).toBeNull() // nothing was written
    // The draft is retained in the textarea.
    expect(screen.getByLabelText('Your note')).toHaveValue('will be lost')
    restore()
    cleanup()
  })

  it('open: a failed write surfaces an error and the note stays sealed', () => {
    seedLibrary({ currentChapter: 60 })
    seedCapsule({
      version: 1,
      bySlug: {
        chainsaw: {
          id: 'c', slug: 'chainsaw', writtenAtChapter: 30, unlockAtChapter: 60,
          body: 'the devil wins', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    })
    const restore = breakWrites(CAPSULE_STORAGE_KEY)
    renderDetail()
    fireEvent.click(screen.getByRole('button', { name: /Open note/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(/could not save to this device/i)
    expect(JSON.parse(localStorage.getItem(CAPSULE_STORAGE_KEY) ?? '{}').bySlug.chainsaw.openedAt).toBeNull()
    restore()
    cleanup()
  })

  it('importNow: a failed write is rejected and storage is unchanged', () => {
    mountProbe()
    const restore = breakWrites(CAPSULE_STORAGE_KEY)
    const result = api!.importNow(JSON.stringify({
      version: 1,
      bySlug: {
        onepunch: {
          id: 'p', slug: 'onepunch', writtenAtChapter: 1, unlockAtChapter: 2,
          body: 'imported note', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    }))
    expect(result).toMatchObject({ ok: false })
    expect(localStorage.getItem(CAPSULE_STORAGE_KEY)).toBeNull() // nothing was written
    restore()
    cleanup()
  })
})

describe('capsule provider cross-tab events', () => {
  let api: ReturnType<typeof useCapsules> | undefined

  function Probe() {
    api = useCapsules()
    return null
  }

  function mountProbe() {
    render(
      <LibraryProvider>
        <CapsuleProvider>
          <Probe />
        </CapsuleProvider>
      </LibraryProvider>,
    )
  }

  function fireStorageEvent(key: string | null) {
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key, storageArea: localStorage }))
    })
  }

  it('adapts to a full storage clear (key === null)', () => {
    seedCapsule({
      version: 1,
      bySlug: {
        onepunch: {
          id: 'p', slug: 'onepunch', writtenAtChapter: 1, unlockAtChapter: 2,
          body: 'note', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    })
    mountProbe()
    expect(api!.store.bySlug.onepunch).toBeDefined()
    localStorage.clear()
    fireStorageEvent(null)
    expect(api!.store.bySlug).toEqual({})
    cleanup()
  })

  it('ignores storage events for unrelated keys', () => {
    seedCapsule({
      version: 1,
      bySlug: {
        onepunch: {
          id: 'p', slug: 'onepunch', writtenAtChapter: 1, unlockAtChapter: 2,
          body: 'note', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    })
    mountProbe()
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'some-other-app', storageArea: localStorage }))
    })
    expect(api!.store.bySlug.onepunch).toBeDefined()
    cleanup()
  })

  it('retains the draft in the form after a failed seal and a storage event', () => {
    seedLibrary()
    const real = window.localStorage
    const data: Record<string, string> = {}
    for (let i = 0; i < real.length; i++) {
      const k = real.key(i)!
      data[k] = real.getItem(k)!
    }
    const mock: Storage = {
      getItem: (k: string) => (k in data ? data[k] : null),
      setItem(k: string, v: string) {
        if (k === CAPSULE_STORAGE_KEY) throw new Error('QuotaExceededError')
        data[k] = String(v)
      },
      removeItem(k: string) { delete data[k] },
      clear() { for (const k of Object.keys(data)) delete data[k] },
      key(i: number) { return Object.keys(data)[i] ?? null },
      get length() { return Object.keys(data).length },
    }
    vi.stubGlobal('localStorage', mock)
    renderDetail()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Reveal at chapter' }), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Your note'), { target: { value: 'keep me' } })
    fireEvent.submit(screen.getByRole('button', { name: /Seal note/i }).closest('form')!)
    // The provider reloads on a storage event; the unsubmitted draft survives.
    fireStorageEvent(CAPSULE_STORAGE_KEY)
    expect(screen.getByRole('alert')).toHaveTextContent(/could not save to this device/i)
    expect(screen.getByLabelText('Your note')).toHaveValue('keep me')
    expect(localStorage.getItem(CAPSULE_STORAGE_KEY)).toBeNull()
    vi.unstubAllGlobals()
    cleanup()
  })
})
