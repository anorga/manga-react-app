import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './components/Home'
import { LibraryPage } from './components/LibraryPage'
import { LibraryProvider } from './components/LibraryProvider'
import { manga } from './data'
import { createLibraryEntry, LIBRARY_STORAGE_KEY, type LibraryState } from './library'

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
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LibraryProvider>{ui}</LibraryProvider>
    </MemoryRouter>,
  )
}

function getStorage() {
  return JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? '{}') as LibraryState
}

function setChapter(input: HTMLInputElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

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

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '8') // 10 / 125
    clear()
  })

  it('updates the chapter count and clamps out-of-range values to the valid range', () => {
    seed({ attack: entry('attack', 'reading', 1) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    const input = screen.getByRole('spinbutton', { name: 'Current chapter for Attack on Titan' }) as HTMLInputElement
    setChapter(input, '5')
    expect(getStorage().attack.currentChapter).toBe(5)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4') // 5 / 139

    // Values beyond the total clamp to the total (AOT has 139 chapters).
    setChapter(input, '999')
    expect(getStorage().attack.currentChapter).toBe(139)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')

    // Negative input clamps to zero.
    setChapter(input, '-5')
    expect(getStorage().attack.currentChapter).toBe(0)
    clear()
  })

  it('syncs progress to the final chapter when a title is marked completed', () => {
    seed({ attack: entry('attack', 'reading', 40) })
    renderWithLibrary(<LibraryPage />, { route: '/library' })

    fireEvent.change(screen.getByRole('combobox', { name: 'Status for Attack on Titan' }), { target: { value: 'completed' } })
    expect(getStorage().attack.status).toBe('completed')
    expect(getStorage().attack.currentChapter).toBe(139) // synced to total
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
      attack: entry('attack', 'completed', 89),
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
