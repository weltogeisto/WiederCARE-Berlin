# Wiedersehen Berlin

**Berlin kann anders aussehen.** Architekturvorschläge öffentlich vergleichen: vorhandenes Stadtbild und mögliche Gestalt im experimentellen Links-rechts-Swipe. Apothekenflügel, alte Spreefront und Schinkels Bauakademie — alle direkt zugänglich, ohne GPS- oder Entdeckungssperre.

Öffentliche Unterstützung wird über echte GitHub-👍-Reaktionen erfasst: [Apothekenflügel](https://github.com/weltogeisto/WiederCARE-Berlin/issues/1), [Spreefront](https://github.com/weltogeisto/WiederCARE-Berlin/issues/2), [Bauakademie](https://github.com/weltogeisto/WiederCARE-Berlin/issues/3). Die App liest gemeinsame Gesamtzahlen; zum Unterstützen/Kommentieren ist ein GitHub-Konto erforderlich. Ein Konto ist keine nachgewiesene Person. Kein lokaler Schein-Zähler, keine repräsentative Umfrage und keine amtliche Abstimmung.

Built with Astra / Hermes. Original design and code; no copied application sprites or sounds.

## The free edition

- Next.js static export on **GitHub Pages**, with MapLibre and public OpenFreeMap tiles.
- Directly accessible architectural proposals, a large experimental swipe, original crew transition and reduced-motion support. The map is optional context, not a walking-game gate.
- No GPS or account is needed to view proposals. Public support/commenting uses GitHub accounts; aggregate counts are fetched from the real public threads only on selection or manual refresh.
- Photo ideas and optional user-supplied after-images stay in **IndexedDB on the device**. No photo upload, API key, tracking SDK or cloud database. Public support is distinct from these local drafts.
- Photos are resized in-browser to a 1536px long edge and re-encoded to JPEG, stripping embedded EXIF. Export important drafts; clearing browser data removes them.
- No paid AI service. **Three user-supplied, explicitly approved KI-Rekonstruktionsvisionen** are included alongside site photos from 2021–2023 and four historical references. These are archive-based interpretations, not edits of the site photographs. The requested swipe deliberately juxtaposes different perspectives; this limitation and speculative colours/details remain explicit.

The original brief is retained in `PLAN.md`. `EXECUTION.md` documents the user's later change to Astra + free GitHub hosting and the associated scope boundaries. Free hosting does not imply that a prompt-to-image API is free: no automatic image generation is claimed here.

## Run locally

Requires Node 22.18+ (CI uses Node 24).

```sh
npm ci
npm run dev
# http://localhost:3000/WiederCARE-Berlin/
```

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Production files are emitted to `out/`. The app's base path is `/WiederCARE-Berlin/`; serve the static files under that path. No server routes, secrets or build-time cloud calls are required. The Pages workflow runs only on main pushes or explicit dispatch; there are no schedules. CI derives the base path from the actual repository name, so renaming the repository does not silently break assets. The independent Astra/Hermes implementation is on `main`; the parallel Claude branch and default-branch setting are not changed.

## Privacy and network

The host (GitHub Pages), GitHub's public issue API and the optional map provider (OpenFreeMap) necessarily receive ordinary HTTP connection data such as IP addresses. The app does not upload GPS positions or photos. Map requests reveal the visible map area to the tile provider. GitHub support reactions and comments are public. External source/inspiration links only open when selected. There is no continuous polling or analytics SDK.

The walking route is approximate and based on OSM. It is not turn-by-turn navigation and does not check current traffic, closures or construction. Demo pins are not claimed to be GPS coordinates of the user's own photographs. Check access and traffic in the real world.

## Licenses and source integrity

Project-created UI, crew and audio are original. Individual photographs retain their respective public-domain/Creative Commons terms; see `research/approved-visions.json`, `seeds/refs/APPROVED-VISIONS.md` and the earlier archive manifest in `seeds/refs/LICENSES.md`. Derivatives preserve whole compositions and record source/output hashes. CC BY-SA obligations remain attached; no blanket public-domain claim is made for AI adaptations. The original source app is research inspiration only, not a source of code or media. Map attribution remains visible in the UI.

## Deployment

Repository: https://github.com/weltogeisto/WiederCARE-Berlin/tree/main

Target Pages URL: https://weltogeisto.github.io/WiederCARE-Berlin/

Standard GitHub-hosted Actions on a public repository and GitHub Pages are used, not paid runners or third-party deployment services. Hosting is subject to the providers' standard limits and terms.
