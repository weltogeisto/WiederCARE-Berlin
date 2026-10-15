# Image sources and licences

Every image in this repo, with who made it, when, and under what terms. Images keep the rights named here; there is no blanket licence. Where a licence is CC BY-SA, keep the credit and the licence link when you reuse the image.

Provenance: the ten images came in the package `Berlin_Rekonstruktion_Vorher_Nachher` (15 Oct 2026). Its `asset_manifest.json` lists the SHA-256 of each original, and all ten matched when they were unpacked. The originals are not stored here; these are web-sized copies.

## Status

- **The three AI after-images are approved by the owner (2026-10-15),** recorded in `PROGRESS.md` as `CLAUDE.md` rule 8 requires. Approval covers the images only; the reference-rule question below is still open.
- **Share-alike:** the Apothekenflügel AI vision is an adaptation of a CC BY-SA 3.0 DE photograph, so it is shared under CC BY-SA 3.0 DE with the credit shown in the app.
- **Reference rule (`CLAUDE.md` rule 7):** public-domain references only, and fewer than two per fix means escalate. Each fix has **one** public-domain reference. Fix 1 also has a CC BY-SA reference. This is raised in `QUESTIONS.md`.
- The before photos are third-party photographs from 2021 to 2023, not the owner's own shots. Camera positions differ from the pins and from the archive views, so the images are shown one above the other, never as a registered slider.
- Not checked against building surveys: colours, materials and fine details of the AI visions are interpreted.

## Shipped images (served by the app from `public/media/`)

### `public/media/apothekenfluegel-before.jpg`

