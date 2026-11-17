# Global Information Portal

An interactive world map that turns CIA World Factbook data into clickable country statistics and rankings, built for students, educators, travelers, and anyone who wants to compare how countries stack up.

**Live site:** https://kcpatt27.github.io/global-info-portal/  
**Repository:** https://github.com/kcpatt27/global-info-portal

---

## Screenshots

These are captures of the current UI at 1440x900. The image files are committed under `docs/screenshots/`.

### Country info

![World map with the United States selected, showing population, GDP, area, and land boundaries in the sidebar](docs/screenshots/map.png)

Click a country to highlight it in red and load its flag, quick stats, and background text.

### Global Superpower Leaderboard

![Rankings tab showing the Global Superpower Leaderboard with the United States ranked first](docs/screenshots/rankings.png)

The Rankings tab scores countries on People, Money, Reach, and Resources, then ranks them by a combined Influence Scale.

### Statistics

![Statistics tab showing Factbook categories such as Geography, People and Society, and Economy](docs/screenshots/statistics.png)

The Statistics tab loads the full Factbook category tree for the selected country, with per-category counts and search.

---

## How the data pipeline works

Everything runs in the browser. There is no backend, no database, and no API key.

1. **Map geometry.** On load, `js/map.js` fetches a TopoJSON world atlas and a TSV of country rows from the `kcpatt27/world-atlas-2-world-factbook` repository on GitHub. It converts the TopoJSON with `topojson.feature(topoJSONdata, topoJSONdata.objects.countries)` and renders the features as SVG with D3. The TSV had 243 rows when checked on 2026-11-17.
2. **Country selection.** Clicking a country resolves its Factbook folder. `getSpecialFolder` covers codes whose folder is not the continent name, and `determineFolder` falls back to the continent slug.
3. **Factbook fetch.** `js/utils/dataFetcher.js` requests `https://raw.githubusercontent.com/factbook/factbook.json/master/{folder}/{a2}.json`. It deduplicates in-flight requests by country code, aborts after 10 seconds, and retries `https://raw.githubusercontent.com/factbook/factbook.json/master/factbook/{folder}/{a2}.json` if the first URL fails.
4. **Parsing.** `extractDataPoint` walks dot-notation paths and unwraps the Factbook's `{ text: ... }` values. `processText` strips HTML. `detectTimeSeriesData` finds year-keyed series so trends can be charted.
5. **Leaderboard pre-cache.** `js/utils/globalPreCache.js` fetches 50 priority countries in batches of 5 with a 100 ms gap, then fetches 32 secondary countries in the background in batches of 5 with a 200 ms gap. It keeps only the metrics the leaderboard needs and stores them in `localStorage` under cache version 15 with a 7-day expiry.
6. **Scoring.** `js/utils/leaderboardScoring.js` normalizes each metric against fixed reference scales, so a country's score does not change when other countries load. The four category scores combine into the Influence Scale shown in the Rankings tab.
7. **Rendering.** `js/panels/` and `js/components/` draw the Info, Statistics, and Rankings panels, including spider charts and category bars.

Two quirks visible in the code: Factbook codes are FIPS-style rather than ISO, so a few countries do not appear on the leaderboard until they are clicked, and some territories have incomplete Factbook entries.

---

## Build and run locally

Requires Node.js and npm. The commands below were run on Windows with Node v24.18.0, npm 11.16.0, and Python 3.11.9 on 2026-11-17.

```bash
git clone https://github.com/kcpatt27/global-info-portal.git
cd global-info-portal
npm install
npm run build
```

`npm run build` writes production bundles to `dist/`. The root `index.html` loads `dist/runtime.js`, `dist/vendors.js`, `dist/main.js`, and `dist/styles.css`, so serve the repository root, not `dist/`:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Any static file server works, including VS Code Live Server, as long as it serves the repository root.

### About `npm start`

`npm start` runs `webpack serve --mode development`. It compiles successfully but does not serve the app: there is no `devServer` block in `webpack.config.js`, webpack-dev-server falls back to a `public/` directory that does not exist, and every request returns 404. This was checked against `/`, `/index.html`, and `/dist/main.js`. Use the `python -m http.server` route above until the dev-server config is added.

`npm run deploy` is also not a real deploy. It only prints a reminder to commit and push `dist/`.

---

## Deploy to GitHub Pages

GitHub Pages is configured to serve the `main` branch at `/` with the legacy build type, no Actions workflow. That configuration was read from the GitHub Pages API on 2026-11-17. Because the built `dist/` directory is committed, deploying means rebuilding it and pushing to `main`:

```bash
npm run build
git add dist
git commit -m "build: rebuild dist for GitHub Pages"
git push origin main
```

`npm run build` and `git add dist` were verified here. The `git commit` and `git push` steps were not run during this documentation pass, because they publish to the live site. Expect `npm run build` to rewrite chunk names and hashes: a build with webpack 5.104.1 produced a diff against the committed `dist/`, so commit the whole directory rather than a selection of files.

No environment variables or API keys are required.

---

## Where the `docs/` set fits

The README is the entry point. Deeper material lives in `docs/` and the root design docs:

- [ARCHITECTURE.md](ARCHITECTURE.md) - system design, module boundaries, and a more detailed view of the data flow.
- [ROADMAP.md](ROADMAP.md) - what is done, what is next, and the feature backlog.
- [docs/key-metrics.md](docs/key-metrics.md) - build sizes, commit history, and measurement notes.
- [docs/retrospective.md](docs/retrospective.md) - what worked, what did not, and what would change next time.
- [docs/living-doc-of-build-process.md](docs/living-doc-of-build-process.md) - the build story in the author's own words.
- [docs/summary-for-career.md](docs/summary-for-career.md) - a career-facing summary of the project.
- [docs/gip-RESUME_DATA_POINTS.md](docs/gip-RESUME_DATA_POINTS.md) - resume-oriented data points. It still links the old `global-information-portal` URL; the live site above is correct.
- `docs/feature-planning/` - planning notes for mobile CSS, mobile navigation, and the Rankings tab.
- `docs/fix-refactor-planning/` - the JavaScript refactor plan and leaderboard metrics analysis.

---

## License and data attribution

This project has no `LICENSE` file and is currently unlicensed, all rights reserved.

Country data comes from the **CIA World Factbook**, distributed through the [factbook/factbook.json](https://github.com/factbook/factbook.json) repository. Factbook content is a U.S. Government work and is in the public domain. The JSON packaging in that repository is licensed CC0-1.0.

Map geometry comes from [kcpatt27/world-atlas-2-world-factbook](https://github.com/kcpatt27/world-atlas-2-world-factbook). That repository had no license file or description when checked on 2026-11-17, so its provenance and terms could not be verified here. Confirm them before redistributing the map data.

Third-party libraries: D3.js (BSD 3-Clause), TopoJSON (BSD 3-Clause), Font Awesome (icons CC BY 4.0, fonts SIL OFL 1.1), Flag Icon CSS (MIT).
