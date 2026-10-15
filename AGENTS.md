# Wiedersehen Berlin — contributor rules

Read EXECUTION.md before PLAN.md: the user changed the product to a free, static GitHub Pages edition.
- Repo owner: weltogeisto. Target project path: /wiedersehen-berlin/.
- All application state is browser-local. Do not add secrets, remote photo upload, paid calls, analytics, polling or scheduled workflows.
- Keep factual provenance and dates next to archival imagery. No archive picture is an approved generated reconstruction.
- Keep historical source files under public/media with per-image licenses. Do not copy upstream application code/art.
- Use pure typed helpers in lib, tests with Node's test runner, and browser verification for maps, IndexedDB, modal focus, animation and GPS.
- Before deployment: npm run lint; npm run typecheck; npm test; npm run build; then browser smoke at 390x844 and desktop, reduced motion, local draft persistence and deployed base-path assets.
- No user-photo GPS is published automatically. Do not commit operational access notes (ignored FINDINGS/QUESTIONS/PROGRESS).
