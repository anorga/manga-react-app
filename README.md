# Read Manga

A mobile-first manga discovery and reading tracker with a curated library.

[View the live app](https://manga-react-app.vercel.app)

## Highlights

- Responsive editorial-style library
- Search by title, creator, or genre
- Private saved library and reading progress stored in the browser
- Official publisher links instead of unmaintained chapter mirrors
- Reusable, data-driven manga detail pages
- Accessible navigation, focus states, and reduced-motion support
- Vite, React, and TypeScript

## Catalog data

The current catalog is local and typed in `src/data.ts`. Each title includes an optional `apiId` field so a future manga API can be connected without changing the reading-library schema. User progress remains local and independent from the catalog provider.

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