- Role: Fix 1, today
- Credit: Frank Liebig
- Date: 2021-10-04
- Licence: https://creativecommons.org/licenses/by-sa/3.0/
- Source: <https://commons.wikimedia.org/wiki/File:Humboldt-Forum_(Ost%2BNord).jpg>
- Changes in the package: Original photograph; renamed only.
- Original in the package: `01_Vorher_Standort_Nordostecke_Foto_2021-10-04.jpg` (SHA-256 `18a943096868f8173e067e97be8f73618643398d46cae122b145ad5123f33b7f`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `public/media/apothekenfluegel-after.jpg`

- Role: Fix 1, AI vision
- Credit: AI adaptation after Bundesarchiv / August Rumbucher
- Date: 2026-10-15
- Licence: https://creativecommons.org/licenses/by-sa/3.0/de/
- Source: <https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_146-1998-014-21A,_Berlin,_Stadtschloss,_Apotheken-Fl%C3%BCgel.jpg>
- Changes in the package: AI colour restoration and interpretation; altered surfaces, vegetation and pedestrians; architectural details not survey-verified. Supporting reference: Schlossapotheke Zeno postcard.
- Original in the package: `02_Nachher_Apothekenfluegel_KI_Rekonstruktionsvision.png` (SHA-256 `71a79d0c05e8859455ab0d49608aafa44dda967075bdeca2984cfb94b738d5ae`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `public/media/spreefront-before.jpg`

- Role: Fix 2, today
- Credit: ArildV
- Date: 2023-06-25
- Licence: https://creativecommons.org/licenses/by-sa/4.0/
- Source: <https://commons.wikimedia.org/wiki/File:Humboldt_Forum_and_Berlin_Cathedral_June_2023_01.jpg>
- Changes in the package: Original photograph; renamed only.
- Original in the package: `01_Vorher_Schloss_Moderne_Ostfassade_Foto_2023-06-25.jpg` (SHA-256 `cb5a80fe68ccfb4329a1ffaf17022879ea0f5ad61bdc214d5ea7cb3863e13515`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `public/media/spreefront-after.jpg`

- Role: Fix 2, AI vision
- Credit: AI adaptation after Bain News Service / Library of Congress
- Date: 2026-10-15
- Licence: Underlying archival photograph: public domain / no known restrictions
- Source: <https://commons.wikimedia.org/wiki/File:Rear_of_Imperial_Castle,_Berlin_LCCN2014716618.jpg>
- Changes in the package: AI colour restoration and interpretation of the archival view; image shows a partial historic elevation, not a surveyed full-facade reconstruction.
- Original in the package: `02_Nachher_Schloss_Historische_Spreefront_KI_Rekonstruktionsvision.png` (SHA-256 `95c8ed4ed4dd0460745c49dae54c220b9933ec44163ee5a8e0fa9d7876b947bb`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `public/media/bauakademie-before.jpg`

- Role: Fix 3, today
- Credit: Fridolin freudenfett
- Date: 2022-05-07
- Licence: https://creativecommons.org/licenses/by-sa/4.0/
- Source: <https://commons.wikimedia.org/wiki/File:Mitte_Schinkelplatz_Bauakademie.jpg>
- Changes in the package: Original photograph; renamed only.
- Original in the package: `01_Vorher_Bauakademie_Musterfassade_Standort_Foto_2022-05-07.jpg` (SHA-256 `cdfeff6cde11a9cdef310a07252c3fc10505abb93060c4047731fef9280f11f4`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `public/media/bauakademie-after.jpg`

- Role: Fix 3, AI vision
- Credit: AI adaptation after Königlich Preußische Messbildanstalt
- Date: 2026-10-15
- Licence: Underlying archival photograph: public domain
- Source: <https://commons.wikimedia.org/wiki/File:M_Bauakademie_Berlin_1888.jpg>
- Changes in the package: AI colour restoration and interpretation; facade geometry based on historical photograph, fine detail not survey-verified.
- Original in the package: `02_Nachher_Schinkelsche_Bauakademie_KI_Rekonstruktionsvision.png` (SHA-256 `af0213d44ce16ac9a902e473037079f05fab59e9dd4c1599f96a0b37a29d1090`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

## Reference images (`seeds/refs/`, inputs to the visions, not served by the app)

### `seeds/refs/apothekenfluegel-1-bundesarchiv-1928.jpg`

- Role: Fix 1
- Credit: Bundesarchiv, Bild 146-1998-014-21A / Rumbucher [junior], August
- Date: before 1929; Commons metadata: 1928
- Licence: https://creativecommons.org/licenses/by-sa/3.0/de/
- Source: <https://commons.wikimedia.org/wiki/File:Bundesarchiv_Bild_146-1998-014-21A,_Berlin,_Stadtschloss,_Apotheken-Fl%C3%BCgel.jpg>
- Public domain: no: CC BY-SA 3.0 DE
- Changes in the package: Original photograph; renamed only.
- Original in the package: `03_Referenz_Apothekenfluegel_Bundesarchiv_vor_1929.jpg` (SHA-256 `3d797499bd12d4468e75e9f6731e80c933cc168f1627534274284ed3886d62c1`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `seeds/refs/apothekenfluegel-2-zeno-postcard.jpg`

- Role: Fix 1
- Credit: Ludwig Walter, Berlin / Zeno.org; print credits photographer E. Schuh
- Date: circa 1900 according to Commons; postcard date uncertain
- Licence: Public domain
- Source: <https://commons.wikimedia.org/wiki/File:Berlin,_Mitte,_Berlin_-_Schlossapotheke_(Zeno_Ansichtskarten).jpg>
- Public domain: yes
- Changes in the package: Original postcard scan; renamed only.
- Original in the package: `04_Referenz_Schlossapotheke_Schraegansicht_Zeno.jpg` (SHA-256 `4e3f422ab8d140d512803889fcdb09c02b3a4ad173a44e17ed2551ac9baeb620`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `seeds/refs/spreefront-1-library-of-congress.jpg`

- Role: Fix 2
- Credit: Bain News Service, publisher / Library of Congress, ggbain.36469, LCCN 2014716618
- Date: Commons lists 1900; source caption data unverified
- Licence: Public domain / no known restrictions
- Source: <https://commons.wikimedia.org/wiki/File:Rear_of_Imperial_Castle,_Berlin_LCCN2014716618.jpg>
- Public domain: yes
- Changes in the package: Original archival scan; renamed only.
- Original in the package: `03_Referenz_Schloss_Spreefront_Library_of_Congress.jpg` (SHA-256 `7579068f48f7a1a17412e42be717820561aac62ff78060552d4182380e3d336f`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

### `seeds/refs/bauakademie-1-messbild.jpg`

- Role: Fix 3
- Credit: Königlich Preußische Messbildanstalt
- Date: Unresolved: filename says 1888; Commons description dates image to 1911
- Licence: Public domain
- Source: <https://commons.wikimedia.org/wiki/File:M_Bauakademie_Berlin_1888.jpg>
- Public domain: yes
- Changes in the package: Original photograph; renamed only.
- Original in the package: `03_Referenz_Bauakademie_Historische_Messbildaufnahme.jpg` (SHA-256 `a60e29c73bfb2a601bcdd01600b6be3f680b761438140e82cd9139ffbd4d1794`)
- Changes for this repo: resized to at most 1600 px on the long edge, metadata stripped, re-encoded as JPEG (PNGs flattened onto white).

## Date notes

- Bundesarchiv photo: "before 1929"; Commons metadata says 1928.
- Zeno postcard: circa 1900 according to Commons; the postcard date is uncertain.
- Library of Congress photo: Commons lists 1900; the source caption data is unverified.
- Messbild photo of the Bauakademie: unresolved. The Commons file name says 1888, its description says 1911.
