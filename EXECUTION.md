# Execution amendment — free GitHub edition

The user's latest instruction supersedes the paid-service deployment/executor decisions in `PLAN.md`: everything is hosted on GitHub without paid APIs. The supplied plan stays intact as historical input.

## Product: WiederCARE

An original, mobile-first walking archive around the Berlin Palace. Keep the map, route, 35 m discoveries, 7-second original crew, before/archive comparison, the approved AI visions, GPS and photo-idea capture. Use Next.js static export, TypeScript, authored CSS, MapLibre and OpenFreeMap. Publish to the public GitHub repository `weltogeisto/WiederCARE` with GitHub Pages at `/WiederCARE/`, using standard GitHub-hosted Actions only. No scheduled workflows or paid runners.

## Explicit boundaries

- No Vercel, Supabase, Anthropic, OpenAI or Gemini requests in this edition; no API keys in browser, GitHub or CI.
- Contemporary and historical photos are real licensed source images, shown with dates, credits and perspective differences. They are never presented as generated or pixel-registered.
- Each stop also has one AI reconstruction vision made from an archival photograph. The owner approved all three on 2026-10-15. A vision is always labelled "KI-Rekonstruktionsvision" with its credit and approval date, and is never presented as evidence: the archive photographs stay one tap away. Any new AI image needs the owner's written approval before it ships.
- New photo ideas stay in the user's browser (IndexedDB). They may include the user's own optional after-image. They do not become public server records or receive AI edits. Explain this before upload. Client resize strips EXIF; explicit position capture only.
- The demo route uses sourced OSM geometry/geocoding, not invented GPS. Demo pins are not claimed to be the user's before-photo positions.
- Standard React/Next renderer/types/lint/build tooling is permitted by the functional stack requirement. No backend is smuggled into GitHub Actions.
- Never publish local access diagnostics, account identifiers, chat metadata or credentials. Keep `FINDINGS.md`, `QUESTIONS.md`, and `PROGRESS.md` local.

## Decisions of 15 Oct 2026 (planner)

Two builds of the plan existed in this repository: this free edition on `main`, and a thinner plan-faithful build on a `claude/` branch. These decisions settle the open questions from both.

1. **One app.** This free edition is the product, renamed WiederCARE (repo name, page title, brand, storage keys, base path `/WiederCARE`). The other build is retired; its history stays in the repository's ancestry, and its approved images were carried over.
2. **AI visions.** The crew now rebuilds into the approved vision, and the stop sheet opens on it. The archive photographs remain the record ("Ganzes Archivbild", "Blickwechsel").
3. **Phase 4 of `PLAN.md` is parked:** no prompt-to-image calls, no server route, no database, no keys. "Eigene Idee" stays on the device. If public submissions ever open, they default to `pending`.
4. **Tap-to-walk moves at walking speed**, as the plan says.
5. **Licences.** Public-domain, CC0, CC BY and CC BY-SA sources are acceptable with attribution, and share-alike is honoured. The Apothekenflügel vision adapts a CC BY-SA 3.0 DE photograph and carries that licence. Every image is logged in `seeds/refs/LICENSES.md`.
6. **Pins** stay at the OSM-sourced demo positions (published sources, within 20 m of the route, enforced by tests). They are not photo GPS, and the app says so.
7. **Rules.** `AGENTS.md` is the contributor rulebook for every agent; `CLAUDE.md` points to it.

Still open, for the owner:

- Enable GitHub Pages (Settings > Pages > Source: GitHub Actions). The workflow's own token cannot do it.
- Which tool or model made the three visions, and from which prompt. The credit line currently reads "AI adaptation after <archive source>".
- A rehearsal on a physical phone, on site.

## Acceptance

1. Fresh mobile map opens without blocking onboarding; demo discovers the three stops in order.
2. Pause, resume, tap-to-walk, drag, repeat, skip/replay, sound toggle, GPS failure, reduced motion and persistent discovery work.
3. Local draft creation survives reload, deletion works, and photos are not sent over the network.
4. Real image assets and source/credit metadata are present. AI visions are labelled as AI and never claimed as photographs.
5. Unit tests, lint, typecheck, production static build and real browser smoke pass.
6. Read back the exact deployed GitHub Pages site and exercise the live demo before claiming completion.
