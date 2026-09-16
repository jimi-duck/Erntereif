/**
 * What each crop is made of.
 *
 * A recipe returns SVG markup for a 96×96 canvas and says nothing about how
 * form is lit or which grey a stem is — `draw.mjs` and `palette.mjs` own that.
 * Read one and you should be able to see the plant: a taproot with a feathered
 * top, a rosette of frilled leaves, three drupes on a shared stalk.
 *
 * Sizing is optical, not geometric. A cherry and a pumpkin do not get the same
 * bounding box; they get the weight they would have on a market stall, so the
 * grid reads evenly. Subjects sit inside x,y ∈ [10, 86].
 */
import { EARTH, FRUIT, GREEN } from './palette.mjs'
import { darken, lighten, mix, ramp } from './colour.mjs'
import * as d from './draw.mjs'

const R = ramp
/** The greens, pre-ramped — `G.leaf.base`, `G.leaf.deep` and so on. */
const G = Object.fromEntries(Object.entries(GREEN).map(([k, v]) => [k, ramp(v)]))

/* Two shorthands that appear in nearly every recipe. */

/** The short stub of stalk left on a picked fruit. */
const stalk = (x, y, dx, dy, w = 3.2, colour = EARTH.bark) =>
  d.curve(x, y, x + dx, y + dy, dx * 0.3, colour, w)

/** The papery star of sepals on a tomato, an aubergine, a persimmon. */
const calyx = (x, y, { count = 5, len = 14, w = 5, spread = 190, from = 0, t = G.dark } = {}) =>
  d.fan(x, y, { count, spread, from, len, w, t, round: 0.15, shade: false, bow: 0 })

