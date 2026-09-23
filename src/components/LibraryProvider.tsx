import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LibraryContext } from '../library-context'
import { normalizeChapter, createLibraryEntry, loadLibrary, persistLibrary, type ReadingStatus } from '../library'
import { migrateLibrary } from '../library-migration'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(loadLibrary)
  // Capture the mount-time state so the one-shot migration effect is stable.
  const initialEntries = useRef(entries)
  const didMigrate = useRef(false)

  // Apply + persist the legacy migration once, in a commit-phase effect
  // (never a render-time side effect, and safe under Strict Mode).
  useEffect(() => {
    if (didMigrate.current) return
    didMigrate.current = true
    const migrated = migrateLibrary(initialEntries.current)
    if (migrated !== initialEntries.current) {
      setEntries(migrated)
      persistLibrary(migrated)
    }
  }, [])

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
      update(slug: string, changes: { currentChapter?: number; status?: ReadingStatus }, limits?: { chapterTotal?: number; completed?: boolean }) {
        const current = entries[slug] ?? createLibraryEntry(slug)
        const nextStatus = changes.status ?? current.status
        let currentChapter = current.currentChapter
        if (changes.currentChapter !== undefined) {
          currentChapter = normalizeChapter(changes.currentChapter, limits?.chapterTotal, limits?.completed ?? nextStatus === 'completed')
        } else if (changes.status === 'completed' && limits?.chapterTotal !== undefined) {
          // Marking completed syncs progress forward to the final/latest chapter, never rewinding.
          currentChapter = Math.max(current.currentChapter, limits.chapterTotal)
        }
        commit({
          ...entries,
          [slug]: {
            ...current,
            ...changes,
            currentChapter,
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
