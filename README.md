# Erntereif

*Erntereif* — ripe for harvest. The name is the whole product: it answers
*when*, not *what*.

A seasonal almanac for Germany and its neighbours. Pick a month and a country,
and see what is actually being harvested nearby — what is coming out of the
cellar, what starts next month, and what a kilo of the imported alternative
costs in carbon.

The interface is in German throughout, set informally — it says `du`, not
`Sie`, and keeps its sentences short.

Simple, clean, bold: white space, one neutral grotesque set Swiss and heavy,
near-black green and a single neon accent. All 87 items are photographed on
white and cut out, so the produce itself supplies the colour and the interface
stays quiet.

## What it does

- **Month and country controls.** Twelve-month rail defaulting to the current
  month, and a country selector for Germany, France, Italy, the Netherlands and
  the UK. Your country choice is remembered; the month always follows the real
  calendar on a fresh visit.
- **A season badge for the month** — peak, high, early, late, or stored and
  winter stock — derived from how much of the year's range is being harvested
  and whether the curve is rising or falling.
- **Produce grouped into printed sections** — `Jetzt in Saison`, `Aus dem
  Lager`, `Kommt nächsten Monat`. Pick a country other than Germany and the
  heading also carries that country's own word for it (`De saison`,
  `Di stagione`, `In het seizoen`, `In season`), the way a bilingual grower's
  calendar prints it.
- **Filters** by category (vegetables / fruit / herbs) and by supply: direct
  harvest versus cellar goods.
- **Per-item status**: cards only badge what the section heading cannot say —
  `Geht los` and `Letzte Wochen`. The rest is in the detail view.
- **Detail view** with a twelve-month season ribbon, flavour notes, storage
  advice, pairing ideas, a recipe suggestion, and a local-versus-imported
  carbon comparison.
- **Search across five languages.** Typing `Spargel`, `asperge`, `asparago` or
  `asparagus` all find the same crop, and searching widens the grid beyond
  what is in season so you can look up when something comes back.
- **Names follow the country.** The card shows the crop's name in the selected
  country's language, with the German name under it when the two differ.

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typechecks, builds to `dist/` |
| `npm run preview` | Serves the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | oxlint |
| `npm run illustrations` | Legacy duotone SVG generator — see *The pictures* |

## How it is put together

```
src/
  data/seasonalProduce.json   87 items — the single source of truth
  types/produce.ts            the ProduceItem schema
  lib/seasonality.ts          calendar resolution, status, month summaries
  lib/co2.ts                  carbon comparison helpers
  lib/calendar.ts             months and countries
  store/useAppStore.ts        Zustand: month, country, filters, selection
  hooks/                      filtering and modal behaviour
  components/                 UI
public/produce/             87 cut-out PNGs, one per item
```

### The data

`src/data/seasonalProduce.json` holds 48 vegetables, 24 fruits and 15 herbs.
Each item carries a German reference calendar (`monthsInSeason`,
`monthsInStorage`) plus `regionalSeasons` overrides wherever the local season
genuinely differs — Italian asparagus starts in March, British asparagus in
May, Dutch glasshouse tomatoes run eight months of the year.

Harvest windows follow published agricultural calendars: the
Bundeszentrum für Ernährung (BZfE) Saisonkalender for Germany, and national
grower calendars elsewhere. Where an item has no country-specific override, the
detail view says so rather than presenting German dates as local ones.

Seasons move by a week or two with weather, region and variety. Every window is
the middle of a range, not a hard edge.

### The carbon figures

`co2` gives indicative kg CO₂e per kg, comparing local and in-season against
the dominant out-of-season alternative on European shelves. The values sit
inside ranges published in food-LCA work for the German market — open-field
regional produce around 0.2–0.4, cold-stored slightly higher, heated glasshouse
roughly 2–3.5, air-freighted 4–11. Driving comparisons assume 0.12 kg CO₂e per
car kilometre. They are for comparing options, not for carbon accounting.

### The design

Two inks and a lot of white, now carrying photographs. The tokens live in
`src/index.css`.

- **Ink** — `#0f2a1e`, a green dark enough to read as black. Type, the carbon
  panel, the footer.
