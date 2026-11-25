// Rewrites the Tools, Guides and Datasets sections of README.md from
// src/toolsList.js, so the README always lists every page with a link.
// Run: node scripts/update-readme.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { TOOL_GROUPS, GUIDES, DATASETS } from '../src/toolsList.js'

const SITE = 'https://online-json-formatter-ten.vercel.app'
const url = (href) => SITE + href
const cell = (text) => text.replace(/\|/g, '\\|')

const toolCount = TOOL_GROUPS.reduce((n, group) => n + group.tools.length, 0)

const tools = TOOL_GROUPS.map((group) =>
  [
    `### ${group.title.charAt(0).toUpperCase()}${group.title.slice(1)}`,
    '',
    '| Tool | What it does |',
    '|---|---|',
    ...group.tools.map((t) => `| [${cell(t.label)}](${url(t.href)}) | ${cell(t.text)} |`),
  ].join('\n')
).join('\n\n')

const guides = GUIDES.map((g) => `- [${g.label}](${url(g.href)})`).join('\n')
const datasets = DATASETS.map((d) => `- [${d.label.replace(/ →$/, '')}](${url(d.href)}): ${d.text}`).join('\n')

const section = `## Tools

${tools}

[See all tools on one page →](${url('/tools')})

## Guides

${guides}

## Free JSON datasets

${datasets}

`

let readme = readFileSync('README.md', 'utf8')
const start = readme.indexOf('## Tools\n')
const end = readme.indexOf('## Built with')
if (start < 0 || end < 0) throw new Error('README sections not found')
readme = readme.slice(0, start) + section + readme.slice(end)
// "35+ free JSON tools" → the real number, rounded down to a multiple of 5.
const rounded = `${Math.floor(toolCount / 5) * 5}+`
readme = readme.replace(/\b\d+\+ free JSON tools/g, `${rounded} free JSON tools`)
writeFileSync('README.md', readme)
console.log(`README updated: ${toolCount} tools, ${GUIDES.length} guides, ${DATASETS.length - 1} datasets (${rounded}).`)
