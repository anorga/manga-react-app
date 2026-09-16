import { useMemo, useState, type ReactNode } from 'react'
import { LibraryContext } from '../library-context'
import { createLibraryEntry, loadLibrary, persistLibrary, type ReadingStatus } from '../library'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(loadLibrary)

  const value = useMemo(() => {
    const commit = (next: typeof entries) => {
      setEntries(next)
      persistLibrary(next)
    }

    return {
      entries,
      save(slug: string) {
        if (entries[slug]) return
        commit({ ...entries, [slug]: createLibraryEntry(slug) })
      },
      remove(slug: string) {
        const next = { ...entries }
        delete next[slug]
        commit(next)
      },
      update(slug: string, changes: { currentChapter?: number; status?: ReadingStatus }) {
        const current = entries[slug] ?? createLibraryEntry(slug)
        commit({
          ...entries,
          [slug]: {
            ...current,
            ...changes,
            currentChapter: Math.max(0, Math.floor(changes.currentChapter ?? current.currentChapter)),
            updatedAt: new Date().toISOString(),
          },
        })
      },
      setStatus(slug: string, status: ReadingStatus) {
        const current = entries[slug] ?? createLibraryEntry(slug)
        commit({ ...entries, [slug]: { ...current, status, updatedAt: new Date().toISOString() } })
      },
    }
  }, [entries])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
