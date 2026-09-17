/**
 * What each crop is made of, in six or seven strokes.
 *
 * A recipe takes a pen already loaded with this crop's tile and ink, and
 * returns line work. It never names a colour and never sets a stroke weight.
 *
 * The rule the whole set is drawn to: one silhouette, one or two marks inside
 * it, and whatever is needed to say which plant it came off. Anything a
 * thumbnail cannot hold is left out.
 */
import { group } from './draw.mjs'

/* Symmetry is the enemy of this style. A round body with a matched pair of
   anything above it becomes a face, and the eye sees the face before it sees
   the vegetable — so roots carry their leaves off to one side, and anything
   that would otherwise sit dead centre is tilted or doubled at two sizes.

   Draw order is load-bearing. Whatever is nearest the viewer goes last, with
   `knock`, so it cuts a clean gap through everything behind it. Put a root's
   leaves after its body and they punch holes in the body instead. */

/* Shorthands used across the set. */

/** The star of sepals on a picked fruit. */
const calyx = (p, x, y, { count = 5, len = 13, w = 4.5, spread = 190, from = 0 } = {}) =>
  Array.from({ length: count }, (_, i) =>
    p.leaf(x, y, {
      len,
      w,
      ang: from + ((i / (count - 1)) - 0.5) * spread,
      round: 0.15,
    }),
  ).join('')

/**
 * The herb template: a stem with pairs of leaves up it and usually a tip.
 *
 * Fifteen herbs at this size differ in leaf shape, leaf size and how many
 * there are — and in nothing else that survives. Drawing them all off one
 * template is honest about that, and it is what makes them look like a family
 * instead of fifteen unrelated scribbles.
 */
const herb = (p, { pairs, ang = 46, round = 0.6, tip = null, stem = [92, 26], scallop = false, stalk = 0, alt = false }) => {
  let o = p.arc(48, stem[0], 48, stem[1], 2)
  pairs.forEach(([y, len, w], row) => {
    // Opposite pairs stack into an ear of wheat once there are more than two
    // rows of them. Alternating sides up the stem stays a sprig.
    const sides = alt ? [row % 2 ? 1 : -1] : [-1, 1]
    for (const side of sides) {
      const r = (side * ang * Math.PI) / 180
      // Small leaves get a petiole; sitting them straight on the stem packs
      // them into it and the sprig closes up.
      const bx = 48 + Math.sin(r) * stalk
      const by = y - Math.cos(r) * stalk
      if (stalk) o += p.mark(48, y, bx, by, 0, 0.55)
      o += scallop
        ? p.scallop(bx + Math.sin(r) * len, by - Math.cos(r) * len, w, w * 0.84, 4, { depth: 0.26, from: side }, { knock: true })
        : p.leaf(bx, by, { len, ang: side * ang, w, bow: -side * len * 0.12, round }, { knock: true })
    }
  })
  // The terminal leaf leans, so the sprig never resolves into a symmetrical
  // arrowhead.
  if (tip) o += p.leaf(48, tip[0], { len: tip[1], ang: tip[2] ?? -14, w: tip[1] * 0.46, bow: 3, round }, { knock: true })
  return o
}

/**
 * A lobed leaf: a scallop stretched along an axis and turned to face the way
 * it grows. A round scallop reads as a flower; an oval one reads as a leaf.
 */
const lobedLeaf = (p, x, y, ang, rx, lobes = 4, depth = 0.28) =>
  group(p.scallop(x, y, rx, rx * 0.72, lobes, { depth, from: ang / 40 }, { knock: true }), `rotate(${ang} ${x} ${y})`)

/** Needles, tiny leaves or florets set in pairs up a stem. */
const alongStem = (p, x1, y1, x2, y2, count, draw, { from = 0.16, to = 0.94 } = {}) => {
  let o = ''
  for (let i = 0; i < count; i++) {
    const t = from + (i / Math.max(1, count - 1)) * (to - from)
    o += draw(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, t, i)
  }
  return o
}

/** Leaves swept around a point — every bunched green starts here. */
const fan = (p, x, y, { count, spread, from = 0, len, w, base = 0, round = 0.6, bow }) =>
  Array.from({ length: count }, (_, i) => {
    const s = count === 1 ? 0.5 : i / (count - 1)
    const ang = from + (s - 0.5) * spread
    const scale = typeof len === 'function' ? len(s) : len
    return p.leaf(x + (s - 0.5) * base, y, {
      len: scale,
      w: typeof w === 'function' ? w(s) : w,
      ang,
      bow: bow === undefined ? (s - 0.5) * spread * 0.05 : bow,
      round,
    })
  })
    .reverse()
    .join('')

