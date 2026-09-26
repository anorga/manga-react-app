import { useEffect } from 'react'

const SCRIPT_ID = 'page-json-ld'

/** Injects page-scoped JSON-LD structured data; removed on unmount. */
export function useJsonLd(data: Record<string, unknown> | null) {
  useEffect(() => {
    if (!data) return
    document.head.querySelectorAll(`script#${SCRIPT_ID}`).forEach(node => node.remove())
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.append(script)
    return () => script.remove()
  }, [data])
}
