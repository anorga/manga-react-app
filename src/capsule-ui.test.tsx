import { cleanup, fireEvent, render, screen, act } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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

describe('capsule provider serialization', () => {
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
    const make = (slug: string) => ({
      id: slug, slug, writtenAtChapter: 1, unlockAtChapter: 2,
      body: slug, createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
    })
    act(() => {
      api!.seal(make('chainsaw'))
      api!.seal(make('naruto'))
    })
    const stored = JSON.parse(localStorage.getItem(CAPSULE_STORAGE_KEY) ?? '{}')
    expect(Object.keys(stored.bySlug)).toEqual(expect.arrayContaining(['chainsaw', 'naruto']))
    cleanup()
  })
})
