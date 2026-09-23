import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'
import { Home } from './components/Home.tsx'
import { LibraryPage } from './components/LibraryPage.tsx'
import { MangaDetail } from './components/MangaDetail.tsx'
import { ScrollToTop } from './components/ScrollToTop.tsx'
import { LibraryProvider } from './components/LibraryProvider.tsx'
import { NotFound } from './components/NotFound.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

export default function App() {
  return (
    <LibraryProvider>
      <div className="app-shell">
        <ScrollToTop />
        <Header />
        <main tabIndex={-1}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/:slug" element={<MangaDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </LibraryProvider>
  )
}
