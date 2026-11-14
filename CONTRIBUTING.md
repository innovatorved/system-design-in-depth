# Contributing to System Design In Depth

Thank you for helping improve **System Design In Depth**! Whether you are fixing a formula, clarifying a distributed protocol edge case, improving simulator accessibility, or adding a primary-source citation, contributions are very welcome.

---

## Ways to Contribute

1. **Fix factual inaccuracies or typos** in `data/content/*.js`, `data/archive/*.js`, or `data/questions/*.js`.
2. **Improve visual simulators or exercises** in `js/simulators*.js` and `js/exercises.js`.
3. **Refine from-scratch build labs** in `data/implementations_code.js` and `data/guided_labs.js`.
4. **Enhance UI/UX, performance, and keyboard/screen-reader accessibility** following [`DESIGN.md`](DESIGN.md).

Please read [`docs/editorial-policy.md`](docs/editorial-policy.md) before submitting curriculum prose: all technical claims must be grounded in primary papers, RFCs, textbooks, or public engineering postmortems.

---

## Local Workflow

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/system-design-in-depth.git
   cd system-design-in-depth
   ```
2. **Preview locally** with any static server:
   ```bash
   npm run serve
   # Open http://localhost:8000
   ```
3. **Regenerate static pages and asset hashes** whenever you edit HTML, CSS, JS, or curriculum data:
   ```bash
   npm run prerender
   npm run build
   ```
   *(Note: `npm run prerender` automatically re-runs `tools/stamp-assets.js` so all `?v=` hashes stay synchronized.)*
4. **Run the quality gates** before opening a pull request:
   ```bash
   npm test
   npm run stamp:check
   ```

Both commands must exit with `0 errors` and `0 stale files`.

---

## Design & Accessibility Standards

- Use semantic design tokens from `design-system/tokens.css` and `css/variables.css` — never hardcode `#000000` dark surfaces or raw hex colors inside components.
- Verify layouts in both **Light (`Warm Neutral Paper #F7F7F5`)** and **Dark (`Neutral Charcoal #0F0F10`)** themes at desktop (`1440px`) and mobile (`390px`) widths.
- Do not use decorative emojis as UI chrome; use crisp inline SVG icons with `aria-hidden="true"` and explicit accessible labels on interactive controls.

---

## Licensing of Contributions

By submitting a pull request, you agree that your code contributions are licensed under the [MIT License](LICENSE) and your curriculum/documentation contributions are licensed under [CC BY 4.0](LICENSE).
