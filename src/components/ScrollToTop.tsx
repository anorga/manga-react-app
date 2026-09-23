import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    // Move focus to the main region so keyboard and screen-reader users land on the new page.
    const main = document.querySelector<HTMLElement>('main')
    if (main) {
      main.focus({ preventScroll: true })
    }
  }, [pathname])

  return null
}
