import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CapsuleContext, type PersistResult } from '../capsule-context'
import { CAPSULE_STORAGE_KEY, loadCapsules, mergeImported, persistCapsules, type Capsule, type CapsuleStore } from '../capsules'

const STORAGE_UNAVAILABLE = 'Could not save to this device (storage unavailable).'

/**
 * Every mutation reads persisted storage immediately before constructing
 * its write. This preserves changes already present at that read, including
 * writes whose storage events have not reached this tab.
 *
 * The read-modify-write sequence is not atomic across tabs: overlapping
 * writes can overwrite each other, even when they concern different titles.
 * Each title stores exactly one note.
 *
 * Failed writes return an error and leave provider state unchanged, allowing
 * callers to retain drafts.
 */
export function CapsuleProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CapsuleStore>(loadCapsules)

  const commit = useCallback((next: CapsuleStore): PersistResult => {
    if (!persistCapsules(next)) {
      return { ok: false, error: STORAGE_UNAVAILABLE }
    }
    setStore(next)
    return { ok: true }
  }, [])

  const seal = useCallback((capsule: Capsule) => {
    const fresh = loadCapsules()
    const next = { ...fresh, bySlug: { ...fresh.bySlug, [capsule.slug]: capsule } }
    return commit(next)
  }, [commit])

  const open = useCallback((slug: string) => {
    const fresh = loadCapsules()
    const current = fresh.bySlug[slug]
    if (!current || current.openedAt !== null) return { ok: true }
    return commit({
      ...fresh,
      bySlug: { ...fresh.bySlug, [slug]: { ...current, openedAt: new Date().toISOString() } },
    })
  }, [commit])

  const remove = useCallback((slug: string) => {
    const fresh = loadCapsules()
    if (!Object.hasOwn(fresh.bySlug, slug)) return { ok: true }
    const bySlug = { ...fresh.bySlug }
    delete bySlug[slug]
    return commit({ ...fresh, bySlug })
  }, [commit])

  // Read the persisted base after the async file read has completed.
  // Includes changes present at this read; overlapping cross-tab writes
  // remain subject to the same read-modify-write race.
  const importNow = useCallback((raw: string) => {
    const base = loadCapsules()
    const merged = mergeImported(base, raw)
    if (!merged.ok) return merged
    const persisted = commit(merged.store)
    if (!persisted.ok) return persisted
    return { ok: true, added: merged.added, updated: merged.updated }
  }, [commit])

  // Another tab changed storage: re-read so this view catches up.
  // key === null: the other tab cleared ALL storage (our namespaced key
  // included) — the same re-read applies.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key === CAPSULE_STORAGE_KEY || event.key === null) setStore(loadCapsules())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({ store, seal, open, remove, importNow }),
    [store, seal, open, remove, importNow],
  )

  return <CapsuleContext.Provider value={value}>{children}</CapsuleContext.Provider>
}
