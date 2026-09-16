/**
 * Shape primitives for the produce illustrations.
 *
 * Every drawing in the set is assembled from these, which is the point: the
 * light falls from the top left in `volume()` once, and 87 crops inherit it.
 * Recipes describe *what* a crop is — a taproot with a feathered top, a
 * three-lobed berry cluster — and never restate how form is shaded.
 *
 * Canvas is 96×96 with the subject inside roughly x,y ∈ [8, 88].
 */

/* ------------------------------- geometry --------------------------------- */

/** Trim float noise: SVG files are 87× whatever this returns. */
export const f = (v) => {
  const r = Math.round(v * 100) / 100
  return Object.is(r, -0) ? 0 : r
}

const RAD = Math.PI / 180

/** Unit vector for an angle in degrees, where 0 points up and 90 points right. */
export const dir = (a) => [Math.sin(a * RAD), -Math.cos(a * RAD)]
/** The same angle turned a quarter clockwise — the "right" side of a form. */
export const perp = (a) => dir(a + 90)

const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s]
const pt = (p) => `${f(p[0])} ${f(p[1])}`

const cubic = (p0, p1, p2, p3, t) => {
  const m = 1 - t
  const a = m * m * m
  const b = 3 * m * m * t
  const c = 3 * m * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ]
}

/* --------------------------------- light ---------------------------------- */

/**
 * The one lighting rule in the set.
 *
 * Draws the silhouette in the shadow tone, then the same silhouette again a
 * little smaller and nudged toward the light, in the body tone. What is left
 * showing underneath is a rim of shadow that is always thickest at the bottom
 * right — on a sphere, a pod or a knobbly celeriac alike, without any form
 * needing to know how it is lit.
 */
export const volume = (d, t, { cx, cy, k = 0.9, dx = -1.4, dy = -2, fill = t.base } = {}) =>
  `<path d="${d}" fill="${t.deep}"/>` +
  `<path d="${d}" fill="${fill}" transform="translate(${f(cx * (1 - k) + dx)} ${f(
    cy * (1 - k) + dy,
  )}) scale(${f(k)})"/>`

/** The lit face: a soft patch up and left of centre. Never white — tinted. */
export const gleam = (cx, cy, rx, ry, fill, { rot = -34, opacity = 0.5 } = {}) =>
  `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" opacity="${opacity}" transform="rotate(${f(
    rot,
  )} ${f(cx)} ${f(cy)})"/>`

/** Wet gloss, for the skins that actually have it: tomato, plum, aubergine. */
export const gloss = (cx, cy, rx, ry, { rot = -32, opacity = 0.34 } = {}) =>
  gleam(cx, cy, rx, ry, '#ffffff', { rot, opacity })

/* --------------------------------- solids --------------------------------- */

export const circlePath = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0Z`

export const ellipsePath = (cx, cy, rx, ry, rot = 0) => {
  const d = `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0a${f(rx)} ${f(
    ry,
  )} 0 1 0 ${f(-rx * 2)} 0Z`
  return rot ? { d, rot } : d
}

/** A sphere: the workhorse behind every berry, bulb and round fruit. */
export const orb = (cx, cy, r, t, { k = 0.88, glossy = false, lit = 0.5, ry = r } = {}) => {
  const d =
    ry === r
      ? circlePath(cx, cy, r)
      : `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(ry)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(ry)} 0 1 0 ${f(
          -r * 2,
        )} 0Z`
  let out = volume(d, t, { cx, cy, k, dx: -r * 0.075, dy: -ry * 0.1 })
  if (lit) out += gleam(cx - r * 0.3, cy - ry * 0.34, r * 0.46, ry * 0.3, t.light, { opacity: lit })
  if (glossy) out += gloss(cx - r * 0.34, cy - ry * 0.42, r * 0.21, ry * 0.11)
  return out
}

/** A capsule between two points — stalks, stems, cucumbers, spears. */
export const rod = (x1, y1, x2, y2, w, fill, { cap = 'round' } = {}) =>
  `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${fill}" stroke-width="${f(
    w,
  )}" stroke-linecap="${cap}" fill="none"/>`

