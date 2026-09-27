import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { CapsuleContext, type PersistResult } from '../capsule-context'
import { loadCapsules, mergeImported, persistCapsules, type Capsule, type CapsuleStore } from '../capsules'

const STORAGE_UNAVAILABLE = 'Could not save to this device (storage unavailable).'

/**
 * Unlike the library, capsule writes report their outcome and are serialized
 * through an authoritative ref so two writes in the same React batch do not
 * clobber each other (each reads the latest committed store before writing).
 * A read-modify-write also reconciles notes sealed in another tab. A failed
 * write leaves the in-memory store untouched so callers can keep the draft.
 */
export function CapsuleProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CapsuleStore>(loadCapsules)
  // Authoritative current store; the source of truth for every mutation.
  const ref = useRef<CapsuleStore>(store)

  const commit = useCallback((next: CapsuleStore): PersistResult => {
    if (!persistCapsules(next)) {
      return { ok: false, error: STORAGE_UNAVAILABLE }
    }
    ref.current = next
    setStore(next)
    return { ok: true }
  }, [])

  const seal = useCallback((capsule: Capsule) => {
    const next = { ...ref.current, bySlug: { ...ref.current.bySlug, [capsule.slug]: capsule } }
    return commit(next)
  }, [commit])

  const open = useCallback((slug: string) => {
    const current = ref.current.bySlug[slug]
    if (!current || current.openedAt !== null) return { ok: true }
    return commit({
      ...ref.current,
      bySlug: { ...ref.current.bySlug, [slug]: { ...current, openedAt: new Date().toISOString() } },
    })
  }, [commit])

  const remove = useCallback((slug: string) => {
    if (!Object.hasOwn(ref.current.bySlug, slug)) return { ok: true }
    const bySlug = { ...ref.current.bySlug }
    delete bySlug[slug]
    return commit({ ...ref.current, bySlug })
  }, [commit])

  // Merge against the latest committed store at commit time (never a snapshot
  // captured before an async file read), so a concurrent seal cannot be lost.
  const importNow = useCallback((raw: string) => {
    const merged = mergeImported(ref.current, raw)
    if (!merged.ok) return merged
    const persisted = commit(merged.store)
    if (!persisted.ok) return persisted
    return { ok: true, added: merged.added, updated: merged.updated }
  }, [commit])

  const value = useMemo(
    () => ({ store, seal, open, remove, importNow }),
    [store, seal, open, remove, importNow],
  )

  return <CapsuleContext.Provider value={value}>{children}</CapsuleContext.Provider>
}
