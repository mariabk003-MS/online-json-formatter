// Tells Bing (and other IndexNow search engines like Yandex and Seznam) about
// every page in the sitemap, so new and changed pages are crawled quickly.
// Run after a deploy:  npm.cmd run indexnow
// The key file public/<key>.txt must already be live on the website.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const host = 'online-json-formatter-ten.vercel.app'

const keyFile = readdirSync(`${root}public`).find((name) => /^[a-f0-9]{32}\.txt$/.test(name))
if (!keyFile) throw new Error('No IndexNow key file (32 hex characters + .txt) found in public/')
const key = keyFile.replace('.txt', '')

const sitemap = readFileSync(`${root}public/sitemap-final.xml`, 'utf8')
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${keyFile}`, urlList }),
})

// 200 = accepted, 202 = accepted (key check pending). Anything else is a problem.
console.log(`IndexNow: sent ${urlList.length} URLs, response ${response.status} ${response.statusText}`)
if (response.status >= 400) {
  console.log(await response.text())
  process.exitCode = 1
}