/** A curved stroke: q-curve from a point, bowing by `bow` across its own axis. */
export const curve = (x1, y1, x2, y2, bow, fill, w, { cap = 'round' } = {}) => {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  return `<path d="M${f(x1)} ${f(y1)}Q${f(mx + nx * bow * 2)} ${f(my + ny * bow * 2)} ${f(x2)} ${f(
    y2,
  )}" stroke="${fill}" stroke-width="${f(w)}" stroke-linecap="${cap}" fill="none"/>`
}

/**
 * A taproot: broad shoulder, tapering to a tip, bowed along its length.
 * Carrot, parsnip, salsify, horseradish, radish tails.
 */
/**
 * A taproot: broad shoulder, tapering toward a tip, bowed along its length.
 * Carrot, parsnip, salsify, courgette, aubergine, horseradish.
 *
 * `belly` moves the widest point along the root, `tipW` blunts the end — a
 * carrot comes to a point, a parsnip and an aubergine do not.
 */
export const taperPath = (
  x,
  y,
  { len, ang = 180, w, bow = 0, round = 0.9, tipW = 0, belly = 0.72, waist = 0.3 } = {},
) => {
  const u = dir(ang)
  const p = perp(ang)
  const base = [x, y]
  const tip = add(add(base, u, len), p, bow)
  const l0 = add(base, p, -w)
  const r0 = add(base, p, w)
  const tR = add(tip, p, tipW)
  const tL = add(tip, p, -tipW)
  // Control points down one flank, ordered base-first.
  const near = (s) => add(add(base, u, len * 0.42), p, s * w * belly + bow * 0.3)
  const far = (s) => add(add(base, u, len * 0.84), p, s * (w * waist + tipW) + bow * 0.86)
  return (
    `M${pt(l0)}` +
    // A properly round shoulder — two controls, not a corner.
    `C${pt(add(l0, u, -w * round))} ${pt(add(r0, u, -w * round))} ${pt(r0)}` +
    `C${pt(near(1))} ${pt(far(1))} ${pt(tR)}` +
    (tipW ? `Q${pt(add(tip, u, tipW * 1.34))} ${pt(tL)}` : '') +
    `C${pt(far(-1))} ${pt(near(-1))} ${pt(l0)}Z`
  )
}

/* --------------------------------- leaves --------------------------------- */

/**
 * Both flanks of a leaf as control points, so every edge treatment below
 * (smooth, toothed, lobed, frilled) is the same leaf with a different hem.
 */
const leafFlanks = (x, y, { len, ang, w, bow = 0, round = 0 }) => {
  const u = dir(ang)
  const p = perp(ang)
  const base = [x, y]
  const tip = add(add(base, u, len), p, bow)
  const tw = w * (0.12 + round * 1.15)
  return {
    base,
    tip,
    left: [
      base,
      add(add(base, u, len * 0.15), p, -w * 0.92),
      add(add(tip, u, -len * 0.33), p, -tw + bow * 0.1),
      tip,
    ],
    right: [
      tip,
      add(add(tip, u, -len * 0.33), p, tw + bow * 0.1),
      add(add(base, u, len * 0.15), p, w * 0.92),
      base,
    ],
  }
}

/** A plain leaf. `round` 0 is a lance, 1 a spoon. */
export const leafPath = (x, y, opts) => {
  const { base, tip, left, right } = leafFlanks(x, y, opts)
  return (
    `M${pt(base)}C${pt(left[1])} ${pt(left[2])} ${pt(tip)}` +
    `C${pt(right[1])} ${pt(right[2])} ${pt(base)}Z`
  )
}

/**
 * The same leaf with a worked edge. `teeth` counts the notches per flank and
 * `depth` how far they bite; `soft` rounds them into lobes instead of points.
 *
 * This is most of what distinguishes one green from another at 40 pixels —
 * mint is toothed, coriander is lobed, kale is frilled to the point of noise.
 */
