# Fixlings Berlin — Build Plan

Oct 15, 2026 · @Welt Geist

## The plan on one page

We rebuild the Fixlings mechanic for Berlin and prove it with one lap around the Schloss. Three lost buildings return as fixes you discover on foot: the Apothekenflügel beside the palace, the historical Spree front in place of today's modern east facade, and Schinkel's Bauakademie on its empty plot.

The single idea: the city as a before/after you walk through. Every choice below serves one moment — arriving at the spot and watching a tiny crew rebuild what is missing.

**Handoff protocol**

- **Opus (this doc) owns every decision:** stack, data model, historical facts, prompts, acceptance gates.
- **Sonnet executes** in Claude Code. Start an empty repo, export this doc as Markdown to `PLAN.md` at the root, switch with `/model` to Sonnet, and tell it: *Execute PLAN.md phase by phase.*
- **Sonnet never re-decides.** Where the plan is silent or wrong, it writes the question to `QUESTIONS.md` and stops. That file is the escalation path back to Opus.
- **You own one gate:** the historical review of the three Berlin after-images before they go live.

## What Fixlings is

Fixlings is a mobile-first Next.js app on Vercel that fuses a geocaching loop with AI image edits. Its source is not readable from here: it is not in your Vercel team, and the client bundle cannot be fetched from this chat. So this section separates what the live site shows from what is inferred. Phase 0 closes the gap.

**Observed on the live page (15 Oct 2026)**

- Promise: snap a problem on your street, tell the AI how to fix it, watch a tiny crew do the job, find fixes near you.
- Full-screen map, counter “0/0 fixes found”, buttons “Demo walk”, “My GPS”, a sound toggle, primary action “+ Fix something”.
- Movement hint: “Tap the map to walk there · drag the blue dot”.
- Next.js (font size-adjust meta), theme colour `#facc15` (Tailwind yellow-400), `viewport-fit=cover` for edge-to-edge phones.

**Inferred (Phase 0 confirms or corrects)**

- A fix is a geotagged record: before photo, instruction, AI after-image, crew animation.
- Discovery is proximity-based: a fix reveals when the blue dot comes within a radius; the counter tracks found / total.
- Three position sources: a simulated demo walk along a path, tap or drag to teleport, real GPS.
- The crew is either a client-side sprite animation over a before-to-after reveal, or a generated video clip.

**Phase 0 recon task (30-minute cap).** Open the site in Chrome DevTools and record in `FINDINGS.md`: map library and tile host; the API route hit by “+ Fix something”; AI provider domains in network traffic; whether the crew is video or DOM/canvas; the discovery radius if visible in the bundle. Do not copy code, sprites, sounds or the name. If a finding contradicts the build spec below, stop and escalate. Otherwise proceed: the Berlin build does not depend on their internals.

## Build spec

One Next.js app, one database, one AI call chain, zero per-fix animation cost. Every layer uses an account you already have or needs no key.

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js App Router, TypeScript, Tailwind | Same shape as the original; deploys to your existing Vercel team |
| Map | MapLibre GL JS + OpenFreeMap vector tiles | No API key, no billing |
| Data | Supabase Postgres + Storage bucket `fix-images` (public read) | Already connected |
| Prompt writer | Claude Haiku 5.5 (`claude-haiku-5-5`) | Turns loose words into a precise edit instruction; cheap and fast per fix |
| Image edit | One adapter; provider pinned in Phase 0 | Must take a base photo plus at least one reference image and leave unedited regions untouched |
| Crew | Client-side sprites + mask reveal + WebAudio | Deterministic, free, works on weak connections; video is a later option |
| Discovery | Haversine distance, reveal radius 35 m, found IDs in `localStorage` | No login needed |

**Image-edit provider rule.** Default candidate: Google's current Gemini image-edit model (the “Nano Banana” line). Fallback: OpenAI's current image-edit model. Phase 0 runs the same test edit on both and pins the exact model ID from the provider's docs that day. Never hard-code a model ID from memory.

**Data model**

```sql
create table fixes (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  heading_deg smallint,          -- camera direction of the before photo
  title text not null,
  instruction text not null,     -- what the person asked for
  edit_prompt text not null,     -- what the image model received
  before_url text not null,
  after_url text not null,
  is_seed boolean not null default false,
  status text not null default 'live' check (status in ('pending','live','hidden')),
  created_at timestamptz not null default now()
);
alter table fixes enable row level security;
create policy "public read live" on fixes for select using (status = 'live');

create table fix_requests (ip_hash text not null, created_at timestamptz not null default now());
```

