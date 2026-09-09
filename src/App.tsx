import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'
import { Home } from './components/Home.tsx'
import { MangaDetail } from './components/MangaDetail.tsx'

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:slug" element={<MangaDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
