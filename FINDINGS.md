# Findings: fixlings.vercel.app (read 2026-10-15)

Observed from the served HTML only (the client bundle was not readable from this environment):

- Next.js app, theme colour #facc15, viewport-fit=cover.
- Copy: "Snap a problem on your street, tell the AI how to fix it, and watch a tiny crew do the job. Find fixes near you."
- UI: "Loading map…", counter "0/0 fixes found", buttons "Demo walk", "My GPS", a sound toggle, "Tap the map to walk there · drag the blue dot", "+ Fix something".

Still open (needs a browser with DevTools): map library and tile host, the API route behind "+ Fix something", AI provider domains, whether the crew is video or DOM/canvas, discovery radius.
Nothing from that site is copied into this repo.