export const recipes = {
  /* ============================ VEGETABLES (48) ============================ */

  artichoke: () => {
    let o = d.rod(48, 88, 48, 68, 6, GREEN.sage)
    // Bracts, laid back to front so the head reads as scales, not a sphere.
    for (const [ring, ry, rx, n, tone] of [
      [70, 13, 25, 7, G.blue],
      [60, 13, 22, 6, G.sage],
      [51, 12, 17, 5, G.grey],
    ]) {
      for (let i = 0; i < n; i++) {
        const s = (i / (n - 1) - 0.5) * 2
        o += d.leaf(48 + s * rx * 0.72, ring, {
          len: ry * 1.5,
          ang: 180 + s * 26,
          w: rx / n + 2.4,
          t: tone,
          round: 0.85,
          shade: true,
        })
      }
    }
    o += d.leaf(48, 40, { len: 15, ang: 180, w: 9, t: G.pale, round: 0.9 })
    return o
  },

  asparagus: () => {
    let o = ''
    for (const [x, tilt, tone] of [
      [30, -9, G.leaf],
      [39, -4, G.mid],
      [57, 4, G.mid],
      [66, 9, G.leaf],
      [48, 0, G.fresh],
    ]) {
      const top = 20 + Math.abs(x - 48) * 0.22
      o += d.volume(
        d.taperPath(x + tilt * 0.9, 86, { len: 86 - top, ang: 360 - tilt, w: 5.4, tipW: 2.2, waist: 0.62, round: 0.6 }),
        tone,
        { cx: x, cy: 60 },
      )
      // Scales at the tip — the one detail that says spear and not stick.
      for (let i = 0; i < 4; i++) {
        const y = top + 3 + i * 4.4
        const s = i % 2 ? 1 : -1
        o += d.leaf(x - tilt * 0.5 + s * 1.2, y, { len: 6.5, ang: 150 * s, w: 2.4, t: tone, round: 0.2, shade: false })
      }
    }
    return o
  },

  aubergine: () =>
    d.volume(
      d.taperPath(46, 86, { len: 58, ang: 353, w: 20, bow: -3, round: 1.25, tipW: 7, belly: 0.86, waist: 0.56 }),
      R(FRUIT.aubergine),
      { cx: 48, cy: 58 },
    ) +
    d.gloss(38, 64, 5, 15, { rot: 12, opacity: 0.2 }) +
    calyx(51, 32, { count: 6, len: 16, w: 6, spread: 150, from: 8 }) +
    d.curve(51, 31, 58, 16, 2, GREEN.stem, 4),

  beetroot: () =>
    d.volume(d.taperPath(48, 44, { len: 42, ang: 180, w: 22, tipW: 1.2, belly: 0.78, round: 1 }), R(FRUIT.magenta), { cx: 48, cy: 58 }) +
    d.gleam(39, 50, 10, 6, lighten(FRUIT.magenta, 0.3), { opacity: 0.4 }) +
    d.curve(48, 84, 52, 92, 2, darken(FRUIT.magenta, 0.2), 2.2) +
    // Leaves on their own crimson stems, which is how you know it from a turnip.
    [[-1, 34], [1, 30], [-1, 20]]
      .map(([s, len], i) =>
        d.curve(48, 42, 48 + s * 13, 42 - len * 0.6, s * 3, FRUIT.crimson, 3) +
        d.leaf(48 + s * 13, 42 - len * 0.6, {
          len,
          ang: s * (24 + i * 6),
          w: 10,
          bow: s * 4,
          t: [G.leaf, G.mid, G.dark][i],
          cut: { teeth: 4, depth: 0.14, soft: true },
          round: 0.55,
          rib: true,
        }),
      )
      .join(''),

  'bell-pepper': () => {
    const t = R(FRUIT.red)
    // Three lobes read as a pepper where one rounded body reads as a tomato.
    const lobe = (cx, w, top, bottom) =>
      `M${cx - w} ${top}C${cx - w - 3} ${bottom - 14} ${cx - w + 2} ${bottom} ${cx} ${bottom}C${cx + w - 2} ${bottom} ${cx + w + 3} ${bottom - 14} ${cx + w} ${top}Z`
    const body = `M28 40C28 30 36 26 48 26C60 26 68 30 68 40C68 62 60 82 48 82C36 82 28 62 28 40Z`
    return (
      d.volume(body, t, { cx: 48, cy: 54 }) +
      `<path d="${lobe(36, 9, 40, 76)}" fill="${t.deep}" opacity=".4"/>` +
      `<path d="${lobe(60, 9, 40, 76)}" fill="${t.deep}" opacity=".4"/>` +
      d.gloss(38, 44, 5, 13, { rot: 10, opacity: 0.3 }) +
      d.curve(48, 28, 50, 12, 3, GREEN.stem, 5) +
      calyx(48, 28, { count: 5, len: 11, w: 5, spread: 170 })
    )
  },

  broccoli: () => {
    let o = d.volume(d.taperPath(48, 88, { len: 34, ang: 0, w: 9, tipW: 7, waist: 0.8 }), G.pale, { cx: 48, cy: 72 })
    o += d.curve(40, 78, 33, 64, -2, GREEN.bright, 6)
    o += d.cluster(48, 43, 28, 20, G.dark, { count: 12, bump: 0.36, seed: 5 })
    o += d.cluster(48, 39, 18, 11, G.leaf, { count: 7, bump: 0.42, seed: 11 })
    return o
  },

  'brussels-sprouts': () => {
    const sprout = (cx, cy, r, t) =>
      d.orb(cx, cy, r, t, { ry: r * 1.08, lit: 0.42 }) +
      `<path d="M${cx - r * 0.75} ${cy - r * 0.2}Q${cx} ${cy + r * 0.5} ${cx + r * 0.75} ${cy - r * 0.25}" stroke="${t.edge}" stroke-width="1.2" fill="none" opacity=".45"/>` +
      `<path d="M${cx} ${cy - r}L${cx - r * 0.2} ${cy + r * 0.8}" stroke="${t.edge}" stroke-width="1.2" fill="none" opacity=".4"/>`
    return (
      sprout(31, 60, 16, G.leaf) +
      sprout(65, 58, 15, G.dark) +
      sprout(48, 42, 17, G.mid) +
      d.rod(48, 26, 48, 30, 3, GREEN.stem)
    )
  },

  'button-mushroom': () => {
    const cap = (cx, cy, rx, ry, t) =>
      d.volume(`M${cx - rx} ${cy}C${cx - rx} ${cy - ry * 1.9} ${cx + rx} ${cy - ry * 1.9} ${cx + rx} ${cy}Q${cx} ${cy + ry * 0.75} ${cx - rx} ${cy}Z`, t, { cx, cy: cy - ry * 0.4 })
    const stem = (cx, top, bottom, w, t) =>
      d.volume(`M${cx - w} ${top}C${cx - w * 0.8} ${bottom} ${cx - w * 1.15} ${bottom} ${cx} ${bottom}C${cx + w * 1.15} ${bottom} ${cx + w * 0.8} ${bottom} ${cx + w} ${top}Z`, t, { cx, cy: (top + bottom) / 2 })
    return (
      stem(66, 62, 76, 6, R(EARTH.bone)) +
      cap(66, 62, 15, 11, R(EARTH.ivory)) +
      stem(40, 58, 80, 8, R(EARTH.pale)) +
      cap(40, 58, 22, 16, R(EARTH.cream)) +
      d.gleam(33, 48, 8, 4, '#ffffff', { opacity: 0.55 })
    )
  },

  carrot: () =>
    d.plume(48, 36, { len: 26, ang: 0, colour: GREEN.leaf, w: 2, pairs: 4, spread: 40, leaflet: 0.4 }) +
    d.plume(44, 36, { len: 22, ang: -26, colour: GREEN.mid, w: 1.8, pairs: 4, spread: 44, leaflet: 0.4 }) +
    d.plume(52, 36, { len: 22, ang: 26, colour: GREEN.dark, w: 1.8, pairs: 4, spread: 44, leaflet: 0.4 }) +
    d.volume(d.taperPath(48, 36, { len: 50, ang: 173, w: 13, bow: 5, round: 0.5 }), R(FRUIT.orange), { cx: 48, cy: 58 }) +
    // The rings a carrot actually has, at a whisper.
    [0.22, 0.4, 0.58].map((t) =>
      d.curve(37 + t * 6, 36 + t * 48, 59 - t * 8, 34 + t * 48, -2, darken(FRUIT.orange, 0.16), 1.3),
    ).join(''),

  cauliflower: () =>
    d.fan(48, 74, { count: 5, spread: 168, from: 0, len: 34, w: 14, t: G.pale, tones: [G.leaf, G.bright, G.pale], round: 0.75, cut: { teeth: 4, depth: 0.14, soft: true } }) +
    d.cluster(48, 48, 26, 19, R(EARTH.cream), { count: 12, bump: 0.36, seed: 8 }) +
    d.cluster(48, 44, 17, 11, R(EARTH.pale), { count: 7, bump: 0.4, seed: 2 }),

  celeriac: () =>
    d.orb(48, 58, 27, R(EARTH.bone), { ry: 25, lit: 0.42 }) +
    d.speckle(48, 60, 19, 16, 9, EARTH.tan, { seed: 5, size: 1.6, opacity: 0.45 }) +
    // A scribble of rootlets under the ball; the top gets cut stalks.
    [[-12, 6], [0, 9], [11, 5]].map(([dx, len]) =>
      d.curve(48 + dx, 80, 48 + dx * 1.5, 80 + len, dx * 0.2, EARTH.tan, 1.8),
    ).join('') +
    [[-10, -20], [-1, -26], [9, -22]].map(([dx, dy], i) =>
      d.curve(48 + dx * 0.6, 36, 48 + dx, 36 + dy, dx * 0.15, GREEN.pale, 4) +
      d.leaf(48 + dx, 36 + dy, { len: 13, ang: dx * 2.2, w: 6, t: [G.mid, G.leaf, G.dark][i], cut: { teeth: 3, depth: 0.2, soft: true }, round: 0.5 }),
    ).join(''),

  celery: () => {
    let o = ''
    for (const [x, tilt, tone] of [
      [30, -10, G.mid],
      [39, -5, G.pale],
      [57, 5, G.pale],
      [66, 10, G.mid],
      [48, 0, G.bright],
    ]) {
      const top = 34 + Math.abs(x - 48) * 0.3
      o += d.volume(d.taperPath(x + tilt, 86, { len: 86 - top, ang: 360 - tilt * 0.8, w: 6.5, tipW: 4.5, waist: 0.8, round: 0.5 }), tone, { cx: x, cy: 62 })
      o += d.curve(x + tilt * 0.6, 82, x - tilt * 0.2, top + 4, 0, tone.edge, 1.2)
      // Leafy tops, three little lobes per stalk.
      for (const s of [-1, 0, 1]) {
        o += d.leaf(x - tilt * 0.4, top + 2, { len: 11, ang: s * 34, w: 5.5, t: G.leaf, cut: { teeth: 3, depth: 0.22, soft: true }, round: 0.6, shade: false })
      }
    }
    return o
  },

  chard: () => {
    let o = ''
    for (const [s, len, tone] of [[-1, 40, G.dark], [1, 38, G.leaf], [0, 44, G.mid]]) {
      const x = 48 + s * 11
      o += d.curve(48 + s * 4, 88, x, 56, s * 2, FRUIT.crimson, 4.2)
    }
    for (const [s, len, tone, ang] of [[-1, 34, G.dark, -26], [1, 32, G.leaf, 26], [0, 38, G.mid, 0]]) {
      o += d.leaf(48 + s * 11, 56, {
        len,
        ang,
        w: 15,
        bow: s * 5,
        t: tone,
        cut: { teeth: 5, depth: 0.16, soft: true },
        round: 0.7,
        rib: true,
        ribOpacity: 0.4,
      })
    }
    return o
  },

  chicory: () => {
    // Witloof: a tight pale spindle, leaf tips just breaking the outline.
    const t = R(EARTH.cream)
    let o = d.volume(d.taperPath(48, 84, { len: 62, ang: 2, w: 17, tipW: 2.5, belly: 0.82, waist: 0.42, round: 1 }), t, { cx: 48, cy: 54 })
    for (const [s, ang] of [[-1, -13], [1, 13]]) {
      o += d.leaf(48 + s * 6, 82, { len: 50, ang: ang, w: 9, bow: s * 3, t: s < 0 ? R(EARTH.pale) : R(lighten(GREEN.lime, 0.5)), round: 0.25, shade: false })
    }
    o += d.leaf(48, 84, { len: 46, ang: 0, w: 7, t: R(lighten(GREEN.lime, 0.42)), round: 0.2, shade: false })
    o += d.curve(40, 30, 56, 30, -2, GREEN.lime, 2)
    return o
  },

  'chinese-cabbage': () => {
    const t = R(lighten(GREEN.lime, 0.46))
    let o = d.volume(d.taperPath(48, 86, { len: 66, ang: 0, w: 21, tipW: 9, belly: 0.94, waist: 0.66, round: 0.9 }), t, { cx: 48, cy: 54 })
    // Loose crinkled tips flaring out of the top of the head.
    o += d.fan(48, 60, { count: 5, spread: 96, from: 0, len: 36, w: 9, t: G.pale, tones: [G.mid, G.bright, G.pale], cut: { teeth: 5, depth: 0.26, soft: true }, round: 0.5, shade: false })
    o += d.volume(d.taperPath(48, 86, { len: 48, ang: 0, w: 18, tipW: 11, belly: 0.98, waist: 0.86, round: 0.8 }), R(EARTH.pale), { cx: 48, cy: 66 })
    o += [[-9, 0.55], [0, 0.75], [9, 0.55]].map(([dx, h]) =>
      d.curve(48 + dx, 86, 48 + dx * 1.3, 86 - 44 * h, dx * 0.1, darken(EARTH.pale, 0.1), 1.6),
    ).join('')
    return o
  },

  courgette: () =>
    d.volume(d.taperPath(34, 82, { len: 62, ang: 26, w: 13, tipW: 9, belly: 0.9, waist: 0.86, round: 0.9 }), R(GREEN.dark), { cx: 48, cy: 52 }) +
    d.speckle(46, 54, 13, 20, 9, GREEN.mid, { seed: 3, size: 1.5, opacity: 0.55 }) +
    d.gleam(38, 62, 4.5, 15, lighten(GREEN.dark, 0.26), { rot: 26, opacity: 0.5 }) +
    d.curve(62, 24, 66, 14, 1, GREEN.stem, 4.5) +
    calyx(62, 25, { count: 4, len: 10, w: 4, spread: 130, from: 20, t: G.bright }),

  cucumber: () =>
    d.volume(d.taperPath(32, 80, { len: 64, ang: 28, w: 12, tipW: 10, belly: 0.94, waist: 0.92, round: 1 }), R(GREEN.leaf), { cx: 48, cy: 52 }) +
    d.gleam(38, 58, 4, 16, lighten(GREEN.leaf, 0.3), { rot: 28, opacity: 0.55 }) +
    d.speckle(48, 52, 12, 20, 7, darken(GREEN.leaf, 0.14), { seed: 6, size: 1.3, opacity: 0.4 }),

  endive: () =>
    d.fan(48, 84, {
      count: 9,
      spread: 214,
      from: 0,
      len: (s, dep) => 40 + dep * 12,
      w: (s, dep) => 11 + dep * 3,
      t: G.pale,
      tones: [G.leaf, G.bright, G.pale, R(lighten(GREEN.lime, 0.4))],
      cut: { teeth: 7, depth: 0.34, soft: false },
      round: 0.6,
    }),

  fennel: () => {
    let o = ''
    for (const [dx, len, tone] of [[-8, 30, GREEN.leaf], [0, 36, GREEN.mid], [8, 28, GREEN.dark], [-3, 26, GREEN.fresh]]) {
      o += d.plume(48 + dx * 0.4, 48, { len, ang: dx * 2.2, colour: tone, w: 1.7, pairs: 5, spread: 44, leaflet: 0.34 })
    }
    const t = R(EARTH.pale)
    o += d.volume(`M26 62C26 50 34 44 48 44C62 44 70 50 70 62C70 76 62 84 48 84C34 84 26 76 26 62Z`, t, { cx: 48, cy: 64 })
    o += [[-10, 0.8], [0, 1], [10, 0.8]].map(([dx, h]) =>
      d.curve(48 + dx * 1.4, 82, 48 + dx, 48, dx * 0.12, darken(EARTH.pale, 0.12), 1.7),
    ).join('')
    o += d.gleam(38, 56, 8, 5, '#ffffff', { opacity: 0.5 })
    return o
  },

  garlic: () => {
    const t = R(EARTH.pale)
    const body = `M48 30C62 38 70 50 70 62C70 76 60 84 48 84C36 84 26 76 26 62C26 50 34 38 48 30Z`
    let o = d.volume(body, t, { cx: 48, cy: 60 })
    for (const dx of [-11, 0, 11]) {
      o += `<path d="M${48 + dx * 0.35} 36Q${48 + dx * 1.5} 60 ${48 + dx * 1.1} 82" stroke="${darken(EARTH.pale, 0.13)}" stroke-width="1.7" fill="none" opacity=".75"/>`
    }
    o += d.curve(48, 32, 49, 16, 2, EARTH.bone, 4)
    o += d.gleam(38, 54, 7, 4.5, '#ffffff', { opacity: 0.5 })
    return o
  },

  'green-beans': () => {
    let o = ''
    for (const [x, ang, len, tone] of [
      [28, 14, 58, G.dark],
      [40, 6, 64, G.leaf],
      [56, -6, 62, G.mid],
      [68, -14, 54, G.fresh],
    ]) {
      o += d.volume(d.taperPath(x, 84, { len, ang: 360 - ang, w: 5, bow: ang * 0.5, tipW: 2.4, waist: 0.8, round: 0.7 }), tone, { cx: x, cy: 56 })
      // The bumps of the seeds inside.
      for (let i = 1; i <= 3; i++) {
        const t = 0.24 + i * 0.2
        o += `<circle cx="${d.f(x + ang * 0.5 * t - ang * 0.2)}" cy="${d.f(84 - len * t)}" r="2" fill="${tone.edge}" opacity=".3"/>`
      }
    }
    return o
  },

  horseradish: () =>
    d.volume(d.taperPath(48, 26, { len: 58, ang: 186, w: 11, bow: -5, tipW: 1.6, belly: 0.8, waist: 0.34 }), R(EARTH.bone), { cx: 48, cy: 54 }) +
    d.speckle(48, 52, 7, 20, 8, EARTH.tan, { seed: 7, size: 1.3, opacity: 0.5 }) +
    [[70, -14], [76, 12], [62, -16]].map(([y, dx]) =>
      d.curve(48 + dx * 0.2, y, 48 + dx, y + 8, dx * 0.2, EARTH.tan, 1.7),
    ).join('') +
    d.fan(48, 26, { count: 4, spread: 92, from: 0, len: 18, w: 7, t: G.leaf, tones: [G.dark, G.mid], cut: { teeth: 4, depth: 0.2, soft: true }, round: 0.5, shade: false }),

  'jerusalem-artichoke': () => {
    const knob = (cx, cy, rx, ry, rot, t, seed) =>
      d.group(
        d.volume(`M${-rx} 0C${-rx} ${-ry * 1.4} ${-rx * 0.2} ${-ry} ${rx * 0.5} ${-ry}C${rx * 1.2} ${-ry} ${rx} ${-ry * 0.2} ${rx} ${ry * 0.3}C${rx} ${ry * 1.3} ${rx * 0.3} ${ry} ${-rx * 0.4} ${ry}C${-rx * 1.1} ${ry} ${-rx} ${ry * 0.5} ${-rx} 0Z`, t, { cx: 0, cy: 0 }) +
          d.speckle(0, 0, rx * 0.55, ry * 0.5, 4, EARTH.bark, { seed, size: 1.3, opacity: 0.45 }),
        `translate(${cx} ${cy}) rotate(${rot})`,
      )
    return (
      knob(64, 62, 17, 14, 18, R(EARTH.tan), 4) +
      knob(34, 66, 16, 13, -14, R(EARTH.husk), 9) +
      knob(47, 42, 19, 15, 6, R(EARTH.straw), 2)
    )
  },

  kale: () =>
    d.fan(48, 84, {
      count: 7,
      spread: 192,
      from: 0,
      len: (s, dep) => 42 + dep * 10,
      w: 14,
      t: G.blue,
      tones: [G.dark, G.blue, G.leaf, G.mid],
      cut: { teeth: 8, depth: 0.3, soft: true },
      round: 0.72,
    }),

  kohlrabi: () => {
    const t = R(lighten(GREEN.lime, 0.2))
    let o = ''
    // Stalks first so the bulb sits in front of them.
    for (const [dx, len, tone] of [[-13, 30, G.leaf], [-4, 38, G.mid], [6, 36, G.dark], [14, 28, G.fresh]]) {
      o += d.curve(48 + dx * 0.4, 50, 48 + dx * 1.5, 50 - len * 0.62, dx * 0.2, GREEN.lime, 3)
      o += d.leaf(48 + dx * 1.5, 50 - len * 0.62, { len: len * 0.62, ang: dx * 2.6, w: 9, bow: dx * 0.2, t: tone, cut: { teeth: 4, depth: 0.16, soft: true }, round: 0.6 })
    }
    o += d.orb(48, 62, 25, t, { ry: 22, lit: 0.45 })
    o += [[-12, 8], [12, 8], [0, 12]].map(([dx, dy]) =>
      d.curve(48 + dx, 42 + Math.abs(dx) * 0.3, 48 + dx * 1.15, 40 - dy * 0.4, 0, GREEN.lime, 2.6),
    ).join('')
    return o
  },

  'lambs-lettuce': () =>
    d.fan(48, 76, {
      count: 11,
      spread: 240,
      from: 0,
      len: (s, dep) => 26 + dep * 10,
      w: (s, dep) => 8 + dep * 2.5,
      t: G.mid,
      tones: [G.dark, G.leaf, G.mid, G.fresh],
      round: 1,
      rib: true,
      ribOpacity: 0.3,
    }) + d.curve(48, 76, 48, 86, 0, GREEN.pale, 3),

  leek: () => {
    let o = d.fan(48, 52, { count: 5, spread: 74, from: 0, len: 42, w: 10, t: G.leaf, tones: [G.darkest, G.dark, G.leaf], round: 0.22, shade: true })
    o += d.volume(d.taperPath(48, 86, { len: 44, ang: 0, w: 11, tipW: 9, waist: 0.92, belly: 0.98, round: 0.7 }), R(EARTH.pale), { cx: 48, cy: 66 })
    o += `<path d="M38 60Q48 56 58 60" stroke="${lighten(GREEN.lime, 0.3)}" stroke-width="2.4" fill="none" opacity=".8"/>`
    o += d.gleam(42, 70, 3.5, 10, '#ffffff', { rot: 0, opacity: 0.45 })
    o += [[-14, 0], [14, 0]].map(([dx]) => d.curve(48 + dx * 0.3, 86, 48 + dx, 92, 0, EARTH.pale, 1.6)).join('')
    return o
  },

  lettuce: () =>
    d.fan(48, 80, {
      count: 8,
      spread: 198,
      from: 0,
      len: (s, dep) => 38 + dep * 8,
      w: (s, dep) => 17 + dep * 3,
      t: G.bright,
      tones: [G.leaf, G.mid, G.fresh, G.pale],
      cut: { teeth: 4, depth: 0.18, soft: true },
      round: 0.95,
    }) +
    d.fan(48, 76, { count: 3, spread: 76, from: 0, len: 24, w: 13, t: R(lighten(GREEN.lime, 0.36)), cut: { teeth: 3, depth: 0.16, soft: true }, round: 1 }),

  'may-turnip': () =>
    d.volume(d.taperPath(48, 44, { len: 40, ang: 180, w: 22, tipW: 1.4, belly: 0.74, round: 1 }), R(EARTH.pale), { cx: 48, cy: 58 }) +
    `<path d="M26.5 46C26.5 38 34 34 48 34C62 34 69.5 38 69.5 46C69.5 50 62 52 48 52C34 52 26.5 50 26.5 46Z" fill="${FRUIT.purple}" opacity=".62"/>` +
    d.gleam(38, 58, 8, 5, '#ffffff', { opacity: 0.5 }) +
    d.curve(48, 82, 51, 91, 2, EARTH.bone, 2) +
    d.fan(48, 36, { count: 5, spread: 122, from: 0, len: 22, w: 8, t: G.mid, tones: [G.dark, G.leaf, G.mid], cut: { teeth: 4, depth: 0.2, soft: true }, round: 0.7 }),

  onion: () => {
    const t = R(EARTH.husk)
    const body = `M48 28C64 40 72 50 72 62C72 76 61 85 48 85C35 85 24 76 24 62C24 50 32 40 48 28Z`
    let o = d.volume(body, t, { cx: 48, cy: 60 })
    for (const dx of [-13, 0, 13]) {
      o += `<path d="M${48 + dx * 0.3} 34Q${48 + dx * 1.45} 60 ${48 + dx * 1.05} 83" stroke="${darken(EARTH.husk, 0.18)}" stroke-width="1.7" fill="none" opacity=".6"/>`
    }
    o += d.gleam(38, 54, 8, 5, lighten(EARTH.husk, 0.34), { opacity: 0.65 })
    o += d.curve(48, 30, 52, 14, 3, EARTH.straw, 3.4)
    o += [[-10, 6], [10, 6]].map(([dx]) => d.curve(48 + dx * 0.2, 84, 48 + dx, 90, 0, EARTH.straw, 1.5)).join('')
    return o
  },

  'pak-choi': () => {
    let o = ''
    for (const [s, ang, len, tone] of [[-1, -30, 40, G.dark], [1, 30, 38, G.leaf], [0, 0, 44, G.mid]]) {
      o += d.leaf(48 + s * 9, 58, { len, ang, w: 15, bow: s * 5, t: tone, cut: { teeth: 4, depth: 0.14, soft: true }, round: 0.95, rib: true, ribOpacity: 0.35 })
    }
    // The white spoon bases are the whole point of a pak choi.
    for (const [s, ang] of [[-1, -16], [1, 16], [0, 0]]) {
      o += d.volume(d.taperPath(48 + s * 3, 86, { len: 34, ang: 360 - ang * 0.6, w: 8, tipW: 5, waist: 0.8, round: 0.6 }), R(EARTH.pale), { cx: 48 + s * 4, cy: 70 })
    }
    return o
  },

  parsnip: () =>
    d.volume(d.taperPath(48, 32, { len: 54, ang: 176, w: 15, bow: 4, tipW: 1.5, belly: 0.72, waist: 0.26 }), R(EARTH.cream), { cx: 48, cy: 58 }) +
    d.gleam(41, 46, 4, 11, '#ffffff', { rot: -8, opacity: 0.5 }) +
    [0.3, 0.5].map((t) => d.curve(38 + t * 8, 32 + t * 52, 58 - t * 10, 30 + t * 52, -2, darken(EARTH.cream, 0.14), 1.2)).join('') +
    d.fan(48, 32, { count: 5, spread: 104, from: 0, len: 19, w: 6.5, t: G.mid, tones: [G.dark, G.leaf, G.mid], cut: { teeth: 4, depth: 0.28, soft: true }, round: 0.4, shade: false }),

  peas: () => {
    let o = ''
    // A whole pod behind, an open one in front with the peas showing.
    o += d.volume(d.taperPath(26, 76, { len: 56, ang: 34, w: 8, bow: -6, tipW: 2.6, waist: 0.6, round: 0.6 }), G.leaf, { cx: 44, cy: 58 })
    const open = d.taperPath(24, 84, { len: 58, ang: 32, w: 10, bow: -7, tipW: 3, waist: 0.6, round: 0.6 })
    o += d.volume(open, G.mid, { cx: 44, cy: 62 })
    o += `<path d="${open}" fill="${GREEN.bright}" transform="translate(1.5 -3.5) scale(0.96)" opacity=".55"/>`
    for (let i = 0; i < 4; i++) {
      o += d.orb(30 + i * 9.5, 76 - i * 13, 6.2, R(GREEN.lime), { lit: 0.5 })
    }
    o += d.curve(20, 88, 26, 82, 1, GREEN.stem, 2.4)
    return o
  },

  potato: () => {
    const tuber = (cx, cy, rx, ry, rot, t, seed) =>
      d.group(
        d.volume(`M${-rx} ${ry * 0.1}C${-rx} ${-ry * 1.2} ${-rx * 0.3} ${-ry} ${rx * 0.3} ${-ry}C${rx * 1.15} ${-ry} ${rx} ${-ry * 0.1} ${rx} ${ry * 0.3}C${rx} ${ry * 1.2} ${rx * 0.4} ${ry} ${-rx * 0.3} ${ry}C${-rx} ${ry} ${-rx} ${ry * 0.6} ${-rx} ${ry * 0.1}Z`, t, { cx: 0, cy: 0 }) +
          d.speckle(0, 0, rx * 0.6, ry * 0.55, 4, EARTH.bark, { seed, size: 1.5, opacity: 0.5 }),
        `translate(${cx} ${cy}) rotate(${rot})`,
      )
    return (
      tuber(62, 64, 20, 15, 14, R(EARTH.tan), 4) +
      tuber(37, 50, 21, 16, -12, R(EARTH.straw), 9)
    )
  },

  pumpkin: () => {
    const t = R(FRUIT.orange)
    let o = d.orb(48, 58, 32, t, { ry: 26, lit: 0 })
    o += d.ribs(48, 58, 30, 4, t.deep, { ry: 24, opacity: 0.45, w: 2.2 })
    o += d.gleam(34, 46, 10, 6, t.light, { opacity: 0.5 })
    o += d.volume(d.taperPath(48, 34, { len: 14, ang: 0, w: 5.5, tipW: 5, waist: 0.9, round: 0.4 }), G.stem, { cx: 48, cy: 28 })
    o += d.curve(52, 22, 62, 28, 4, GREEN.stem, 2.4)
    return o
  },

  radicchio: () => {
    const t = R(FRUIT.crimson)
    let o = d.orb(48, 58, 27, t, { ry: 26, lit: 0.35 })
    // The white veins are what makes a radicchio and not a red cabbage.
    for (const [dx, bow] of [[-13, -5], [-4, -2], [5, 2], [14, 5]]) {
      o += `<path d="M${48 + dx} 36Q${48 + dx + bow * 2} 58 ${48 + dx * 0.8} 82" stroke="${EARTH.pale}" stroke-width="${3.4 - Math.abs(dx) * 0.11}" fill="none" opacity=".72"/>`
    }
    o += d.fan(48, 80, { count: 5, spread: 150, from: 0, len: 28, w: 13, t: R(FRUIT.magenta), tones: [R(darken(FRUIT.crimson, 0.2)), R(FRUIT.crimson), R(FRUIT.magenta)], cut: { teeth: 4, depth: 0.16, soft: true }, round: 0.9 })
    return o
  },

  radish: () => {
    const bulb = (cx, cy, r, t) =>
      d.orb(cx, cy, r, t, { ry: r * 0.94, glossy: true, lit: 0.42 }) +
      // The white tail every radish has.
      `<path d="M${cx - r * 0.5} ${cy + r * 0.72}Q${cx} ${cy + r * 1.05} ${cx + r * 0.5} ${cy + r * 0.72}Q${cx} ${cy + r * 1.35} ${cx - r * 0.5} ${cy + r * 0.72}Z" fill="${EARTH.pale}"/>` +
      d.curve(cx, cy + r * 1.1, cx + r * 0.3, cy + r * 1.9, 1, EARTH.pale, 1.8)
    return (
      d.fan(48, 46, { count: 5, spread: 120, from: 0, len: 24, w: 8, t: G.mid, tones: [G.dark, G.leaf, G.mid], cut: { teeth: 4, depth: 0.2, soft: true }, round: 0.75 }) +
      bulb(31, 62, 15, R(FRUIT.scarlet)) +
      bulb(64, 60, 14, R(FRUIT.red)) +
      bulb(48, 68, 16, R(FRUIT.red))
    )
  },

  'red-cabbage': () => {
    const t = R(FRUIT.plum)
    let o = d.orb(48, 58, 28, t, { ry: 27, lit: 0.4 })
    for (const [r, op] of [[20, 0.5], [13, 0.4], [6.5, 0.32]]) {
      o += `<path d="M${48 - r} 58a${r} ${r * 0.98} 0 1 1 ${r * 2} 0" stroke="${mix(FRUIT.plum, EARTH.pale, 0.55)}" stroke-width="1.8" fill="none" opacity="${op}"/>`
    }
    o += `<path d="M48 30L48 22" stroke="${mix(FRUIT.plum, EARTH.pale, 0.5)}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>`
    o += d.fan(48, 80, { count: 5, spread: 156, from: 0, len: 27, w: 13, t: t, tones: [R(darken(FRUIT.plum, 0.22)), R(FRUIT.plum), R(mix(FRUIT.plum, GREEN.sage, 0.3))], cut: { teeth: 4, depth: 0.18, soft: true }, round: 0.9 })
    return o
  },

  rhubarb: () => {
    let o = ''
    for (const [x, ang, tone] of [[34, -12, FRUIT.crimson], [48, 0, FRUIT.red], [62, 12, FRUIT.cherry]]) {
      o += d.volume(d.taperPath(x - ang * 0.5, 86, { len: 56, ang: 360 - ang, w: 5.5, tipW: 3.6, waist: 0.8, round: 0.6 }), R(tone), { cx: x, cy: 60 })
    }
    for (const [x, ang, tone] of [[30, -24, G.dark], [66, 24, G.leaf], [48, 0, G.mid]]) {
      o += d.leaf(x, 32, { len: 26, ang, w: 13, bow: ang * 0.2, t: tone, cut: { teeth: 5, depth: 0.22, soft: true }, round: 0.85, rib: true, ribOpacity: 0.3 })
    }
    return o
  },

  rocket: () => {
    let o = ''
    for (const [x, y, ang, len] of [[36, 82, -34, 42], [60, 82, 34, 40], [48, 86, 0, 48]]) {
      o += d.curve(48, 88, x, y, 0, GREEN.stem, 2.4)
      // Rocket's deep side lobes, cut almost to the midrib.
      o += d.leaf(x, y, { len, ang, w: 11, bow: ang * 0.12, t: [G.leaf, G.mid, G.dark][Math.abs(ang) % 3], cut: { teeth: 4, depth: 0.52, soft: true }, round: 0.8, rib: true, ribOpacity: 0.35 })
    }
    return o
  },

  salsify: () => {
    let o = ''
    for (const [x, ang, tone] of [[36, -8, R(EARTH.bark)], [60, 8, R(EARTH.husk)], [48, 0, R(EARTH.tan)]]) {
      o += d.volume(d.taperPath(x - ang * 0.6, 26, { len: 60, ang: 180 - ang, w: 6, bow: ang * 0.8, tipW: 1.2, belly: 0.74, waist: 0.24 }), tone, { cx: x, cy: 56 })
    }
    o += [[-4, 74], [5, 78], [0, 82]].map(([dx, y]) => d.curve(48 + dx, y, 48 + dx * 3, y + 7, dx * 0.3, EARTH.bark, 1.4)).join('')
    o += d.fan(48, 26, { count: 5, spread: 96, from: 0, len: 17, w: 3.4, t: G.blue, tones: [G.darkest, G.blue, G.leaf], round: 0.1, shade: false })
    return o
  },

  'savoy-cabbage': () => {
    const t = R(mix(GREEN.blue, GREEN.mid, 0.4))
    let o = d.orb(48, 58, 28, t, { ry: 27, lit: 0.34 })
    // Savoy is a crinkle, not a stripe — a lattice of short arcs.
    for (let ring = 1; ring <= 3; ring++) {
      const r = ring * 8
      for (let i = 0; i < ring * 5; i++) {
        const a = (i / (ring * 5)) * Math.PI * 2 + ring
        const cx = 48 + Math.cos(a) * r
        const cy = 58 + Math.sin(a) * r * 0.95
        o += `<path d="M${d.f(cx - 4)} ${d.f(cy)}Q${d.f(cx)} ${d.f(cy - 4)} ${d.f(cx + 4)} ${d.f(cy)}" stroke="${t.light}" stroke-width="1.5" fill="none" opacity=".55"/>`
      }
    }
    o += d.fan(48, 80, { count: 5, spread: 156, from: 0, len: 28, w: 13, t: G.bright, tones: [G.dark, G.blue, G.bright], cut: { teeth: 5, depth: 0.24, soft: true }, round: 0.9 })
    return o
  },

  spinach: () =>
    d.fan(48, 84, {
      count: 7,
      spread: 176,
      from: 0,
      len: (s, dep) => 40 + dep * 10,
      w: (s, dep) => 15 + dep * 3,
      t: G.mid,
      tones: [G.darkest, G.dark, G.leaf, G.mid],
      round: 0.9,
      rib: true,
      ribOpacity: 0.32,
    }),

  'spring-onion': () => {
    let o = ''
    for (const [x, ang, tone] of [[34, -16, G.dark], [62, 16, G.leaf], [48, 0, G.mid], [42, -7, G.fresh]]) {
      o += d.volume(d.taperPath(x - ang * 0.7, 66, { len: 52, ang: 360 - ang, w: 4.6, bow: -ang * 0.3, tipW: 1.6, waist: 0.58, round: 0.4 }), tone, { cx: x, cy: 44 })
    }
    o += d.volume(d.taperPath(48, 86, { len: 32, ang: 0, w: 9, tipW: 6.5, waist: 0.86, belly: 0.96, round: 0.9 }), R(EARTH.pale), { cx: 48, cy: 72 })
    o += `<path d="M40 62Q48 58 56 62" stroke="${lighten(GREEN.lime, 0.28)}" stroke-width="2.2" fill="none" opacity=".8"/>`
    o += [[-9, 0], [9, 0], [0, 0]].map(([dx]) => d.curve(48 + dx * 0.3, 86, 48 + dx, 93, 0, EARTH.pale, 1.5)).join('')
    return o
  },

  swede: () =>
    d.orb(48, 60, 27, R(EARTH.straw), { ry: 25, lit: 0.45 }) +
    `<path d="M21.5 54C24 42 34 35 48 35C62 35 72 42 74.5 54C66 58 58 59 48 59C38 59 30 58 21.5 54Z" fill="${FRUIT.purple}" opacity=".6"/>` +
    d.gleam(37, 50, 9, 5, '#ffffff', { opacity: 0.4 }) +
    d.curve(48, 84, 52, 92, 2, EARTH.tan, 2.2) +
    d.fan(48, 36, { count: 4, spread: 96, from: 0, len: 18, w: 7, t: G.blue, tones: [G.darkest, G.blue, G.leaf], cut: { teeth: 3, depth: 0.2, soft: true }, round: 0.6, shade: false }),

  sweetcorn: () => {
    let o = ''
    // Husk leaves peeled back behind the cob.
    for (const [ang, len, tone] of [[-22, 56, G.dark], [22, 54, G.leaf], [-9, 60, G.mid], [10, 58, G.bright]]) {
      o += d.leaf(48, 86, { len, ang, w: 9, bow: ang * 0.22, t: tone, round: 0.18 })
    }
    const t = R(FRUIT.gold)
    o += d.volume(d.taperPath(48, 84, { len: 60, ang: 0, w: 13, tipW: 4, belly: 0.94, waist: 0.6, round: 0.9 }), t, { cx: 48, cy: 56 })
    // Kernels: staggered rows, drawn as flat dots so the cob stays readable.
    for (let row = 0; row < 8; row++) {
      const y = 76 - row * 7
      const w = 10 - Math.max(0, row - 4) * 1.9
      for (let i = -2; i <= 2; i++) {
        const x = 48 + (i + (row % 2 ? 0.5 : 0)) * (w / 2.3)
        if (Math.abs(x - 48) > w) continue
        o += `<circle cx="${d.f(x)}" cy="${d.f(y)}" r="2.5" fill="${t.light}" opacity=".85"/>`
      }
    }
    o += d.curve(48, 26, 50, 16, 1, G.pale.base, 3)
    return o
  },

  tomato: () =>
    d.orb(48, 57, 29, R(FRUIT.red), { ry: 26, glossy: true, lit: 0.42 }) +
    `<path d="M30 46Q48 40 66 46" stroke="${darken(FRUIT.red, 0.18)}" stroke-width="1.4" fill="none" opacity=".3"/>` +
    calyx(48, 33, { count: 6, len: 15, w: 5.5, spread: 200 }) +
    d.curve(48, 33, 48, 20, 0, GREEN.stem, 4),

  'white-cabbage': () => {
    const t = R(lighten(GREEN.lime, 0.44))
    let o = d.orb(48, 58, 28, t, { ry: 27, lit: 0.4 })
    for (const [r, op] of [[21, 0.5], [14, 0.42], [7, 0.34]]) {
      o += `<path d="M${48 - r} 59a${r} ${r * 0.96} 0 1 1 ${r * 2} 0" stroke="${G.pale.base}" stroke-width="1.8" fill="none" opacity="${op}"/>`
    }
    o += `<path d="M48 31L48 23" stroke="${G.pale.base}" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`
    o += d.fan(48, 80, { count: 5, spread: 154, from: 0, len: 27, w: 13, t: G.pale, tones: [G.mid, G.bright, G.pale], cut: { teeth: 4, depth: 0.18, soft: true }, round: 0.9 })
    return o
  },
}
