import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Rewrite the emitted sw.js after each build: build-specific cache ID + the
// actual hashed shell assets, so a fresh install precaches the JS/CSS it will
// serve. Files in public/ are copied to the outDir by Vite (not bundled), so
// this edits the emitted file on disk. It shares the outDir with the config
// below (a dev worker is never stamped; the plugin only rewrites a file that
// still carries the dev placeholders).
const OUT_DIR = 'dist'

function serviceWorkerAssets(): Plugin {
  return {
    name: 'read-manga:sw-assets',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve(OUT_DIR, 'sw.js')
      if (!fs.existsSync(swPath)) return

      const source = fs.readFileSync(swPath, 'utf-8')
      if (!source.includes('BUILD_ID = "dev"')) return

      // Top-level files in the assets dir only (Vite emits hashed assets flat).
      const assetsDir = path.resolve(OUT_DIR, 'assets')
      const assets = fs.existsSync(assetsDir)
        ? fs
            .readdirSync(assetsDir, { withFileTypes: true })
            .filter((entry) => entry.isFile())
            .map((entry) => '/assets/' + entry.name)
        : []

      const next = source
        .replace(/BUILD_ID = "dev"/, `BUILD_ID = "${Date.now()}"`)
        .replace(/BUILD_ASSETS = \[\]/, `BUILD_ASSETS = ${JSON.stringify(assets)}`)
      fs.writeFileSync(swPath, next)
    },
  }
}

export default defineConfig({
  build: { outDir: OUT_DIR },
  plugins: [react(), serviceWorkerAssets()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