Writes happen only server-side with the service-role key. `fix_requests` enforces 5 new fixes per IP per day.

**Request flow for “+ Fix something”**

1. Camera capture via `<input type="file" accept="image/*" capture="environment">`; attach GPS position and compass heading if available.
2. Client downsizes to 1536 px long edge, JPEG quality 0.85, posts photo + instruction to `POST /api/fix`.
3. Server checks the rate limit, stores the before photo, asks Haiku for the edit prompt (template in the Berlin section), calls the image adapter, stores the after-image, inserts the row.
4. Client plays the crew reveal, then pins the fix on the map.
5. `GET /api/fixes?bbox=` returns live fixes in view. Timeout for the whole chain: 60 s, with a clear retry message.

**File tree**

```
app/page.tsx                 map shell, HUD, counter
app/api/fixes/route.ts       GET live fixes in bbox
app/api/fix/route.ts         POST new fix
components/MapView.tsx       MapLibre, markers, blue dot
components/WalkerControls.tsx  demo walk, GPS, tap-to-walk, drag
components/FixSheet.tsx      before/after viewer
components/CrewReveal.tsx    crew sprites, mask reveal, sound
components/FixComposer.tsx   snap, instruction, submit
lib/geo.ts                   haversine, path interpolation
lib/walk.ts                  demo route, speed
lib/ai/promptWriter.ts       Haiku call
lib/ai/imageEdit.ts          provider adapter, one interface
lib/supabase.ts
public/crew/                 own SVG sprites
scripts/generate-seeds.ts    renders Berlin candidates
scripts/seed.ts              inserts approved seeds
seeds/berlin.json            viewpoints, prompts, reference list
seeds/refs/LICENSES.md       source + licence per reference image
```

**Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `IMAGE_PROVIDER`, `IMAGE_MODEL`, `IMAGE_API_KEY`.

## Rules for the Sonnet executor

Sonnet follows the plan literally and escalates instead of improvising. These eight rules make that enforceable.

1. Read the whole plan before the first command. Work one phase at a time; pass its gate before starting the next.
2. Never change a decision in the build spec or a fact in the Berlin section. If one is wrong or impossible, write it to `QUESTIONS.md` with the evidence, then stop.
3. Dependencies are capped: `next`, `react`, `typescript`, `tailwindcss`, `maplibre-gl`, `@supabase/supabase-js`, `@anthropic-ai/sdk`, plus the one image SDK pinned in Phase 0. Anything else goes to `QUESTIONS.md` first.
4. Every phase ends with a clean `npm run build` and `npm run lint`, a Vercel preview deploy, and a short entry in `PROGRESS.md`: what shipped, the preview URL, what is untested.
5. Secrets live only in Vercel env vars and `.env.local`. Add `.env.local` to `.gitignore` before the first commit.
6. Test every phase at 390 × 844 (phone viewport). The original is mobile-first; so is this.
7. Read fixlings.vercel.app, never copy from it: no code, sprites, sounds or name in the repo.
8. Commit after each gate with the message `phase N: <gate passed>`.

## Phases and gates

Seven phases, each ending in a working preview deploy. Kept as a numbered list on purpose: Sonnet reads this file as Markdown, and a list survives the export.

0. **Recon and keys.** Fill `FINDINGS.md` (see What Fixlings is). Confirm the OpenFreeMap style URL loads in MapLibre. Run one test edit per image provider: a current Berlin street photo plus one reference image. Pin `IMAGE_PROVIDER` and `IMAGE_MODEL` from the winner's docs.
   - Gate: `FINDINGS.md` complete; both test edits saved; provider choice and reason written down.
1. **Map shell.** Full-screen MapLibre map centred on Schlossplatz at zoom 16. HUD: counter, Demo walk, My GPS, sound toggle, “+ Fix something”. Blue dot draggable; tap-to-walk animates the dot at 1.4 m/s.
   - Gate: the dot moves by tap, drag and GPS on a phone viewport, with no visible jank.
2. **Fixes and discovery.** Create the tables, policy and bucket in Supabase (via the Supabase connector or SQL). Build `GET /api/fixes`. Markers stay hidden until the dot is within 35 m, then pop with a sound; counter shows n/N; found IDs persist in `localStorage`.
   - Gate: three placeholder fixes are discovered in order by a test walk.
