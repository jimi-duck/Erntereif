/**
 * The pigments the 87 illustrations are drawn from.
 *
 * Deliberately a short list. Real produce spans a far wider gamut than this,
 * but a grid of 87 tiles is a composition in its own right — if every crop
 * brings its own reds and greens the grid fizzes. So leaves come from one
 * family of greens, roots from one family of earths, and only the fruit gets
 * to be loud.
 */
import { ramp } from './colour.mjs'

/* Foliage. `GREEN.stem` and `GREEN.leaf` carry most of the set; the rest are
   for crops whose colour is the whole point of them (kale, chard, lime peas). */
export const GREEN = {
  darkest: '#173f2a',
  dark: '#1f5c37',
  leaf: '#2c7a44',
  mid: '#3d9350',
  fresh: '#55a95d',
  bright: '#74bd67',
  pale: '#a3cf88',
  lime: '#b5d45f',
  stem: '#478c4d',
  blue: '#356d51',
  sage: '#94ac93',
  grey: '#aebfa8',
}

/* Whites, creams and earths — bulbs, roots and tubers. */
export const EARTH = {
  cream: '#f2e8cf',
  ivory: '#efe6d2',
  bone: '#e8e2cd',
  straw: '#e0c98b',
  tan: '#cfa96a',
  husk: '#c08c4f',
  bark: '#a97542',
  clay: '#b9713f',
  pale: '#f5f1e4',
}

/* The loud end. */
export const FRUIT = {
  red: '#d92f31',
  scarlet: '#c02026',
  cherry: '#b81d34',
  crimson: '#9c1533',
  coral: '#e8604a',
  orange: '#ef8a21',
  amber: '#f0a324',
  gold: '#f3c341',
  yellow: '#f2d64b',
  lemon: '#f5dc55',
  blush: '#f0a074',
  pink: '#e2707e',
  magenta: '#a8306a',
  plum: '#6a2a55',
  purple: '#59316f',
  aubergine: '#4a2258',
  indigo: '#3b3566',
  blue: '#5573a8',
  ink: '#241a2e',
}

export const ramps = {
  ...Object.fromEntries(Object.entries(GREEN).map(([k, v]) => [`green-${k}`, ramp(v)])),
}

/** Shorthand used all over the recipes. */
export const R = ramp
