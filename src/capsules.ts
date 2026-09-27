/**
 * Time-capsule notes: a sealed note per title that only reveals once the reader
 * passes a chosen chapter milestone. This is a *delayed reveal*, not a lock —
 * the text lives in local storage and stays readable; we never present it as
 * secure. Storage is isolated from the library under its own key so deleting a
 * title from the library never destroys the note.
 */
export type Capsule = {
  id: string
  slug: string
  writtenAtChapter: number
  unlockAtChapter: number
  body: string
  createdAt: string
  openedAt: string | null
}

export type CapsuleStore = {
  version: 1
  bySlug: Record<string, Capsule>
}

export const CAPSULE_STORAGE_KEY = 'read-manga.capsules.v1'
export const CAPSULE_MAX_CHARS = 2000

export function emptyStore(): CapsuleStore {
  return { version: 1, bySlug: {} }
}

export function loadCapsules(): CapsuleStore {
  try {
    return parseCapsules(localStorage.getItem(CAPSULE_STORAGE_KEY))
  } catch {
    return emptyStore()
  }
}

/** Returns whether the write reached storage. Callers must surface failure. */
export function persistCapsules(store: CapsuleStore): boolean {
  try {
    localStorage.setItem(CAPSULE_STORAGE_KEY, JSON.stringify(store))
    return true
  } catch {
    return false
  }
}

function isIsoString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function parseCapsule(raw: unknown): Capsule | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const c = raw as Partial<Capsule>
  if (typeof c.id !== 'string' || c.id.length === 0) return null
  if (typeof c.slug !== 'string' || c.slug.length === 0) return null
  if (typeof c.writtenAtChapter !== 'number' || !Number.isInteger(c.writtenAtChapter) || c.writtenAtChapter < 0) return null
  if (typeof c.unlockAtChapter !== 'number' || !Number.isInteger(c.unlockAtChapter) || c.unlockAtChapter <= 0) return null
  if (c.unlockAtChapter <= c.writtenAtChapter) return null
  if (typeof c.body !== 'string' || c.body.length === 0 || c.body.length > CAPSULE_MAX_CHARS) return null
  if (!isIsoString(c.createdAt)) return null
  if (c.openedAt !== null && !isIsoString(c.openedAt)) return null
  return {
    id: c.id,
    slug: c.slug,
    writtenAtChapter: c.writtenAtChapter,
    unlockAtChapter: c.unlockAtChapter,
    body: c.body,
    createdAt: c.createdAt,
    openedAt: c.openedAt,
  }
}

export function parseCapsules(value: string | null): CapsuleStore {
  if (!value) return emptyStore()
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyStore()
    const candidate = parsed as Partial<CapsuleStore>
    if (candidate.version !== 1) return emptyStore()

    const bySlug: Record<string, Capsule> = {}
    if (candidate.bySlug && typeof candidate.bySlug === 'object' && !Array.isArray(candidate.bySlug)) {
      for (const [slug, raw] of Object.entries(candidate.bySlug)) {
        if (isReservedKey(slug)) continue
        const capsule = parseCapsule(raw)
        if (capsule && capsule.slug === slug) bySlug[slug] = capsule
      }
    }
    return { version: 1, bySlug }
  } catch {
    return emptyStore()
  }
}

export type SealInput = {
  slug: string
  body: string
  writtenAtChapter: number
  unlockAtChapter: number
  chapterTotal?: number
  completed: boolean
}

export type SealValidation =
  | { ok: true; writtenAtChapter: number; unlockAtChapter: number }
  | { ok: false; error: string }

/** Reuse the library's chapter semantics: ongoing series may exceed the catalog count. */
function normalize(value: number, total: number | undefined, completed: boolean): number {
  if (!Number.isFinite(value)) return 0
  const chapter = Math.max(0, Math.floor(value))
  if (completed && total !== undefined) return Math.min(chapter, Math.max(0, Math.floor(total)))
  return chapter
}

