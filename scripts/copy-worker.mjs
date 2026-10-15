// MapLibre 6 resolves its worker from import.meta.url, which Turbopack rewrites to a non-http URL.
// Serve the worker from /public instead and point MapLibre at it with setWorkerUrl (see MapView.tsx).
// Copying from node_modules keeps the worker on the same version as the library.
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const from = fileURLToPath(new URL("../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url));
const dir = fileURLToPath(new URL("../public/", import.meta.url));
mkdirSync(dir, { recursive: true });
copyFileSync(from, dir + "maplibre-gl-worker.mjs");
