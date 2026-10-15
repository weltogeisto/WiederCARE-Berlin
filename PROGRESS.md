# Progress (WiederCARE)

Plan: `PLAN.md` ("Fixlings Berlin — Build Plan", exported from the Claude Doc). Last updated 2026-10-15.

## Phase status

| Phase | State | Evidence / blocker |
| --- | --- | --- |
| 0 Recon and keys | Partial | Live page read (see FINDINGS.md). Not done: DevTools recon (needs a browser), OpenFreeMap check in a browser, image-provider test edits (need keys). |
| 1 Map shell | Built, seen in a browser | `tsc --noEmit` clean, `next build` passes. Seen at 390 x 844 on 2026-10-15: full-screen OpenFreeMap map, blue dot, no horizontal scroll. Two defects found and fixed (see Browser verification). Not yet seen on a real phone. |
| 2 Fixes and discovery | Built, seen in a browser | Node test: pins 68/213/383 m apart, start is 68 m from pin 1, walk finds all three in order at 35 m. Browser: the routed demo walk found all three in order, pins appear, progress survives a reload. No database yet: fixes are bundled in `data/fixes.ts`. |
| 3 Crew reveal | Built, seen in a browser | 7 s sequence per plan, own SVG crew, WebAudio sound, reduced-motion fallback. Browser: crew in, scaffold, wipe line, tap to skip, and replay from the sheet all play. Sound NOT heard (headless). |
| 4 Make a fix | Not started | Needs `ANTHROPIC_API_KEY`, an image provider and key, and a server host (Pages is static). Composer button is not rendered yet. |
| 5 Berlin seeds | Images in, after-images approved | The image package of 15 Oct 2026 is integrated on this branch: three third-party before photos (Wikimedia Commons, 2021 to 2023), three AI after-visions, four references. Shown with credits and an "AI vision" label (see `seeds/refs/LICENSES.md`). The owner approved all three after-images on 2026-10-15 (rule 8, table below). Open: rule 7 (one public-domain reference per fix, see QUESTIONS.md); pins are still the published bridge coordinates, not photo GPS; `scripts/generate-seeds.ts` is not built because the visions were made outside this repo (model and prompts unknown). Stand-in SVG illustrations remain in `components/Art.tsx` as the fallback. |
| 6 Live demo | Blocked | Needs 5, and a deploy. |

## Browser verification (2026-10-15)

Setup: Playwright, headless Chromium 141, 390 x 844 at 2x with touch, software WebGL. Static export built with `NEXT_PUBLIC_BASE_PATH=/wiederkehr` and served under `/wiederkehr/`; `npm run dev` checked at `http://localhost:3000`. Screenshots were reviewed by eye.

Seen working:
- Map renders full screen (Lustgarten, Berlin Cathedral, Schlossplatz, Spree) with the blue dot and the HUD. No horizontal scroll.
- Demo walk: finds Apothekenflügel, Spree front, Bauakademie in that order. Pins show after discovery, each labelled with its title.
- Reveal: crew walks in, scaffold, yellow wipe line, caption and "Tap to skip". Tap skips it. Replay works from the sheet.
- Sheet: opens from a pin, 624 px tall at 844 px, compare slider moves, stand-in note shows.
- Reload keeps the found list (3/3, three pins).
- Plan check "route passes within 20 m of each pin": the routed demo path passes 3.7 m (Apothekenflügel), 0.7 m (Spree front) and 11.2 m (Bauakademie) from the pins. Computed from the router's geometry, so it still needs a re-check on the pins' real photo GPS in Phase 5.
- After the rename to WiederCARE: a clean copy of the tracked files passes `npm ci`, lint and the build with `NEXT_PUBLIC_BASE_PATH=/WiederCARE`. At 390 x 844 the page title and HUD read "WiederCARE" (card 154 px wide, no wrapping), the map fills the screen, and the first discovery writes `wiedercare:found:v1`.
- With the real images (390 x 844, all three fixes opened from their pins): both images in each sheet decode at full size, the captions and licence links render, there is no slider, the AI note shows, and the reveal plays the wipe between the two photos with the "AI reconstruction vision" line. No 404s under `/WiederCARE/media/` and no console errors. Not handled: the images are not preloaded, so on a slow connection the first reveal can start before they arrive.

