import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { BASE } from "../lib/assets";
export const metadata: Metadata = {
  title: "Wiedersehen Berlin · Wie soll unsere Stadt aussehen?",
  description: "Berliner Stadtgestaltung öffentlich diskutieren: Standortfotos und KI-Visionen per Swipe vergleichen, historische Quellen prüfen und Architekturvorschläge unterstützen.",
  icons: { icon: `${BASE}/favicon.svg` },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f5f1e8" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
