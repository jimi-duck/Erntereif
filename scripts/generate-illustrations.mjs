/**
 * Generates one duotone SVG per produce item into `public/produce/`.
 *
 * Each item in `src/data/seasonalProduce.json` names only an `archetype` — the
 * shape language. Both colours come from `scripts/palette.mjs`, so all 87
 * illustrations are the same two inks and the variety is entirely in the
 * silhouette.
 *
 * Run with: npm run illustrations
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { INK, NEON, resolvePalette } from './palette.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(root, 'public/produce')
const NEON_RGB = [1, 3, 5].map((i) => parseInt(NEON.slice(i, i + 2), 16))

/* ----------------------------------- colour --------------------------------- */

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
/** Step a colour along the ink → neon ramp. `amount` 0 = untouched, 1 = neon. */
const tint = (hex, amount) => toHex(toRgb(hex).map((c, i) => c + (NEON_RGB[i] - c) * amount))
/** Mix a colour toward black. */
const shade = (hex, amount) => toHex(toRgb(hex).map((c) => c * (1 - amount)))

/* ---------------------------------- helpers --------------------------------- */

/** Stable small integer per item id, so same-archetype items differ predictably. */
const seedOf = (id) => {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}
/** Pick element `seed mod n` from a list. Guards against signed-shift negatives. */
const pick = (seed, list) => list[Math.abs(Math.trunc(seed)) % list.length]

/**
 * No-op anchor, like `groundShadow` and `gleam`. The archetypes were composed
 * with a shading crescent; the duotone silhouettes are flat, so it renders
 * nothing while the call sites stay readable.
 */
const volume = () => ''

/**
 * No-op anchor, like `groundShadow`. The archetypes were composed with a glossy
 * highlight; the duotone silhouettes are flat, so it renders nothing while the
 * call sites stay readable.
 */
const gleam = () => ''

const stem = (x, y, dx, dy, colour = INK, width = 7) =>
  `<path d="M${x} ${y}q${dx} ${dy * 0.5} ${dx * 1.1} ${dy}" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" fill="none"/>`

/** A single pointed leaf growing from (x,y) toward (x+dx, y+dy). */
const leaf = (x, y, dx, dy, colour, spread = 0.42) =>
  `<path d="M${x} ${y}Q${x + dx * spread - dy * spread} ${y + dy * spread + dx * spread} ${x + dx} ${y + dy}` +
  `Q${x + dx * spread + dy * spread} ${y + dy * spread - dx * spread} ${x} ${y}Z" fill="${colour}"/>`

/**
 * Kept as a no-op anchor. The archetypes below were composed around a cast
 * shadow; printed illustration has none, so it renders nothing while the call
 * sites stay readable.
 */
const groundShadow = () => ''

/* --------------------------------- archetypes -------------------------------- */
/* Each receives [base, shade, highlight, foliage] and returns SVG body markup.  */

