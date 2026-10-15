# Verification evidence — architectural proposal edition

This supersedes the earlier walking-game/archival comparison QA. `PLAN.md` stays unchanged; the user's current product requirements are recorded first in `EXECUTION.md`.

## Local gate

- Fresh `npm ci` succeeds. Lockfile includes ARM64 and x64 optional dependencies; `next typegen` precedes TypeScript on clean checkouts.
- `npm run lint` and `npm run typecheck` pass.
- `npm test`: **28 tests collected, 28 passed, 7 files**. Includes 10 exact source-derived WebPs (hashes/dimensions/provenance), public-support parsing, and unique voting-thread mappings. Geospatial/draft tests protect retained supporting modules, not a required walking-game UX.
- `npm run build`: static Next.js export.
- `npm audit --omit=dev --audit-level=high`: 0 reported production dependency vulnerabilities.
- Working-tree public-file token/private-key pattern scan passes; secrets, local operational notes and QA artifacts are ignored. The original plan is byte-identical to the supplied source. This is not a historical Git-secret audit.

## Real-browser proposal checks

`python3 scripts/proposal_smoke.py` runs against the exported static app, at 390×844 mobile and 1440×1000 desktop:

- First open has all three proposals, no GPS/discovery gate, no walk counter, and no blocking modal.
- All three approved site-photo/KI-vision pairs load. Native range Home/End and actual pointer drags work.
- Wipe uses a clip mask; image widths remain fixed across 0–100, rather than resizing adjacent columns. Entire compositions use `object-fit: contain`. Different viewpoints remain explicitly disclosed.
- All three public support counts load from the correct real GitHub issue; links match issues 1/2/3. No test reactions are posted.
- Desktop direct hash link selects the intended proposal without overflow.
- An explicitly mocked GitHub API outage produces an unavailable state, not fabricated zero votes; the public support link remains usable. Reduced-motion interaction works.
- No uncaught page errors or mutation/upload requests in the primary interaction smoke.
- New UI was visually inspected. Existing local-draft CRUD/export/delete and real map rendering were exercised in the earlier supporting-component smoke; current primary-page integration receives additional release checks.

## Reproduce

Requires an existing Python environment with Playwright (including its video recorder) and Chromium; no new dependency is needed by the application.

```sh
python3 scripts/serve.py --port 4173
python3 scripts/proposal_smoke.py
BERLIN_BASE_URL=https://weltogeisto.github.io/WiederCARE-Berlin/ BERLIN_RECORD=1 python3 scripts/proposal_smoke.py
```

Reports/screenshots/video are local under ignored `.cache/proposal-qa/`. The legacy `scripts/browser_smoke.py` targets the former walk prototype and is not the current release gate.

## Explicit limits

- Voting is public GitHub support, not a direct-in-app identity service: a GitHub account is required to react/comment. Multiple accounts are not one verified citizen; results are not representative or binding.
- Public API rate limits may temporarily hide totals; the actual GitHub voting thread remains reachable.
- No automatic photo-to-AI edit, hosted photo submission or extra voting backend was provisioned. Local photo drafts are not public proposals.
- User approval is illustration approval, not historical/architectural certification. The source viewpoints differ; some dates are uncertain and the Spreefront is partial.
- Physical-phone camera/GPS and a complete assistive-technology audit are not claimed. Software WebGL rendering is not a low-end-phone benchmark.

## Deployment

A local pass is not deployment proof. The exact GitHub Pages Actions SHA and browser smoke against the live URL are the release authority. Parallel Claude work/default-branch settings are preserved.