- **Neon** — `#3df07a`. One accent, used hard: the rule under the active month,
  the underline in the headline, the primary button. It no longer appears in
  the artwork — the produce brings its own colour.
- **Surfaces** — white page, `#f2f3f0` for picture tiles and quiet blocks.
- **Data-only accents** — corn yellow and coral, used nowhere except the
  `Aus dem Lager` badge and the imported-carbon bar.
- **Type** — Inter throughout, set Swiss and set heavy: flush left, sentence
  case, tight negative tracking that increases with size, leading down to
  `0.84` on the headline, tabular figures everywhere. Two weights carry it.
  `.display` is extrabold at `-0.03em` and does the general work; `.display-black`
  is the full 900 cut at `-0.045em` and is reserved for the four things that
  should stop you — the headline, the two counters, the section titles and the
  footer statement. Neither sets a colour, so both work on white and on the
  dark blocks. `.label` (10px, uppercase, `0.09em`) indexes the page, and
  sections are numbered `01`–`04` down the left. Hierarchy comes from size and
  weight against hairline rules, not from decoration.
- **German breaks** — compounds like `Frühlingszwiebel` are long and the grid
  is tight, so card names carry `.hyphenate` and the document is `lang="de"`,
  which lets the browser hyphenate them properly.

### Light and dark

`data-theme` on `<html>` is always a resolved `light` or `dark` — never
"system" — so the CSS needs one selector and no media query. A small inline
script in `index.html` sets it before first paint; `src/lib/theme.ts` keeps it
in step afterwards and only stores a choice that *disagrees* with the OS, so
anyone who never disagrees keeps following their system setting forever.

Colours are semantic for this reason: `page` is the paper, `panel` is anything
raised off it, `plate` is the square a photograph sits on, `ink-*` is the type
ramp, `invert` is a chip that has to shout, `block` is a large dark slab.
Nothing hard-codes white.

**`plate` does not flip, and must not.** The cut-outs are soft-alpha almost
everywhere — `blackberry.png` has five fully opaque pixels out of 45,149 — and
the colour under that partial alpha still carries the near-white shadow they
were shot with, around 230 of 255 at the edges. On any ground darker than
roughly `#e6e8e2` every item picks up a visible grey halo; a dark blackberry on
a dark tile becomes a pale smear. So the photographs keep a light plate
(`#eceee8` in dark, a touch dimmed to take the glare off a grid of them) and
the interface goes dark around them. If you ever darken `plate`, check the
blackberry.

The dark type ramp is spaced so the weakest tone still clears 4.5:1 on the
page, because `ink-300` carries 10px uppercase labels — on white it can afford
to whisper, on near-black it cannot.

### The pictures

Every item is a cut-out photograph on transparent ground, committed to
`public/produce/<id>.png` at 256px square and a 128-colour palette — about
18KB each, 1.6MB for the set. They were sliced from a single generated contact
sheet of all 87 crops, so the whole set shares one light, one camera angle and
one white ground, which is what keeps it reading as a series.

The source frames are small — roughly 100px per crop — so the layout is built
to suit them rather than to fight them. Tiles are `object-contain` with 12%
padding inside a six-column grid, which renders the produce at about 130 CSS
pixels: near enough 1:1 with the 256px file on a retina screen, and far more
of the month in view at once. Widening the tiles is what makes them soft, so
the dense grid is doing two jobs at once. If you want them bigger, you need
larger originals, not more CSS.

The earlier duotone generator is still in the tree at
`scripts/generate-illustrations.mjs` with its palette, and `npm run
illustrations` still works — it writes `public/produce/*.svg`, which nothing
reads any more. It is kept as a way back to the two-ink set, not as part of
the build.

## Adding produce

Add an object to `src/data/seasonalProduce.json` following the `ProduceItem`
interface in `src/types/produce.ts` and set `imageUrl` to `/produce/<id>.png`.

Then add the picture: a cut-out on transparent ground, 256px square, the crop
filling about 94% of the frame, shot square-on against white like the rest of
the set. Anything with its own background or its own lighting will stand out
immediately in the grid.

`illustration.archetype` is still on the schema and still feeds the legacy SVG
generator. Nothing in the app reads it.
