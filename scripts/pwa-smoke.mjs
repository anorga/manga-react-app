/**
 * Production-browser PWA smoke test (puppeteer-core, browser supplied via
 * CHROME_PATH). Serves the built app with `vite preview`, then verifies the
 * real registration code:
 *   1. the production app registers + activates the worker and gets control
 *   2. the app reloads offline (cache-backed), rendering the empty library
 *   3. a second worker (new BUILD_ID) activates, cleaning the old cache and
 *      PRESERVING an unrelated cache
 * Temporarily rewrites the generated dist/sw.js to a +1 BUILD_ID for the
 * upgrade step, restoring it afterward.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import puppeteer from 'puppeteer-core'

const origin = 'http://127.0.0.1:4173'
const file = 'dist/sw.js'
const original = await fs.readFile(file, 'utf8')
const oldId = original.match(/^const BUILD_ID = "(\d+)"/m)?.[1]
assert(oldId, 'Run build and assert-sw.mjs first (dist/sw.js must be stamped)')

const newId = String(BigInt(oldId) + 1n)
const oldCache = `read-manga-${oldId}`
const newCache = `read-manga-${newId}`
const errors = []

let browser
try {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
    args: ['--no-sandbox'],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(30_000)
  page.setDefaultNavigationTimeout(30_000)
  page.on('pageerror', (error) => errors.push(String(error)))

  // Prevent the HTTP cache from making the offline test pass by itself.
  await page.setCacheEnabled(false)
  await page.goto(`${origin}/library`, { waitUntil: 'load' })

  // Do not register manually: the production app must do that.
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    return registration?.active?.state === 'activated' && navigator.serviceWorker.controller !== null
  })

  await page.waitForFunction(async (name) => (await caches.keys()).includes(name), {}, oldCache)

  async function assertOfflineReload() {
    await page.setOfflineMode(true)
    try {
      const response = await page.reload({ waitUntil: 'load' })
      assert.equal(response?.status(), 200)
      await page.waitForFunction(() => document.querySelector('main h1')?.textContent === 'Nothing saved yet')
    } finally {
      await page.setOfflineMode(false)
    }
  }

  await assertOfflineReload()

  // Prove activation preserves caches owned by something else.
  await page.evaluate(async () => {
    await caches.open('unrelated-smoke-cache')
    window.__controllerChanges = 0
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.__controllerChanges += 1
    })
  })

  // Serve the "next deploy" (new BUILD_ID) and ask the app to update.
  await fs.writeFile(file, original.replace(`const BUILD_ID = "${oldId}"`, `const BUILD_ID = "${newId}"`))
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) throw new Error('Missing registration')
    await registration.update()
  })

  await page.waitForFunction(async ({ oldCache, newCache }) => {
    const keys = await caches.keys()
    return (
      window.__controllerChanges > 0 &&
      keys.includes(newCache) &&
      !keys.includes(oldCache) &&
      keys.includes('unrelated-smoke-cache')
    )
  }, {}, { oldCache, newCache })

  await assertOfflineReload()
  assert.deepEqual(errors, [], 'Browser page errors')
  console.log('PWA registration, offline reload, and cache upgrade passed')
} finally {
  try {
    await browser?.close()
  } finally {
    await fs.writeFile(file, original)
  }
}
