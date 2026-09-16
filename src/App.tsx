import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'
import { Home } from './components/Home.tsx'
import { MangaDetail } from './components/MangaDetail.tsx'
import { ScrollToTop } from './components/ScrollToTop.tsx'
import { LibraryProvider } from './components/LibraryProvider.tsx'
import { NotFound } from './components/NotFound.tsx'

export default function App() {
  return (
    <LibraryProvider>
      <div className="app-shell">
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:slug" element={<MangaDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </LibraryProvider>
  )
}