3. **Crew reveal.** `CrewReveal` plays a 7-second sequence: crew walks in (1 s), scaffolding rises (1.5 s), a left-to-right mask wipes before into after (3.5 s), crew waves out (1 s). Tap skips; a replay button repeats. `prefers-reduced-motion` gets a plain crossfade.
   - Gate: plays cleanly at 390 px wide; skip and replay both work.
4. **Make a fix.** `FixComposer` and `POST /api/fix` end to end, with the rate limit and error states: no GPS, model refusal, 60 s timeout.
   - Gate: a photo taken on a phone becomes a live fix within 60 s.
5. **Berlin seeds.** You shoot the three before photos at the viewpoints in the Berlin section (daylight, phone held level, 1x lens). Sonnet sources the public-domain references, then `generate-seeds.ts` renders three candidates per fix. You pick one per fix or reject all; rejected fixes get re-rendered with your notes.
   - Gate: your written approval of all three in `PROGRESS.md`; `seed.ts` inserts them with `is_seed = true`.
6. **Live demo.** Load the demo route from the Demo walk section, deploy to production, rehearse once on a phone.
   - Gate: one tap on Demo walk discovers all three fixes in order and every reveal plays.

## The three Berlin fixes

Accuracy comes from pictures, not adjectives. Each prompt states only facts verified below; every visual detail — storeys, windows, gables, colours — comes from public-domain reference images attached to the edit call. An image model asked to “imagine” a lost building invents one; asked to copy a reference, it mostly copies.

**Reference rule for Sonnet.** Use only images on Wikimedia Commons with a public-domain tag (e.g. photos taken before 1926, or creators dead for 70+ years). Log URL, author, date and licence for each in `seeds/refs/LICENSES.md`. Attach 2–4 references per fix. If fewer than two qualify, stop and escalate.

### Fix 1 — the Apothekenflügel returns

**What stood there.** A Renaissance wing built from 1585 for Elector Johann Georg, attributed to Rochus Graf zu Lynar, home of the court pharmacy. It ran along the Spree from the palace toward the Lustgarten. At the end of the 19th century it was shortened for the new Kaiser-Wilhelm-Straße and its bridge — today Karl-Liebknecht-Straße and the Liebknechtbrücke — and its new end was closed with a historicist Renaissance front. It was blown up in September 1950, the first part of the palace to go, and was left out of the 2013–2020 reconstruction.

**State to show:** the shortened wing, c. 1900–1945. The full-length wing would stand in today's Karl-Liebknecht-Straße; only the shortened one fits the city as it is.

**Viewpoint:** Liebknechtbrücke, south railing, looking upstream toward the north-east corner of the Humboldt Forum — the angle of the c. 1900 postcards taken from the Kaiser-Wilhelm-Brücke.

**References:** pre-1945 photographs and postcards of the Apothekenflügel, ideally from the same bridge; Rudolf Dührkoop's c. 1908 photograph if it is on Commons.

```text
Edit the base photo, taken on the Liebknechtbrücke in Berlin looking upstream toward the Humboldt Forum.
On the west bank of the Spree, between the bridge approach and the north-east corner of the palace,
add the historic Apothekenflügel of the Berlin Palace exactly as it appears in the reference images,
in its shortened state of about 1900 to 1945: a Renaissance wing along the river with gabled dormers,
its street end closed by a historicist Renaissance front.
Copy storeys, window rhythm, roof shape, gables and wall colour from the references. Do not invent details.
Keep everything else unchanged: palace, river, bridge, cathedral, trees, sky, people, vehicles.
Match the base photo's light, shadows, perspective and lens. Photorealistic. No text, no watermark.
```

### Fix 2 — the Spree front replaces the modern east facade

**What stands there today.** Franco Stella's east facade, a modern design in the spirit of Italian Razionalismo. The reconstruction restored the baroque fronts on the other three sides, not this one.

**What stood there.** The palace's oldest side: remains of the castle founded in 1443 under Elector Friedrich II, Renaissance additions of the 16th century, the Grüner Hut tower with its green roof, and an irregular cluster of wings at the water's edge. It came down with the rest of the palace in 1950–51.

**State to show:** c. 1900–1939, consistent with Fix 1.