export const leafCutPath = (x, y, opts) => {
  const { teeth = 5, depth = 0.16, soft = false, samples = 11 } = opts
  const { base, tip, left, right } = leafFlanks(x, y, opts)
  const u = dir(opts.ang)
  const p = perp(opts.ang)

  const flank = (c, sign, skipFirst) => {
    const out = []
    for (let i = skipFirst ? 1 : 0; i <= samples; i++) {
      const t = i / samples
      const q = cubic(c[0], c[1], c[2], c[3], t)
      // Taper the bite to nothing at the stalk and at the point, so the leaf
      // still reads as a leaf and not as a saw blade.
      const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.04) / 0.92)))
      const wave = Math.sin(t * teeth * Math.PI * 2 - Math.PI / 2)
      const off = wave * depth * opts.w * fade * sign
      out.push([q[0] + p[0] * off * sign, q[1] + p[1] * off * sign])
    }
    return out
  }

  const join = (pts) =>
    soft
      ? pts
          .slice(1)
          .map((q, i) => {
            const a = pts[i]
            return `Q${pt([(a[0] + q[0]) / 2 + u[0] * 0.6, (a[1] + q[1]) / 2 + u[1] * 0.6])} ${pt(q)}`
          })
          .join('')
      : pts.slice(1).map((q) => `L${pt(q)}`).join('')

  return `M${pt(base)}${join(flank(left, -1, true).concat([tip]))}${join(
    [tip].concat(flank(right, 1, true)),
  )}Z`
}

/** Midrib plus a few side veins, at the weight of a pencil line. */
export const veins = (x, y, { len, ang, w, bow = 0, colour, pairs = 3, opacity = 0.5 }) => {
  const u = dir(ang)
  const p = perp(ang)
  const base = [x, y]
  const tip = add(add(base, u, len * 0.9), p, bow * 0.9)
  let out = `<path d="M${pt(base)}Q${pt(add(add(base, u, len * 0.5), p, bow * 0.3))} ${pt(
    tip,
  )}" stroke="${colour}" stroke-width="${f(w * 0.12)}" stroke-linecap="round" fill="none" opacity="${opacity}"/>`
  for (let i = 1; i <= pairs; i++) {
    const t = 0.18 + (i / (pairs + 1)) * 0.68
    const on = add(add(base, u, len * t), p, bow * t * 0.5)
    for (const s of [-1, 1]) {
      const end = add(add(on, u, len * 0.2), p, s * w * (0.72 - t * 0.35))
      out += `<path d="M${pt(on)}L${pt(end)}" stroke="${colour}" stroke-width="${f(
        w * 0.085,
      )}" stroke-linecap="round" fill="none" opacity="${opacity * 0.8}"/>`
    }
  }
  return out
}

/**
 * A leaf drawn with its own shading, for leaves large enough to need it.
 * Small leaves in a cluster get depth from stacking instead — see `fan`.
 */
export const leaf = (x, y, opts) => {
  const { t, cut = null, rib = false, ribOpacity = 0.45, shade = true } = opts
  const d = cut ? leafCutPath(x, y, { ...opts, ...cut }) : leafPath(x, y, opts)
  const u = dir(opts.ang)
  const cx = x + u[0] * opts.len * 0.5
  const cy = y + u[1] * opts.len * 0.5
  let out = shade
    ? volume(d, t, { cx, cy, k: 0.9, dx: -0.7, dy: -1 })
    : `<path d="${d}" fill="${t.base}"/>`
  if (rib) out += veins(x, y, { ...opts, colour: t.edge, opacity: ribOpacity })
  return out
}

/**
 * A rosette: leaves swept around a point, back ones dark, front ones light.
 * Lettuces, herbs, cabbages and every bunched green in the set start here.
 */
export const fan = (x, y, { count, spread, from = 0, len, w, t, tones, ...rest }) => {
  const out = []
  for (let i = 0; i < count; i++) {
    const s = count === 1 ? 0.5 : i / (count - 1)
    const ang = from + (s - 0.5) * spread
    // Back-to-front: outermost leaves darkest, so the middle of the bunch lifts.
    const depth = 1 - Math.abs(s - 0.5) * 2
    const tone = tones ? tones[Math.round(depth * (tones.length - 1))] : t
    const val = (v) => (typeof v === 'function' ? v(s, depth) : v)
    // Leaves curl away from the middle of the bunch unless told otherwise.
    const bow = rest.bow === undefined ? (s - 0.5) * spread * 0.06 : val(rest.bow)
    out.push({
      ang,
      depth,
      s,
      svg: leaf(x, y, { ...rest, ang, bow, len: val(len), w: val(w), t: tone }),
    })
  }
  // Draw the outside leaves first so the centre of the rosette sits on top.
  return out
    .sort((a, b) => a.depth - b.depth)
    .map((o) => o.svg)
    .join('')
}

