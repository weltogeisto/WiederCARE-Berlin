# WiederCARE: instructions for Claude Code

Mobile-first map app, Berlin edition of the mechanic seen at fixlings.vercel.app: walk the city, discover three lost buildings, watch a crew rebuild them. Next.js 16 static export, hosted free on GitHub Pages.

## Read first, in this order
1. `PLAN.md`: the build plan, source of truth. If it is missing, stop and ask the user to export the Claude Doc "Fixlings Berlin: Build Plan" as Markdown to `PLAN.md`.
2. `PROGRESS.md`: what is built, what is untested, deviations from the plan.
3. `QUESTIONS.md`: open questions. Add yours here.

## Roles
Opus planned; you execute. Do not change a decision in the plan or a historical fact in its Berlin section. If something is wrong or impossible, write it to `QUESTIONS.md` with the evidence and stop. Work one phase at a time and pass its gate before the next.

## Commands
- `npm run dev`: http://localhost:3000
- `npm run lint`: type check (`tsc --noEmit`)
- `npm run build`: static export into `out/`. Test the Pages path with `NEXT_PUBLIC_BASE_PATH=/WiederCARE npm run build`.

## Rules
1. Dependencies are capped: `next`, `react`, `react-dom`, `maplibre-gl`, plus what the plan names for Phase 4 (`@supabase/supabase-js`, `@anthropic-ai/sdk`, one image SDK pinned in Phase 0). Anything else goes to `QUESTIONS.md` first.
2. After each phase: lint and build clean, update `PROGRESS.md` (what shipped, what is untested), commit as `phase N: <gate passed>`.
3. Secrets live only in env vars and `.env.local`. Never commit them. Anything `NEXT_PUBLIC_` is public in the browser, so no keys there.
4. Test at 390 x 844 (phone viewport).
5. Never copy code, sprites, sounds or the name from fixlings.vercel.app.
6. Coordinates come from published sources or photo GPS, never from memory.
7. Reference images: public domain only, from Wikimedia Commons, logged in `seeds/refs/LICENSES.md`. Fewer than two per fix means escalate.
8. After-images need the user's written approval in `PROGRESS.md` before they ship.
9. Ask before irreversible or public actions: creating a repo, enabling Pages, creating accounts or API keys.

## Architecture
- `components/App.tsx`: state, walk loop (refs, `requestAnimationFrame`), discovery at 35 m, HUD.
- `components/MapView.tsx`: MapLibre with the OpenFreeMap "liberty" style. maplibre-gl 6 has no default export: `import * as maplibregl`.
- `components/CrewReveal.tsx` + CSS in `app/globals.css`: the 7 s sequence (crew in, scaffold, wipe, crew out).
- `components/Art.tsx`: stand-in illustrations, addressed as `plate:<key>`. Real images replace them by setting `before` and `after` in `data/fixes.ts` to URLs.
- `lib/walk.ts`: demo route via routing.openstreetmap.de foot routing, straight-line fallback. `lib/geo.ts`: haversine and path maths. `lib/sound.ts`: WebAudio, no assets.
- No API routes: GitHub Pages is static. TypeScript is pinned to `^5`.

## Tasks, in order
1. Publish: with the user's OK on name and visibility, create the public repo and enable Pages (commands in `PROGRESS.md`), then confirm the workflow run is green and the Pages URL loads.
2. Verify Phases 1 to 3 in a real browser at phone size (Playwright is fine): map renders, the routed demo walk follows streets and finds all three fixes in order, the reveal plays, the sheet opens from a pin. Fix defects. Record what you saw in `PROGRESS.md`.
3. Phase 0 leftovers: browser recon of the original into `FINDINGS.md`; pick the image provider and pin its model ID from the provider docs on the day; run one test edit per candidate.
4. Phase 4: keys cannot live on Pages. Propose a small server host for `POST /api/fix` only (Cloudflare Workers free tier is the default candidate) and ask before creating accounts or keys.
5. Phase 5: the user shoots the three before photos with GPS on; build `scripts/generate-seeds.ts`; render three candidates per fix; the user picks.
6. Phase 6: rehearse the full demo walk on a phone.
