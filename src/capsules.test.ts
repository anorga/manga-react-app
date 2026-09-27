import { describe, expect, it } from 'vitest'
import {
  CAPSULE_MAX_CHARS,
  capsuleState,
  createCapsule,
  exportCapsules,
  mergeImported,
  parseCapsules,
  validateSeal,
  type Capsule,
} from './capsules'

function sampleCapsule(overrides: Partial<Capsule> = {}): Capsule {
  return {
    id: 'c-1',
    slug: 'chainsaw',
    writtenAtChapter: 30,
    unlockAtChapter: 60,
    body: 'The story will end badly.',
    createdAt: '2026-01-01T00:00:00.000Z',
    openedAt: null,
    ...overrides,
  }
}

describe('parseCapsules', () => {
  it('returns an empty store for absent or malformed storage', () => {
    expect(parseCapsules(null)).toEqual({ version: 1, bySlug: {} })
    expect(parseCapsules('not json')).toEqual({ version: 1, bySlug: {} })
    expect(parseCapsules('[]')).toEqual({ version: 1, bySlug: {} })
    expect(parseCapsules(JSON.stringify({ version: 2, bySlug: {} }))).toEqual({ version: 1, bySlug: {} })
  })

  it('drops records with missing or invalid fields', () => {
    const store = {
      version: 1,
      bySlug: {
        'good-slug': {
          id: 'g', slug: 'good-slug', writtenAtChapter: 5, unlockAtChapter: 10,
          body: 'x', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
        'bad-slug': {
          id: 'b', slug: 'other', writtenAtChapter: 5, unlockAtChapter: 3,
          body: 'x', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null,
        },
      },
    }
    const parsed = parseCapsules(JSON.stringify(store))
    expect(Object.keys(parsed.bySlug)).toEqual(['good-slug'])
  })
})

describe('validateSeal', () => {
  const base = { slug: 'chainsaw', body: 'It ends on a cliffhanger.', writtenAtChapter: 30, unlockAtChapter: 60, completed: false, chapterTotal: undefined as number | undefined }

  it('rejects blank or oversized text', () => {
    expect(validateSeal({ ...base, body: '   ' }).ok).toBe(false)
    expect(validateSeal({ ...base, body: 'x'.repeat(CAPSULE_MAX_CHARS + 1) }).ok).toBe(false)
  })

  it('requires the unlock chapter to be beyond current progress', () => {
    expect(validateSeal({ ...base, unlockAtChapter: 30 }).ok).toBe(false)
    expect(validateSeal({ ...base, unlockAtChapter: 10 }).ok).toBe(false)
    expect(validateSeal({ ...base, unlockAtChapter: 31 })).toEqual({ ok: true, writtenAtChapter: 30, unlockAtChapter: 31 })
  })

  it('clamps unlock for finished titles to the final chapter', () => {
    const finished = { ...base, completed: true, chapterTotal: 139 }
    // An over-target is clamped to the final chapter (still reachable).
    expect(validateSeal({ ...finished, unlockAtChapter: 200 })).toEqual({ ok: true, writtenAtChapter: 30, unlockAtChapter: 139 })
    expect(validateSeal({ ...finished, unlockAtChapter: 80 })).toEqual({ ok: true, writtenAtChapter: 30, unlockAtChapter: 80 })
  })

  it('rejects an unreachable target on a finished title already at its end', () => {
    const finished = { ...base, completed: true, chapterTotal: 139, writtenAtChapter: 139 }
    expect(validateSeal({ ...finished, unlockAtChapter: 200 }).ok).toBe(false)
  })

  it('allows ongoing titles to target beyond the catalog count', () => {
    const ongoing = { ...base, completed: false, chapterTotal: 100 }
    expect(validateSeal({ ...ongoing, unlockAtChapter: 500 })).toEqual({ ok: true, writtenAtChapter: 30, unlockAtChapter: 500 })
  })
})

describe('capsuleState', () => {
  it('tracks absent, sealed, ready, and opened states', () => {
    expect(capsuleState(undefined, 0)).toBe('absent')
    expect(capsuleState(sampleCapsule(), 30)).toBe('sealed')
    expect(capsuleState(sampleCapsule(), 60)).toBe('ready')
    expect(capsuleState(sampleCapsule({ openedAt: '2026-02-01T00:00:00.000Z' }), 60)).toBe('opened')
  })

  it('becomes ineligible again when progress drops', () => {
    const capsule = sampleCapsule({ writtenAtChapter: 10, unlockAtChapter: 60 })
    expect(capsuleState(capsule, 60)).toBe('ready')
    expect(capsuleState(capsule, 15)).toBe('sealed')
  })
})

describe('createCapsule', () => {
  it('trims the body and stamps an id', () => {
    const input = { slug: 'a', body: '  hello  ', writtenAtChapter: 1, unlockAtChapter: 2, completed: false, chapterTotal: undefined as number | undefined }
    const validation = validateSeal(input)
    expect(validation.ok).toBe(true)
    if (!validation.ok) throw new Error('expected a valid seal')
    const capsule = createCapsule(input, validation)
    expect(capsule.body).toBe('hello')
    expect(capsule.id).toContain('a-')
  })
})

describe('backup round trips', () => {
  it('exports and re-imports an identical store', () => {
    const store = { version: 1 as const, bySlug: { chainsaw: sampleCapsule() } }
    const imported = mergeImported({ version: 1, bySlug: {} }, exportCapsules(store))
    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.added).toBe(1)
      expect(imported.store.bySlug.chainsaw).toEqual(sampleCapsule())
    }
  })

  it('adopts an opened state from another device, never downgrades', () => {
    const sealed = sampleCapsule()
    const opened = sampleCapsule({ openedAt: '2026-03-01T00:00:00.000Z' })
    const imported = mergeImported({ version: 1, bySlug: { chainsaw: sealed } }, JSON.stringify({ version: 1, bySlug: { chainsaw: opened } }))
    expect(imported.ok).toBe(true)
    if (imported.ok) {
      expect(imported.updated).toBe(1)
      expect(imported.store.bySlug.chainsaw.openedAt).toBe(opened.openedAt)
    }
  })

  it('rejects a conflict (a different note under the same slug)', () => {
    const other = sampleCapsule({ id: 'different', body: 'different note' })
    const imported = mergeImported(
      { version: 1, bySlug: { chainsaw: sampleCapsule() } },
      JSON.stringify({ version: 1, bySlug: { chainsaw: other } }),
    )
    expect(imported.ok).toBe(false)
  })

  it('rejects invalid JSON and wrong versions', () => {
    expect(mergeImported({ version: 1, bySlug: {} }, 'nope').ok).toBe(false)
    expect(mergeImported({ version: 1, bySlug: {} }, JSON.stringify({ version: 9, bySlug: {} })).ok).toBe(false)
  })

  it('rejects a same-id backup whose immutable fields do not match', () => {
    const local = sampleCapsule()
    const tampered = sampleCapsule({ body: 'replaced by import' }) // same id, different body
    const imported = mergeImported(
      { version: 1, bySlug: { chainsaw: local } },
      JSON.stringify({ version: 1, bySlug: { chainsaw: tampered } }),
    )
    expect(imported.ok).toBe(false)
  })

  it('rejects malformed backup containers', () => {
    expect(mergeImported({ version: 1, bySlug: {} }, JSON.stringify({ version: 1 })).ok).toBe(false)
    expect(mergeImported({ version: 1, bySlug: {} }, JSON.stringify({ version: 1, bySlug: [] })).ok).toBe(false)
    expect(mergeImported({ version: 1, bySlug: {} }, JSON.stringify({ version: 1, bySlug: null })).ok).toBe(false)
  })

  it('rejects reserved slug keys instead of corrupting the dictionary', () => {
    // A crafted backup carries a __proto__ key in bySlug. Importing it must
    // reject (not mutate Object.prototype); loading it must drop the record.
    const evilRecord = { id: 'x', slug: '__proto__', writtenAtChapter: 1, unlockAtChapter: 2, body: 'y', createdAt: '2026-01-01T00:00:00.000Z', openedAt: null }
    const raw = `{"version":1,"bySlug":{"__proto__":${JSON.stringify(evilRecord)}}}`
    expect(Object.keys(JSON.parse(raw).bySlug)).toContain('__proto__') // the key survives JSON.parse

    const imported = mergeImported({ version: 1, bySlug: {} }, raw)
    expect(imported.ok).toBe(false)
    expect((imported as { error?: string }).error).toContain('reserved key')
    expect((Object.prototype as Record<string, unknown>)['x']).toBeUndefined()

    const loaded = parseCapsules(raw)
    expect(Object.keys(loaded.bySlug)).toEqual([])
    expect(Object.prototype.hasOwnProperty.call(loaded.bySlug, '__proto__')).toBe(false)
  })
})
