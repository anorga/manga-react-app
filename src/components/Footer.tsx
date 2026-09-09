export function Footer() {
  return (
    <footer className="site-footer">
      <span>Curated stories for curious readers.</span>
      <div>
        <a href="https://github.com/anorga/manga-react-app" target="_blank" rel="noreferrer">GitHub</a>
        <a href="mailto:anorga2990@gmail.com">Contact</a>
      </div>
      <span>© {new Date().getFullYear()} Read Manga</span>
    </footer>
  )
}
