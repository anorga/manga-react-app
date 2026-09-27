import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CapsuleContext, type PersistResult } from '../capsule-context'
import { CAPSULE_STORAGE_KEY, loadCapsules, mergeImported, persistCapsules, type Capsule, type CapsuleStore } from '../capsules'

const STORAGE_UNAVAILABLE = 'Could not save to this device (storage unavailable).'

/**
 * Capsule writes report their outcome. Every mutation re-reads the persisted
 * store *before* building the next state, so a note sealed in another tab is
 * not clobbered by a later write in this one (and a note sealed here is
 * re-loaded for other tabs via the storage listener below). Each title holds
 * exactly one note, so a same-title write last-wins; notes on other titles
 * are always preserved. A failed write leaves the in-memory store untouched
 * so callers can keep the draft.
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

  // Merge against the latest persisted store at commit time (never a snapshot
  // captured before an async file read), so a concurrent seal cannot be lost.
  const importNow = useCallback((raw: string) => {
    const base = loadCapsules()
    const merged = mergeImported(base, raw)
    if (!merged.ok) return merged
    const persisted = commit(merged.store)
    if (!persisted.ok) return persisted
    return { ok: true, added: merged.added, updated: merged.updated }
  }, [commit])

  // Another tab wrote to the capsule key: re-read so this view catches up.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === CAPSULE_STORAGE_KEY) setStore(loadCapsules())
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
