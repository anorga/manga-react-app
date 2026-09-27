import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LibraryContext } from '../library-context'
import { LIBRARY_STORAGE_KEY, normalizeChapter, createLibraryEntry, loadLibrary, persistLibrary, type LibraryState, type ReadingStatus } from '../library'
import { migrateLibrary } from '../library-migration'

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState(loadLibrary)
  // Authoritative store; the source of truth for every mutation.
  const ref = useRef(entries)
  // Slugs whose local value (or deletion) has not reached storage yet.
  // A dirty slug missing from local state is a pending deletion.
  const dirty = useRef(new Set<string>())
  // A failed persistence write must be visible: the tracker keeps working
  // in-memory, but it must not be silently reported as durably saved.
  const [persistFailed, setPersistFailed] = useState(false)
  const didMigrate = useRef(false)

  // Read storage, then overlay only unsaved local changes. A dirty slug
  // missing from local state represents a pending deletion.
  const reconcile = useCallback((local: LibraryState): LibraryState => {
    const next = loadLibrary()
    for (const slug of dirty.current) {
      if (Object.hasOwn(local, slug)) next[slug] = local[slug]
      else delete next[slug]
    }
    return next
  }, [])

  // Every commit re-reads storage first, preserving external writes even
  // before their storage events reach this tab. A successful write clears
  // all dirty slugs; a failed one keeps them for the next retry.
  const commit = useCallback((local: LibraryState, changedSlugs: readonly string[]) => {
    for (const slug of changedSlugs) dirty.current.add(slug)
    const next = reconcile(local)
    ref.current = next
    setEntries(next)
    const saved = persistLibrary(next)
    if (saved) dirty.current.clear()
    setPersistFailed(!saved)
  }, [reconcile])

  // Apply + persist the legacy migration once, in a commit-phase effect
  // (never a render-time side effect, and safe under Strict Mode), routed
  // through the shared commit so a failed write sets the warning too.
  useEffect(() => {
    if (didMigrate.current) return
    didMigrate.current = true
    const before = loadLibrary()
    const migrated = migrateLibrary(before)
    if (migrated !== before) {
      // migrateLibrary preserves unchanged entry references, so reference
      // comparison selects exactly the healed slugs. Unchanged entries must
      // stay eligible for external updates/deletions — never mark them dirty.
      const changedSlugs = Object.keys(migrated).filter((slug) => migrated[slug] !== before[slug])
      commit(migrated, changedSlugs)
    }
  }, [commit])

  // Another tab changed storage: retry the unsaved local work if there is
  // any, otherwise just observe (an observation must not cause a storage
  // write, or every tab would echo the others). key === null: the other tab
  // cleared ALL storage, which also removed our namespaced key — same
  // reconciliation path; our dirty entries are the only surviving copies
  // of them.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key !== LIBRARY_STORAGE_KEY && event.key !== null) return
      if (dirty.current.size > 0) {
        // No new changes; retry the existing unsaved entries/deletions.
        commit(ref.current, [])
      } else {
        const fresh = loadLibrary()
        ref.current = fresh
        setEntries(fresh)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [commit])

  const value = useMemo(() => {
    const save = (slug: string) => {
      if (ref.current[slug]) return
      commit({ ...ref.current, [slug]: createLibraryEntry(slug) }, [slug])
    }
    const remove = (slug: string) => {
      const next = { ...ref.current }
      delete next[slug]
      commit(next, [slug])
    }
    const update = (slug: string, changes: { currentChapter?: number; status?: ReadingStatus }, limits?: { chapterTotal?: number; completed?: boolean }) => {
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
      }, [slug])
    }
    const setStatus = (slug: string, status: ReadingStatus) => {
      const current = ref.current[slug] ?? createLibraryEntry(slug)
      commit({ ...ref.current, [slug]: { ...current, status, updatedAt: new Date().toISOString() } }, [slug])
    }
    return { entries, persistFailed, save, remove, update, setStatus }
  }, [entries, persistFailed, commit])

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