export const recipes = {
  /* ============================ VEGETABLES (48) ============================ */

  artichoke: (p) =>
    p.arc(48, 92, 48, 74, 0) +
    p.scallop(48, 52, 27, 30, 6, { depth: 0.16 }, { knock: true }) +
    p.scallop(48, 52, 14, 16, 5, { depth: 0.2, from: 0.5 }, { knock: true, w: p.w * 0.78 }),

  asparagus: (p) =>
    [
      [30, -9, 60],
      [66, 9, 58],
      [48, 0, 68],
    ]
      .map(([x, rot, len]) =>
        group(
          p.taper(0, 0, { len, ang: 0, w: 7, tipW: 4.4, waist: 0.9, belly: 0.96, round: 0.5 }, { knock: true }) +
            // Two scales near the tip: the difference between a spear and a stick.
            p.mark(-4.5, -len + 14, 0, -len + 8, 1.5, 0.55) +
            p.mark(4.5, -len + 14, 0, -len + 8, -1.5, 0.55),
          `translate(${x} 90) rotate(${rot})`,
        ),
      )
      .join(''),

  aubergine: (p) =>
    group(
      p.body(48, 32, 88, { topW: 4, midW: 22, midAt: 0.7, botW: 9 }, { knock: true }),
      'rotate(-6 48 60)',
    ) +
    // Sepals point down the shoulder, not up off the top — an aubergine wears
    // a hood, and a fruit whose calyx stands up is a pineapple.
    calyx(p, 50, 36, { count: 3, len: 17, w: 7, spread: 112, from: 180 }) +
    p.arc(50, 34, 57, 18, 3),

  beetroot: (p) =>
    // One stem, off to the side. Two symmetrical stems are antennae.
    p.arc(52, 52, 66, 20, 5) +
    p.leaf(66, 20, { len: 22, ang: 26, w: 10, bow: 3, round: 0.6 }) +
    p.leaf(60, 32, { len: 18, ang: 52, w: 8, bow: 3, round: 0.6 }) +
    p.arc(46, 84, 40, 94, -2) +
    p.taper(46, 48, { len: 38, ang: 180, w: 24, tipW: 2.5, belly: 0.76, round: 1 }, { knock: true }),

  'bell-pepper': (p) =>
    p.line(
      `M48 32C62 32 72 40 72 52C72 70 62 84 52 84C50 84 49 80 48 80C47 80 46 84 44 84C34 84 24 70 24 52C24 40 34 32 48 32Z`,
      { knock: true },
    ) +
    // The two clefts that make a pepper a pepper.
    p.mark(36, 60, 38, 82, 2) +
    p.mark(60, 60, 58, 82, -2) +
    p.arc(48, 32, 52, 16, 3) +
    calyx(p, 48, 32, { count: 3, len: 12, w: 5, spread: 110, from: 180 }),

  broccoli: (p) =>
    p.taper(48, 94, { len: 38, ang: 0, w: 11, tipW: 10, waist: 0.94 }, { knock: true }) +
    p.scallop(48, 42, 32, 24, 7, { depth: 0.17 }, { knock: true }) +
    p.scallop(48, 42, 17, 12, 5, { depth: 0.18, from: 0.4 }, { knock: true, w: p.w * 0.78 }),

  'brussels-sprouts': (p) =>
    p.circle(30, 62, 17, { knock: true }) +
    p.mark(19, 56, 40, 58, -4) +
    p.circle(67, 60, 16, { knock: true }) +
    p.mark(57, 54, 77, 56, -4) +
    p.circle(48, 40, 18, { knock: true }) +
    p.mark(36, 34, 59, 36, -4),

  'button-mushroom': (p) =>
    // Cap and stem as one outline, the way a mushroom is always drawn.
    p.line(
      `M20 52C20 34 33 22 48 22C63 22 76 34 76 52C76 58 70 60 62 60C60 60 58 62 58 68C58 78 60 84 60 88L36 88C36 84 38 78 38 68C38 62 36 60 34 60C26 60 20 58 20 52Z`,
      { knock: true },
    ) +
    p.mark(34, 60, 62, 60, -2),

  carrot: (p) =>
    p.taper(48, 36, { len: 48, ang: 174, w: 13, bow: 5, round: 0.5, tipW: 1.5 }, { knock: true }) +
    p.mark(38, 50, 56, 46, -2) +
    p.mark(41, 62, 56, 59, -2) +
    [-26, 0, 26]
      .map((a) =>
        p.arc(
          48,
          36,
          48 + Math.sin((a * Math.PI) / 180) * 26,
          36 - Math.cos((a * Math.PI) / 180) * 26,
          a * 0.12,
        ),
      )
      .join(''),

  cauliflower: (p) =>
    p.leaf(48, 76, { len: 34, ang: -52, w: 13, bow: -4, round: 0.6 }, { knock: true }) +
    p.leaf(48, 76, { len: 32, ang: 52, w: 12, bow: 4, round: 0.6 }, { knock: true }) +
    p.scallop(48, 48, 29, 24, 8, { depth: 0.14 }, { knock: true }) +
    p.scallop(48, 48, 14, 11, 5, { depth: 0.16, from: 0.5 }, { knock: true, w: p.w * 0.78 }),

  celeriac: (p) =>
    p.scallop(48, 58, 29, 27, 9, { depth: 0.07 }, { knock: true }) +
    [-13, 0, 13]
      .map((dx) => p.arc(48 + dx * 0.5, 34, 48 + dx, 22, dx * 0.15))
      .join('') +
    p.mark(42, 84, 48, 92, 1) +
    p.mark(56, 82, 62, 90, 1),

  celery: (p) => {
    // Ribs curving out of one base, not a row of posts.
    let o = ''
    for (const [x, rot] of [[34, -18], [62, 14], [42, -8], [54, 5]]) {
      o += group(
        p.taper(0, 0, { len: 58, ang: 0, w: 7, bow: rot * 0.5, tipW: 5, waist: 0.9, round: 0.5 }, { knock: true }),
        `translate(${x} 94) rotate(${rot})`,
      )
    }
    for (const [x, y, r] of [[22, 32, 10], [70, 26, 10], [45, 20, 12]]) {
      o += p.scallop(x, y, r, r * 0.78, 4, { depth: 0.28 }, { knock: true, w: p.w * 0.85 })
    }
    return o
  },

  chard: (p) =>
    // One dominant leaf on a thick white stem, one smaller behind it.
    p.leaf(62, 58, { len: 30, ang: 38, w: 14, bow: 5, round: 0.8 }, { knock: true }) +
    p.leaf(38, 60, { len: 48, ang: -18, w: 23, bow: -6, round: 0.8 }, { knock: true }) +
    p.mark(38, 60, 26, 18, -5, 0.5) +
    p.taper(46, 96, { len: 40, ang: -10, w: 8, tipW: 6, waist: 0.92, round: 0.5 }, { knock: true }) +
    p.taper(60, 96, { len: 42, ang: 6, w: 5.5, tipW: 4.5, waist: 0.92, round: 0.5 }, { knock: true }),

  chicory: (p) =>
    p.body(48, 16, 86, { topW: 3, midW: 19, midAt: 0.74, botW: 11 }, { knock: true }) +
    p.mark(38, 78, 45, 26, -4) +
    p.mark(58, 78, 51, 26, 4),

  'chinese-cabbage': (p) =>
    group(
      p.scallop(48, 32, 25, 18, 5, { depth: 0.28 }, { knock: true }) +
        p.body(48, 30, 94, { topW: 14, midW: 24, midAt: 0.58, botW: 15 }, { knock: true }) +
        p.mark(40, 86, 44, 42, -3) +
        p.mark(60, 86, 55, 42, 3),
      'rotate(-7 48 60)',
    ),

  courgette: (p) =>
    group(
      p.taper(0, 0, { len: 62, ang: 0, w: 14, tipW: 11, belly: 0.94, waist: 0.9, round: 1 }, { knock: true }),
      'translate(34 80) rotate(28)',
    ) +
    p.mark(40, 66, 52, 46, -2) +
    // The flower still on the end.
    calyx(p, 64, 26, { count: 3, len: 13, w: 6, spread: 120, from: 28 }) +
    p.arc(64, 27, 70, 16, 2),

  cucumber: (p) =>
    group(
      p.taper(0, 0, { len: 64, ang: 0, w: 13, tipW: 12, belly: 0.98, waist: 0.96, round: 1.1 }, { knock: true }),
      'translate(18 64) rotate(66)',
    ) +
    // Ridges along the length — a courgette has none.
    p.mark(30, 56, 66, 42, -3) +
    p.mark(34, 66, 70, 52, -3),

  endive: (p) =>
    p.scallop(48, 55, 31, 28, 9, { depth: 0.2 }, { knock: true }) +
    p.scallop(48, 56, 15, 13, 6, { depth: 0.24, from: 0.5 }, { knock: true, w: p.w * 0.78 }),

  fennel: (p) =>
    // A wide flat bulb with its stalks cut short, fronds leaning one way.
    [6, 26]
      .map((ang, i) => {
        const r = (ang * Math.PI) / 180
        const len = 40 - i * 6
        const tip = [48 + Math.sin(r) * len, 56 - Math.cos(r) * len]
        return (
          p.arc(48 + i * 5, 56, tip[0], tip[1], 3) +
          alongStem(p, 48 + i * 5, 56, tip[0], tip[1], 3, (x, y, t) =>
            p.mark(x, y, x - 11 * (1 - t * 0.4), y - 7, 2, 0.5) +
            p.mark(x, y, x + 11 * (1 - t * 0.4), y - 7, -2, 0.5),
          )
        )
      })
      .join('') +
    p.oval(45, 72, 29, 20, { knock: true }) +
    p.mark(34, 90, 40, 56, -2) +
    p.mark(56, 90, 51, 56, 2),

  garlic: (p) =>
    p.line(`M48 30C64 42 74 54 74 66C74 78 62 86 48 86C34 86 22 78 22 66C22 54 32 42 48 30Z`, {
      knock: true,
    }) +
    // Two clove seams running the full height: without them it is an onion.
    p.mark(38, 38, 33, 82, 4) +
    p.mark(58, 38, 63, 82, -4) +
    p.arc(48, 30, 50, 16, 2),

  'green-beans': (p) =>
    [
      [26, 12, 60],
      [48, 0, 66],
      [70, -12, 58],
    ]
      .map(([x, rot, len]) =>
        group(
          p.taper(0, 0, { len, ang: 0, w: 6, tipW: 3, waist: 0.86, belly: 0.94, round: 0.6 }, { knock: true }),
          `translate(${x} 88) rotate(${rot})`,
        ),
      )
      .join(''),

  horseradish: (p) =>
    p.taper(48, 24, { len: 56, ang: 186, w: 12, bow: -5, tipW: 2, belly: 0.8, waist: 0.3 }, { knock: true }) +
    p.mark(40, 46, 54, 44, -1.5) +
    p.mark(42, 62, 55, 60, -1.5) +
    [-22, 0, 22].map((a) => p.arc(48, 24, 48 + Math.sin((a * Math.PI) / 180) * 18, 24 - Math.cos((a * Math.PI) / 180) * 18, a * 0.1)).join(''),

  'jerusalem-artichoke': (p) =>
    // Two knobs, overlapping, at two sizes, each with a stubby neck.
    group(p.scallop(63, 66, 21, 17, 4, { depth: 0.2, from: 0.7 }, { knock: true }), 'rotate(16 63 66)') +
    group(p.scallop(38, 44, 24, 19, 4, { depth: 0.22, from: 2.1 }, { knock: true }), 'rotate(-12 38 44)') +
    p.arc(30, 30, 36, 26, 1) +
    p.dot(32, 42, 2.4) +
    p.dot(45, 50, 2.4) +
    p.dot(67, 70, 2.4),

  kale: (p) =>
    // One big frilled leaf running off the tile, and a smaller one behind.
    p.scallop(62, 32, 22, 19, 6, { depth: 0.26, from: 0.4 }, { knock: true }) +
    p.arc(46, 96, 56, 40, 4) +
    p.scallop(40, 56, 32, 28, 7, { depth: 0.26 }, { knock: true }),

  kohlrabi: (p) =>
    // Both stalks lean the same way; one either side is a pair of eyes.
    [[10, 26], [30, 34]]
      .map(([ang, len]) => {
        const r = (ang * Math.PI) / 180
        const tip = [48 + Math.sin(r) * len, 52 - Math.cos(r) * len]
        return p.arc(48, 52, tip[0], tip[1], 3) + p.leaf(tip[0], tip[1], { len: 17, ang: ang + 16, w: 8, round: 0.7 })
      })
      .join('') +
    p.circle(46, 64, 25, { knock: true }) +
    p.mark(28, 72, 22, 76, 1, 0.55),

  'lambs-lettuce': (p) =>
    [-64, -34, 0, 34, 64]
      .map((ang) => p.leaf(48, 80, { len: ang === 0 ? 40 : 36, ang, w: 12, bow: ang * 0.08, round: 1 }, { knock: true }))
      .join('') +
    p.arc(48, 80, 48, 92, 0),

  leek: (p) =>
    // Long blunt blades and a short shaft. Short pointed blades read as a
    // crown; blunt ones sitting low read as footwear.
    [-24, 0, 24]
      .map((ang) => p.leaf(48, 62, { len: 52, ang, w: 9, bow: ang * 0.16, round: 0.55 }, { knock: true }))
      .join('') +
    p.taper(48, 92, { len: 44, ang: 0, w: 11.5, tipW: 10, waist: 0.96, belly: 0.99, round: 0.7 }, { knock: true }) +
    p.mark(38, 64, 58, 64, -3),

  lettuce: (p) =>
    // Heads get a second, smaller ring rather than loose interior marks: it
    // reads as leaves folded inside leaves, and it never looks like a face.
    p.scallop(48, 55, 30, 27, 6, { depth: 0.13 }, { knock: true }) +
    p.scallop(48, 56, 15, 13, 5, { depth: 0.16, from: 0.6 }, { knock: true, w: p.w * 0.82 }),

  'may-turnip': (p) =>
    p.arc(52, 46, 64, 22, 4) +
    p.leaf(64, 22, { len: 20, ang: 28, w: 9, round: 0.7 }) +
    p.leaf(58, 32, { len: 16, ang: 56, w: 7, round: 0.7 }) +
    p.arc(46, 84, 40, 94, -2) +
    p.taper(46, 48, { len: 38, ang: 180, w: 24, tipW: 2.5, belly: 0.74, round: 1 }, { knock: true }) +
    // The shoulder band: a turnip is two colours and this is where they meet.
    p.mark(23, 52, 69, 52, -5),

  onion: (p) =>
    p.line(`M48 28C66 42 76 54 76 66C76 79 63 88 48 88C33 88 20 79 20 66C20 54 30 42 48 28Z`, {
      knock: true,
    }) +
    p.mark(34, 44, 31, 84, 3) +
    p.mark(62, 44, 65, 84, -3) +
    p.arc(48, 28, 54, 14, 3),

  'pak-choi': (p) =>
    // Big leaves, narrow spoon bases — reverse the proportions and it is a
    // pair of boots.
    p.leaf(48, 66, { len: 42, ang: -28, w: 20, bow: -5, round: 0.9 }, { knock: true }) +
    p.leaf(48, 66, { len: 42, ang: 28, w: 20, bow: 5, round: 0.9 }, { knock: true }) +
    p.taper(42, 92, { len: 32, ang: -8, w: 7, tipW: 5, waist: 0.88, round: 0.5 }, { knock: true }) +
    p.taper(54, 92, { len: 32, ang: 8, w: 7, tipW: 5, waist: 0.88, round: 0.5 }, { knock: true }),

  parsnip: (p) =>
    p.taper(48, 34, { len: 52, ang: 176, w: 16, bow: 4, round: 0.5, tipW: 1.5, waist: 0.26 }, { knock: true }) +
    p.mark(37, 50, 58, 46, -2) +
    [-24, 0, 24]
      .map((a) =>
        p.arc(48, 34, 48 + Math.sin((a * Math.PI) / 180) * 24, 34 - Math.cos((a * Math.PI) / 180) * 24, a * 0.12),
      )
      .join(''),

  peas: (p) =>
    group(
      p.taper(0, 0, { len: 68, ang: 0, w: 15, bow: 0, tipW: 4, belly: 0.96, waist: 0.6, round: 0.7 }, { knock: true }) +
        [-20, 0, 20].map((dy) => p.circle(0, dy, 7.5, { knock: true })).join(''),
      'translate(48 56) rotate(34)',
    ),

  potato: (p) =>
    group(p.oval(64, 66, 20, 15, { knock: true }), 'rotate(9 64 66)') +
    group(p.oval(36, 46, 23, 18, { knock: true }), 'rotate(-13 36 46)') +
    // Eyes, scattered and never paired at the same height.
    p.dot(27, 44, 2.3) +
    p.dot(39, 53, 2.3) +
    p.dot(43, 37, 2.3) +
    p.dot(70, 71, 2.3) +
    p.dot(59, 62, 2.3),

  pumpkin: (p) =>
    p.oval(48, 60, 33, 27, { knock: true }) +
    p.mark(34, 36, 30, 84, 5) +
    p.mark(62, 36, 66, 84, -5) +
    p.taper(48, 34, { len: 16, ang: 0, w: 6, tipW: 5, waist: 0.9 }, { knock: true }) +
    p.arc(52, 22, 64, 28, 4),

  radicchio: (p) =>
    p.scallop(48, 56, 30, 28, 6, { depth: 0.12 }, { knock: true }) +
    // Radicchio is read by its white ribs, not by its outline.
    p.mark(36, 34, 33, 78, 4) +
    p.mark(48, 30, 48, 82, 0) +
    p.mark(60, 34, 63, 78, -4),

  radish: (p) =>
    p.arc(52, 44, 66, 20, 5) +
    p.leaf(66, 20, { len: 20, ang: 28, w: 9, round: 0.7 }) +
    p.leaf(59, 30, { len: 16, ang: 56, w: 7, round: 0.7 }) +
    p.arc(44, 80, 36, 94, -3) +
    p.circle(45, 58, 25, { knock: true }),

  'red-cabbage': (p) =>
    p.circle(48, 56, 30, { knock: true }) + p.coil(50, 58, 21, 3, { open: -50 }),

  rhubarb: (p) =>
    // One dominant leaf, stalks fanning under it.
    p.scallop(58, 26, 22, 16, 5, { depth: 0.26 }, { knock: true }) +
    p.scallop(26, 34, 14, 11, 4, { depth: 0.26 }, { knock: true }) +
    [
      [30, -16, 56],
      [62, 8, 60],
      [46, -4, 62],
    ]
      .map(([x, rot, len]) =>
        group(p.taper(0, 0, { len, ang: 0, w: 6.5, tipW: 5, waist: 0.92, round: 0.5 }, { knock: true }), `translate(${x} 96) rotate(${rot})`),
      )
      .join(''),

  rocket: (p) =>
    [
      [-40, 44],
      [40, 42],
      [0, 50],
    ]
      .map(([ang, len]) =>
        p.leaf(48, 86, { len, ang, w: 11, bow: ang * 0.1, round: 0.8 }, { knock: true }) +
        p.mark(
          48,
          86,
          48 + Math.sin((ang * Math.PI) / 180) * len * 0.8,
          86 - Math.cos((ang * Math.PI) / 180) * len * 0.8,
          ang * 0.08,
          0.5,
        ),
      )
      .join(''),

  salsify: (p) =>
    [
      [36, -7],
      [60, 7],
      [48, 0],
    ]
      .map(([x, rot]) =>
        group(p.taper(0, 0, { len: 62, ang: 180, w: 7, tipW: 1.4, belly: 0.76, waist: 0.24 }, { knock: true }), `translate(${x} 22) rotate(${rot})`),
      )
      .join('') +
    [-20, 0, 20].map((a) => p.arc(48, 22, 48 + Math.sin((a * Math.PI) / 180) * 14, 22 - Math.cos((a * Math.PI) / 180) * 14, 0)).join(''),

  'savoy-cabbage': (p) =>
    p.scallop(48, 56, 30, 28, 8, { depth: 0.11 }, { knock: true }) +
    // The blistering, as three puckers rather than a texture.
    p.scallop(48, 56, 17, 15, 5, { depth: 0.18, from: 0.4 }, { knock: true, w: p.w * 0.8 }) +
    p.mark(40, 44, 48, 40, 2, 0.5) +
    p.mark(56, 70, 48, 74, 2, 0.5),

  spinach: (p) =>
    [
      [-44, 42],
      [44, 40],
      [0, 46],
    ]
      .map(([ang, len]) =>
        p.leaf(48, 88, { len, ang, w: 17, bow: ang * 0.09, round: 0.9 }, { knock: true }) +
        p.mark(
          48,
          88,
          48 + Math.sin((ang * Math.PI) / 180) * len * 0.78,
          88 - Math.cos((ang * Math.PI) / 180) * len * 0.78,
          ang * 0.07,
          0.5,
        ),
      )
      .join(''),

  'spring-onion': (p) =>
    [
      [-16, 60],
      [16, 58],
      [0, 66],
    ]
      .map(([ang, len]) => p.taper(48, 66, { len, ang: 180 + ang + 180, w: 6, tipW: 3.4, waist: 0.88, round: 0.5 }, { knock: true }))
      .join('') +
    p.taper(48, 88, { len: 30, ang: 0, w: 10, tipW: 8, waist: 0.9, belly: 0.98, round: 0.9 }, { knock: true }) +
    p.mark(40, 64, 56, 64, -2),

  swede: (p) =>
    p.arc(52, 44, 66, 22, 5) +
    p.leaf(66, 22, { len: 20, ang: 28, w: 9, round: 0.7 }) +
    p.leaf(59, 32, { len: 16, ang: 56, w: 7, round: 0.7 }) +
    p.arc(44, 84, 38, 94, -2) +
    p.oval(46, 62, 27, 25, { knock: true }) +
    p.mark(22, 54, 70, 54, -5),

  sweetcorn: (p) => {
    // Tilted, with one husk leaf pulled down — square on it reads as a bean.
    let o = p.leaf(40, 96, { len: 58, ang: -22, w: 12, bow: -4, round: 0.4 }, { knock: true })
    o += p.leaf(56, 96, { len: 44, ang: 18, w: 10, bow: 4, round: 0.4 }, { knock: true })
    let cob = p.body(48, 14, 88, { topW: 4, midW: 17, midAt: 0.45, botW: 10 }, { knock: true })
    for (let row = 0; row < 5; row++) {
      const y = 30 + row * 12
      const half = row > 2 ? 8 : 11
      for (const s of [-1, 1]) cob += p.mark(48 + s * 2.5, y, 48 + s * half, y, 0, 0.5)
    }
    return o + group(cob, 'rotate(9 48 52)')
  },

  tomato: (p) =>
    p.circle(48, 56, 25, { knock: true }) +
    p.mark(33, 48, 43, 42, 2) +
    // Sepals lie back along the shoulder of the fruit; stand them up and a
    // tomato turns into a pineapple.
    calyx(p, 48, 34, { count: 5, len: 14, w: 5.5, spread: 230 }) +
    p.arc(48, 33, 48, 22, 0),

  'white-cabbage': (p) =>
    p.circle(48, 56, 30, { knock: true }) +
    p.coil(47, 57, 21, 3, { open: 130 }) +
    p.arc(48, 26, 48, 14, 0),

  /* ============================== FRUIT (24) ============================== */

  apple: (p) =>
    p.line(`M48 36C41 27 22 28 22 50C22 70 35 84 48 84C61 84 74 70 74 50C74 28 55 27 48 36Z`, {
      knock: true,
    }) +
    p.arc(48, 34, 52, 18, 3) +
    p.leaf(52, 22, { len: 20, ang: 62, w: 8, bow: -4, round: 0.35 }),

  apricot: (p) =>
    p.circle(48, 56, 26, { knock: true }) +
    // One suture, off centre. A crease down the middle reads as a seam.
    p.mark(42, 32, 38, 80, 4) +
    p.arc(48, 30, 50, 18, 2) +
    p.leaf(50, 22, { len: 16, ang: 64, w: 7, bow: -3, round: 0.35 }),

  blackberry: (p) => {
    let o = ''
    for (const [cy, n, rx] of [
      [72, 2, 9],
      [60, 3, 15],
      [46, 3, 14],
      [33, 2, 8],
    ]) {
      for (let i = 0; i < n; i++) {
        const s = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2
        o += p.circle(48 + s * rx, cy, 8, { knock: true, gap: 2.4 })
      }
    }
    return o + p.arc(48, 26, 48, 16, 0)
  },

  blueberry: (p) =>
    [
      [30, 64, 16],
      [66, 62, 15],
      [48, 42, 17],
    ]
      .map(([cx, cy, r]) =>
        p.circle(cx, cy, r, { knock: true }) +
        // The five-point crown, as a small star on top of each berry.
        p.line(
          `M${cx - r * 0.42} ${cy - r * 0.42}L${cx} ${cy - r * 0.66}L${cx + r * 0.42} ${cy - r * 0.42}`,
          { w: p.w * 0.6 },
        ),
      )
      .join(''),

  cherry: (p) =>
    p.arc(46, 24, 32, 52, 6) +
    p.arc(50, 24, 64, 48, -6) +
    p.leaf(48, 23, { len: 22, ang: 78, w: 8, bow: -5, round: 0.3 }) +
    p.circle(64, 64, 16, { knock: true }) +
    p.circle(32, 68, 17, { knock: true }),

  elderberry: (p) => {
    // A flat, wide umbel on visible rays — sitting it on a tall stem turns it
    // into a tree.
    const berries = [
      [22, 52],
      [36, 42],
      [52, 38],
      [68, 44],
      [78, 56],
      [30, 66],
      [46, 58],
      [62, 62],
    ]
    return (
      p.arc(48, 92, 44, 70, -2) +
      berries.map(([x, y]) => p.mark(44, 72, x, y + 4, (x - 44) * 0.1, 0.5)).join('') +
      berries.map(([x, y]) => p.circle(x, y, 8, { knock: true, gap: 2.6 })).join('')
    )
  },

  fig: (p) =>
    // Whole and halved, overlapping, at two sizes.
    p.body(64, 34, 84, { topW: 9, midW: 20, midAt: 0.66, botW: 10 }, { knock: true }) +
    p.oval(64, 64, 10, 12, { w: p.w * 0.72 }) +
    p.body(33, 24, 78, { topW: 7, midW: 22, midAt: 0.7, botW: 10 }, { knock: true }) +
    p.arc(33, 25, 27, 14, -2),

  gooseberry: (p) =>
    // Two berries, overlapping, at two sizes, on one shared stalk.
    p.arc(44, 40, 52, 22, 3) +
    p.oval(64, 60, 17, 18, { knock: true }) +
    p.mark(64, 44, 64, 76, 0, 0.55) +
    p.oval(38, 66, 22, 23, { knock: true }) +
    p.mark(38, 45, 38, 87, 0, 0.55),

  grape: (p) => {
    let o = p.arc(48, 24, 48, 34, 0)
    o += p.leaf(44, 24, { len: 20, ang: -62, w: 11, round: 0.7 }, { knock: true })
    for (const [cy, n] of [
      [44, 3],
      [58, 2],
      [72, 1],
    ]) {
      for (let i = 0; i < n; i++) {
        const s = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2
        o += p.circle(48 + s * (n - 1) * 13, cy, 10.5, { knock: true, gap: 2.6 })
      }
    }
    return o
  },

  lemon: (p) =>
    group(
      p.body(48, 24, 84, { topW: 5, midW: 26, midAt: 0.5, botW: 6 }, { knock: true }),
      'rotate(-16 48 54)',
    ) +
    p.mark(34, 48, 42, 40, 1) +
    p.leaf(60, 28, { len: 19, ang: 60, w: 7.5, bow: -4, round: 0.3 }),

  melon: (p) =>
    p.circle(48, 56, 30, { knock: true }) +
    // Netting as arcs that follow the sphere. A grid makes it a wire basket.
    p.mark(24, 48, 70, 42, -5) +
    p.mark(26, 68, 72, 62, -5) +
    p.mark(40, 27, 34, 84, 4) +
    p.arc(52, 26, 58, 15, 2),

  mirabelle: (p) =>
    p.arc(38, 46, 40, 28, -2) +
    p.arc(62, 48, 62, 30, 2) +
    p.circle(36, 64, 19, { knock: true }) +
    p.mark(36, 46, 33, 82, 2, 0.55) +
    p.circle(64, 62, 17, { knock: true }) +
    p.mark(64, 46, 62, 78, 2, 0.55) +
    p.leaf(50, 28, { len: 17, ang: 36, w: 7, bow: -3, round: 0.35 }),

  orange: (p) =>
    p.circle(48, 58, 27, { knock: true }) +
    // Segment lines: the one thing that separates it from every other sphere.
    [30, 90, 150, 210, 270, 330]
      .map((a) =>
        p.mark(48, 58, 48 + Math.sin((a * Math.PI) / 180) * 26, 58 - Math.cos((a * Math.PI) / 180) * 26, 0, 0.5),
      )
      .join('') +
    p.arc(48, 31, 48, 20, 0) +
    p.leaf(51, 24, { len: 17, ang: 62, w: 7, bow: -3, round: 0.35 }),

  peach: (p) =>
    p.circle(48, 58, 27, { knock: true }) +
    // Deeper cleft than an apricot, and it runs the whole fruit.
    p.mark(43, 32, 36, 82, 6) +
    p.arc(48, 31, 50, 20, 2) +
    p.leaf(51, 23, { len: 19, ang: 66, w: 7, bow: -4, round: 0.25 }),

  pear: (p) =>
    p.body(48, 24, 88, { topW: 4, midW: 24, midAt: 0.76, botW: 8 }, { knock: true }) +
    p.arc(48, 24, 54, 12, 3) +
    p.leaf(53, 16, { len: 17, ang: 70, w: 7, bow: -3, round: 0.35 }),

  persimmon: (p) =>
    p.oval(48, 62, 29, 25, { knock: true }) +
    // Sepals lying flat on the shoulder. Four of them become ears.
    calyx(p, 48, 44, { count: 5, len: 19, w: 8, spread: 230 }) +
    p.arc(48, 42, 51, 28, 2),

  plum: (p) =>
    p.oval(48, 58, 24, 28, { knock: true }) +
    p.mark(48, 32, 42, 84, 5) +
    p.arc(48, 31, 54, 18, 3) +
    p.leaf(53, 22, { len: 16, ang: 70, w: 6, bow: -3, round: 0.25 }),

  quince: (p) =>
    // Lumpier and more shouldered than a pear.
    p.scallop(48, 60, 27, 26, 5, { depth: 0.07, from: 0.3 }, { knock: true }) +
    p.arc(48, 34, 50, 16, 2) +
    p.leaf(51, 20, { len: 19, ang: 68, w: 9, bow: -3, round: 0.5 }),

  raspberry: (p) => {
    let o = ''
    for (const [cy, n, rx] of [
      [72, 2, 8],
      [59, 3, 14],
      [45, 3, 13],
    ]) {
      for (let i = 0; i < n; i++) {
        const s = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2
        o += p.circle(48 + s * rx, cy, 8, { knock: true, gap: 2.4 })
      }
    }
    return o + calyx(p, 48, 34, { count: 5, len: 13, w: 5, spread: 210 }) + p.arc(48, 32, 48, 20, 0)
  },

  redcurrant: (p) => {
    // A strig: berries hanging off one drooping stalk.
    const spine = [
      [34, 26],
      [56, 76],
    ]
    let o = p.arc(spine[0][0], spine[0][1], spine[1][0], spine[1][1], -10)
    o += p.leaf(34, 26, { len: 18, ang: -50, w: 9, round: 0.7 }, { knock: true })
    const hang = [
      [26, 46],
      [48, 44],
      [30, 64],
      [54, 60],
      [44, 78],
      [64, 74],
    ]
    o += hang.map(([x, y]) => p.circle(x, y, 8.5, { knock: true, gap: 2.6 })).join('')
    return o
  },

  rosehip: (p) =>
    // Two hips at two sizes, the sepal tuft on the nose of each.
    p.arc(44, 94, 34, 66, -3) +
    p.arc(44, 94, 66, 56, 4) +
    p.body(66, 28, 58, { topW: 6, midW: 14, midAt: 0.54, botW: 8 }, { knock: true }) +
    calyx(p, 66, 30, { count: 3, len: 11, w: 4, spread: 100 }) +
    p.body(33, 34, 72, { topW: 7, midW: 17, midAt: 0.54, botW: 9 }, { knock: true }) +
    calyx(p, 33, 36, { count: 3, len: 13, w: 4.5, spread: 100 }),

  'sea-buckthorn': (p) => {
    // Berries crowd the twig itself — no other fruit here does that.
    let o = p.arc(20, 88, 74, 22, 6)
    const at = (t) => [20 + 54 * t + 12 * t * (1 - t), 88 - 66 * t]
    for (let i = 0; i < 5; i++) {
      const [x, y] = at(0.12 + i * 0.2)
      const side = i % 2 ? 1 : -1
      o += p.leaf(x, y, { len: 22, ang: 118 * side, w: 4, round: 0.15 }, { knock: true })
    }
    for (let i = 0; i < 5; i++) {
      const [x, y] = at(0.12 + i * 0.2)
      const side = i % 2 ? 1 : -1
      o += p.circle(x + side * 8, y - 3, 8, { knock: true, gap: 2.6 })
    }
    return o
  },

  'sour-cherry': (p) =>
    // Shorter stalks and flatter fruit than a sweet cherry.
    p.arc(46, 30, 34, 50, 4) +
    p.arc(50, 30, 62, 48, -4) +
    p.leaf(48, 29, { len: 19, ang: 80, w: 7, bow: -4, round: 0.25 }) +
    p.oval(62, 66, 17, 15, { knock: true }) +
    p.oval(33, 68, 18, 16, { knock: true }),

  strawberry: (p) =>
    p.line(`M48 30C66 30 76 42 76 54C76 70 58 86 48 86C38 86 20 70 20 54C20 42 30 30 48 30Z`, {
      knock: true,
    }) +
    [
      [40, 50],
      [56, 50],
      [48, 62],
      [34, 62],
      [62, 62],
      [48, 74],
    ]
      .map(([x, y]) => p.dot(x, y, 2.4))
      .join('') +
    fan(p, 48, 32, { count: 5, spread: 196, len: 16, w: 5.5, round: 0.12, bow: 0 }) +
    p.arc(48, 30, 48, 16, 0),

  /* ============================== HERBS (15) ============================== */

  /* Fifteen greens that all want to be the same drawing. Each is pinned to one
     structural fact and nothing else: basil is broad opposite pairs, thyme is
     a wiry twig, chives are cut tubes, dill is a frond, rosemary is needles. */

  basil: (p) =>
    // The broadest leaf in the herb set, and only three of them.
    herb(p, { pairs: [[80, 40, 21]], ang: 44, round: 0.6, tip: [56, 34, -16], stem: [94, 34] }),

  chervil: (p) =>
    // The finest cut of the four parsley-family herbs: many small lobes.
    p.arc(48, 94, 48, 52, 2) +
    [
      [-54, 26],
      [54, 26],
      [-8, 34],
    ]
      .map(([a, len]) => {
        const r = (a * Math.PI) / 180
        const x = 48 + Math.sin(r) * len
        const y = 66 - Math.cos(r) * len
        return p.arc(48, 66, x, y, a * 0.1) + lobedLeaf(p, x, y, a, 15, 6, 0.32)
      })
      .join(''),

  chives: (p) =>
    // Hollow tubes, cut flat at the top.
    [
      [28, -10, 56],
      [68, 10, 54],
      [40, -4, 66],
      [57, 4, 64],
    ]
      .map(([x, rot, len]) =>
        group(
          p.taper(0, 0, { len, ang: 0, w: 5, tipW: 4.6, waist: 0.97, belly: 0.99, round: 0.5 }, { knock: true }),
          `translate(${x} 90) rotate(${rot})`,
        ),
      )
      .join(''),

  coriander: (p) =>
    // Two big round lobes and one above — wider and blunter than chervil.
    p.arc(48, 94, 48, 44, 2) +
    [
      [-60, 24],
      [60, 24],
    ]
      .map(([a, len]) => {
        const r = (a * Math.PI) / 180
        const x = 48 + Math.sin(r) * len
        const y = 70 - Math.cos(r) * len
        return p.arc(48, 72, x, y, a * 0.1) + lobedLeaf(p, x, y, a, 19, 3, 0.26)
      })
      .join('') +
    lobedLeaf(p, 48, 32, -8, 19, 3, 0.26),

  dill: (p) =>
    // One frond, feathered the whole way up. Three fronds is a thicket.
    p.arc(48, 94, 48, 20, 2) +
    alongStem(p, 48, 92, 48, 22, 7, (x, y, t) =>
      [-1, 1]
        .map((side) => {
          const len = 26 * (1 - t * 0.45)
          return p.mark(x, y, x + side * len, y - len * 0.5, -side * 3, 0.5)
        })
        .join(''),
    ),

  lovage: (p) =>
    // The biggest leaflets of the family, in one clear opposite pair.
    p.arc(48, 94, 48, 38, 2) +
    [[-64, 24], [64, 24]]
      .map(([a, len]) => {
        const r = (a * Math.PI) / 180
        const x = 48 + Math.sin(r) * len
        const y = 74 - Math.cos(r) * len
        return p.arc(48, 76, x, y, a * 0.1) + lobedLeaf(p, x, y, a, 21, 4, 0.3)
      })
      .join('') +
    lobedLeaf(p, 48, 30, -8, 20, 4, 0.3),

  marjoram: (p) =>
    // Small leaves alternating up a bare stem, held off on threads.
    herb(p, { pairs: [[80, 19, 9], [66, 19, 9], [52, 18, 8.5]], ang: 52, round: 0.65, stalk: 9, alt: true, tip: [40, 18, -12], stem: [94, 30] }),

  mint: (p) =>
    // A sprig: one pair held up, one tip. Lay the pair out sideways and it
    // turns into a fleur-de-lis.
    p.arc(48, 88, 48, 58, 2) +
    p.leaf(48, 74, { len: 40, ang: -38, w: 17, bow: 6, round: 0.5 }, { knock: true }) +
    p.leaf(48, 74, { len: 40, ang: 38, w: 17, bow: -6, round: 0.5 }, { knock: true }) +
    p.mark(48, 74, 25, 48, -5, 0.5) +
    p.mark(48, 74, 71, 48, 5, 0.5),

  oregano: (p) =>
    // Rounder and more crowded than marjoram, and it alternates the same way.
    herb(p, { pairs: [[82, 20, 9], [69, 20, 9], [56, 19, 8.5], [43, 18, 8]], ang: 54, round: 0.6, stalk: 8, alt: true, tip: [32, 18, -12], stem: [94, 24] }),

  parsley: (p) =>
    // A tight ruffled mound on a short stalk — the frill is the plant.
    p.arc(48, 94, 48, 78, 0) +
    [
      [-48, 24],
      [48, 24],
      [-4, 32],
    ]
      .map(([a, len]) => {
        const r = (a * Math.PI) / 180
        return lobedLeaf(p, 48 + Math.sin(r) * len, 76 - Math.cos(r) * len, a, 18, 6, 0.32)
      })
      .join(''),

  rosemary: (p) =>
    [-22, 0, 22]
      .map((ang) => {
        const r = (ang * Math.PI) / 180
        const tip = [48 + Math.sin(r) * 62, 90 - Math.cos(r) * 62]
        return (
          p.arc(48, 92, tip[0], tip[1], ang * 0.06) +
          alongStem(p, 48, 92, tip[0], tip[1], 6, (x, y) =>
            [-1, 1]
              .map((side) => {
                const a = ((ang + side * 56) * Math.PI) / 180
                return p.mark(x, y, x + Math.sin(a) * 11, y - Math.cos(a) * 11, 0, 0.62)
              })
              .join(''),
          )
        )
      })
      .join(''),

  sage: (p) =>
    // Long blunt leaves, the softest shape in the set.
    herb(p, { pairs: [[84, 38, 18]], ang: 48, round: 1, tip: [50, 36, -16], stem: [94, 32] }),

  tarragon: (p) =>
    // Long narrow straps and no frill at all.
    herb(p, { pairs: [[84, 38, 7], [64, 36, 6.5], [48, 32, 6]], ang: 36, round: 0.12, alt: true, tip: [40, 34, -10], stem: [94, 20] }),

  thyme: (p) =>
    // Mostly twig: tiny leaves alternating up a thin stem.
    herb(p, { pairs: [[84, 15, 6], [72, 15, 6], [60, 14, 5.5], [48, 13, 5], [36, 12, 4.5]], ang: 54, round: 0.7, stalk: 6, alt: true, tip: [28, 12, -10], stem: [94, 20] }),

  'wild-garlic': (p) =>
    // Two broad lance leaves and the white starburst above them.
    p.leaf(40, 90, { len: 58, ang: -18, w: 16, bow: -6, round: 0.2 }, { knock: true }) +
    p.mark(40, 90, 24, 36, -5, 0.5) +
    p.leaf(56, 90, { len: 56, ang: 19, w: 15, bow: 6, round: 0.2 }, { knock: true }) +
    p.mark(56, 90, 73, 38, 5, 0.5) +
    p.arc(48, 88, 62, 44, 3, { knock: true }) +
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2
      return p.mark(62, 38, 62 + Math.cos(a) * 12, 38 + Math.sin(a) * 11, 0, 0.55)
    }).join(''),
}
