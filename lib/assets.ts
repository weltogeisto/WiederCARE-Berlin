export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "/WiederCARE-Berlin";
export const REPOSITORY = process.env.NEXT_PUBLIC_REPOSITORY || "weltogeisto/WiederCARE-Berlin";
export function asset(path: string) { return `${BASE}/${path.replace(/^\//, "")}`; }
