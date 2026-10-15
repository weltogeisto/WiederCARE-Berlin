# Berlin comparison image licenses

## Processing and use

- Except the three AI visions in the last section, the source images below are genuine Wikimedia Commons media, not generated images. `after` assets are archival comparisons, not AI restorations.
- The local `.webp` copies were resized to a maximum 1,400 px long edge and compressed for web delivery (each is under 500,000 bytes). No depicted content was added, removed, or retouched. EXIF was stripped; see `research/berlin-assets.json` for the source dates and unresolved metadata conflicts.
- Commons file pages were used as the license record. Public-domain labels below reflect each Commons file page; this is not a jurisdiction-specific legal opinion.
- Preserve attribution for CC BY / CC BY-SA assets. The `spreefront-before.webp` derivative remains CC BY-SA 4.0; the `bauakademie-before.webp` derivative remains CC BY 4.0. CC0 attribution is optional but retained here for provenance.

## Apothekenflügel

### Contemporary site photo
- Local: `public/media/apothekenfluegel-before.webp` — 1,400 × 878, 197,354 bytes.
- Source title: *Spree Liebknechtbrücke Berlin-Mitte 02.jpg*.
- Author: Singlespeedfahrer. Commons lists CC0; the image is released under CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/deed.en
- Source: https://commons.wikimedia.org/wiki/File:Spree_Liebknechtbr%C3%BCcke_Berlin-Mitte_02.jpg
- Date caveat: Commons DateTimeOriginal says 2021-12-22 13:37:57; embedded EXIF DateTime says 2023-10-31 18:23:17. Exact capture date unresolved; describe it as a contemporary Spree-side view, not as a verified 2021 or 2023 capture.

### Archival comparator
- Local: `public/media/apothekenfluegel-archive.webp` — 1,280 × 830, 120,470 bytes.
- Source title: *Berlin, Mitte, Berlin - Schlossapotheke (Zeno Ansichtskarten).jpg*.
- Author: Ludwig Walter, Berlin. Commons marks the circa-1900 postcard/photo public domain.
- Source: https://commons.wikimedia.org/wiki/File:Berlin,_Mitte,_Berlin_-_Schlossapotheke_(Zeno_Ansichtskarten).jpg

### Additional archival reference
- Local: `public/media/apothekenfluegel-archive-1905.webp` — 1,280 × 989, 274,372 bytes.
- Source title: *Max Missmann, Blick über die Kaiser-Wilhelm-Brücke auf das königliche Schloss, 1905.jpg*.
- Author: Max Missmann. Date: 1905. Commons marks it public domain.
- Source: https://commons.wikimedia.org/wiki/File:Max_Missmann,_Blick_%C3%BCber_die_Kaiser-Wilhelm-Br%C3%BCcke_auf_das_k%C3%B6nigliche_Schloss,_1905.jpg
- Use as a contextual bridge-angle view; do not treat the wide image as a close architectural record of the pharmacy wing.

## Schloss Spreefront / Grüner Hut

### Contemporary site photo
- Local: `public/media/spreefront-before.webp` — 1,280 × 960, 154,110 bytes.
- Source title: *2021-07-19 Humboldt Forum Berlin 08.jpg*.
- Author: Geoprofi Lars. Date: 2021-07-19 17:20:41 (Commons DateTimeOriginal).
- License: CC BY-SA 4.0. Attribute Geoprofi Lars, link the source and license, indicate the WebP resize/format conversion, and share this derivative under CC BY-SA 4.0.
- Source: https://commons.wikimedia.org/wiki/File:2021-07-19_Humboldt_Forum_Berlin_08.jpg

### Archival comparator
- Local: `public/media/spreefront-archive.webp` — 1,280 × 1,031, 495,910 bytes.
- Source title: *Berlin Schloss, Spreeseite (Max Missmann, 1903).jpg*.
- Author: Max Missmann. Date: 1903. Commons marks it public domain.
- Source: https://commons.wikimedia.org/wiki/File:Berlin_Schloss,_Spreeseite_(Max_Missmann,_1903).jpg

### Additional archival reference
- Local: `public/media/spreefront-archive-kurfuerstenbruecke.webp` — 1,053 × 1,400, 257,314 bytes.
- Source title: *Berlin Kurfuerstenbruecke 1900.jpg*.
- Author: unknown in Commons metadata. Date: circa 1900. Commons marks it public domain.
- Source: https://commons.wikimedia.org/wiki/File:Berlin_Kurfuerstenbruecke_1900.jpg

## Schinkel Bauakademie

### Contemporary site photo
- Local: `public/media/bauakademie-before.webp` — 1,111 × 1,400, 335,898 bytes.
- Source title: *Berlin-Schinkelsche Bauakademie-02-2022-gje.jpg*.
- Author: Gerd Eichmann. Date: 2022-04-21 18:45:50 (Commons DateTimeOriginal).
- License: CC BY 4.0. Attribute Gerd Eichmann, link the source and license, and indicate the WebP resize/format conversion.
- Source: https://commons.wikimedia.org/wiki/File:Berlin-Schinkelsche_Bauakademie-02-2022-gje.jpg

