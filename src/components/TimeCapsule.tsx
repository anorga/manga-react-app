import { useState } from 'react'
import type { Manga } from '../data'
import { useLibrary } from '../hooks/useLibrary'
import { useCapsules } from '../hooks/useCapsules'
import { capsuleState, createCapsule, validateSeal, CAPSULE_MAX_CHARS } from '../capsules'

/**
 * A time-capsule note for one title: write a prediction now, choose a chapter
 * to seal it until. This is a delayed reveal, not a lock — the text stays in
 * local storage and is only hidden from the page until the reader passes the
 * unlock chapter, then it reveals on an explicit "Open note" press.
 */
export function TimeCapsule({ title }: { title: Manga }) {
  const { entries } = useLibrary()
  const { store, seal, open, remove } = useCapsules()
  const [draft, setDraft] = useState('')
  const [unlockText, setUnlockText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const entry = entries[title.slug]
  const currentChapter = entry?.currentChapter ?? 0
  const isFinished = title.status === 'Completed'
  const charCount = draft.length
  const capsule = store.bySlug[title.slug]
  const state = capsuleState(capsule, currentChapter)

  if (state === 'opened' && capsule) {
    return (
      <div className="capsule capsule-opened">
        <p className="eyebrow">Time capsule · opened</p>
        <h3>Your note from chapter {capsule.writtenAtChapter}</h3>
        <p className="capsule-body">{capsule.body}</p>
        <p className="capsule-meta">Sealed at chapter {capsule.writtenAtChapter} · opened {formatDate(capsule.openedAt)}</p>
        {actionError ? <p className="capsule-error" role="alert">{actionError}</p> : null}
        <button
          className="capsule-danger"
          onClick={() => {
            const result = remove(title.slug)
            setActionError(result.ok ? null : result.error ?? 'Could not delete the note.')
          }}
        >
          Delete note
        </button>
      </div>
    )
  }

  if (state === 'ready' && capsule) {
    return (
      <div className="capsule capsule-ready">
        <p className="eyebrow">Time capsule · ready</p>
        <h3>Your chapter-{capsule.writtenAtChapter} note is ready</h3>
        <p>You reached chapter {capsule.unlockAtChapter}. Open it to see what you wrote earlier.</p>
        {actionError ? <p className="capsule-error" role="alert">{actionError}</p> : null}
        <button
          className="primary-button"
          onClick={() => {
            const result = open(title.slug)
            setActionError(result.ok ? null : result.error ?? 'Could not open the note yet. Try again.')
          }}
        >
          Open note <span aria-hidden="true">→</span>
        </button>
      </div>
    )
  }

  if (state === 'sealed' && capsule) {
    return (
      <div className="capsule capsule-sealed">
        <p className="eyebrow">Time capsule · sealed</p>
        <h3>Sealed until chapter {capsule.unlockAtChapter}</h3>
        <p>You wrote a note at chapter {capsule.writtenAtChapter}. It will reveal once you reach chapter {capsule.unlockAtChapter}.</p>
        {actionError ? <p className="capsule-error" role="alert">{actionError}</p> : null}
        <button
          className="capsule-danger"
          onClick={() => {
            const result = remove(title.slug)
            setActionError(result.ok ? null : result.error ?? 'Could not delete the note.')
          }}
        >
          Delete note
        </button>
      </div>
    )
  }

  // absent — the seal form (only meaningful for a saved title)
  if (!entry) {
    return (
      <div className="capsule capsule-absent">
        <p className="eyebrow">Time capsule</p>
        <p>Add this title to your library to seal a note to your future self.</p>
      </div>
    )
  }

  return (
    <form
      className="capsule capsule-compose"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)
        const validation = validateSeal({
          slug: title.slug,
          body: draft,
          writtenAtChapter: currentChapter,
          unlockAtChapter: Number(unlockText),
          chapterTotal: title.chapters,
          completed: isFinished,
        })
        if (!validation.ok) {
          setError(validation.error)
          return
        }
        const capsule = createCapsule(
          { slug: title.slug, body: draft, writtenAtChapter: currentChapter, unlockAtChapter: Number(unlockText), chapterTotal: title.chapters, completed: isFinished },
          validation,
        )
        const result = seal(capsule)
        if (!result.ok) {
          // Keep the draft; never lose a personal note to a failed write.
          setError(result.error ?? 'Could not save your note.')
          return
        }
        setDraft('')
        setUnlockText('')
      }}
    >
      <p className="eyebrow">Time capsule</p>
      <h3>Leave a note for your future self</h3>
      <p className="capsule-hint">Write a prediction at chapter {currentChapter}. It stays sealed until you choose.</p>
      <label htmlFor={`capsule-body-${title.slug}`}>Your note</label>
      <textarea
        id={`capsule-body-${title.slug}`}
        className="capsule-textarea"
        rows={3}
        maxLength={CAPSULE_MAX_CHARS}
        value={draft}
        placeholder="At this point I think the story will…"
        onChange={(event) => setDraft(event.target.value)}
      />
      <div className="capsule-compose-row">
        <label htmlFor={`capsule-unlock-${title.slug}`}>Reveal at chapter</label>
        <input
          id={`capsule-unlock-${title.slug}`}
          type="number"
          min={currentChapter + 1}
          max={isFinished ? title.chapters : undefined}
          className="capsule-unlock"
          value={unlockText}
          placeholder={`${currentChapter + 1}–${isFinished ? title.chapters : '…'}`}
          onChange={(event) => setUnlockText(event.target.value)}
        />
      </div>
      <p className="capsule-count">{charCount}/{CAPSULE_MAX_CHARS}</p>
      {error ? <p className="capsule-error" role="alert">{error}</p> : null}
      <button type="submit" className="primary-button">Seal note <span aria-hidden="true">✦</span></button>
    </form>
  )
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
