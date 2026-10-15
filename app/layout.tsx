import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Wiedersehen Berlin · Eine Stadt. Zwei Zeiten.",
  description: "Ein Spaziergang um das Berliner Schloss. Drei verlorene Bauwerke, echte Archivbilder und eine kleine Crew, die Geschichte sichtbar macht. Kostenlos, ohne Konto.",
  icons: { icon: "/wiedersehen-berlin/favicon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f5f1e8" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
