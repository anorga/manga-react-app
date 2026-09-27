import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LibraryContext } from '../library-context'
import { LIBRARY_STORAGE_KEY, normalizeChapter, createLibraryEntry, loadLibrary, persistLibrary, type ReadingStatus } from '../library'
import { migrateLibrary } from '../library-migration'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(loadLibrary)
  // Authoritative store; the source of truth for every mutation. Each commit
  // reads the latest committed state (never a render-time snapshot), so
  // several updates in one React batch cannot clobber each other.
  const ref = useRef(entries)
  // A failed persistence write must be visible: the tracker keeps working
  // in-memory, but it must not be silently reported as durably saved.
  const [persistFailed, setPersistFailed] = useState(false)
  const didMigrate = useRef(false)

  // Apply + persist the legacy migration once, in a commit-phase effect
  // (never a render-time side effect, and safe under Strict Mode), routed
  // through the same commit mechanism so ref, state and storage stay in sync.
  useEffect(() => {
    if (didMigrate.current) return
    didMigrate.current = true
    const migrated = migrateLibrary(ref.current)
    if (migrated !== ref.current) {
      ref.current = migrated
      if (persistLibrary(migrated)) setPersistFailed(false)
      setEntries(migrated)
    }
  }, [])

  // Another tab wrote to the library key: re-read so this tab sees it.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LIBRARY_STORAGE_KEY) {
        const fresh = loadLibrary()
        ref.current = fresh
        setEntries(fresh)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(() => {
    const commit = (next: typeof entries) => {
      ref.current = next
      setEntries(next)
      if (persistLibrary(next)) setPersistFailed(false)
      else setPersistFailed(true)
    }

    return {
      entries,
      persistFailed,
      save(slug: string) {
        if (ref.current[slug]) return
        commit({ ...ref.current, [slug]: createLibraryEntry(slug) })
      },
      remove(slug: string) {
        const next = { ...ref.current }
        delete next[slug]
        commit(next)
      },
      update(slug: string, changes: { currentChapter?: number; status?: ReadingStatus }, limits?: { chapterTotal?: number; completed?: boolean }) {
        const current = ref.current[slug] ?? createLibraryEntry(slug)
        const nextStatus = changes.status ?? current.status
        let currentChapter = current.currentChapter
        if (changes.currentChapter !== undefined) {
          currentChapter = normalizeChapter(changes.currentChapter, limits?.chapterTotal, limits?.completed ?? nextStatus === 'completed')
        } else if (changes.status === 'completed' && limits?.chapterTotal !== undefined) {
          // Marking completed syncs progress forward to the final/latest chapter, never rewinding.
          currentChapter = Math.max(current.currentChapter, limits.chapterTotal)
        }
        commit({
          ...ref.current,
          [slug]: {
            ...current,
            ...changes,
            currentChapter,
            updatedAt: new Date().toISOString(),
          },
        })
      },
      setStatus(slug: string, status: ReadingStatus) {
        const current = ref.current[slug] ?? createLibraryEntry(slug)
        commit({ ...ref.current, [slug]: { ...current, status, updatedAt: new Date().toISOString() } })
      },
    }
  }, [entries, persistFailed])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
