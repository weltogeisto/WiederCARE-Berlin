export type LngLat = [number, number];
export type Path = { pts: LngLat[]; cum: number[]; total: number };

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function haversine(a: LngLat, b: LngLat): number {
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function makePath(pts: LngLat[]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + haversine(pts[i - 1], pts[i]));
  return { pts, cum, total: cum[cum.length - 1] };
}

export function pointAt(p: Path, d: number): LngLat {
  if (p.pts.length === 1 || d <= 0) return p.pts[0];
  if (d >= p.total) return p.pts[p.pts.length - 1];
  let i = 1;
  while (p.cum[i] < d) i++;
  const seg = p.cum[i] - p.cum[i - 1] || 1;
  const t = (d - p.cum[i - 1]) / seg;
  const a = p.pts[i - 1];
  const b = p.pts[i];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