/**
 * A feathered frond: a rachis with paired leaflets down it.
 *
 * Dill, fennel, chervil and carrot tops are all the same plant idea, and at
 * this size the feathering is the only thing that tells them from a bunch of
 * grass — so it gets its own primitive rather than a fan of thin leaves.
 */
export const plume = (x, y, { len, ang = 0, colour, w = 1.7, pairs = 6, spread = 46, leaflet = 0.32, bow = 0, from = 0.18 }) => {
  const u = dir(ang)
  const p = perp(ang)
  const tip = add(add([x, y], u, len), p, bow)
  let out = curve(x, y, tip[0], tip[1], bow * 0.5, colour, w)
  for (let i = 0; i < pairs; i++) {
    const t = from + (i / Math.max(1, pairs - 1)) * (0.96 - from)
    const on = add(add([x, y], u, len * t), p, bow * t * t)
    const size = len * leaflet * (1 - t * 0.45)
    for (const side of [-1, 1]) {
      const a = ang + side * spread * (1 - t * 0.3)
      const end = add(on, dir(a), size)
      out += curve(on[0], on[1], end[0], end[1], side * size * 0.16, colour, w * 0.72)
    }
  }
  return out
}

/* --------------------------------- texture -------------------------------- */

/** Ribs on a pumpkin or a melon: arcs that follow the curve of the body. */
export const ribs = (cx, cy, r, count, colour, { ry = r, opacity = 0.35, w = 1.1 } = {}) => {
  let out = ''
  for (let i = 1; i <= count; i++) {
    const s = (i / (count + 1) - 0.5) * 2
    const x = cx + s * r * 0.82
    const bend = s * r * 0.34
    out += `<path d="M${f(x - bend * 0.14)} ${f(cy - ry * 0.9)}Q${f(x + bend)} ${f(cy)} ${f(
      x - bend * 0.14,
    )} ${f(cy + ry * 0.9)}" stroke="${colour}" stroke-width="${f(
      w,
    )}" stroke-linecap="round" fill="none" opacity="${opacity}"/>`
  }
  return out
}

/** Speckle, for potato eyes, strawberry seeds and celeriac pocks. */
export const speckle = (cx, cy, rx, ry, count, colour, { seed = 7, size = 1.1, opacity = 0.75 } = {}) => {
  let s = seed * 9301 + 49297
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  let out = ''
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2
    const d = Math.sqrt(rnd()) * 0.86
    out += `<ellipse cx="${f(cx + Math.cos(a) * rx * d)}" cy="${f(
      cy + Math.sin(a) * ry * d,
    )}" rx="${f(size)}" ry="${f(size * 0.72)}" fill="${colour}" opacity="${opacity}"/>`
  }
  return out
}

/**
 * A knobbly mass — florets, curd, brassica heads, tubers.
 * Bumps are placed on a ring and shaded by height, so the top of the mound
 * catches light in the same way a sphere does.
 */
export const cluster = (cx, cy, rx, ry, t, { count = 9, bump = 0.34, seed = 3, jitter = 0.18 } = {}) => {
  let s = seed * 1103515245 + 12345
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
  const blobs = []
  // A filled core, so gaps between bumps never show through to the page.
  blobs.push({ x: cx, y: cy, r: Math.min(rx, ry) * 0.92, h: 0.5, core: true })
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rnd() * jitter * 4
    const dx = Math.cos(a) * rx * (0.58 + rnd() * jitter)
    const dy = Math.sin(a) * ry * (0.58 + rnd() * jitter)
    blobs.push({
      x: cx + dx,
      y: cy + dy,
      r: Math.min(rx, ry) * (bump + rnd() * jitter * 0.6),
      h: 1 - (dy / ry + 1) / 2,
    })
  }
  return blobs
    .sort((a, b) => a.y - b.y)
    .map((b) =>
      b.core
        ? `<ellipse cx="${f(b.x)}" cy="${f(b.y)}" rx="${f(rx * 0.94)}" ry="${f(ry * 0.94)}" fill="${t.deep}"/>`
        : orb(b.x, b.y, b.r, b.h > 0.55 ? t : { ...t, base: t.deep, light: t.base }, {
            k: 0.9,
            lit: 0.4,
          }),
    )
    .join('')
}

/* ---------------------------------- output -------------------------------- */

export const svg = (body, { title }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${title}">` +
  `<title>${title}</title>${body}</svg>`

export const group = (body, transform) => `<g transform="${transform}">${body}</g>`
