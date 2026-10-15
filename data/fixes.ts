export type Fix = {
  id: string;
  title: string;
  where: string;
  period: string;
  lat: number;
  lng: number;
  story: string;
  today: string;
  before: string; // image URL, or "plate:<key>" for a built-in stand-in illustration
  after: string;
};

// Pins sit at the viewpoints. Coordinates come from published bridge and plot coordinates
// (Liebknechtbrücke 52°31'7.52"N 13°24'8.31"E, Rathausbrücke 52°31'2"N 13°24'15"E,
// Schinkelplatz 52°30'59.78"N 13°23'54.95"E). Phase 5 replaces them with the GPS of the real before photos.
export const FIXES: Fix[] = [
  {
    id: "apothekenfluegel",
    title: "The Apothekenflügel returns",
    where: "Liebknechtbrücke",
    period: "1585 – 1950",
    lat: 52.51876,
    lng: 13.40231,
    story:
      "Built from 1585 for Elector Johann Georg, this Renaissance wing housed the court pharmacy beside the Lustgarten. It was shortened around 1890 to make room for Kaiser-Wilhelm-Straße and blown up in September 1950.",
    today: "It is not part of the reconstructed palace.",
    before: "plate:f1-before",
    after: "plate:f1-after",
  },
  {
    id: "spreefront",
    title: "The Spree front returns",
    where: "Rathausbrücke",
    period: "1443 – 1951",
    lat: 52.51722,
    lng: 13.40417,
    story:
      "The palace's oldest side: castle remains from the 1440s, Renaissance wings and the green-roofed Grüner Hut tower, all at the water's edge. The whole palace was demolished in 1950 and 1951.",
    today: "Today the east side shows Franco Stella's modern facade.",
    before: "plate:f2-before",
    after: "plate:f2-after",
  },
  {
    id: "bauakademie",
    title: "Schinkel's Bauakademie returns",
    where: "Schinkelplatz",
    period: "1836 – 1962",
    lat: 52.51661,
    lng: 13.39860,
    story:
      "Karl Friedrich Schinkel's red-brick academy stood here from 1836. It burned out in 1945 and was demolished in 1962.",
    today:
      "In January 2026 Berlin and the federal government agreed to rebuild its historical facades. Nothing is built yet.",
    before: "plate:f3-before",
    after: "plate:f3-after",
  },
];
