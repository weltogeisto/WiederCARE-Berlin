# Progress (working title: Wiederkehr)

Plan: `PLAN.md` ("Fixlings Berlin — Build Plan", exported from the Claude Doc). Last updated 2026-10-15.

## Phase status

| Phase | State | Evidence / blocker |
| --- | --- | --- |
| 0 Recon and keys | Partial | Live page read (see FINDINGS.md). Not done: DevTools recon (needs a browser), OpenFreeMap check in a browser, image-provider test edits (need keys). |
| 1 Map shell | Built, seen in a browser | `tsc --noEmit` clean, `next build` passes. Seen at 390 x 844 on 2026-10-15: full-screen OpenFreeMap map, blue dot, no horizontal scroll. Two defects found and fixed (see Browser verification). Not yet seen on a real phone. |
| 2 Fixes and discovery | Built, seen in a browser | Node test: pins 68/213/383 m apart, start is 68 m from pin 1, walk finds all three in order at 35 m. Browser: the routed demo walk found all three in order, pins appear, progress survives a reload. No database yet: fixes are bundled in `data/fixes.ts`. |
| 3 Crew reveal | Built, seen in a browser | 7 s sequence per plan, own SVG crew, WebAudio sound, reduced-motion fallback. Browser: crew in, scaffold, wipe line, tap to skip, and replay from the sheet all play. Sound NOT heard (headless). |
| 4 Make a fix | Not started | Needs `ANTHROPIC_API_KEY`, an image provider and key, and a server host (Pages is static). Composer button is not rendered yet. |
| 5 Berlin seeds | Not started | Needs the three before photos (GPS on) and the public-domain references. Stand-in SVG illustrations are in `components/Art.tsx`. |
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

## Deploy (GitHub Pages, free)

Not deployed yet. The repo is `weltogeisto/WiederCARE` (public; renamed from `wiedersehen-berlin`, and GitHub redirects the old URL). This work is on branch `claude/new-session-ay0vj8`, not on `main`. `.github/workflows/pages.yml` builds a static export and publishes it on every push to `main`, so nothing runs until the branch is merged and Pages is enabled (see QUESTIONS.md, item 1).
One-time setup after merging (needs `gh` logged in):

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
- MapLibre's worker is served from `public/` via `setWorkerUrl` (Turbopack breaks its default URL). See Browser verification.
- "Demo walk" clears found fixes so the demo can be rehearsed.
- Hosting moved from Vercel to GitHub Pages (static export). The `/api/fixes` route is gone; fixes are bundled in `data/fixes.ts`.
- Phase 4 cannot run on Pages: API keys must stay server-side. When we get there, add a small server host (Cloudflare Workers free tier or Vercel) for `POST /api/fix` only; the map stays on Pages.
- No Supabase tables yet. Two projects exist in the account and neither is dedicated to this; creating one costs money. Decide in QUESTIONS.md.
- Working title "Wiederkehr" is a placeholder.

## Next, in order

1. Push to GitHub, let the workflow publish, and open the Pages URL on a phone at 390 x 844. Check the routing call in the Network tab, and listen for the sound.
2. Phase 0 keys and provider test edit.
3. You shoot the three before photos (Phase 5).
