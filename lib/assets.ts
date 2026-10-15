export const BASE = "/wiedersehen-berlin";
export function asset(path: string) { return `${BASE}/${path.replace(/^\//, "")}`; }