**Viewpoint:** Rathausbrücke (the historical Kurfürstenbrücke), looking downstream along the palace's east side — the view in many pre-war photographs.

**References:** pre-1945 photographs of the Spree side, ideally from the Kurfürstenbrücke.

```text
Edit the base photo, taken on the Rathausbrücke in Berlin looking downstream along the Spree.
Replace the modern east facade of the Humboldt Forum with the historic Spree side of the Berlin Palace
exactly as it appears in the reference images, in its state of about 1900 to 1939:
the irregular group of late-medieval and Renaissance wings at the water's edge,
including the Grüner Hut tower with its green roof.
Copy masses, heights, rooflines, gables, windows and wall colours from the references.
Do not invent details and do not make the group symmetrical.
Keep everything outside the east facade unchanged, including the baroque facades, river, bridge, sky and people.
Match the base photo's light, shadows, perspective and lens. Photorealistic. No text, no watermark.
```

### Fix 3 — Schinkel's Bauakademie reappears

**What stood there.** Karl Friedrich Schinkel's building academy, built 1832–1836 under Emil Flaminius: a near-square block on a grid of eight bays per side at 5.55 m, in red unplastered brick with terracotta ornament. The main entrance faced the triangular Schinkelplatz to the north. Burned out in February 1945, partly rebuilt, then demolished in 1962 for the GDR foreign ministry, itself removed in 1995–96.

**What stands there today.** An empty plot with the north-east sample corner rebuilt in brick and terracotta in 2001–02, plus temporary installations. In January 2026 the Berlin Senate, the Bundesstiftung Bauakademie and the federal government agreed to rebuild the historical facades; there is no construction yet.

**State to show:** the building as completed in 1836, all four facades. The real sample corner becomes part of it — no second corner, no seam.

**Viewpoint:** north edge of Schinkelplatz, looking south at the entrance front, with the sample corner on the left.

**References:** Eduard Gaertner's painting *Die Bauakademie* (1868) and pre-1945 photographs of the entrance front.

```text
Edit the base photo, taken on Schinkelplatz in Berlin looking south at the empty Bauakademie plot.
Replace the empty plot, fences and temporary installations with Karl Friedrich Schinkel's Bauakademie
exactly as it appears in the reference images: a near-square block of red unplastered brick
with terracotta ornament, eight window bays per facade, the main entrance front facing this square.
The existing reconstructed brick corner on the left is part of the building: extend from it seamlessly,
matching its brick colour, bond, terracotta and cornice. Do not add a second corner.
Copy storeys, window shapes, portals and ornament from the references. Do not invent details.
Keep the Schinkel statue, square, trees, neighbouring buildings, sky and people unchanged.
Match the base photo's light, shadows, perspective and lens. Photorealistic. No text, no watermark.
```

### Prompt-writer template for everyday fixes

Haiku gets this as its system prompt and the person's words as the message. It returns JSON only.

```text
You turn a person's request about a street photo into an instruction for an image-edit model.
Return JSON only: {"edit": string, "preserve": string, "refuse": boolean, "reason": string}.
"edit" names only what changes, in concrete visual terms: object, material, colour, position in the frame.
"preserve" always lists: camera position, perspective, light, weather, every unchanged object, all people.
Set "refuse" to true for requests that alter or add identifiable people, add sexual or violent content,
or add text, logos or slogans. Keep "edit" under 60 words.
```

## Demo walk and live script

The demo is one lap around the Schloss: the walk circles the building it restores, and each fix waits where its viewpoint stands. Roughly 1.1 km, about 80 seconds at 10× walking speed, plus a pause for each reveal.

**Route waypoints, in order**

1. Lustgarten, centre of the lawn (start; nothing in range)
2. Liebknechtbrücke, south railing midpoint — **Fix 1, Apothekenflügel**
3. East end of the Liebknechtbrücke, then south along the east-bank Spree promenade
4. Rathausbrücke, midpoint — **Fix 2, Spree front**
5. West end of the Rathausbrücke, then west along Schlossplatz past the palace's south front
6. Schleusenbrücke over the Spreekanal
7. Schinkelplatz, north edge — **Fix 3, Bauakademie** (end)

**Coordinates: geocode, never guess.** Sonnet resolves every waypoint with OpenStreetMap Nominatim, then checks each on the map by eye. All points must fall inside lat 52.513–52.521, lng 13.395–13.408; any point outside means a wrong match. Each fix is pinned at the spot where its before photo was taken, using the phone's GPS from that photo, not the geocode.

