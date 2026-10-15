import { asset } from "@/lib/assets";

// Who made an image and under what terms it may be shown. Mirrors seeds/refs/LICENSES.md.
export type Credit = {
  label: string; // what the image is, e.g. "Photo, 4 Oct 2021"
  author: string;
  license: string;
  licenseUrl?: string;
  source: string; // page the image came from
};

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
  beforeCredit?: Credit;
  afterCredit?: Credit;
  aiAfter?: boolean; // the after image is an AI reconstruction vision, shown with a label
};

// Pins sit at the viewpoints. Coordinates come from published bridge and plot coordinates
// (Liebknechtbrücke 52°31'7.52"N 13°24'8.31"E, Rathausbrücke 52°31'2"N 13°24'15"E,
// Schinkelplatz 52°30'59.78"N 13°23'54.95"E). Phase 5 replaces them with the GPS of the real before photos.
//
// The before photos are dated 2021 to 2023 and come from Wikimedia Commons. The after images are AI
// reconstruction visions made from archive photographs. The two do not share a camera position, so the
// sheet shows them one above the other and never as a registered slider. The after images have NOT been
// approved yet (see PROGRESS.md): do not ship them to main before that.
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
    before: asset("/media/apothekenfluegel-before.jpg"),
    after: asset("/media/apothekenfluegel-after.jpg"),
    beforeCredit: {
      label: "Photo, 4 Oct 2021",
      author: "Frank Liebig",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source: "https://commons.wikimedia.org/wiki/File:Humboldt-Forum_(Ost%2BNord).jpg",
    },
    afterCredit: {
      label: "AI vision after an archive photo",
      author: "Bundesarchiv, Bild 146-1998-014-21A (August Rumbucher)",
      license: "CC BY-SA 3.0 DE",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/de/",
      source:
        "https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_146-1998-014-21A,_Berlin,_Stadtschloss,_Apotheken-Fl%C3%BCgel.jpg",
    },
    aiAfter: true,
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
    before: asset("/media/spreefront-before.jpg"),
    after: asset("/media/spreefront-after.jpg"),
    beforeCredit: {
      label: "Photo, 25 Jun 2023",
      author: "ArildV",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Humboldt_Forum_and_Berlin_Cathedral_June_2023_01.jpg",
    },
    afterCredit: {
      label: "AI vision after an archive photo",
      author: "Bain News Service, Library of Congress (LCCN 2014716618)",
      license: "source photograph in the public domain",
      source: "https://commons.wikimedia.org/wiki/File:Rear_of_Imperial_Castle,_Berlin_LCCN2014716618.jpg",
    },
    aiAfter: true,
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
    before: asset("/media/bauakademie-before.jpg"),
    after: asset("/media/bauakademie-after.jpg"),
    beforeCredit: {
      label: "Photo, 7 May 2022",
      author: "Fridolin freudenfett",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Mitte_Schinkelplatz_Bauakademie.jpg",
    },
    afterCredit: {
      label: "AI vision after an archive photo",
      author: "Königlich Preußische Messbildanstalt",
      license: "source photograph in the public domain",
      source: "https://commons.wikimedia.org/wiki/File:M_Bauakademie_Berlin_1888.jpg",
    },
    aiAfter: true,
  },
];
