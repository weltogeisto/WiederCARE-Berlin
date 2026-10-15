# Execution amendment — free GitHub edition

The user's latest instruction supersedes the paid-service deployment/executor decisions in `PLAN.md`: Astra executes, everything is hosted on GitHub without paid APIs. The supplied plan stays intact as historical input.

## Product: Wiedersehen Berlin

An original, mobile-first walking archive around the Berlin Palace. Keep the map, route, 35 m discoveries, 7-second original crew, before/archive comparison, GPS and photo-idea capture. Use Next.js static export, TypeScript, authored CSS, MapLibre and OpenFreeMap. Publish to a public GitHub repository with GitHub Pages using standard GitHub-hosted Actions only. No scheduled workflows or paid runners.

## Explicit boundaries

- No Vercel, Supabase, Anthropic, OpenAI or Gemini requests in this edition; no API keys in browser, GitHub or CI.
- Contemporary and historical photos are real licensed source images. The archive reveal is labelled as archival, with dates, credits and perspective differences. It is NOT a generated reconstruction or a pixel-registered restoration.
- The original historical reconstruction approval gate remains unpassed. No imagery is labelled approved on the user's behalf.
- New photo ideas stay in the user's browser (IndexedDB). They may include the user's own optional after-image. They do not become public server records or receive AI edits. Explain this before upload. Client resize strips EXIF; explicit position capture only.
- The demo route uses sourced OSM geometry/geocoding, not invented GPS. Archive-demo pins are not claimed to be the user's before-photo positions.
- Standard React/Next renderer/types/lint/build tooling is permitted by the functional stack requirement. No backend is smuggled into GitHub Actions.
- Never publish local access diagnostics, account identifiers, chat metadata or credentials. Keep `FINDINGS.md`, `QUESTIONS.md`, and `PROGRESS.md` local.

## Acceptance

1. Fresh mobile map opens without blocking onboarding; demo discovers the three stops in order.
2. Pause, resume, tap-to-walk, drag, repeat, skip/replay, sound toggle, GPS failure, reduced motion and persistent discovery work.
3. Local draft creation survives reload, deletion works, and photos are not sent over the network.
4. Real image assets and source/credit metadata are present. No generated/mock image claims.
5. Unit tests, lint, typecheck, production static build and real browser smoke pass.
6. Read back the exact deployed GitHub Pages site and exercise the live demo before claiming completion.
