# Wiedersehen Berlin

**Eine Stadt. Zwei Zeiten.** Ein kostenloser Spaziergang um das Berliner Schloss: Apothekenflügel, alte Spreefront und Schinkels Bauakademie.

Built with Astra / Hermes. Original design and code; no copied application sprites or sounds.

## The free edition

- Next.js static export on **GitHub Pages**, with MapLibre and public OpenFreeMap tiles.
- A geocoded demo walk, 35-metre discoveries, original 7-second SVG/canvas-style crew reveal, archive comparison, skip/replay, opt-in synthesized sound and reduced-motion support.
- GPS only after an explicit button press. Simulation works from anywhere.
- Found places persist in localStorage. Photo ideas and optional user-supplied after-images stay in **IndexedDB on the device**. No upload, API key, login, tracking SDK or cloud database.
- Photos are resized in-browser to a 1536px long edge and re-encoded to JPEG, stripping embedded EXIF. Export important drafts; clearing browser data removes them.
- No paid AI service. **The historical images are real archive images, not AI restorations.** Perspectives and dates differ and are shown with sources in the app. The human review gate for future generated reconstructions is not bypassed.

The original brief is retained in `PLAN.md`. `EXECUTION.md` documents the user's later change to Astra + free GitHub hosting and the associated scope boundaries. Free hosting does not imply that a prompt-to-image API is free: no automatic image generation is claimed here.

## Run locally

Requires Node 22.18+ (CI uses Node 24).

```sh
npm ci
npm run dev
# http://localhost:3000/wiedersehen-berlin/
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Production files are emitted to `out/`. The app's base path is `/wiedersehen-berlin/`; serve the static files under that path. No server routes, secrets or build-time cloud calls are required. The Pages workflow runs only on main pushes or explicit dispatch; there are no schedules.

## Privacy and network

The host (GitHub Pages) and public map provider (OpenFreeMap) necessarily receive ordinary HTTP connection data such as IP addresses. The app itself does not upload GPS positions or photos. Public map requests necessarily reveal the visible map area to the tile provider. External source links only open when selected. Sound starts only after an explicit user gesture.

The walking route is approximate and based on OSM. It is not turn-by-turn navigation and does not check current traffic, closures or construction. Demo pins are not claimed to be GPS coordinates of the user's own photographs. Check access and traffic in the real world.

## Licenses and source integrity

Project-created UI, crew and audio are original. Individual photographs retain their respective public-domain/Creative Commons terms; see the per-image source manifest and `seeds/refs/LICENSES.md`. The original source app is research inspiration only, not a source of code or media. Map attribution remains visible in the UI.

## Deployment

Repository: https://github.com/weltogeisto/wiedersehen-berlin

Target Pages URL: https://weltogeisto.github.io/wiedersehen-berlin/

Standard GitHub-hosted Actions on a public repository and GitHub Pages are used, not paid runners or third-party deployment services. Hosting is subject to the providers' standard limits and terms.
