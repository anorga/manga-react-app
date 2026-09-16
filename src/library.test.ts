import { describe, expect, it } from 'vitest'
import { createLibraryEntry, parseLibrary } from './library'

describe('library persistence', () => {
  it('rejects malformed or outdated storage values', () => {
    expect(parseLibrary('not json')).toEqual({})
    expect(parseLibrary(JSON.stringify({ broken: { status: 'unknown' } }))).toEqual({})
  })

  it('restores valid entries', () => {
    const entry = createLibraryEntry('attack')
    expect(parseLibrary(JSON.stringify({ attack: entry }))).toEqual({ attack: entry })
  })
})
