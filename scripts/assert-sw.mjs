/**
 * Post-build assertion for the emitted service worker (zero dependencies).
 * Runs in CI after `npm run build`. Fails on an unstamped dev worker, an
 * empty asset list, a missing asset file, or an omitted emitted JS/CSS.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const sw = fs.readFileSync(path.join(dist, 'sw.js'), 'utf8')

const id = sw.match(/^const BUILD_ID = "(\d+)"\s*;?$/m)?.[1]
assert(id, 'sw.js must contain a non-empty numeric BUILD_ID (was it stamped by the build?)')

const raw = sw.match(/^const BUILD_ASSETS = (\[[^\r\n]*\])\s*;?$/m)?.[1]
assert(raw, 'sw.js must contain its generated BUILD_ASSETS array')

const assets = JSON.parse(raw)
assert(Array.isArray(assets) && assets.length > 0, 'BUILD_ASSETS is empty')

for (const asset of assets) {
  assert(typeof asset === 'string' && asset.startsWith('/'), `Invalid asset: ${asset}`)
  const file = path.resolve(dist, asset.slice(1))
  const relative = path.relative(dist, file)
  assert(
    relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    `Asset escapes dist: ${asset}`,
  )
  assert(fs.statSync(file).isFile(), `Missing asset file: ${asset}`)
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(file) : [file]
  })
}

const emitted = walk(path.join(dist, 'assets'))
  .filter((file) => /\.(?:js|css)$/.test(file))
  .map((file) => '/' + path.relative(dist, file).split(path.sep).join('/'))

assert(emitted.some((file) => file.endsWith('.js')), 'No emitted JavaScript in dist/assets')
assert(emitted.some((file) => file.endsWith('.css')), 'No emitted CSS in dist/assets')

const listed = new Set(assets)
for (const file of emitted) {
  assert(listed.has(file), `Emitted ${file} is missing from BUILD_ASSETS`)
}

// Also required by the worker's current PRECACHE list.
for (const file of ['index.html', 'manifest.json']) {
  assert(fs.statSync(path.join(dist, file)).isFile(), `Missing ${file}`)
}

console.log(`SW assertions passed: build ${id}, ${assets.length} assets, ${emitted.length} emitted js/css`)
