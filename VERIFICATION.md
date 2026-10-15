# Verification evidence

## Local release gate

- `npm run lint` — passed without warnings.
- `npm run typecheck` — passed.
- `npm test` — **22 tests collected, 22 passed**, across 5 files.
- `npm run build` — static Next.js export, real browser loaded emitted HTML/JS/images/worker.
- `npm audit --omit=dev --audit-level=high` — 0 reported production dependency vulnerabilities.
- Public-file secret scan — no detected token/private-key patterns; local operational notes, env files and test fixtures excluded.

## Real-browser checks

Chromium, real WebGL2 via software rendering, virgin mobile viewport 390 × 844 and desktop 1440 × 1000:

- Map renders actual OpenFreeMap tiles. Initial 0/3, no revealed pins, no blocking onboarding.
- Full demo discovers Apothekenflügel → Spreefront → Bauakademie in order, plays each 7-second reveal, resumes automatically, ends at 3/3.
- Pause/resume, keyboard-operable comparison slider, full uncropped archive view, replay and skip.
- Discovery survives reload; explicit reset clears discovery, not local photo drafts.
- Actual map click moves the walker; actual marker drag updates the coordinates.
- Denied geolocation shows a usable fallback. Browser-mocked accurate GPS discovers a real sourced stop.
- Reduced-motion rendering omits crew and uses the short crossfade.
- A synthetic test photograph (only a QA fixture, never an archival asset) is resized to 1536px, saved to IndexedDB, survives reload, exports successfully, and can be deleted.
- No POST/PUT/upload request during photo handling. Observed external host during normal map use: `tiles.openfreemap.org`.
- No uncaught page errors in the completed smoke contexts. No horizontal overflow at the tested widths.

Run the reusable browser smoke with an existing Python environment containing Playwright and Pillow, plus Chromium:

```sh
python3 scripts/serve.py --port 4173
python3 scripts/browser_smoke.py
# Optional shorter rerun excluding the full demo:
BERLIN_SMOKE_QUICK=1 python3 scripts/browser_smoke.py
# Deployed smoke:
BERLIN_BASE_URL=https://weltogeisto.github.io/wiedersehen-berlin/ python3 scripts/browser_smoke.py
```

The full run deliberately waits for the real walking/reveal sequence. `scripts/browser_smoke.py` writes report and screenshots under ignored `.cache/qa/`. The GitHub workflow separately re-runs lint, typecheck, unit tests and build for each released SHA. Browser-smoke evidence is local/manual, not falsely represented as a CI job.

## Not claimed

- Physical iOS/Android GPS, camera chooser, or real-world route rehearsal has not been tested.
- Map software-renderer success is not a benchmark of low-end mobile GPU performance.
- Real archival imagery has been visually inspected, but these are NOT approved photorealistic AI reconstructions. Source perspectives and dates differ; uncertain dates are disclosed.
- No original-plan prompt-to-image API, server-side public submission, moderation or shared database is implemented in this all-free static edition.
- Accessibility is implemented with native dialogs, labels, keyboard controls and reduced-motion behavior; no full assistive-technology audit is claimed.

## Deployment authority

The repository's **Test and deploy Pages** workflow and the live Pages URL are the authority for the deployed revision; a local pass alone does not prove deployment.
