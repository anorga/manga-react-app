import { createContext } from 'react'
import type { Capsule, CapsuleStore } from './capsules'

export type PersistResult = { ok: boolean; error?: string }

export type CapsuleContextValue = {
  store: CapsuleStore
  /** Seal a note for a title. Reports whether the write reached storage. */
  seal: (capsule: Capsule) => PersistResult
  /** Mark a sealed note opened (explicit, never automatic). Reports the outcome. */
  open: (slug: string) => PersistResult
  /** Delete a capsule; deleting a library title does not call this. Reports the outcome. */
  remove: (slug: string) => PersistResult
  /** Merge a backup into the latest committed store; reports the outcome. */
  importNow: (raw: string) => PersistResult | { ok: false; error: string } | { ok: true; added: number; updated: number }
}

export const CapsuleContext = createContext<CapsuleContextValue | null>(null)
