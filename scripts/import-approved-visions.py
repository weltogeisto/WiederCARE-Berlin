#!/usr/bin/env python3
"""Create optimized derivatives and provenance manifest from the approved local ZIP extraction.

No network access. Originals are read-only and are never copied into the repository.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
from pathlib import Path

from PIL import Image, ImageOps

MAX_EDGE = 1536
MAX_BYTES = 500_000
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public/media/approved"
MANIFEST_PATH = Path(__file__).resolve().parents[1] / "research/approved-visions.json"

# Source filenames are relative to the supplied extraction root; no private path is stored.
DETAILS = {
    "01_Apothekenfluegel/01_Vorher_Standort_Nordostecke_Foto_2021-10-04.jpg": {
        "stop": "apotheke", "slot": "before", "output": "apotheke-before.webp",
        "title": "Standortfoto · 04.10.2021", "date": "04.10.2021",
        "dateNote": "2021-10-04",
        "kind": "photo",
        "license": "CC BY-SA 3.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    },
    "01_Apothekenfluegel/02_Nachher_Apothekenfluegel_KI_Rekonstruktionsvision.png": {
        "stop": "apotheke", "slot": "after", "output": "apotheke-vision.webp",
        "title": "KI-Rekonstruktionsvision · Apothekenflügel", "date": "15.10.2026",
        "dateNote": "2026-10-15",
        "kind": "ai_reconstruction",
        "license": "CC BY-SA 3.0 DE (KI-Adaption; Weitergabe unter gleichen Bedingungen)",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/",
    },
    "01_Apothekenfluegel/03_Referenz_Apothekenfluegel_Bundesarchiv_vor_1929.jpg": {
        "stop": "apotheke", "slot": "reference", "output": "apotheke-reference-1.webp",
        "title": "Historische Referenz · Apothekenflügel (vor 1929)", "date": "vor 1929",
        "dateNote": "before 1929; Commons metadata: 1928",
        "kind": "archive_photo",
        "license": "CC BY-SA 3.0 DE",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/",
    },
    "01_Apothekenfluegel/04_Referenz_Schlossapotheke_Schraegansicht_Zeno.jpg": {
        "stop": "apotheke", "slot": "reference", "output": "apotheke-reference-2.webp",
        "title": "Historische Referenz · Schlossapotheke (um 1900)", "date": "um 1900",
        "dateNote": "circa 1900 according to Commons; postcard date uncertain",
        "kind": "archive_photo",
        "license": "Public domain",
        "licenseUrl": None,
    },
    "02_Schloss_Ostfassade_Spree/01_Vorher_Schloss_Moderne_Ostfassade_Foto_2023-06-25.jpg": {
        "stop": "spreefront", "slot": "before", "output": "spreefront-before.webp",
        "title": "Standortfoto · Ostfassade, 25.06.2023", "date": "25.06.2023",
        "dateNote": "2023-06-25",
        "kind": "photo",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    "02_Schloss_Ostfassade_Spree/02_Nachher_Schloss_Historische_Spreefront_KI_Rekonstruktionsvision.png": {
        "stop": "spreefront", "slot": "after", "output": "spreefront-vision.webp",
        "title": "KI-Rekonstruktionsvision · historische Spreefront", "date": "15.10.2026",
        "dateNote": "2026-10-15",
        "kind": "ai_reconstruction",
        "license": "Underlying archival photograph: public domain / no known restrictions. No blanket public-domain claim is made for this AI adaptation.",
        "licenseUrl": None,
    },
    "02_Schloss_Ostfassade_Spree/03_Referenz_Schloss_Spreefront_Library_of_Congress.jpg": {
        "stop": "spreefront", "slot": "reference", "output": "spreefront-reference.webp",
        "title": "Historische Referenz · Spreefront", "date": "1900",
        "dateNote": "Commons lists 1900; source caption data unverified",
        "kind": "archive_photo",
        "license": "Public domain / no known restrictions",
        "licenseUrl": None,
    },
    "03_Schinkelsche_Bauakademie/01_Vorher_Bauakademie_Musterfassade_Standort_Foto_2022-05-07.jpg": {
        "stop": "bauakademie", "slot": "before", "output": "bauakademie-before.webp",
        "title": "Standortfoto · Bauakademieplatz, 07.05.2022", "date": "07.05.2022",
        "dateNote": "2022-05-07",
        "kind": "photo",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    },
    "03_Schinkelsche_Bauakademie/02_Nachher_Schinkelsche_Bauakademie_KI_Rekonstruktionsvision.png": {
        "stop": "bauakademie", "slot": "after", "output": "bauakademie-vision.webp",
        "title": "KI-Rekonstruktionsvision · Schinkelsche Bauakademie", "date": "15.10.2026",
        "dateNote": "2026-10-15",
        "kind": "ai_reconstruction",
        "license": "Underlying archival photograph: public domain. No blanket public-domain claim is made for this AI adaptation.",
        "licenseUrl": None,
    },
    "03_Schinkelsche_Bauakademie/03_Referenz_Bauakademie_Historische_Messbildaufnahme.jpg": {
        "stop": "bauakademie", "slot": "reference", "output": "bauakademie-reference.webp",
        "title": "Historische Referenz · Bauakademie", "date": "1888 / 1911",
        "dateNote": "Unresolved: filename says 1888; Commons description dates image to 1911",
        "kind": "archive_photo",
        "license": "Public domain",
        "licenseUrl": None,
    },
}

APPROVAL_SCOPE = (
    "Freigegeben ist die öffentliche App-Darstellung der drei KI-Rekonstruktionsvisionen "
    "mit den jeweils zugehörigen, ausdrücklich datierten Standortfotos als experimenteller Links-rechts-Swipe; unterschiedliche Blickwinkel, "
    "kein ausgerichteter Wipe. Historische Aufnahmen erscheinen ausschließlich separat als "
    "Referenzen. Die Standortfotos stammen aus 2021–2023 und sind keine heutigen Aufnahmen "
    "(Stand 15.10.2026). Keine Vision ist eine Vermessung, ein maßstabsgetreuer Bauentwurf "
    "oder ein nachgewiesener Ist-Zustand."
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def webp_bytes(source: Path) -> tuple[bytes, int, int, int, int]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        original_width, original_height = image.size
        # thumbnail preserves the complete frame and aspect ratio; it does not crop.
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        width, height = image.size
        has_alpha = "A" in image.getbands() or "transparency" in image.info
        image = image.convert("RGBA" if has_alpha else "RGB")
        for quality in range(88, 39, -4):
            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=quality, method=6, exact=True)
            encoded = buffer.getvalue()
            if len(encoded) < MAX_BYTES:
                return encoded, width, height, original_width, original_height
    raise RuntimeError(f"Could not compress below {MAX_BYTES} bytes: {source.name}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", required=True, type=Path,
                        help="Path to the read-only extracted ZIP contents")
    args = parser.parse_args()
    source_root = args.source_root.resolve()
    input_manifest = json.loads((source_root / "asset_manifest.json").read_text(encoding="utf-8"))
    entries = {item["file"]: item for item in input_manifest["assets"]}
    if set(entries) != set(DETAILS):
        raise SystemExit("Source manifest entries do not exactly match the approved 10-file set")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    rendered: dict[str, dict] = {}
    for original_file, spec in DETAILS.items():
        source = source_root / original_file
        if not source.is_file():
            raise SystemExit(f"Missing source file: {original_file}")
        source_record = entries[original_file]
        source_digest = sha256(source)
        if source_digest != source_record["sha256"]:
            raise SystemExit(f"Source checksum mismatch: {original_file}")

        encoded, width, height, original_width, original_height = webp_bytes(source)
        output = OUTPUT_DIR / spec["output"]
        output.write_bytes(encoded)
        digest = hashlib.sha256(encoded).hexdigest()
        license_text = spec.get("license", source_record["license"])
        license_url = spec.get("licenseUrl", source_record["license"] if source_record["license"].startswith("http") else None)
        if license_url and not license_url.startswith("http"):
            license_url = None
        item = {
            "localPath": f"public/media/approved/{spec['output']}",
            "title": spec["title"],
            "author": source_record["credit"],
            "date": spec["date"],
            "dateNote": spec["dateNote"],
            "license": license_text,
            "licenseUrl": license_url,
            "sourceUrl": source_record["source"],
            "changes": (
                f"{source_record['changes']} Converted to WebP at {width}×{height} px "
                f"(maximum edge {MAX_EDGE} px); complete frame retained, no cropping or repainting."
            ),
            "kind": spec["kind"],
            "sourceSha256": source_digest,
            "sha256": digest,
            "width": width,
            "height": height,
            "originalWidth": original_width,
            "originalHeight": original_height,
            "originalFile": original_file,
        }
        rendered[original_file] = item
        print(f"{spec['output']}: {len(encoded)} bytes, {width}×{height}, quality<=88, sha256={digest}")

    stops = []
    for stop_id in ("apotheke", "spreefront", "bauakademie"):
        specs = [(name, spec) for name, spec in DETAILS.items() if spec["stop"] == stop_id]
        images = [(name, rendered[name], DETAILS[name]["slot"]) for name, _ in specs]
        before = next(image for _, image, slot in images if slot == "before")
        after = next(image for _, image, slot in images if slot == "after")
        references = [image for _, image, slot in images if slot == "reference"]
        stops.append({"id": stop_id, "before": before, "after": after, "references": references})

    manifest = {"approval": {"status": "approved", "scope": APPROVAL_SCOPE}, "stops": stops}
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {MANIFEST_PATH.relative_to(MANIFEST_PATH.parents[1])}; {len(rendered)} images")


if __name__ == "__main__":
    main()
