# WiederCARE — contributor rules

Read EXECUTION.md before PLAN.md: the product is a free, static GitHub Pages edition, and EXECUTION.md records the decisions taken since the plan.
- Repo: weltogeisto/WiederCARE. Project path on Pages: /WiederCARE/ (exact case).
- All application state is browser-local. Do not add secrets, remote photo upload, paid calls, analytics, polling or scheduled workflows.
- Keep factual provenance and dates next to archival imagery. Archive pictures stay archive pictures.
- The three AI visions (`public/media/*-vision.webp`) were approved by the owner on 2026-10-15. Keep them labelled as AI with credit and approval date, and never present them as evidence. Any new AI image needs the owner's written approval before it ships.
- Keep source files under public/media with per-image licences, logged in seeds/refs/LICENSES.md. Do not copy upstream application code/art.
- Use pure typed helpers in lib, tests with Node's test runner, and browser verification for maps, IndexedDB, modal focus, animation and GPS.
- Before deployment: npm run lint; npm run typecheck; npm test; npm run build; then browser smoke at 390x844 and desktop, reduced motion, local draft persistence and deployed base-path assets.
- No user-photo GPS is published automatically. Do not commit operational access notes (ignored FINDINGS/QUESTIONS/PROGRESS).
