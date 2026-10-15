export const BASE = "/WiederCARE";
export function asset(path: string) { return `${BASE}/${path.replace(/^\//, "")}`; }
