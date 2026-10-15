# Questions for Hendrik / Opus

1. Pages: the repo is `weltogeisto/WiederCARE` (renamed from `wiedersehen-berlin`) and this work sits on branch `claude/new-session-ay0vj8`. OK to merge it to `main` and enable GitHub Pages (Settings > Pages > Source: GitHub Actions)? The workflow only runs on `main`.
2. Database: use one of the two existing Supabase projects (in its own schema), or create a dedicated one (has a cost)?
3. Public name for the Berlin app (working title: Wiederkehr; the repo is called WiederCARE). Is WiederCARE the app name too? The title in `app/layout.tsx`, the HUD and the README still say Wiederkehr.
4. Do fixes from other people go live instantly, or wait for approval?
5. Tap-to-walk speed: PLAN.md Phase 1 says 1.4 m/s; `TAP_SPEED` in `lib/walk.ts` is 9 m/s, and PROGRESS.md does not list it as a deviation. Keep 9 m/s (faster to test) or set it to 1.4?
