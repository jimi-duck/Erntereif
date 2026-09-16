/**
 * The brand's two inks.
 *
 * Every illustration is a duotone: a solid near-black green silhouette with
 * neon green carrying the living parts — leaves, stems, seeds, cut faces.
 * Two colours, no texture, no per-item palette. Variety comes from shape.
 */

export const INK = '#0f2a1e'
export const NEON = '#3df07a'
/** One step along the ink → neon ramp, for structure lines inside a silhouette. */
export const MID = '#2c6f49'

/** The tile the subject is printed on. */
export const GROUND = '#f2f3f0'

/** Named inks an item may pick for its accent. */
export const INKS = {
  neon: NEON,
  ink: INK,
  /** A mid green, for the rare item that needs a third step. */
  mid: MID,
  white: '#ffffff',
}

export const PAPER = '#ffffff'

/**
 * Resolve an item's illustration spec to [base, shade, light, accent].
 *
 * Everything sits on one ink → neon ramp. `shade` is a mid green so structure
 * drawn inside the silhouette (onion layers, melon ribs, root rings) stays
 * readable, and `light` is the accent so internal detail — corn kernels, citrus
 * segments, peas in a pod — pops as the second brand colour.
 */
export function resolvePalette({ accent } = {}) {
  const ink = INKS[accent ?? 'neon']
  if (!ink) throw new Error(`Unknown accent ink: ${accent}`)
  return { palette: [INK, MID, ink, ink], ground: GROUND }
}
