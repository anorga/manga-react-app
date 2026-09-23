import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Component } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

/**
 * Throws on the first two renders so React's transient-error recovery
 * (synchronous retry) is exhausted and the failure reaches the boundary,
 * then recovers on the third.
 */
class Boom extends Component<{ flag: { count: number } }> {
  render() {
    this.props.flag.count += 1
    if (this.props.flag.count < 3) throw new Error('intentional render failure')
    return <p>recovered</p>
  }
}

describe('app integration', () => {
  beforeEach(() => {
    cleanup()
    localStorage.removeItem('read-manga.library.v1')
  })

  it('renders the collection and can save a title', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { level: 2, name: 'Choose your story' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Save Chainsaw Man/ }))
    expect(screen.getByRole('button', { name: /Remove Chainsaw Man/ })).toBeInTheDocument()
  })

  it('renders the library page through the router', () => {
    renderApp('/library')
    expect(screen.getByRole('heading', { level: 1, name: 'Nothing saved yet' })).toBeInTheDocument()
  })

  it('catches a route render failure in the error boundary and recovers', () => {
    const flag = { count: 0 }
    render(
      <ErrorBoundary>
        <Boom flag={flag} />
      </ErrorBoundary>,
    )
    // The boundary caught the failure (thrown twice: original + React's retry).
    expect(flag.count).toBe(2)
    expect(screen.getByRole('alert')).toHaveTextContent('unexpected error')

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})