### Archival comparator photograph
- Local: `public/media/bauakademie-archive.webp` — 1,400 × 1,227, 324,304 bytes.
- Source title: *M Bauakademie Berlin 1888.jpg*.
- Author: Königlich Preußische Messbildanstalt. Commons DateTimeOriginal says 1911, while the filename contains “1888”; the exact capture date is therefore recorded as 1911 per file metadata, with the filename discrepancy disclosed.
- Commons marks it public domain.
- Source: https://commons.wikimedia.org/wiki/File:M_Bauakademie_Berlin_1888.jpg

### Additional period visual reference (painting, not a photograph)
- Local: `public/media/bauakademie-archive-gaertner.webp` — 1,280 × 1,011, 485,052 bytes.
- Source title: *Bauakademie Schinkel (Eduard Gaertner).jpg*.
- Author: Eduard Gaertner. Date: 1868. Commons marks it public domain.
- Source: https://commons.wikimedia.org/wiki/File:Bauakademie_Schinkel_(Eduard_Gaertner).jpg
- Label it as Gaertner's painting. It is a period visual depiction, not a photograph or an unmediated architectural survey.

## AI reconstruction visions (approved 15 Oct 2026)

These three images are AI adaptations of archival photographs, not photographs. They came in the image package `Berlin_Rekonstruktion_Vorher_Nachher` (15 Oct 2026), whose manifest SHA-256 values matched on unpacking. The project owner approved all three on 15 Oct 2026 for display as labelled AI visions. Colours, materials and fine details are interpreted, not verified against building surveys. The tool or model that made them is not recorded in the package.

Processing for this repo: PNG converted to WebP, resized to a maximum 1,400 px long edge, metadata dropped. Each file is under 500,000 bytes.

### Apothekenflügel
- Local: `public/media/apothekenfluegel-vision.webp` — 1,079 × 1,400, 319,472 bytes.
- Made from: *Bundesarchiv Bild 146-1998-014-21A, Berlin, Stadtschloss, Apotheken-Flügel*. Author: Bundesarchiv / August Rumbucher [junior]. Date: before 1929 (Commons metadata: 1928). Licence: CC BY-SA 3.0 DE.
- Source: https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_146-1998-014-21A,_Berlin,_Stadtschloss,_Apotheken-Fl%C3%BCgel.jpg
- Supporting reference: the Schlossapotheke Zeno postcard listed above (public domain).
- **Licence of the vision: CC BY-SA 3.0 DE** (an adaptation of a share-alike source). Credit: "AI adaptation after Bundesarchiv, Bild 146-1998-014-21A / August Rumbucher [junior]", https://creativecommons.org/licenses/by-sa/3.0/de/
- Original in the package: `02_Nachher_Apothekenfluegel_KI_Rekonstruktionsvision.png` (SHA-256 `71a79d0c05e8859455ab0d49608aafa44dda967075bdeca2984cfb94b738d5ae`).

### Schloss Spreefront
- Local: `public/media/spreefront-vision.webp` — 1,400 × 1,004, 356,184 bytes.
- Made from: *Rear of Imperial Castle, Berlin*. Author: Bain News Service, publisher / Library of Congress, ggbain.36469, LCCN 2014716618. Date: Commons lists 1900; the source caption data is unverified. Public domain / no known restrictions.
- Source: https://commons.wikimedia.org/wiki/File:Rear_of_Imperial_Castle,_Berlin_LCCN2014716618.jpg
- Shows a partial Spree-side view, not the Rathausbrücke angle and not the whole east side. No green-roofed tower (Grüner Hut) is visible; the owner approved it knowing this.
- Original in the package: `02_Nachher_Schloss_Historische_Spreefront_KI_Rekonstruktionsvision.png` (SHA-256 `95c8ed4ed4dd0460745c49dae54c220b9933ec44163ee5a8e0fa9d7876b947bb`).

### Schinkel Bauakademie
- Local: `public/media/bauakademie-vision.webp` — 1,340 × 1,174, 273,418 bytes.
- Made from: *M Bauakademie Berlin 1888.jpg*, the same Messbild photograph used above as the archival comparator (public domain; date 1888 or 1911, unresolved).
- Source: https://commons.wikimedia.org/wiki/File:M_Bauakademie_Berlin_1888.jpg
- Because the photograph's date is unresolved, the vision may show a later state than the building as completed in 1836.
- Original in the package: `02_Nachher_Schinkelsche_Bauakademie_KI_Rekonstruktionsvision.png` (SHA-256 `af0213d44ce16ac9a902e473037079f05fab59e9dd4c1599f96a0b37a29d1090`).
