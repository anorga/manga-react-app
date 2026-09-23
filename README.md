# Read Manga

A mobile-first manga discovery and reading tracker with a curated library of 12 titles.

[View the live app](https://manga-react-app.vercel.app)

## Highlights

- Curated catalog of 12 titles with covers, stats (chapters, rating, years), and official publisher links — no third-party chapter mirrors
- Home page with search, genre filter chips, sort control, and a "pick up where you left off" strip
- Detail pages with stat rows, read-progress bars, and a similar-titles rail
- Dedicated `/library` page: your private reading list with completion stats, per-title status, chapter tracking, and one-click removal
- Private saved library and reading progress stored in the browser (no account, no backend)
- Installable as a PWA: manifest, 192/512/maskable icons, and a network-first service worker for offline use
- Accessible navigation, focus states, progress bars with ARIA progress indicators, and reduced-motion support
- Vite, React 19, TypeScript; unit + component tests (Vitest, Testing Library)

## Catalog data

The catalog is local and typed in `src/data.ts`. Each title includes an optional `apiId` field so a future manga API can be connected without changing the reading-library schema. User progress remains local and independent from the catalog provider.

## Local development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
npm audit
```

## Testing

```bash
npx vitest run          # unit + component tests
npx vitest watch        # watch mode
```
