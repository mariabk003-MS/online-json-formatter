// Moves the site to its own domain in one step.
//   node scripts/switch-domain.mjs example.com
// 1. Replaces the old vercel.app address with https://<new host> in every tracked
//    text file (canonical links, social tags, JSON-LD, sitemap, robots.txt, feed,
//    llms.txt, IndexNow, README, ...).
// 2. Adds a permanent (301) redirect in vercel.json, so every visit to the old
//    address goes to the same page on the new domain.
// Run it only after the domain is connected to the Vercel project, then build,
// test and push as usual.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const OLD = 'online-json-formatter-ten.vercel.app'
const root = fileURLToPath(new URL('..', import.meta.url))

const host = (process.argv[2] || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
if (!/^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host)) {
  console.error('Usage: node scripts/switch-domain.mjs example.com   (a host name, without https:// or a path)')
  process.exit(1)
}
if (host === OLD) {
  console.error('That is the current address already.')
  process.exit(1)
}

const TEXT = /\.(html|jsx?|mjs|json|xml|txt|md|css)$/i
const SKIP = new Set(['package-lock.json', 'scripts/switch-domain.mjs'])
const files = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && TEXT.test(f) && !SKIP.has(f))

let changedFiles = 0
let replacements = 0
for (const file of files) {
  const path = root + file
  const text = readFileSync(path, 'utf8')
  const count = text.split(OLD).length - 1
  if (!count) continue
  writeFileSync(path, text.split(OLD).join(host))
  changedFiles++
  replacements += count
}

// 301 from the old address to the new domain (added after the replacement above,
// so the old host name in this rule is kept).
const vercelPath = root + 'vercel.json'
const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'))
vercel.redirects = (vercel.redirects || []).filter((r) => !(r.has || []).some((h) => h.value === OLD))
vercel.redirects.unshift({
  source: '/:path*',
  has: [{ type: 'host', value: OLD }],
  destination: `https://${host}/:path*`,
  permanent: true,
})
// Keep "redirects" right after "outputDirectory" for readability.
const { buildCommand, outputDirectory, redirects, ...rest } = vercel
writeFileSync(vercelPath, JSON.stringify({ buildCommand, outputDirectory, redirects, ...rest }, null, 2) + '\n')

console.log(`Replaced ${replacements} mentions of ${OLD} in ${changedFiles} files with ${host}.`)
console.log(`Added a 301 redirect: https://${OLD}/* → https://${host}/*`)
console.log('Next: npm.cmd run build, test, push; then add the domain in Search Console and Bing, submit sitemap.xml and feed.xml, and run npm.cmd run indexnow.')
