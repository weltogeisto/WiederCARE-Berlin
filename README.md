# WiederCARE

**Eine Stadt. Zwei Zeiten.** Ein kostenloser Spaziergang um das Berliner Schloss: Apothekenflügel, alte Spreefront und Schinkels Bauakademie.

Original design and code; no copied application sprites or sounds.

## The free edition

- Next.js static export on **GitHub Pages**, with MapLibre and public OpenFreeMap tiles.
- A geocoded demo walk, 35-metre discoveries, original 7-second SVG/canvas-style crew reveal, archive comparison, skip/replay, opt-in synthesized sound and reduced-motion support.
- GPS only after an explicit button press. Simulation works from anywhere.
- Found places persist in localStorage. Photo ideas and optional user-supplied after-images stay in **IndexedDB on the device**. No upload, API key, login, tracking SDK or cloud database.
- Photos are resized in-browser to a 1536px long edge and re-encoded to JPEG, stripping embedded EXIF. Export important drafts; clearing browser data removes them.
- No paid AI service at runtime. Contemporary and historical images are real photographs with sources. Each stop also shows one **AI reconstruction vision**, made from an archival photograph and approved by the project owner on 15 Oct 2026. It is always labelled as AI, and the archive photographs remain the record.

The original brief is retained in `PLAN.md`. `EXECUTION.md` documents the change to a free GitHub-hosted edition, its boundaries, and the decisions taken since. `AGENTS.md` holds the contributor rules.

## Run locally

Requires Node 22.18+ (CI uses Node 24).

```sh
npm ci
npm run dev
# http://127.0.0.1:3000/WiederCARE/
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Production files are emitted to `out/`. The app's base path is `/WiederCARE/`; serve the static files under that path (`python3 scripts/serve.py`). No server routes, secrets or build-time cloud calls are required. The Pages workflow runs only on main pushes or explicit dispatch; there are no schedules.

## Privacy and network

The host (GitHub Pages) and public map provider (OpenFreeMap) necessarily receive ordinary HTTP connection data such as IP addresses. The app itself does not upload GPS positions or photos. Public map requests necessarily reveal the visible map area to the tile provider. External source links only open when selected. Sound starts only after an explicit user gesture.

The walking route is approximate and based on OSM. It is not turn-by-turn navigation and does not check current traffic, closures or construction. Demo pins are not claimed to be GPS coordinates of the user's own photographs. Check access and traffic in the real world.

## Licenses and source integrity

Project-created UI, crew and audio are original. Individual images retain their respective public-domain/Creative Commons terms; see `research/berlin-assets.json` and `seeds/refs/LICENSES.md`. The Apothekenflügel AI vision adapts a CC BY-SA 3.0 DE photograph and is shared under that licence. The original source app is research inspiration only, not a source of code or media. Map attribution remains visible in the UI.

## Deployment

Repository: https://github.com/weltogeisto/WiederCARE

Target Pages URL: https://weltogeisto.github.io/WiederCARE/

Standard GitHub-hosted Actions on a public repository and GitHub Pages are used, not paid runners or third-party deployment services. Hosting is subject to the providers' standard limits and terms.