Defects found and fixed:
1. Map collapsed to 0 px, so MapLibre drew a 300 px canvas and the map was invisible. `.map { position: fixed; inset: 0 }` lost to `.maplibregl-map { position: relative }`, which loads later. Fix: `main .map` in `app/globals.css`.
2. No tiles ever loaded: "Worker failed to load". MapLibre 6 builds its worker URL from `import.meta.url`, which Turbopack rewrites to a non-http URL, so it called `new Worker("")`. Fix: `scripts/copy-worker.mjs` copies `maplibre-gl-worker.mjs` into `public/` (run by `predev` and `prebuild`, git-ignored), and `MapView.tsx` calls `maplibregl.setWorkerUrl(<base>/maplibre-gl-worker.mjs)`. No new dependency.

NOT verified:
- The live call from a browser to routing.openstreetmap.de. In this sandbox Chromium got `403 request rejected: path contains matrix parameter separator` for that host (the `;` in the coordinate list), while curl and Node got 200 with `access-control-allow-origin: *`. I could not tell whether the block is the sandbox or the host. The routed walk was tested by serving the real response to the page through Playwright. On Pages, check the Network tab once: if the call fails there too, the walk silently falls back to straight lines across water and buildings.
- A real phone, real GPS ("My GPS"), and sound.
- Wall-clock demo timing. Software WebGL ran well below 60 fps and the walk loop caps each frame at 0.1 s, so times measured here are too long. From path lengths: routed 1,042 m (legs 163 / 298 / 580 m) is about 74 s walking plus 21 s of reveals, roughly 95 s. The straight line was 663 m, about 68 s in all.
- The Pages workflow and live URL (not deployed).
- Style warnings from OpenFreeMap's "liberty" style under MapLibre 6 (three `highway-shield` filters, missing `office` image). They do not affect the view.

Note: `next dev` writes an `AGENTS.md` into the project. It is not ours; commit or delete it as you prefer. Open dev pages as `localhost`, not `127.0.0.1`: Next 16 blocks dev resources from other origins.

## After-image approval (CLAUDE.md rule 8)

Rule 8 asks for the owner's written approval before an after-image ships. The owner approved all three in the session on 2026-10-15 and asked Claude to record it here. Approval covers the images only. It does not decide which app becomes `main` (QUESTIONS.md, item 1) and does not settle the reference-rule, pin and provenance questions (items 6 to 8).

| Fix | Approved? | Date | Notes |
| --- | --- | --- | --- |
| 1 Apothekenflügel | approved | 2026-10-15 | Owner's reply in the session. Shared under CC BY-SA 3.0 DE, credit shown in the app. |
| 2 Spree front | approved | 2026-10-15 | Approved after being told it is a partial Spree-side view with no green-roofed tower (the plan names the Grüner Hut). |
| 3 Bauakademie | approved | 2026-10-15 | Approved after being told the source photograph's date is unresolved (1888 or 1911) and the brick colours are interpreted. |

For the review, here is what I saw comparing each vision with its archive photo by eye. This is not a survey, and the call stays with the owner.
- Fix 1: the structure follows the 1928 photograph (stepped gable with two round openings, domed corner turret, oriel with coat of arms, balustraded wing on the right). Invented or changed: all colours, the ivy pattern, cleaner surfaces, the fence, and the two pedestrians.
- Fix 2: it shows the partial Spree-side view of the Library of Congress photograph (conical-roofed turrets, gabled fronts, arched windows, awnings, quay with landing stage), coloured in stone and slate. It is not the Rathausbrücke angle and not the whole east side. No green-roofed tower is visible in it, and the plan's Fix 2 text names the Grüner Hut.
- Fix 3: the geometry follows the Messbild photograph (pilaster grid, arched upper windows, balustraded parapet). The brick red and terracotta tones are interpreted. The photograph's date is unresolved (1888 or 1911), so it may show a later state than the building as completed in 1836.

