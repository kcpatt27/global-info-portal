# Global Information Portal

An interactive world map of CIA World Factbook data: click a country to see its population, GDP, area and land boundaries with global ranks, browse every Factbook category in a searchable list, and compare countries on a composite influence leaderboard. It is aimed at students, teachers, travellers and anyone who wants to compare countries without reading the Factbook entry by entry. Country data comes from the public [factbook/factbook.json](https://github.com/factbook/factbook.json) mirror, map geometry comes from [world-atlas-2-world-factbook](https://github.com/kcpatt27/world-atlas-2-world-factbook), and the whole app is static files: no backend, no database, no API key.

**Live site:** <https://kcpatt27.github.io/global-info-portal/>

## Screenshots

All three were captured on 2026-11-18 from a production build of this repository at 1440x900.

**Map and country info.** Selecting the United States fills the quick stats panel with population, GDP, area and land boundaries, plus the Factbook introduction text.

![World map with the United States selected and the info panel open](docs/screenshots/map.png)

**Rankings.** The Rankings tab shows the Global Superpower Leaderboard, ranked by a composite influence scale, with a per-category breakdown for the selected country.

![Rankings tab showing the Global Superpower Leaderboard](docs/screenshots/rankings.png)

**Statistics.** The Statistics tab loads every category in the country's Factbook file, with counts per category and search across all of them.

![Statistics tab listing Factbook categories for the United States](docs/screenshots/statistics.png)

## How the data pipeline works

Everything runs in the browser. The path from a click to a rendered panel is:

1. **Map data.** `js/map.js` fetches two files from the `world-atlas-2-world-factbook` repository: a 50m TopoJSON file of country boundaries and a TSV of row attributes. The TopoJSON is projected with `d3.geoNaturalEarth1`, and each feature becomes a country record carrying its name, FIPS id and `iso_a2` code.

2. **Selection.** Clicking a country fires a selection event. `determineFolder()` resolves which Factbook folder holds that country: an explicit `folder` on the record, then a hardcoded special-case map (for countries whose Factbook folder differs from their continent), then the continent name slugified.

3. **Fetch.** `js/utils/dataFetcher.js` requests
   `https://raw.githubusercontent.com/factbook/factbook.json/master/{folder}/{a2}.json`
   with a 10 second `AbortController` timeout, a single alternate URL retry, and in-flight de-duplication keyed by country code, so the same file is never requested twice at once.

4. **Parse.** The raw Factbook JSON is traversed rather than mapped field by field: `extractDataPoint()` follows a dot path and unwraps `text` values, `processText()` strips HTML tags, and `detectTimeSeriesData()` finds objects holding three or more year keys. The Statistics tab walks the whole file and renders every category it finds, which is why category counts differ per country.

5. **Warm the cache.** `js/utils/globalPreCache.js` pre-fetches 50 priority countries (major economies, NATO and EU members, key Middle East and Asia-Pacific states) in batches of 5 with a 100 ms gap. It keeps only the leaderboard metrics plus land boundaries, stores them under the `global_leaderboard_cache` localStorage key with a version marker and timestamp, and expires them after 7 days. Secondary countries fill in from a background queue; the "Load All Countries" button forces the rest.

6. **Score.** `js/utils/leaderboardScoring.js` normalises each metric to 0..1 against fixed reference scales, averages the metrics per category (`people`, `money`, `reach`, `resources`, `quality`), and sums the five category scores into the influence scale. Because the scales are fixed rather than derived from whatever countries are loaded, a country's score does not move when more countries finish loading.

7. **Render.** The selected country and its metrics land in `js/state.js`, and the panels under `js/panels/` and `js/components/panels/` draw quick stats, the category tree, the leaderboard and the spider charts. Country-level ranks (the `#3`, `#2` badges next to quick stats) come from the same index, so they are global, not local to the current view.

Data freshness is whatever the `factbook/factbook.json` mirror currently holds: the app caches it locally, so a long-lived browser tab can show data up to 7 days old until the cache version changes or the entries expire.

## Build, run and deploy

Requirements: Node.js and npm, plus Python 3 for the local static server used below.

```bash
git clone https://github.com/kcpatt27/global-info-portal.git
cd global-info-portal
npm install
npm run build
python -m http.server 8000
```

Then open <http://localhost:8000/>. The repository root must be the server root: `index.html` loads its bundles from `dist/` with relative paths.

`npm start` is not a usable preview right now. It compiles successfully with `webpack serve`, but the current webpack config has no `devServer` static root and no HTML plugin, so the dev server returns 404 for both `/` and `/index.html` (checked 2026-11-18). Use the build plus static server path above until that changes.

To deploy, rebuild `dist/` and push it to `main`, because GitHub Pages serves this repository from the `main` branch root (verified through the GitHub Pages API):

```bash
npm run build
git add dist
git commit -m "build: rebuild dist for GitHub Pages"
git push origin main
```

`npm run deploy` runs the build and then only prints a reminder that `dist/` needs to be committed and pushed; it does not publish anything itself.

## Where the docs set fits

- [ARCHITECTURE.md](ARCHITECTURE.md): components, data flow and technology trade-offs. Note that its external-data diagram still names unpkg for the map tiles; the live code fetches TopoJSON and TSV from the `world-atlas-2-world-factbook` repository as described above.
- [ROADMAP.md](ROADMAP.md): what is done and what is next.
- [PROJECT_SPECS.md](PROJECT_SPECS.md): scope, success metrics and known limitations.
- [docs/key-metrics.md](docs/key-metrics.md): performance, scale and quality numbers with confidence levels.
- [docs/retrospective.md](docs/retrospective.md): phase-by-phase history, what worked and what did not.
- [docs/living-doc-of-build-process.md](docs/living-doc-of-build-process.md): first-person build log, from the freeCodeCamp brief to the Rankings overhaul.
- [docs/summary-for-career.md](docs/summary-for-career.md) and [docs/gip-RESUME_DATA_POINTS.md](docs/gip-RESUME_DATA_POINTS.md): career-facing summaries and metric statements.
- [docs/feature-planning/](docs/feature-planning/) and [docs/fix-refactor-planning/](docs/fix-refactor-planning/): the plans and analyses behind the Rankings, Statistics, mobile and refactor work.
- [tickets/](tickets/): open maintenance tickets for this repository.

## License and data attribution

This repository has no `LICENSE` file, so the code is unlicensed and all rights are reserved.

- **CIA World Factbook data** is a U.S. Government work and is in the public domain. It is read here through the [factbook/factbook.json](https://github.com/factbook/factbook.json) mirror, which is maintained separately and has its own terms.
- **Map geometry** (TopoJSON and TSV) is fetched from [kcpatt27/world-atlas-2-world-factbook](https://github.com/kcpatt27/world-atlas-2-world-factbook); check that repository for its terms before redistributing the geometry.
- **Bundled libraries:** D3.js and TopoJSON (BSD 3-Clause), Font Awesome Free (icons CC BY 4.0, fonts SIL OFL 1.1), Flag Icon CSS (MIT). See `package.json` for the build toolchain.
