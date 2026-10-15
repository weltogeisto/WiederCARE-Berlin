# Verification evidence

## Release gate for the WiederCARE revision (15 Oct 2026)

Run on the integrated tree: the free edition renamed to WiederCARE, plus the three approved AI visions.

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: **23 tests, 23 passed**. New: every AI vision is approved, labelled as AI, records its source photograph, and the Apothekenflügel vision carries CC BY-SA 3.0 DE.
- `npm run build`: static export with base path `/WiederCARE`.
- `scripts/browser_smoke.py` against the export served at `http://127.0.0.1:4173/WiederCARE/` (Chromium 141, software WebGL): **12 of 12 checks passed**, including the new "sheet opens on the approved AI vision with its label", zero page errors, no mutating requests, and `tiles.openfreemap.org` as the only external host.
- Separate visual check at 390 × 844: the brand reads WiederCARE, the crew rebuilds into the vision with the stamp "KI-Vision · nach Archivfoto", and the three view buttons fit. The credits list today's photo, the archive photo and the vision with its approval date.

## Real-browser checks (from the free-edition release, still covered by the smoke run above)

Chromium, real WebGL2 via software rendering, virgin mobile viewport 390 × 844 and desktop 1440 × 1000:

- Map renders actual OpenFreeMap tiles. Initial 0/3, no revealed pins, no blocking onboarding.
- Full demo discovers Apothekenflügel → Spreefront → Bauakademie in order, plays each 7-second reveal, resumes automatically, ends at 3/3.
- Pause/resume, keyboard-operable comparison slider, full uncropped archive view, replay and skip.
- Discovery survives reload; explicit reset clears discovery, not local photo drafts.
- Actual map click moves the walker; actual marker drag updates the coordinates.
- Denied geolocation shows a usable fallback. Browser-mocked accurate GPS discovers a real sourced stop.
- Reduced-motion rendering omits crew and uses the short crossfade.
- A synthetic test photograph (only a QA fixture, never an archival asset) is resized to 1536px, saved to IndexedDB, survives reload, exports successfully, and can be deleted.
- No POST/PUT/upload request during photo handling.

Run the reusable browser smoke with Python Playwright and Pillow. It uses `/usr/bin/chromium` if present, otherwise Playwright's bundled Chromium, or `CHROMIUM_PATH`:

```sh
python3 scripts/serve.py --port 4173
python3 scripts/browser_smoke.py
# Optional shorter rerun excluding the full demo:
BERLIN_SMOKE_QUICK=1 python3 scripts/browser_smoke.py
# Deployed smoke:
BERLIN_BASE_URL=https://weltogeisto.github.io/WiederCARE/ python3 scripts/browser_smoke.py
```

The full run deliberately waits for the real walking/reveal sequence. `scripts/browser_smoke.py` writes report and screenshots under ignored `.cache/qa/`. The GitHub workflow separately re-runs lint, typecheck, unit tests and build for each released SHA. Browser-smoke evidence is local/manual, not falsely represented as a CI job.

## Not claimed

- Not deployed yet: GitHub Pages is not enabled, so the deployed smoke has not run.
- Physical iOS/Android GPS, camera chooser, or real-world route rehearsal has not been tested.
- Map software-renderer success is not a benchmark of low-end mobile GPU performance.
- The AI visions were approved by the owner as labelled visions. They are not survey-verified reconstructions: colours, materials and fine details are interpreted.
- No original-plan prompt-to-image API, server-side public submission, moderation or shared database is implemented in this all-free static edition.
- Accessibility is implemented with native dialogs, labels, keyboard controls and reduced-motion behavior; no full assistive-technology audit is claimed.

## Deployment authority

The repository's **Test and deploy Pages** workflow and the live Pages URL are the authority for the deployed revision; a local pass alone does not prove deployment.
