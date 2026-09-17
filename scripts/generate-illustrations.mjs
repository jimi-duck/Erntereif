/**
 * Generates one SVG tile per produce item into `public/produce/`.
 *
 * NOTHING IN THE APP READS THESE. The grid ships the photographs in
 * `public/produce/*.png`; this generator is kept as a worked-out way back to a
 * drawn set, the way the duotone generator before it was. It writes alongside
 * the photographs and never touches them.
 *
 * The drawings are built, not drawn: `illustrations/draw.mjs` owns the stroke
 * weight, the knockout rule and the shape vocabulary, `palette.mjs` owns the
 * coloured ground each crop sits on and the ink that reads against it, and
 * `recipes.mjs` says what each of the 87 crops is made of in six or seven
 * strokes. Change the weight in one place and all 87 follow.
 *
 * Run with: npm run illustrations
 *   --sheet   also write a contact sheet of the set to illustrations.html
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pen, svg } from './illustrations/draw.mjs'
import { TILES, inkFor } from './illustrations/palette.mjs'
import { recipes } from './illustrations/recipes.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'public/produce')
const items = JSON.parse(readFileSync(resolve(root, 'src/data/seasonalProduce.json'), 'utf8'))

mkdirSync(OUT_DIR, { recursive: true })

const missing = items.filter((i) => !recipes[i.id] || !TILES[i.id]).map((i) => i.id)
const orphan = Object.keys(recipes).filter((id) => !items.some((i) => i.id === id))
if (missing.length) {
  console.error(`No recipe or tile for: ${missing.join(', ')}`)
  process.exit(1)
}
if (orphan.length) console.warn(`Recipe with no item: ${orphan.join(', ')}`)

let bytes = 0
const drawn = []
for (const item of items) {
  const tile = TILES[item.id]
  const markup = svg(recipes[item.id](pen(tile, inkFor(tile))), { title: item.nameEN, tile })
  writeFileSync(resolve(OUT_DIR, `${item.id}.svg`), markup + '\n')
  bytes += markup.length
  drawn.push({ ...item, markup })
}

const photos = readdirSync(OUT_DIR).filter((f) => f.endsWith('.png')).length

if (process.argv.includes('--sheet')) {
  const count = (key) => drawn.filter((d) => d.category === key).length
  const section = (key, label) =>
    `<h2>${label}</h2><div class="grid">${drawn
      .filter((d) => d.category === key)
      .map((d) => `<figure>${d.markup}<figcaption>${d.nameEN}</figcaption></figure>`)
      .join('')}</div>`
  writeFileSync(
    resolve(root, 'illustrations.html'),
    `<!doctype html><meta charset="utf-8"><title>Produce tiles</title><style>
      body { margin:0; padding:40px; background:#fff; color:#141414;
             font:500 13px/1.4 Inter,-apple-system,Helvetica,sans-serif; -webkit-font-smoothing:antialiased }
      h1 { font-size:34px; letter-spacing:-.035em; margin:0 0 4px }
      p.sub { color:#8b8b8b; margin:0 0 36px }
      h2 { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:#8b8b8b;
           border-bottom:1px solid #eee; padding-bottom:8px; margin:40px 0 20px }
      .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(104px,1fr)); gap:18px 14px }
      figure { margin:0 }
      svg { display:block; width:100% }
      figcaption { margin-top:8px; font-size:12px; letter-spacing:-.01em }
    </style><h1>Produce tiles</h1><p class="sub">${drawn.length} crops · one stroke weight, one ink rule · not shipped</p>
    ${section('vegetable', `Vegetables (${count('vegetable')})`)}
    ${section('fruit', `Fruit (${count('fruit')})`)}
    ${section('herb', `Herbs (${count('herb')})`)}`,
  )
}

console.log(
  `${drawn.length} tiles · ${(bytes / 1024).toFixed(1)}KB total · ` +
    `${Math.round(bytes / drawn.length)}B average · ` +
    `${photos} photographs left untouched`,
)
