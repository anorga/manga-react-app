import { createContext } from 'react'
import type { LibraryEntry, LibraryState, ReadingStatus } from './library'

export type LibraryContextValue = {
  entries: LibraryState
  /** True when the last storage write failed: progress is in-memory only until it is re-persisted. */
  persistFailed: boolean
  save: (slug: string) => void
  remove: (slug: string) => void
  update: (slug: string, changes: Partial<Pick<LibraryEntry, 'currentChapter' | 'status'>>, limits?: { chapterTotal?: number; completed?: boolean }) => void
  setStatus: (slug: string, status: ReadingStatus) => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)