export function validateSeal(input: SealInput): SealValidation {
  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Write a note before sealing it.' }
  if (body.length > CAPSULE_MAX_CHARS) return { ok: false, error: `Keep the note under ${CAPSULE_MAX_CHARS} characters.` }

  const writtenAtChapter = normalize(input.writtenAtChapter, input.chapterTotal, input.completed)
  const unlockRaw = Math.floor(input.unlockAtChapter)
  if (!Number.isFinite(input.unlockAtChapter) || unlockRaw <= writtenAtChapter) {
    return { ok: false, error: 'The unlock chapter must be beyond your current progress.' }
  }

  let unlockAtChapter = unlockRaw
  if (input.completed && input.chapterTotal !== undefined) {
    unlockAtChapter = Math.min(unlockAtChapter, Math.max(0, Math.floor(input.chapterTotal)))
    if (unlockAtChapter <= writtenAtChapter) {
      return { ok: false, error: 'That series is finished — pick a chapter you have not reached yet.' }
    }
  }
  return { ok: true, writtenAtChapter, unlockAtChapter }
}

export function createCapsule(input: SealInput, validation: Extract<SealValidation, { ok: true }>): Capsule {
  return {
    id: `${input.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug: input.slug,
    writtenAtChapter: validation.writtenAtChapter,
    unlockAtChapter: validation.unlockAtChapter,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    openedAt: null,
  }
}

/** Eligibility is derived, never stored: lower progress and a sealed note becomes ineligible again. */
export type CapsuleState = 'absent' | 'sealed' | 'ready' | 'opened'

export function capsuleState(capsule: Capsule | undefined, currentChapter: number | undefined): CapsuleState {
  if (!capsule) return 'absent'
  if (capsule.openedAt !== null) return 'opened'
  if (currentChapter !== undefined && currentChapter >= capsule.unlockAtChapter) return 'ready'
  return 'sealed'
}

export function exportCapsules(store: CapsuleStore): string {
  return JSON.stringify(store, null, 2)
}

export type ImportResult =
  | { ok: true; store: CapsuleStore; added: number; updated: number }
  | { ok: false; error: string }

function isReservedKey(key: string) {
  return key === '__proto__' || key === 'constructor' || key === 'prototype'
}

function sameImmutableFields(a: Capsule, b: Capsule) {
  return a.id === b.id
    && a.writtenAtChapter === b.writtenAtChapter
    && a.unlockAtChapter === b.unlockAtChapter
    && a.body === b.body
    && a.createdAt === b.createdAt
}

/**
 * Merge a backup into the current store. The caller passes the authoritative
 * store (not a render-time snapshot). A record whose id matches but whose
 * immutable fields do not is a conflict and rejects the whole import.
 */
export function mergeImported(base: CapsuleStore, raw: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'That file is not a capsule backup.' }
  }
  const candidate = parsed as Partial<CapsuleStore>
  if (candidate.version !== 1) {
    return { ok: false, error: 'Unsupported capsule backup version.' }
  }
  if (candidate.bySlug === null || typeof candidate.bySlug !== 'object' || Array.isArray(candidate.bySlug)) {
    return { ok: false, error: 'That backup is missing a capsule list.' }
  }

  const bySlug: Record<string, Capsule> = { ...base.bySlug }
  let added = 0
  let updated = 0
  for (const [slug, rawCapsule] of Object.entries(candidate.bySlug)) {
    if (isReservedKey(slug)) {
      return { ok: false, error: `"${slug}" is a reserved key — import rejected.` }
    }
    const imported = parseCapsule(rawCapsule)
    if (!imported || imported.slug !== slug) {
      return { ok: false, error: `"${slug}" is a malformed capsule record — import rejected.` }
    }
    const existing = Object.hasOwn(base.bySlug, slug) ? base.bySlug[slug] : undefined
    if (!existing) {
      bySlug[slug] = imported
      added += 1
    } else if (existing.id !== imported.id || !sameImmutableFields(existing, imported)) {
      return { ok: false, error: `"${slug}" already has a different sealed note. Open or delete it first, then import.` }
    } else if (existing.openedAt !== imported.openedAt) {
      // Same note seen on another device: adopt the opened state (never downgrade a sealed note).
      bySlug[slug] = { ...existing, openedAt: imported.openedAt ?? existing.openedAt }
      updated += 1
    }
  }
  return { ok: true, store: { version: 1, bySlug }, added, updated }
}
