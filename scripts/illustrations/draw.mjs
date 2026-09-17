/**
 * The drawing kit: bold line work on a coloured tile.
 *
 * One stroke weight, round caps and joins, no fills and no shading. Everything
 * a crop needs to be recognisable has to survive in six or seven strokes, so
 * the primitives here are deliberately blunt — a body, a leaf, a stalk, a
 * cluster — and the recipes decide which three of them a crop is.
 *
 * Canvas is 96×96. The tile is the full square; the drawing sits inside
 * roughly x,y ∈ [14, 82] and is allowed to run off the edge when the crop is
 * better for being cropped.
 */

/* ------------------------------- geometry --------------------------------- */

export const f = (v) => {
  const r = Math.round(v * 100) / 100
  return Object.is(r, -0) ? 0 : r
}

const RAD = Math.PI / 180
/** Unit vector for an angle in degrees, where 0 points up and 90 points right. */
export const dir = (a) => [Math.sin(a * RAD), -Math.cos(a * RAD)]
export const perp = (a) => dir(a + 90)
const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s]
const pt = (p) => `${f(p[0])} ${f(p[1])}`

/* ---------------------------------- paths --------------------------------- */

export const circlePath = (cx, cy, r, ry = r) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(ry)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(ry)} 0 1 0 ${f(-r * 2)} 0Z`

/** A quadratic arc from one point to another, bowing across its own axis. */
export const arcPath = (x1, y1, x2, y2, bow = 0) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  return `M${f(x1)} ${f(y1)}Q${f((x1 + x2) / 2 - (dy / len) * bow * 2)} ${f(
    (y1 + y2) / 2 + (dx / len) * bow * 2,
  )} ${f(x2)} ${f(y2)}`
}

/**
 * A leaf, and by extension most of the set: petals, bracts, pods, husks and
 * every pointed thing that grows out of something else. `round` 0 is a lance,
 * 1 a spoon.
 */
export const leafPath = (x, y, { len, ang = 0, w, bow = 0, round = 0, tail = 0.15 }) => {
  const u = dir(ang)
  const p = perp(ang)
  const base = [x, y]
  const tip = add(add(base, u, len), p, bow)
  const tw = w * (0.1 + round * 1.2)
  const c = (s) => [
    add(add(base, u, len * tail), p, s * w),
    add(add(tip, u, -len * 0.34), p, s * tw + bow * 0.1),
  ]
  const [l1, l2] = c(-1)
  const [r1, r2] = c(1)
  return `M${pt(base)}C${pt(l1)} ${pt(l2)} ${pt(tip)}C${pt(r2)} ${pt(r1)} ${pt(base)}Z`
}

/**
 * A body that tapers: roots, pods, spears, cucumbers, chillies. `tipW` blunts
 * the far end, `belly` moves the widest point along it.
 */
export const taperPath = (
  x,
  y,
  { len, ang = 180, w, bow = 0, round = 0.9, tipW = 0, belly = 0.75, waist = 0.35 } = {},
) => {
  const u = dir(ang)
  const p = perp(ang)
  const base = [x, y]
  const tip = add(add(base, u, len), p, bow)
  const l0 = add(base, p, -w)
  const r0 = add(base, p, w)
  const near = (s) => add(add(base, u, len * 0.42), p, s * w * belly + bow * 0.3)
  const far = (s) => add(add(base, u, len * 0.84), p, s * (w * waist + tipW) + bow * 0.86)
  return (
    `M${pt(l0)}C${pt(add(l0, u, -w * round))} ${pt(add(r0, u, -w * round))} ${pt(r0)}` +
    `C${pt(near(1))} ${pt(far(1))} ${pt(add(tip, p, tipW))}` +
    (tipW ? `Q${pt(add(tip, u, tipW * 1.34))} ${pt(add(tip, p, -tipW))}` : '') +
    `C${pt(far(-1))} ${pt(near(-1))} ${pt(l0)}Z`
  )
}

/**
 * A symmetrical body given as a width profile: how wide at the top, how wide
 * at its widest, how far down that widest point sits, how wide at the bottom.
 *
 * Aubergines, pears, plums, figs, lemons and peppers are all this one path
 * with four numbers changed, which is cheaper and far more controllable than
 * hand-writing a bezier per fruit.
 */
export const bodyPath = (cx, top, bot, { topW = 3, midW, midAt = 0.55, botW = 7 }) => {
  const h = bot - top
  const my = top + h * midAt
  const F = (v) => f(v)
  return (
    `M${F(cx)} ${F(top)}` +
    `C${F(cx + topW * 2.2)} ${F(top + h * 0.02)} ${F(cx + midW)} ${F(top + h * midAt * 0.42)} ${F(
      cx + midW,
    )} ${F(my)}` +
    `C${F(cx + midW)} ${F(my + h * (1 - midAt) * 0.58)} ${F(cx + botW)} ${F(bot - h * 0.02)} ${F(
      cx,
    )} ${F(bot)}` +
    `C${F(cx - botW)} ${F(bot - h * 0.02)} ${F(cx - midW)} ${F(my + h * (1 - midAt) * 0.58)} ${F(
      cx - midW,
    )} ${F(my)}` +
    `C${F(cx - midW)} ${F(top + h * midAt * 0.42)} ${F(cx - topW * 2.2)} ${F(top + h * 0.02)} ${F(
      cx,
    )} ${F(top)}Z`
  )
}

/** A scalloped outline — cabbage frills, curd, florets, drupelet clusters. */
export const scallopPath = (cx, cy, rx, ry, lobes, { depth = 0.14, from = 0 } = {}) => {
  const n = lobes * 4
  const at = (i) => {
    const a = from + (i / n) * Math.PI * 2
    const k = 1 + Math.cos(a * lobes - Math.PI) * depth
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  }
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = at(i)
    const b = at(i + 1)
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    d += i === 0 ? `M${pt(m)}` : `Q${pt(a)} ${pt(m)}`
  }
  return d + 'Z'
}

/* ----------------------------------- pen ---------------------------------- */

/**
 * A pen bound to one tile: it knows the ground colour, the ink and the one
 * stroke weight, so a recipe never restates any of them.
 *
 * `knock` is the reason overlapping line work reads: it lays the shape down
 * once in the ground colour at a heavier weight before inking it, cutting a
 * clean gap through whatever sits behind.
 */
export const pen = (tile, ink, w = 6.2) => {
  const stroke = (d, colour, width, extra = '') =>
    `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${f(
      width,
    )}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`

  const line = (d, { knock = false, w: width = w, gap = 3.4 } = {}) =>
    (knock ? stroke(d, tile, width + gap * 2) : '') + stroke(d, ink, width)

  return {
    tile,
    ink,
    w,
    line,
    /** Several paths sharing one knockout, so they read as a single object. */
    group: (paths, { knock = false, w: width = w, gap = 3.4 } = {}) =>
      (knock ? paths.map((d) => stroke(d, tile, width + gap * 2)).join('') : '') +
      paths.map((d) => stroke(d, ink, width)).join(''),
    dot: (cx, cy, r = w * 0.52, { knock = false, gap = 3.4 } = {}) =>
      (knock ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r + gap)}" fill="${tile}"/>` : '') +
      `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${ink}"/>`,
    circle: (cx, cy, r, o) => line(circlePath(cx, cy, r), o),
    oval: (cx, cy, rx, ry, o) => line(circlePath(cx, cy, rx, ry), o),
    arc: (x1, y1, x2, y2, bow, o) => line(arcPath(x1, y1, x2, y2, bow), o),
    leaf: (x, y, s, o) => line(leafPath(x, y, s), o),
    taper: (x, y, s, o) => line(taperPath(x, y, s), o),
    scallop: (cx, cy, rx, ry, lobes, s, o) => line(scallopPath(cx, cy, rx, ry, lobes, s), o),
    body: (cx, top, bot, s, o) => line(bodyPath(cx, top, bot, s), o),
    /**
     * Layered leaves seen end on, as nested C-arcs all opening the same way.
     * Concentric rings read as a target and two arcs meeting at the top read
     * as a peace sign; an off-centre stack reads as a cabbage.
     */
    coil: (cx, cy, r, turns = 3, { open = -40, k = 0.78 } = {}) =>
      Array.from({ length: turns }, (_, i) => {
        const rr = r * Math.pow(k, i)
        const a0 = ((open - 150) * Math.PI) / 180
        const a1 = ((open + 150) * Math.PI) / 180
        return line(
          `M${f(cx + Math.cos(a0) * rr)} ${f(cy + Math.sin(a0) * rr)}A${f(rr)} ${f(
            rr,
          )} 0 1 1 ${f(cx + Math.cos(a1) * rr)} ${f(cy + Math.sin(a1) * rr)}`,
          { w: w * (0.86 - i * 0.08) },
        )
      }).join(''),
    /** A short mark: veins, creases, ribs, seeds. Always lighter than the body. */
    mark: (x1, y1, x2, y2, bow = 0, k = 0.62) => stroke(arcPath(x1, y1, x2, y2, bow), ink, w * k),
    fill: (d) => `<path d="${d}" fill="${ink}"/>`,
  }
}

/* --------------------------------- output --------------------------------- */

/** The tile itself: full bleed, one radius across the whole set. */
export const svg = (body, { title, tile }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${title}">` +
  `<title>${title}</title>` +
  `<rect width="96" height="96" rx="20" fill="${tile}"/>` +
  // Nothing is allowed to escape the tile, so a crop can be drawn oversize and
  // simply run off the edge.
  `<g clip-path="inset(0 round 20)">${body}</g></svg>`

export const group = (body, transform) => `<g transform="${transform}">${body}</g>`
