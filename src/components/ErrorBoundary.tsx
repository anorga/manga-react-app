import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Keeps a render failure from unmounting the whole app: a throw in any route
 * shows a recovery panel with a retry button instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No external error service yet; keep the message available for debugging.
    console.error('Read Manga caught an unexpected error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-width error-boundary" role="alert">
          <p className="eyebrow">Something went wrong</p>
          <h1>This page hit an unexpected error</h1>
          <p className="hero-copy">Your library is safe — it is stored privately in this browser. Try again to get back to where you were.</p>
          <button className="primary-button" onClick={() => this.setState({ error: null })}>Try again</button>
        </div>
      )
    }
    return this.props.children
  }
}
