// Generates one 1200x630 PNG per essay into public/og/{slug}.png by loading
// public/og/template.html in headless chromium with the essay's frontmatter
// passed as URL params. Run manually after editing essays:
//   npm run og
// PNGs are committed to git so Netlify builds don't need a headless browser.

import { readdir, readFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import matter from 'gray-matter'
import puppeteer from 'puppeteer'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ESSAYS_DIR = join(ROOT, 'src/content/essays')
const TEMPLATE = join(ROOT, 'public/og/template.html')
const OUT_DIR = join(ROOT, 'public/og')

function formatDate(date) {
  const d = new Date(date)
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${month} ${d.getUTCFullYear()}`
}

function countWords(body) {
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/^---[\s\S]*?---/, '')
    .split(/\s+/)
    .filter(Boolean).length
}

function buildParams(data, body) {
  const p = new URLSearchParams()
  p.set(
    'title',
    data.greekTitle ? `<gk>${data.greekTitle}</gk>` : data.title
  )
  p.set('dek', data.dek)
  p.set('kicker', data.kicker || 'Essay')
  p.set('num', String(data.number).padStart(3, '0'))
  p.set('date', formatDate(data.date))
  p.set('words', String(countWords(body)))
  p.set(
    'contributors',
    data.manifest
      .map((m) => `${m.isModel ? 'm' : 'h'}:${m.role}:${m.contributor}`)
      .join(',')
  )
  return p
}

async function shoot(page, params, outName, clears = []) {
  const url = `${pathToFileURL(TEMPLATE).href}?${params.toString()}`
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  if (clears.length) {
    await page.evaluate((ids) => {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el) el.textContent = ''
      })
    }, clears)
  }
  await new Promise((r) => setTimeout(r, 400))
  const card = await page.$('.card')
  if (!card) throw new Error(`No .card element for ${outName}`)
  await card.screenshot({ path: join(OUT_DIR, outName) })
  console.log(`✓ og/${outName}`)
}

function defaultParams() {
  const p = new URLSearchParams()
  p.set('title', 'symn<gk>ē</gk>mata')
  p.set(
    'dek',
    'Long-form essays written between a person and several models. The texts are the authority. The models are named.'
  )
  p.set('kicker', 'σύν + μνῆμα · co-rememberings · n. pl.')
  p.set('num', '')
  p.set('date', '')
  p.set('words', '')
  p.set('contributors', '')
  return p
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const files = (await readdir(ESSAYS_DIR)).filter((f) =>
    /\.mdx?$/.test(f)
  )

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 })

  await shoot(page, defaultParams(), 'default.png', [
    'm-num',
    'm-date',
    'm-words',
    'm-contributors',
  ])

  for (const file of files) {
    const raw = await readFile(join(ESSAYS_DIR, file), 'utf8')
    const { data, content } = matter(raw)

    if (data.draft) {
      console.log(`- skip ${file} (draft)`)
      continue
    }

    const slug = file.replace(/\.mdx?$/, '')
    await shoot(page, buildParams(data, content), `${slug}.png`)
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
