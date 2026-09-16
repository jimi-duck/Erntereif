/**
 * Generates one SVG per produce item into `public/produce/`.
 *
 * The drawings are built, not drawn: `scripts/illustrations/draw.mjs` owns the
 * shape vocabulary and the single lighting rule, `palette.mjs` owns the
 * pigments, and `recipes.mjs` says what each of the 87 crops is made of. That
 * split is what holds the set together — change the light in one place and all
 * 87 follow.
 *
 * Run with: npm run illustrations
 *   --sheet   also write a contact sheet of the whole set to illustrations.html
 */
import { mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svg } from './illustrations/draw.mjs'
import { recipes } from './illustrations/recipes.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'public/produce')
const DATA = resolve(root, 'src/data/seasonalProduce.json')

const items = JSON.parse(readFileSync(DATA, 'utf8'))

mkdirSync(OUT_DIR, { recursive: true })

const missing = items.filter((i) => !recipes[i.id]).map((i) => i.id)
const orphan = Object.keys(recipes).filter((id) => !items.some((i) => i.id === id))
if (missing.length) {
  console.error(`No recipe for: ${missing.join(', ')}`)
  process.exitCode = 1
}
if (orphan.length) console.warn(`Recipe with no item: ${orphan.join(', ')}`)

let bytes = 0
const drawn = []
for (const item of items) {
  const recipe = recipes[item.id]
  if (!recipe) continue
  const markup = svg(recipe(), { title: item.nameEN })
  writeFileSync(resolve(OUT_DIR, `${item.id}.svg`), markup + '\n')
  bytes += markup.length
  drawn.push({ id: item.id, name: item.nameEN, category: item.category, markup })
}

// The set replaced a folder of PNGs; clear them out rather than shipping both.
for (const file of readdirSync(OUT_DIR)) {
  if (file.endsWith('.png')) unlinkSync(resolve(OUT_DIR, file))
}

if (process.argv.includes('--sheet')) {
  const cell = (d) =>
    `<figure><div class="tile">${d.markup}</div><figcaption>${d.name}</figcaption></figure>`
  const section = (key, label) =>
    `<h2>${label}</h2><div class="grid">${drawn
      .filter((d) => d.category === key)
      .map(cell)
      .join('')}</div>`
  writeFileSync(
    resolve(root, 'illustrations.html'),
    `<!doctype html><meta charset="utf-8"><title>Produce illustrations</title><style>
      :root { --ink:#0f2a1e; --surface:#f2f3f0; --line:#e2e5e0 }
      body { margin:0; padding:40px; background:#fff; color:var(--ink);
             font:500 13px/1.4 Inter,-apple-system,Helvetica,sans-serif; -webkit-font-smoothing:antialiased }
      h1 { font-size:34px; letter-spacing:-.035em; margin:0 0 4px }
      p.sub { color:#8b958e; margin:0 0 36px }
      h2 { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#8b958e;
           border-bottom:1px solid var(--line); padding-bottom:8px; margin:40px 0 20px }
      .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(112px,1fr)); gap:20px 16px }
      figure { margin:0 }
      .tile { background:var(--surface); border-radius:3px; padding:8%; aspect-ratio:1 }
      svg { display:block; width:100%; height:100% }
      figcaption { margin-top:8px; font-size:12px; letter-spacing:-.01em }
    </style><h1>Produce illustrations</h1><p class="sub">${drawn.length} crops · one light, one palette</p>
    ${section('vegetable', `Vegetables (${drawn.filter((d) => d.category === 'vegetable').length})`)}
    ${section('fruit', `Fruit (${drawn.filter((d) => d.category === 'fruit').length})`)}
    ${section('herb', `Herbs (${drawn.filter((d) => d.category === 'herb').length})`)}`,
  )
}

console.log(
  `${drawn.length} illustrations · ${(bytes / 1024).toFixed(1)}KB total · ` +
    `${Math.round(bytes / Math.max(1, drawn.length))}B average`,
)
