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

/**
 * Normalize a chapter value. Every entry is an integer at least 0; for finished
 * titles the value is additionally capped at the final chapter, while ongoing
 * series are never hard-capped so readers can log chapters past the catalog's
 * "latest known" count (the catalog only tracks series as of its last audit).
 */
export function normalizeChapter(value: number, total?: number, completed = false) {
  if (!Number.isFinite(value)) return 0
  const chapter = Math.max(0, Math.floor(value))
  if (completed && total !== undefined) return Math.min(chapter, Math.max(0, Math.floor(total)))
  return chapter
}
