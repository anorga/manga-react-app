import { useRef, useState } from 'react'
import { useCapsules } from '../hooks/useCapsules'
import { exportCapsules } from '../capsules'

const MAX_BACKUP_BYTES = 256 * 1024

/**
 * Backup controls for the capsule store: export to JSON and import it back.
 * An emotional-storage feature needs an escape hatch from browser storage.
 */
export function CapsuleBackup() {
  const { store, importNow } = useCapsules()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const hasNotes = Object.keys(store.bySlug).length > 0

  const exportNow = () => {
    const blob = new Blob([exportCapsules(store)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'read-manga-capsules.json'
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage({ tone: 'ok', text: 'Backup downloaded.' })
  }

  const importFile = async (file: File) => {
    if (file.size > MAX_BACKUP_BYTES) {
      setMessage({ tone: 'error', text: 'That file is too large to import.' })
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setMessage({ tone: 'error', text: 'Could not read that file. Try exporting a fresh backup.' })
      return
    }
    const result = importNow(text)
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error ?? 'Import failed to save.' })
      return
    }
    if ('added' in result) {
      const parts: string[] = []
      if (result.added) parts.push(`${result.added} added`)
      if (result.updated) parts.push(`${result.updated} updated`)
      setMessage({ tone: 'ok', text: parts.length ? `Imported: ${parts.join(', ')}.` : 'Nothing new to import.' })
    } else {
      setMessage({ tone: 'ok', text: 'Nothing new to import.' })
    }
  }

  return (
    <div className="capsule-backup" role="region" aria-label="Capsule backup">
      <div className="capsule-backup-actions">
        <button type="button" className="capsule-link-button" onClick={exportNow} disabled={!hasNotes}>
          Export backup <span aria-hidden="true">↓</span>
        </button>
        <button type="button" className="capsule-link-button" onClick={() => fileRef.current?.click()}>
          Import backup <span aria-hidden="true">↑</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="visually-hidden"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void importFile(file)
          }}
        />
      </div>
      {message ? (
        <p className={`capsule-backup-message ${message.tone}`} role={message.tone === 'error' ? 'alert' : 'status'}>
          {message.text}
        </p>
      ) : (
        <p className="capsule-backup-hint">Notes live only in this browser — export a backup to keep them safe.</p>
      )}
    </div>
  )
}