const archetypes = {
  'round-fruit': ([b, , , f], seed) => {
    // Seven crops share this shape, so in a monochrome set they need to differ
    // by silhouette: how round the body is, and how the stem and leaf sit.
    const squash = pick(seed, [1, 0.93, 1.06, 0.97])
    const tilt = pick(seed >>> 2, [0, -10, 12, -6])
    const stemLen = pick(seed >>> 4, [22, 30, 16])
    const leaves = 1 + (seed % 2)
    return `
    ${groundShadow()}
    <ellipse cx="120" cy="134" rx="${58 / squash}" ry="${58 * squash}" fill="${b}"/>
    <g transform="rotate(${tilt} 120 134)">
      ${stem(120, 134 - 58 * squash + 4, 2, -stemLen, b)}
      ${leaf(124, 134 - 58 * squash + 4 - stemLen, 38, -6, f)}
      ${leaves > 1 ? leaf(116, 134 - 58 * squash + 10 - stemLen, -32, -4, f) : ''}
    </g>`
  },

  citrus: ([b, s, h, f]) => `
    ${groundShadow(198, 52)}
    <circle cx="156" cy="146" r="40" fill="${tint(b, 0.55)}"/>
    <circle cx="156" cy="146" r="31" fill="${tint(b, 0.3)}"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M156 146L${156 + 29 * Math.cos((a * Math.PI) / 180)} ${146 + 29 * Math.sin((a * Math.PI) / 180)}" stroke="${tint(b, 0.72)}" stroke-width="3.5" stroke-linecap="round"/>`).join('')}
    <ellipse cx="102" cy="130" rx="50" ry="46" fill="${b}"/>
    ${volume(102, 130, 50, s, 0.36, 0.92)}
    ${gleam(82, 110, 16, 10, h)}
    <circle cx="102" cy="84" r="7" fill="${s}"/>
    ${leaf(106, 82, 34, -18, f)}`,

  'stone-fruit': ([b, s, h, f]) => `
    ${groundShadow(196, 48)}
    <path d="M118 62q-16 30 -26 52M122 62q14 26 24 48" stroke="${f}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <circle cx="90" cy="142" r="34" fill="${b}"/>
    ${volume(90, 142, 34, s)}
    ${gleam(77, 128, 11, 7, h)}
    <circle cx="150" cy="150" r="30" fill="${b}"/>
    ${volume(150, 150, 30, s)}
    ${gleam(139, 138, 9, 6, h)}
    ${leaf(120, 62, 40, -14, f)}`,

  'berry-cluster': ([b, , h, f], seed) => {
    const r = pick(seed, [13, 10, 16])
    const rows = 3 + (seed % 2)
    const berries = Array.from({ length: rows }, (_, row) => {
      const n = row === rows - 1 ? 1 : 3 - (row % 2)
      return Array.from({ length: n }, (_, i) => [
        120 + (n === 1 ? 0 : -30 + (i * 60) / (n - 1)),
        96 + row * (r * 2.6),
      ])
    }).flat()
    return `
    ${groundShadow()}
    <path d="M120 58v34" stroke="${f}" stroke-width="3.6" stroke-linecap="round"/>
    ${berries.map(([x, y]) => `<path d="M120 84L${x} ${y}" stroke="${f}" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${berries.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.26}" fill="${h}" opacity="0.8"/>`).join('')}
    ${leaf(118, 60, 34, -12, f)}`
  },

  'cane-berry': ([b, , h, f], seed) => {
    const r = pick(seed, [14, 11])
    const rows = [3, 3, 2, 2, 1].slice(0, 4 + (seed % 2))
    const drupes = rows.flatMap((n, row) =>
      Array.from({ length: n }, (_, i) => [
        120 + (n === 1 ? 0 : -(n - 1) * r + i * 2 * r),
        84 + row * r * 1.7,
      ]),
    )
    return `
    ${groundShadow()}
    ${drupes.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/><circle cx="${x - r * 0.28}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="${h}" opacity="0.7"/>`).join('')}
    ${leaf(120, 80, -30, -26, f)}${leaf(120, 80, 30, -26, f)}${leaf(120, 78, 0, -34, f)}`
  },

  'small-berry': ([b, s, , f], seed) => {
    const big = pick(seed, [36, 30, 40])
    const small = big - pick(seed >>> 2, [8, 4, 12])
    const stalks = 1 + (seed % 2)
    return `
    ${groundShadow()}
    ${leaf(126, 74, 40, -12, f)}${stalks > 1 ? leaf(114, 74, -36, -16, f) : ''}
    <circle cx="96" cy="140" r="${big}" fill="${b}"/>
    <circle cx="${152 + (40 - big) / 2}" cy="152" r="${small}" fill="${b}"/>
    <path d="M96 ${140 - big}v-${28 - (40 - big)}M${152 + (40 - big) / 2} ${152 - small}v-22" stroke="${f}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="96" cy="${140 - big + 6}" r="4" fill="${s}" opacity="0.9"/>`
  },

  strawberry: ([b, , h, f]) => `
    ${groundShadow(196, 44)}
    <path d="M120 194q-52 -30 -52 -74q0 -26 52 -26q52 0 52 26q0 44 -52 74Z" fill="${b}"/>
    <path d="M120 194q52 -30 52 -74q0 -26 -52 -26v100Z" fill="none"/>
    ${[[100, 116], [122, 112], [144, 118], [110, 138], [132, 138], [120, 160], [98, 142], [146, 142]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="5" fill="${h}" opacity="0.85"/>`).join('')}
    ${gleam(98, 106, 13, 7, h, -24, 0.45)}
    ${[-46, -24, 0, 24, 46].map((d) => leaf(120, 94, d, -28 + Math.abs(d) * 0.18, f)).join('')}
    <path d="M120 92v-26" stroke="${f}" stroke-width="6" stroke-linecap="round"/>`,

  'grape-cluster': ([b, s, h, f]) => {
    const rows = [[80, 108, 4], [86, 134, 4], [94, 160, 3], [104, 182, 2]]
    const balls = rows.flatMap(([x0, y, n]) => Array.from({ length: n }, (_, i) => [x0 + i * 27, y]))
    return `
    ${groundShadow(202, 42)}
    <path d="M120 72v-20q0 -10 14 -12" stroke="${f}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${balls.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${b}"/>${volume(x, y, 15, s, 0.34)}<circle cx="${x - 5}" cy="${y - 6}" r="4" fill="${h}" opacity="0.55"/>`).join('')}
    ${leaf(130, 60, 40, 6, f)}`
  },

  pear: ([b, , h, f]) => `
    ${groundShadow(196, 42)}
    <path d="M120 78q22 0 22 26q0 16 12 28q14 14 14 32q0 32 -48 32q-48 0 -48 -32q0 -18 14 -32q12 -12 12 -28q0 -26 22 -26Z" fill="${b}"/>
    <path d="M120 78q22 0 22 26q0 16 12 28q14 14 14 32q0 32 -48 32V78Z" fill="none"/>
    ${gleam(99, 132, 11, 20, h, 12, 0.4)}
    ${stem(120, 78, 4, -24)}
    ${leaf(124, 60, 36, -4, f)}`,

  fig: ([b, s, h, f]) => `
    ${groundShadow(196, 42)}
    <path d="M120 84q34 6 40 44q6 40 -40 62q-46 -22 -40 -62q6 -38 40 -44Z" fill="${b}"/>
    <path d="M120 84q34 6 40 44q6 40 -40 62V84Z" fill="none"/>
    <path d="M120 106q20 18 20 42q0 22 -20 34q-20 -12 -20 -34q0 -24 20 -42Z" fill="${h}" opacity="0.45"/>
    ${[[120, 140], [112, 156], [128, 156], [120, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${s}" opacity="0.6"/>`).join('')}
    <path d="M120 84v-18" stroke="${f}" stroke-width="7" stroke-linecap="round"/>
    ${leaf(118, 68, -34, -12, f)}${leaf(122, 68, 34, -12, f)}`,

  melon: ([b, s, h, f], seed) => `
    ${groundShadow(198, 52)}
    <defs><clipPath id="melon-${seed}"><circle cx="120" cy="130" r="62"/></clipPath></defs>
    <circle cx="120" cy="130" r="62" fill="${b}"/>
    ${volume(120, 130, 62, s, 0.3)}
    <g clip-path="url(#melon-${seed})">
      ${[-44, -22, 0, 22, 44]
        .map(
          (d) =>
            `<path d="M${120 + d} 66q${-d * 0.34} 64 0 128" stroke="${f}" stroke-width="5" fill="none" opacity="0.55" stroke-linecap="round"/>`,
        )
        .join('')}
    </g>
    ${gleam(92, 102, 17, 10, h, -30, 0.4)}
    ${stem(120, 70, 3, -18, f)}`,

  'leafy-head': ([b, , , f], seed) => {
    const squash = pick(seed, [1, 0.88, 1.1, 0.95])
    const r = 60
    const ribs = 2 + (seed % 4)
    const wraps = seed % 3
    const nub = pick(seed >>> 3, [12, 0, 20])
    const rx = r / squash
    const ry = r * squash
    return `
    ${groundShadow()}
    <ellipse cx="120" cy="128" rx="${rx}" ry="${ry}" fill="${b}"/>
    ${Array.from({ length: ribs }, (_, i) => {
      const t = -1 + (2 * (i + 1)) / (ribs + 1)
      return `<path d="M120 ${128 - ry + 4}q${rx * t * 1.15} ${ry} 0 ${ry * 1.9}" stroke="${tint(b, 0.42)}" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    }).join('')}
    ${Array.from({ length: wraps }, (_, i) =>
      leaf(120, 128 + ry * 0.55, (i % 2 ? 1 : -1) * (rx + 26), -18 - i * 12, f, 0.62),
    ).join('')}
    ${nub ? `<path d="M120 ${128 - ry}v-${nub}" stroke="${f}" stroke-width="7" stroke-linecap="round"/>` : ''}`
  },

  'leafy-loose': ([b, s, h, f], seed) => {
    const pairs = 2 + (seed % 3)
    const reach = pick(seed >>> 2, [62, 50, 72])
    const stalkW = pick(seed >>> 4, [12, 7, 16])
    const rib = (y, dx, dy) =>
      `<path d="M120 ${y}q${dx * 0.5} ${dy * 0.42} ${dx * 0.88} ${dy * 0.88}" stroke="${f}" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="0.9"/>`
    const rows = Array.from({ length: pairs }, (_, i) => ({
      y: 178 - i * (46 / pairs) * 1.2,
      dx: reach - i * 6,
      dy: -50 - i * 14,
      fill: i % 2 ? b : s,
    }))
    return `
    ${groundShadow()}
    <path d="M120 198V112" stroke="${f}" stroke-width="${stalkW}" stroke-linecap="round"/>
    ${rows.map((r) => leaf(120, r.y, -r.dx, r.dy, r.fill) + leaf(120, r.y, r.dx, r.dy, r.fill)).join('')}
    ${leaf(120, 132, 0, -78, h, 0.3)}
    ${rows.map((r) => rib(r.y, -r.dx, r.dy) + rib(r.y, r.dx, r.dy)).join('')}
    <path d="M120 198V120" stroke="${f}" stroke-width="${stalkW}" stroke-linecap="round"/>`
  },

  rosette: ([b, , h, f], seed) => {
    const petals = 8 + (seed % 4)
    const reach = pick(seed >>> 2, [58, 48, 66])
    const round = pick(seed >>> 4, [0.5, 0.8, 0.35])
    return `
    ${groundShadow()}
    ${Array.from({ length: petals }, (_, i) => {
      const a = (i / petals) * Math.PI * 2 - Math.PI / 2
      const len = reach + (i % 3) * 7
      return leaf(120, 140, Math.cos(a) * len, Math.sin(a) * len * 0.8, i % 2 ? b : tint(b, 0.34), round)
    }).join('')}
    <circle cx="120" cy="140" r="13" fill="${h}"/>
    <circle cx="120" cy="140" r="6" fill="${f}" opacity="0.6"/>`
  },

  'root-taper': ([b, s, , f], seed) => {
    const halfW = pick(seed, [20, 15, 25])
    const len = pick(seed >>> 2, [84, 100, 70])
    const tops = 2 + (seed % 3)
    const rings = 2 + ((seed >>> 4) % 3)
    return `
    ${groundShadow()}
    <path d="M${120 - halfW} 96h${halfW * 2}l-${halfW * 0.7} ${len}q-${halfW * 0.3} 22 -${halfW * 0.3} 22t-${halfW * 0.3} -22Z" fill="${b}"/>
    ${Array.from({ length: rings }, (_, i) => {
      const y = 96 + ((i + 1) * len) / (rings + 1)
      const half = halfW - (halfW * 0.7 * (y - 96)) / len
      return `<path d="M${120 - half * 0.8} ${y}h${half * 1.6}" stroke="${s}" stroke-width="3" opacity="0.8" stroke-linecap="round"/>`
    }).join('')}
    ${Array.from({ length: tops }, (_, i) => {
      const spread = tops === 1 ? 0 : -46 + (i * 92) / (tops - 1)
      return leaf(120, 96, spread, -54 + Math.abs(spread) * 0.1, f)
    }).join('')}`
  },

  'root-bulbous': ([b, s, , f], seed) => {
    const squash = pick(seed, [1, 0.86, 1.12])
    const rx = 44 / squash
    const ry = 44 * squash
    const tops = 2 + (seed % 3)
    const taproot = pick(seed >>> 2, [0, 26, 14])
    return `
    ${groundShadow()}
    ${taproot ? `<path d="M120 ${142 + ry}q-3 ${taproot * 0.6} -7 ${taproot}" stroke="${b}" stroke-width="5" stroke-linecap="round" fill="none"/>` : ''}
    <ellipse cx="120" cy="142" rx="${rx}" ry="${ry}" fill="${b}"/>
    ${pick(seed >>> 4, [0, 1, 0]) ? `<path d="M${120 - rx * 0.55} 142q${rx * 0.55} ${ry * 0.5} ${rx * 1.1} 0" stroke="${s}" stroke-width="3.5" fill="none" opacity="0.8"/>` : ''}
    ${Array.from({ length: tops }, (_, i) => {
      const spread = tops === 1 ? 0 : -46 + (i * 92) / (tops - 1)
      return leaf(120, 142 - ry + 4, spread, -50 + Math.abs(spread) * 0.12, f)
    }).join('')}`
  },

  tuber: ([b, s, , f], seed) => {
    const count = 2 + (seed % 2)
    const blobs = [
      [98, 136, 46, 34, -16],
      [158, 160, 34, 26, 12],
      [74, 178, 27, 20, 8],
    ].slice(0, count)
    return `
    ${groundShadow()}
    ${blobs.map(([x, y, rx, ry, rot]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${b}" transform="rotate(${rot} ${x} ${y})"/>`).join('')}
    ${[[84, 124], [110, 146], [92, 152], [150, 154], [168, 166]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="${s}" opacity="0.9"/>`).join('')}
    ${pick(seed >>> 3, [0, 1]) ? leaf(120, 104, 22, -26, f) : ''}`
  },

  garlic: ([b, s, , f]) => `
    ${groundShadow()}
    <path d="M120 84q44 22 44 62q0 38 -44 38q-44 0 -44 -38q0 -40 44 -62Z" fill="${b}"/>
    ${[-26, -9, 9, 26].map((d) => `<path d="M120 88q${d * 1.5} 40 ${d * 1.7} 62" stroke="${s}" stroke-width="3" fill="none" opacity="0.85" stroke-linecap="round"/>`).join('')}
    <path d="M120 84V56" stroke="${f}" stroke-width="6" stroke-linecap="round"/>
    ${leaf(120, 58, -20, -22, f)}${leaf(120, 58, 20, -22, f)}`,

  bulb: ([b, s, h, f]) => `
    ${groundShadow(200, 40)}
    <path d="M120 96q46 10 46 52q0 40 -46 40q-46 0 -46 -40q0 -42 46 -52Z" fill="${b}"/>
    <path d="M120 96q46 10 46 52q0 40 -46 40V96Z" fill="none"/>
    ${[-30, -15, 0, 15, 30].map((d) => `<path d="M120 98q${d * 1.4} 34 ${d * 1.5} 60" stroke="${s}" stroke-width="2.6" fill="none" opacity="0.4" stroke-linecap="round"/>`).join('')}
    ${gleam(97, 124, 11, 18, h, 16, 0.4)}
    <path d="M120 96q-6 -18 -14 -26M120 96q4 -20 14 -28M120 96v-30" stroke="${f}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M120 188v10" stroke="${tint(b, 0.4)}" stroke-width="3.5" stroke-linecap="round"/>`,

  'stalk-bundle': ([b, s, h, f], seed) => {
    const count = 2 + (seed % 3)
    const w = pick(seed >>> 2, [13, 10, 16])
    const top = pick(seed >>> 4, [58, 72, 50])
    const spear = (x, t, tilt) => `
      <g transform="rotate(${tilt} ${x} 194)">
        <path d="M${x - w} 192V${t + 26}Q${x - w} ${t + 4} ${x} ${t}Q${x + w} ${t + 4} ${x + w} ${t + 26}V192Q${x} 200 ${x - w} 192Z" fill="${b}"/>
        <path d="M${x - w * 0.35} ${t + 38}V172" stroke="${s}" stroke-width="3.4" opacity="0.8" stroke-linecap="round"/>
        ${[0, 1, 2].map((i) => `<path d="M${x - w * 0.7} ${t + 16 + i * 12}q${w * 0.7} 7 ${w * 1.4} 0" stroke="${h}" stroke-width="2.8" fill="none" opacity="0.8"/>`).join('')}
      </g>`
    const xs = Array.from({ length: count }, (_, i) =>
      count === 1 ? 120 : 120 - 34 + (i * 68) / (count - 1),
    )
    return `
    ${groundShadow()}
    ${xs.map((x, i) => spear(x, top + Math.abs(i - (count - 1) / 2) * 12, (i - (count - 1) / 2) * 7)).join('')}
    ${xs.map((x, i) => leaf(x, top + Math.abs(i - (count - 1) / 2) * 12 + 2, (i - (count - 1) / 2) * 22, -26, f)).join('')}
    <path d="M${120 - 40} 156h80" stroke="${f}" stroke-width="7" stroke-linecap="round"/>`
  },

  cauliflower: ([b, s, h, f]) => `
    ${groundShadow()}
    <path d="M110 194V126h20v68Z" fill="${b}"/>
    ${leaf(120, 172, -60, -30, f, 0.75)}${leaf(120, 172, 60, -30, f, 0.75)}
    <path d="M120 66q56 0 56 44q0 34 -56 34q-56 0 -56 -34q0 -44 56 -44Z" fill="${b}"/>
    ${[[92, 96], [120, 84], [148, 96], [106, 116], [134, 116], [120, 104]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${h}" opacity="0.55"/>`).join('')}
    <path d="M70 118q50 12 100 0" stroke="${s}" stroke-width="3.4" fill="none" opacity="0.8"/>`,

  'brassica-floret': ([b, s, h, f]) => `
    ${groundShadow(202, 40)}
    <path d="M110 194V128h20v66Z" fill="${tint(b, 0.42)}"/>
    ${leaf(120, 168, -58, -22, f)}${leaf(120, 168, 58, -22, f)}
    ${[[120, 96, 38], [86, 118, 28], [154, 118, 28], [102, 138, 24], [138, 138, 24]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/>`).join('')}
    ${[[120, 96, 38], [86, 118, 28], [154, 118, 28]].map(([x, y, r]) => volume(x, y, r, s, 0.26)).join('')}
    ${[[104, 88], [136, 90], [120, 74], [92, 108], [150, 110], [118, 116], [100, 130], [140, 130]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${h}" opacity="0.5"/>`).join('')}`,

  sprouts: ([b, s, h, f]) => `
    ${groundShadow(198, 46)}
    ${[[92, 148, 32], [150, 156, 26], [122, 116, 28]].map(([x, y, r]) => `
      <circle cx="${x}" cy="${y}" r="${r}" fill="${b}"/>
      ${volume(x, y, r, s, 0.34)}
      <path d="M${x} ${y - r}q${-r * 0.6} ${r} 0 ${r * 2}" stroke="${h}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M${x} ${y - r}q${r * 0.6} ${r} 0 ${r * 2}" stroke="${tint(b, 0.3)}" stroke-width="3" fill="none" opacity="0.6"/>
      <circle cx="${x - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.18}" fill="${h}" opacity="0.5"/>`).join('')}
    ${leaf(122, 92, -26, -22, f)}${leaf(122, 92, 26, -22, f)}`,

  pod: ([b, , h, f], seed) => {
    const open = seed % 2 === 0
    const depth = open ? 40 : 26
    const half = open ? 68 : 74
    return `
    ${groundShadow()}
    <g transform="rotate(-12 120 112)">
      <path d="M${120 - half} 100q${half} -30 ${half * 2} 0q-${half * 0.24} 30 -${half} 30q-${half * 0.76} 0 -${half} -30Z" fill="${b}"/>
      <path d="M${120 - half + 10} 102q${half - 10} -20 ${(half - 10) * 2} 0" stroke="${tint(b, 0.4)}" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <g transform="rotate(7 120 162)">
      <path d="M${120 - half} 150q${half} -20 ${half * 2} 0q-${half * 0.2} ${depth} -${half} ${depth}q-${half * 0.8} 0 -${half} -${depth}Z" fill="${b}"/>
      ${open
        ? [84, 120, 156].map((x) => `<circle cx="${x}" cy="154" r="16" fill="${h}"/>`).join('')
        : [90, 120, 150].map((x) => `<circle cx="${x}" cy="158" r="8" fill="${tint(b, 0.4)}"/>`).join('')}
    </g>
    <path d="M${120 + half} 92q18 -8 24 -26" stroke="${f}" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${leaf(120 + half + 20, 68, 26, -18, f)}`
  },

  squash: ([b, s, h, f]) => `
    ${groundShadow(198, 56)}
    <ellipse cx="120" cy="138" rx="68" ry="56" fill="${b}"/>
    <path d="M120 82q68 0 68 56q0 56 -68 56Z" fill="none"/>
    ${[-46, -24, 0, 24, 46].map((d) => `<path d="M${120 + d} 86q${-d * 0.3} 52 0 104" stroke="${s}" stroke-width="4" fill="none" opacity="0.42" stroke-linecap="round"/>`).join('')}
    ${gleam(88, 108, 18, 10, h, -28, 0.4)}
    <path d="M120 84V64q0 -8 10 -10" stroke="${f}" stroke-width="10" stroke-linecap="round" fill="none"/>
    ${leaf(134, 56, 32, -6, f)}`,

  cucumber: ([b, , h, f], seed) => {
    const len = pick(seed, [120, 138])
    const thick = pick(seed >>> 2, [50, 42])
    const angle = pick(seed >>> 4, [-34, -22])
    return `
    ${groundShadow()}
    <g transform="rotate(${angle} 120 130)">
      <rect x="${120 - len / 2}" y="${131 - thick / 2}" width="${len}" height="${thick}" rx="${thick / 2}" fill="${b}"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const x = 120 - len / 2 + 16 + i * ((len - 32) / 5)
        return `<ellipse cx="${x}" cy="${131 + (i % 2 ? -8 : 8)}" rx="3.4" ry="4.4" fill="${h}" opacity="0.75"/>`
      }).join('')}
      <path d="M${120 + len / 2} 131h12" stroke="${f}" stroke-width="7" stroke-linecap="round"/>
    </g>
    ${leaf(150, 76, 34, -14, f)}`
  },

  nightshade: ([b, s, , f]) => `
    ${groundShadow(198, 46)}
    <path d="M120 88q52 0 52 46q0 58 -52 58q-52 0 -52 -58q0 -46 52 -46Z" fill="${b}"/>
    <path d="M120 88q52 0 52 46q0 58 -52 58Z" fill="none"/>
    <path d="M96 110q-12 22 -6 52" stroke="${s}" stroke-width="9" fill="none" opacity="0.55" stroke-linecap="round"/>
    ${[-34, 0, 34].map((d) => leaf(120, 92, d, -26 + Math.abs(d) * 0.12, f)).join('')}
    <path d="M120 88V58" stroke="${f}" stroke-width="9" stroke-linecap="round"/>`,

  aubergine: ([b, , h, f]) => `
    ${groundShadow(198, 42)}
    <g transform="rotate(-12 120 140)">
      <path d="M120 78q40 0 40 46q0 34 -18 56q-12 14 -22 14q-10 0 -22 -14q-18 -22 -18 -56q0 -46 40 -46Z" fill="${b}"/>
      <path d="M120 78q40 0 40 46q0 34 -18 56q-12 14 -22 14Z" fill="none"/>
      <path d="M100 104q-10 24 -4 54" stroke="${h}" stroke-width="8" fill="none" opacity="0.4" stroke-linecap="round"/>
      ${[-32, -11, 11, 32].map((d) => leaf(120, 84, d, -28 + Math.abs(d) * 0.2, f)).join('')}
      <path d="M120 82V54" stroke="${f}" stroke-width="9" stroke-linecap="round"/>
    </g>`,

  corn: ([b, , h, f]) => `
    ${groundShadow(200, 36)}
    ${leaf(120, 176, -60, -74, f)}${leaf(120, 176, 60, -74, f)}
    <path d="M120 72q34 0 34 44v40q0 32 -34 32q-34 0 -34 -32v-40q0 -44 34 -44Z" fill="${b}"/>
    <path d="M120 72q34 0 34 44v40q0 32 -34 32Z" fill="none"/>
    ${Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
      const x = 98 + c * 15 + (r % 2) * 7
      const y = 96 + r * 17
      return `<ellipse cx="${x}" cy="${y}" rx="6.2" ry="7" fill="${h}" opacity="${0.42 + (c % 2) * 0.16}"/>`
    }).join('')).join('')}
    <path d="M110 74q6 -22 10 -26M130 76q-4 -22 -10 -26" stroke="${tint(f, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  mushroom: ([b, , h, f]) => `
    ${groundShadow(198, 42)}
    <path d="M104 128h32v50q0 14 -16 14q-16 0 -16 -14Z" fill="${tint(b, 0.24)}"/>
    <path d="M120 128h16v50q0 14 -16 14Z" fill="none"/>
    <path d="M52 132q0 -58 68 -58q68 0 68 58q0 10 -68 10q-68 0 -68 -10Z" fill="${b}"/>
    <path d="M120 74q68 0 68 58q0 10 -68 10Z" fill="none"/>
    ${gleam(92, 100, 20, 11, h, -22, 0.5)}
    <path d="M56 134q30 8 64 8q34 0 64 -8" stroke="${f}" stroke-width="4" fill="none" opacity="0.45"/>
    <ellipse cx="166" cy="176" rx="20" ry="15" fill="${b}" opacity="0.85"/>
    <path d="M166 161q20 0 20 15q0 0 -20 0Z" fill="none"/>`,

  chicory: ([b, s, h, f], seed) => {
    const w = pick(seed, [34, 27, 41])
    const point = pick(seed >>> 2, [76, 60, 88])
    return `
    ${groundShadow()}
    <path d="M120 200q-${w} -12 -${w} -64q0 -${point} ${w} -${point + 12}q${w} ${12} ${w} ${point + 12}q0 52 -${w} 64Z" fill="${b}"/>
    ${[0.4, 0.75].map((t) => `<path d="M120 ${200 - point - 12 + 6}q${w * t} 24 ${w * t} 62q0 30 ${-w * t} 72" fill="none" stroke="${s}" stroke-width="3" opacity="0.8"/>`).join('')}
    <path d="M120 ${200 - point - 12}q-18 14 -24 40q16 -14 24 -26q8 12 24 26q-6 -26 -24 -40Z" fill="${h}"/>
    <path d="M104 192q16 7 32 0" stroke="${f}" stroke-width="6" fill="none" stroke-linecap="round"/>`
  },

  fennel: ([b, , h, f]) => `
    ${groundShadow(202, 42)}
    <path d="M120 96q48 0 48 48q0 46 -48 46q-48 0 -48 -46q0 -48 48 -48Z" fill="${b}" stroke="${shade(b, 0.22)}" stroke-width="3"/>
    <path d="M120 96q48 0 48 48q0 46 -48 46Z" fill="none"/>
    ${[-28, -14, 0, 14, 28].map((d) => `<path d="M${120 + d} 98q${-d * 0.3} 44 0 88" stroke="${shade(b, 0.2)}" stroke-width="3" fill="none" opacity="0.45" stroke-linecap="round"/>`).join('')}
    ${gleam(96, 122, 10, 18, h, 12, 0.5)}
    <path d="M96 98V64M120 96V54M144 98V64" stroke="${tint(f, 0.25)}" stroke-width="7" stroke-linecap="round"/>
    ${[[96, 62], [120, 52], [144, 62]].map(([x, y]) => Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i - 2) * 0.42
      return `<path d="M${x} ${y}l${Math.cos(a) * 22} ${Math.sin(a) * 22}" stroke="${f}" stroke-width="3.6" stroke-linecap="round"/>`
    }).join('')).join('')}`,

  artichoke: ([b, s, h, f]) => {
    /** One upward-pointing bract. */
    const bract = (x, y, w, hh, colour) =>
      `<path d="M${x - w} ${y}Q${x - w - 3} ${y - hh} ${x} ${y - hh - 6}Q${x + w + 3} ${y - hh} ${x + w} ${y}Q${x} ${y + 8} ${x - w} ${y}Z" fill="${colour}"/>` +
      `<path d="M${x - w} ${y}Q${x - w - 3} ${y - hh} ${x} ${y - hh - 6}" stroke="${s}" stroke-width="2" fill="none" opacity="0.3"/>`
    const rows = [
      { y: 186, n: 3, w: 17, hh: 26, spread: 32, c: shade(b, 0.2) },
      { y: 170, n: 4, w: 19, hh: 30, spread: 52, c: shade(b, 0.1) },
      { y: 150, n: 4, w: 20, hh: 32, spread: 56, c: b },
      { y: 130, n: 4, w: 19, hh: 32, spread: 50, c: tint(b, 0.08) },
      { y: 112, n: 3, w: 18, hh: 30, spread: 36, c: tint(b, 0.16) },
      { y: 96, n: 2, w: 16, hh: 28, spread: 18, c: tint(b, 0.24) },
      { y: 84, n: 1, w: 14, hh: 24, spread: 0, c: tint(b, 0.32) },
    ]
    return `
    ${groundShadow(206, 30)}
    <path d="M120 208v-40" stroke="${f}" stroke-width="11" stroke-linecap="round"/>
    ${rows
      .map(({ y, n, w, hh, spread, c }) =>
        Array.from({ length: n }, (_, i) =>
          bract(120 + (n === 1 ? 0 : -spread + (i * spread * 2) / (n - 1)), y, w, hh, c),
        ).join(''),
      )
      .join('')}
    <path d="M120 74q-6 -12 1 -20" stroke="${h}" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85"/>`
  },

  'herb-sprig': ([b, s, h, f], seed) => {
    const round = pick(seed, [0.4, 0.6, 0.85, 0.5])
    const pairs = 4 + (seed % 2)
    const lean = pick(seed >>> 2, [0, 5, -5])
    const droop = pick(seed >>> 4, [0.16, 0.34, 0.5])
    const step = 96 / pairs
    return `
    ${groundShadow(202, 34)}
    <g transform="rotate(${lean} 120 196)">
      <path d="M120 198V72" stroke="${f}" stroke-width="6" stroke-linecap="round"/>
      ${Array.from({ length: pairs }, (_, i) => {
        const y = 176 - i * step
        const size = 46 - i * 2 + (seed % 4)
        return (
          leaf(120, y, -size, -size * droop, i % 2 ? b : s, round) +
          leaf(120, y - 8, size, -size * droop, i % 2 ? s : b, round)
        )
      }).join('')}
      ${leaf(120, 86, 0, -26, h, round * 0.85)}
    </g>`
  },

  'herb-needle': ([b, s, h, f], seed) => {
    const count = 8 + (seed % 3)
    const spanNeedle = 19 + (seed % 4) * 2
    return `
    ${groundShadow(202, 30)}
    ${[[94, 13], [146, -13], [120, 0]].map(([x, tilt]) => `
      <g transform="rotate(${tilt} ${x} 190)">
        <path d="M${x} 196V68" stroke="${shade(b, 0.22)}" stroke-width="5" stroke-linecap="round"/>
        ${Array.from({ length: count }, (_, i) => {
          const y = 80 + i * ((110 - (count - 8) * 4) / count)
          return `<path d="M${x} ${y}l-${spanNeedle} -6M${x} ${y + 5}l${spanNeedle} -6" stroke="${i % 2 ? b : s}" stroke-width="5.4" stroke-linecap="round"/>`
        }).join('')}
        <path d="M${x} 70v-6" stroke="${h}" stroke-width="5" stroke-linecap="round"/>
      </g>`).join('')}
    <circle cx="152" cy="94" r="7" fill="${f}" opacity="0.8"/>
    <circle cx="90" cy="108" r="5.5" fill="${f}" opacity="0.65"/>`
  },

  'herb-grass': ([b, s, h, f]) => `
    ${groundShadow(204, 32)}
    ${[[-46, 78], [-24, 62], [-2, 56], [20, 62], [42, 76]].map(([dx, top], i) => `
      <path d="M120 196q${dx * 0.3} -${(196 - top) * 0.55} ${dx} -${196 - top}" stroke="${i % 2 ? b : s}" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M120 190q${dx * 0.3} -${(196 - top) * 0.5} ${dx * 0.92} -${(196 - top) * 0.92}" stroke="${h}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity="0.45"/>`).join('')}
    <circle cx="${120 - 2}" cy="54" r="9" fill="${f}" opacity="0.85"/>
    <circle cx="${120 + 42}" cy="74" r="7" fill="${f}" opacity="0.65"/>`,

  'herb-frond': ([b, s, h, f]) => `
    ${groundShadow(202, 32)}
    <path d="M120 200V72" stroke="${f}" stroke-width="5" stroke-linecap="round"/>
    ${[176, 150, 124, 98].map((y, r) => `
      <path d="M120 ${y}q-26 -4 -40 -22M120 ${y}q26 -4 40 -22" stroke="${r % 2 ? b : s}" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${Array.from({ length: 5 }, (_, i) => {
        const t = (i + 1) / 6
        const px = 120 - 40 * t
        const py = y - 22 * t * t - 4 * t
        return `<path d="M${px} ${py}l-6 -13M${240 - px} ${py}l6 -13" stroke="${h}" stroke-width="3.2" stroke-linecap="round"/>`
      }).join('')}`).join('')}
    <path d="M120 78l-9 -16M120 78l9 -16M120 76v-18" stroke="${h}" stroke-width="3.2" stroke-linecap="round"/>`,

  'wild-garlic': ([b, s, h, f]) => `
    ${groundShadow(202, 36)}
    ${leaf(120, 192, -58, -104, s, 0.24)}
    ${leaf(120, 192, 58, -104, b, 0.24)}
    ${leaf(120, 192, -16, -122, tint(b, 0.12), 0.2)}
    ${leaf(120, 192, 26, -114, h, 0.2)}
    <path d="M120 192V96" stroke="${shade(b, 0.25)}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
    ${[[120, 66], [104, 78], [136, 78], [112, 90], [130, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${f}"/>`).join('')}
    <path d="M120 96V80" stroke="${shade(b, 0.2)}" stroke-width="4" stroke-linecap="round"/>`,
}

/* ----------------------------------- render ---------------------------------- */

const items = JSON.parse(readFileSync(resolve(root, 'src/data/seasonalProduce.json'), 'utf8'))

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })

const missing = [...new Set(items.map((i) => i.illustration.archetype))].filter((a) => !archetypes[a])
if (missing.length) {
  console.error('No archetype defined for: ' + missing.join(', '))
  process.exit(1)
}

for (const item of items) {
  const { archetype } = item.illustration
  const seed = seedOf(item.id)
  const { palette, ground } = resolvePalette(item.illustration)
  const body = archetypes[archetype](palette, seed).replace(/\n\s*/g, '\n  ').trim()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-label="${item.nameEN}">
  <title>${item.nameEN}</title>
  <rect width="240" height="240" fill="${ground}"/>
  <g transform="translate(120 128) scale(0.88) translate(-120 -128)">
  ${body}
  </g>
</svg>
`
  // A malformed archetype silently emits NaN coordinates, which renders as
  // nothing at all — fail loudly instead of shipping a blank illustration.
  const bad = svg.match(/NaN|undefined/)
  if (bad) {
    console.error(`${item.id}.svg contains "${bad[0]}" — check the "${archetype}" archetype.`)
    process.exit(1)
  }
  writeFileSync(resolve(OUT_DIR, `${item.id}.svg`), svg)
}

console.log(`Generated ${items.length} illustrations into public/produce/`)
