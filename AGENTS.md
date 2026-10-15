# Wiedersehen Berlin — contributor rules

Read EXECUTION.md before PLAN.md: the user changed the product to a free, static GitHub Pages edition.
- Repo owner: weltogeisto. Repo: WiederCARE-Berlin, Astra implementation on main. CI derives the Pages base path from the actual repo name; local default /WiederCARE-Berlin/. Preserve the independent Claude branch and default-branch setting.
- All application state is browser-local. Do not add secrets, remote photo upload, paid calls, analytics, polling or scheduled workflows.
- The user explicitly approved the three supplied KI-Rekonstruktionsvisionen for public demo use. Keep those distinct from dated site photos and historical references, preserve whole compositions and licenses, and use separate views rather than a registered wipe. User approval is not historical or architectural certification.
- Keep historical source files under public/media with per-image licenses. Do not copy upstream application code/art.
- Use pure typed helpers in lib, tests with Node's test runner, and browser verification for maps, IndexedDB, modal focus, animation and GPS.
- Before deployment: npm run lint; npm run typecheck; npm test; npm run build; then browser smoke at 390x844 and desktop, reduced motion, local draft persistence and deployed base-path assets.
- No user-photo GPS is published automatically. Do not commit operational access notes (ignored FINDINGS/QUESTIONS/PROGRESS).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
