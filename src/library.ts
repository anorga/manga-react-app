export type ReadingStatus = 'want-to-read' | 'reading' | 'completed'

export type LibraryEntry = {
  slug: string
  status: ReadingStatus
  currentChapter: number
  updatedAt: string
}

export type LibraryState = Record<string, LibraryEntry>

export const LIBRARY_STORAGE_KEY = 'read-manga.library.v1'

export function loadLibrary(): LibraryState {
  try {
    return parseLibrary(localStorage.getItem(LIBRARY_STORAGE_KEY))
  } catch {
    return {}
  }
}

export function persistLibrary(state: LibraryState) {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The tracker still works for the current session when storage is unavailable.
  }
}

export function parseLibrary(value: string | null): LibraryState {
  if (!value) return {}

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed).filter(([, entry]) => {
        if (!entry || typeof entry !== 'object') return false
        const candidate = entry as Partial<LibraryEntry>
        return typeof candidate.slug === 'string'
          && ['want-to-read', 'reading', 'completed'].includes(candidate.status ?? '')
          && typeof candidate.currentChapter === 'number'
          && candidate.currentChapter >= 0
          && typeof candidate.updatedAt === 'string'
      }),
    ) as LibraryState
  } catch {
    return {}
  }
}

export function createLibraryEntry(slug: string): LibraryEntry {
  return {
    slug,
    status: 'want-to-read',
    currentChapter: 0,
    updatedAt: new Date().toISOString(),
  }
}

/** Clamp a chapter value to the valid [0, total] range; non-finite input becomes 0. */
export function clampChapter(value: number, total: number) {
  if (!Number.isFinite(value)) return 0
  const max = Math.max(0, Math.floor(total))
  return Math.min(Math.max(0, Math.floor(value)), max)
}
