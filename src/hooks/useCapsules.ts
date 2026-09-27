import { useContext } from 'react'
import { CapsuleContext } from '../capsule-context'

export function useCapsules() {
  const context = useContext(CapsuleContext)
  if (!context) throw new Error('useCapsules must be used within CapsuleProvider')
  return context
}
