import type { Point } from "./geo";
export type ImageCredit = { src: string; title: string; author: string; date: string; dateNote: string; license: string; licenseUrl: string | null; sourceUrl: string };
export type Stop = Point & { id: string; number: string; title: string; subtitle: string; period: string; tag: string; description: string; detail: string; viewpoint: string; before: ImageCredit; after: ImageCredit; sources: { label: string; url: string }[] };
