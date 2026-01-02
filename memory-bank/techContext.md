# Tech Context

## Technologies Used
- **Core:** HTML5, CSS3, JavaScript (ES6+)
- **Visualization:** D3.js, TopoJSON
- **Icons:** Font Awesome
- **Data Source:** World Factbook JSON API (via `factbook/factbook.json` GitHub repo)
- **Build Tools:** Webpack (as per `webpack.config.js`), `package.json` likely manages dependencies.
- **Environment:** Vanilla JavaScript (no major frontend frameworks like React, Vue, Angular).

## Development Setup
- Clone the repository.
- As per README, potentially no build process strictly *required* for basic running (open `index.html`), but Webpack suggests a build/bundling setup is available/used.
- Dependencies likely managed via npm/yarn (due to `package.json` and `webpack.config.js`). Run `npm install` or `yarn install`.
- Development server likely run via Webpack Dev Server (`npm start` or similar script in `package.json`).

## Technical Constraints
- Reliance on external World Factbook data structure and availability.
- Performance considerations for rendering complex D3.js maps and charts, especially on lower-powered devices.
- Cross-browser compatibility for vanilla JS and CSS features.
- Ensuring responsive design works correctly across a wide range of screen sizes and devices.

## Dependencies
- D3.js library
- TopoJSON library
- Font Awesome library
- Node.js/npm for development tooling (Webpack, potentially linters/formatters). Check `package.json` for specific dev dependencies. 