**Walk behaviour.** The dot moves along the polyline at 14 m/s (10× of 1.4 m/s). When it enters a fix's 35 m radius it stops, the reveal plays, and the walk resumes after the crew waves out. Any tap on the map hands control back to the user.

**Live script (about three minutes)**

1. Production URL on a phone, sound on, counter at 0/3.
2. Tap Demo walk. The dot leaves the Lustgarten for the bridge.
3. Liebknechtbrücke: the crew raises the Apothekenflügel beside the palace. 1/3.
4. Down the east bank to the Rathausbrücke: the modern east facade gives way to the Spree front and the Grüner Hut. 2/3.
5. Across Schlossplatz and the Schleusenbrücke to Schinkelplatz: the Bauakademie grows out of its sample corner. 3/3.
6. Close by tapping “+ Fix something” on a fresh photo, to show the mechanic is real, not canned.

## Decisions, risks, open questions

The biggest risk is a confidently wrong building, so the plan puts a human gate exactly there. Everything else is ordinary engineering.

**Decisions taken here (Sonnet does not revisit)**

- Apothekenflügel in its shortened c. 1900–1945 state, because it fits today's street grid.
- Spree front in its last pre-war state, matching Fix 1.
- Bauakademie grown from the real 2001–02 sample corner, not placed beside it.
- Crew animation runs client-side; no video model in v1.
- Prompts carry verified facts only; visual detail comes from public-domain references.
- Coordinates come from geocoding and photo GPS, never from memory. The route must pass within 20 m of each fix pin; Sonnet checks this in Phase 6.

| Risk | Mitigation |
| --- | --- |
| Image model invents architecture | 2–4 references per fix, 3 candidates each, your approval before seeding |
| Model IDs and prices change | Phase 0 pins them from provider docs on the day |
| “Fixlings” is someone else's name and look | Own name, own sprites and sounds before any public link |
| Abuse of open fix creation | Haiku refusal step, 5 fixes per IP per day, `pending` status if opened beyond friends |
| Reference licensing | Public domain only, logged in `LICENSES.md` |

**Open questions (yours, one line each)**

- Public name for the Berlin app.
- Do new fixes from other people go live instantly, or wait for your approval?

**Sources**

- [Fixlings live site](https://fixlings.vercel.app/)
- [Berliner Kunstkammer — the Apothekenflügel and its shortening](https://berlinerkunstkammer.de/standorte)
- [Förderverein Berliner Schloss — building history](https://berliner-schloss.de/das-historische-schloss/baugeschichte/)
- [Van Ham — Albert Schwendy, view of the Schloss-Apotheke](https://www.van-ham.com/de/kuenstler/albert-schwendy/albert-schwendy-berlin.html)
- [FU Berlin (Refubium) — Lynar, 1950 demolition sequence](https://refubium.fu-berlin.de/bitstream/handle/fub188/6606/2_Kapitel2_kl.pdf?sequence=3&isAllowed=y)
- [Berliner Zeitung — the 1950 demolition](https://www.berliner-zeitung.de/article/102708)
- [arthistoricum — Grüner Hut seen from the Kurfürstenbrücke](https://www.arthistoricum.net/en/werkansicht/dlf/73335/57)
- [Stuttgarter Zeitung — Stella's east facade](https://www.stuttgarter-zeitung.de/kultur/berliner-schloss-steht-vor-der-eroeffnung-preussens-gloria-ist-wieder-da-78888420.html)
- [Wikipedia — Berliner Bauakademie](https://de.wikipedia.org/wiki/Berliner_Bauakademie)
- [berlin.de — Schinkelplatz and the north entrance](https://berlin.de/kunst-und-kultur-mitte/geschichte/erinnerungskultur/gedenktafel-datenbank/id-1120_schinkelplatz.pdf)
- [BauNetz — Senate decision on historical facades, Jan 2026](https://www.baunetz.de/meldungen/Meldungen-Senatsbeschluss_zum_Wiederaufbau_der_Bauakademie_in_Berlin_10215021.html)
- [Entwicklungsstadt — plot still empty, interim installation](https://www.entwicklungsstadt.de/bauakademie-am-schinkelplatz-gruene-zwischennutzung-auf-leerem-grundstueck/)
