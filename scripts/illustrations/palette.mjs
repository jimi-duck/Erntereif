/**
 * The tiles.
 *
 * Each crop gets a saturated ground and one ink drawn on top of it — no
 * shading, no second hue inside the drawing. All the colour is in the tile,
 * which is what lets the line work stay this simple.
 *
 * Tiles are picked from the crop's real colour, then pushed until they are
 * properly bright. Where a family would otherwise fill the grid with the same
 * green forty times over, it rotates through the greens instead: truthful
 * about the crop, varied across the page.
 */
import { darken, luminance, mix } from './colour.mjs'

export const TILE = {
  lilac: '#b46cff',
  violet: '#7b3fe4',
  grape: '#5b2bb8',
  magenta: '#ff2d87',
  rose: '#ff6d9c',
  red: '#f5372b',
  coral: '#ff6b4a',
  orange: '#fb7c00',
  amber: '#f79d00',
  yellow: '#ffd21e',
  cream: '#ffe9a8',
  lime: '#b8e412',
  spring: '#4ec916',
  green: '#0cae78',
  mint: '#00cf94',
  teal: '#00b2ba',
  sky: '#38a9f5',
  blue: '#2f6bf0',
  ink: '#123a2a',
  chalk: '#f4efe2',
  sand: '#e8c98d',
  clay: '#c98b4b',
}

/**
 * White on a dark ground, a deep version of the ground on a light one.
 *
 * Doing this by luminance rather than by hand is what keeps 87 tiles legible:
 * there is no tile where the line work quietly disappears.
 */
export const inkFor = (tile) =>
  // The palest grounds take a deep version of their own hue, everything else
  // takes white. Deciding it by luminance rather than by eye is what stops any
  // one tile from quietly losing its drawing.
  //
  // White on a saturated ground sits around 2.5:1, under the 3:1 usually asked
  // of a graphical object. That is deliberate: the line work is decoration
  // beside a name that is always printed, never the only carrier of meaning,
  // and at this stroke weight it reads cleanly. The palest grounds are where
  // white would genuinely vanish, so those are the ones that swap.
  luminance(tile) > 0.6 ? darken(mix(tile, '#3a1a06', 0.55), 0.52, 0) : '#ffffff'

/**
 * Tile per crop. Read down the list and it should look like the produce aisle:
 * roots in oranges and sands, brassicas across the greens, berries in the
 * reds and purples, herbs in the fresher greens.
 */
export const TILES = {
  /* roots, tubers, alliums */
  carrot: TILE.orange,
  parsnip: TILE.cream,
  celeriac: TILE.sand,
  'jerusalem-artichoke': TILE.clay,
  potato: TILE.sand,
  salsify: TILE.clay,
  horseradish: TILE.chalk,
  beetroot: TILE.grape,
  radish: TILE.magenta,
  'may-turnip': TILE.lilac,
  swede: TILE.violet,
  kohlrabi: TILE.lime,
  onion: TILE.amber,
  garlic: TILE.chalk,
  leek: TILE.spring,
  'spring-onion': TILE.mint,

  /* brassicas and leaves */
  broccoli: TILE.green,
  cauliflower: TILE.cream,
  'brussels-sprouts': TILE.spring,
  kale: TILE.teal,
  'savoy-cabbage': TILE.green,
  'white-cabbage': TILE.lime,
  'red-cabbage': TILE.violet,
  'chinese-cabbage': TILE.lime,
  'pak-choi': TILE.mint,
  lettuce: TILE.spring,
  endive: TILE.lime,
  chicory: TILE.cream,
  radicchio: TILE.magenta,
  'lambs-lettuce': TILE.green,
  rocket: TILE.teal,
  spinach: TILE.green,
  chard: TILE.red,

  /* fruiting vegetables and stems */
  tomato: TILE.red,
  'bell-pepper': TILE.coral,
  aubergine: TILE.violet,
  courgette: TILE.spring,
  cucumber: TILE.mint,
  pumpkin: TILE.orange,
  sweetcorn: TILE.yellow,
  peas: TILE.lime,
  'green-beans': TILE.green,
  asparagus: TILE.mint,
  celery: TILE.lime,
  fennel: TILE.teal,
  rhubarb: TILE.magenta,
  artichoke: TILE.teal,
  'button-mushroom': TILE.chalk,

  /* fruit */
  apple: TILE.red,
  pear: TILE.lime,
  quince: TILE.amber,
  plum: TILE.grape,
  mirabelle: TILE.yellow,
  peach: TILE.coral,
  apricot: TILE.orange,
  cherry: TILE.red,
  'sour-cherry': TILE.magenta,
  strawberry: TILE.red,
  raspberry: TILE.rose,
  blackberry: TILE.grape,
  blueberry: TILE.blue,
  redcurrant: TILE.red,
  gooseberry: TILE.lime,
  elderberry: TILE.violet,
  rosehip: TILE.coral,
  'sea-buckthorn': TILE.amber,
  grape: TILE.violet,
  fig: TILE.lilac,
  melon: TILE.cream,
  persimmon: TILE.orange,
  orange: TILE.orange,
  lemon: TILE.yellow,

  /* herbs */
  basil: TILE.green,
  mint: TILE.mint,
  parsley: TILE.spring,
  chives: TILE.teal,
  dill: TILE.lime,
  chervil: TILE.mint,
  coriander: TILE.spring,
  rosemary: TILE.teal,
  thyme: TILE.green,
  sage: TILE.sky,
  oregano: TILE.lime,
  marjoram: TILE.spring,
  tarragon: TILE.mint,
  lovage: TILE.green,
  'wild-garlic': TILE.spring,
}
