# Questions for Hendrik / Opus

1. Two apps, one repo. `main` holds "Wiedersehen Berlin" (commit `30f71bc`, "ship free Wiedersehen Berlin walking archive": no AI, real archive images, base path `/wiedersehen-berlin/`). This branch, `claude/new-session-ay0vj8`, holds WiederCARE, the plan-faithful build (stand-in art, AI phases still to come). The histories are unrelated, so a merge conflicts on `README.md`, `PLAN.md`, `app/*`, `lib/*`, `package.json` and `pages.yml`. Which one should `main` be? Options: this branch replaces `main`; `main`'s app moves to its own branch or repo; or keep both and publish one from a branch. Also: after the repo rename, `main`'s hard-coded `/wiedersehen-berlin/` base path no longer matches the Pages URL.
2. Pages: OK to enable GitHub Pages (Settings > Pages > Source: GitHub Actions) once question 1 is settled? The workflow only runs on `main`.
3. Database: use one of the two existing Supabase projects (in its own schema), or create a dedicated one (has a cost)?
4. Do fixes from other people go live instantly, or wait for approval?
5. Tap-to-walk speed: PLAN.md Phase 1 says 1.4 m/s; `TAP_SPEED` in `lib/walk.ts` is 9 m/s, and PROGRESS.md does not list it as a deviation. Keep 9 m/s (faster to test) or set it to 1.4?