## Deploy (GitHub Pages, free)

Not deployed from this branch. The repo is `weltogeisto/WiederCARE` (public; renamed from `wiedersehen-berlin`, and GitHub redirects the old URL). This work is on branch `claude/new-session-ay0vj8`. `main` holds a different app, "Wiedersehen Berlin" (commit `30f71bc`, unrelated history, its base path hard-coded to `/wiedersehen-berlin/`). `.github/workflows/pages.yml` publishes on every push to `main`, so this branch deploys only once it replaces or is merged into `main` and Pages is enabled (see QUESTIONS.md, item 1).
One-time setup at that point (needs `gh` logged in):

    gh api -X POST repos/weltogeisto/WiederCARE/pages -f build_type=workflow

Or in the browser: Settings > Pages > Source: GitHub Actions.

Live URL: https://weltogeisto.github.io/WiederCARE/. The workflow sets `NEXT_PUBLIC_BASE_PATH` from the repo name (`/WiederCARE`), so no change is needed. Not yet checked: that Pages serves the mixed-case path. If the first deploy shows 404s on `_next/` files, lowercase the base path in `.github/workflows/pages.yml`.
Tested: clean copy, `npm ci`, `npm run lint`, `npm run build` with the base path. All pass.

## Deviations from the plan (Opus decided; Sonnet does not revisit)

- No Tailwind: plain CSS in `app/globals.css`. Fewer dependencies, same result.
- Fewer files than the tree: map logic lives in `components/App.tsx` and `MapView.tsx`; walk and discovery in `lib/`.
- `typescript` pinned to `^5`: 7.x is the latest tag and was not verified against Next 16.4.
- `maplibre-gl` 6 has no default export: `import * as maplibregl`.
- Pin coordinates come from published coordinates (see the comment in `data/fixes.ts`), not Nominatim: this environment cannot call it. The demo start point is approximate; foot routing snaps it.
- Demo path is routed at runtime via routing.openstreetmap.de (foot), with a straight-line fallback. Straight-line length is 663 m, so about 47 s at 14 m/s plus 7 s per reveal. Check the routed path by eye.
- Routed length is 1,042 m, not 663 m: about 74 s walking plus 21 s of reveals, roughly 95 s. `DEMO_SPEED` in `lib/walk.ts` is the knob if that is too long.
- Phase 5 differs from the plan: the before photos are third-party Commons photos (CC BY-SA), not the owner's own shots, and the after-images are AI visions colourised from archive photographs, not edits of the before photos. They share no camera position, so the sheet stacks them with credits instead of using a slider (the wipe in the reveal still runs between them). Web-sized copies live in `public/media/` (6 images, 2.1 MB in all, 160 to 470 KB each); the references are in `seeds/refs/`.
- MapLibre's worker is served from `public/` via `setWorkerUrl` (Turbopack breaks its default URL). See Browser verification.
- "Demo walk" clears found fixes so the demo can be rehearsed.
- Hosting moved from Vercel to GitHub Pages (static export). The `/api/fixes` route is gone; fixes are bundled in `data/fixes.ts`.
- Phase 4 cannot run on Pages: API keys must stay server-side. When we get there, add a small server host (Cloudflare Workers free tier or Vercel) for `POST /api/fix` only; the map stays on Pages.
- No Supabase tables yet. Two projects exist in the account and neither is dedicated to this; creating one costs money. Decide in QUESTIONS.md.
- The app is called WiederCARE (decided 2026-10-15; the repo has the same name). `PLAN.md`'s export note still says the working title is "Wiederkehr": that is superseded. Renamed in the page title, HUD, README, `package.json`, and the `localStorage` / `sessionStorage` keys (`wiedercare:*`; nothing was deployed, so no saved progress is lost).

## Next, in order

1. Push to GitHub, let the workflow publish, and open the Pages URL on a phone at 390 x 844. Check the routing call in the Network tab, and listen for the sound.
2. Phase 0 keys and provider test edit.
3. You shoot the three before photos (Phase 5).
