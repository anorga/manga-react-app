import { createContext } from 'react'
import type { LibraryEntry, LibraryState, ReadingStatus } from './library'

export type LibraryContextValue = {
  entries: LibraryState
  save: (slug: string) => void
  remove: (slug: string) => void
  update: (slug: string, changes: Partial<Pick<LibraryEntry, 'currentChapter' | 'status'>>) => void
  setStatus: (slug: string, status: ReadingStatus) => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)
