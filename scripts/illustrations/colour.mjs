/**
 * Colour for the produce illustrations.
 *
 * Every form is built from a ramp rather than a loose hex, which is what keeps
 * 87 drawings looking like one set: the same lightness step between a body and
 * its shaded rim, the same lift on a highlight, whatever the hue.
 */

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

const toHsl = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (!d) return [0, 0, l]
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [(h * 60) % 360, s, l]
}

const toHex = ([h, s, l]) => {
  h = ((h % 360) + 360) % 360
  s = clamp(s)
  l = clamp(l)
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const seg = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60) % 6]
  return (
    '#' +
    seg
      .map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Lighten toward white, keeping a little saturation so nothing goes chalky. */
export const lighten = (hex, amount) => {
  const [h, s, l] = toHsl(hex)
  return toHex([h, s * (1 - amount * 0.28), l + (1 - l) * amount])
}

/** Darken, and warm the hue slightly — shadows in daylight are never just black. */
export const darken = (hex, amount, hueShift = -4) => {
  const [h, s, l] = toHsl(hex)
  return toHex([h + hueShift * amount, clamp(s + amount * 0.14), l * (1 - amount)])
}

export const mix = (a, b, t) => {
  const [ah, as, al] = toHsl(a)
  const [bh, bs, bl] = toHsl(b)
  let dh = bh - ah
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  return toHex([ah + dh * t, as + (bs - as) * t, al + (bl - al) * t])
}

/**
 * The four tones every solid form is drawn with.
 *
 * `deep` is the rim that falls away from the light, `base` the body, `light`
 * the lit face, `edge` a hairline used only where two forms of the same hue
 * overlap and would otherwise fuse into one blob.
 */
export const ramp = (hex) => ({
  light: lighten(hex, 0.2),
  base: hex,
  deep: darken(hex, 0.17),
  edge: darken(hex, 0.32),
})
