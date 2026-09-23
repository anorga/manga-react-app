import { manga } from './data'
import type { LibraryState } from './library'

/**
 * Pure heal for legacy data: a title saved as "completed" back when a (lower)
 * chapter ceiling was in force should be synced forward to the true final
 * chapter so its progress reads 100%. Only touches finished titles; ongoing
 * series, non-completed entries, and entries already at (or intentionally
 * above) the final chapter are left untouched. Returns the same object
 * reference when nothing changed, so callers can detect a no-op.
 */
export function migrateLibrary(state: LibraryState): LibraryState {
  let changed = false
  const migrated: LibraryState = { ...state }
  for (const [slug, entry] of Object.entries(state)) {
    if (entry.status !== 'completed') continue
    const item = manga.find((title) => title.slug === slug)
    if (!item || item.status !== 'Completed') continue
    // Only heal legacy entries saved under an older, lower ceiling (at or
    // below the final chapter). Anything above it is intentional user data.
    if (entry.currentChapter > item.chapters) continue
    if (entry.currentChapter !== item.chapters) {
      migrated[slug] = { ...entry, currentChapter: item.chapters }
      changed = true
    }
  }
  return changed ? migrated : state
}
