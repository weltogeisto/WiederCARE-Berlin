import manifest from "../research/approved-visions.json";
import archiveManifest from "../research/berlin-assets.json";
import geometry from "../research/berlin-route.json";
import { asset } from "./assets";
import type { Stop, ImageCredit } from "./types";
import type { Point } from "./geo";
const copy: Record<string, Omit<Stop, "id" | "lat" | "lng" | "before" | "after" | "references" | "sources">> = {
 apotheke: { number: "01", title: "Der Apothekenflügel", subtitle: "Ein verschwundener Nachbar des Schlosses.", period: "1585—1950", tag: "Die fehlende Ecke", description: "Hier schob sich einst ein Renaissanceflügel zwischen Schloss und Spree. Wo heute Luft ist, lagen die Räume der Hofapotheke.", detail: "Für die neue Kaiser-Wilhelm-Straße und ihre Brücke wurde der Flügel im späten 19. Jahrhundert verkürzt. Die Vision interpretiert die historische Stirnseite nach einer Bundesarchiv-Aufnahme vor 1929. Sie zeigt nicht den gesamten Flügel und ist nicht in das Standortfoto von 2021 eingesetzt.", viewpoint: "Liebknechtbrücke, südlicher Gehweg. Blick stromaufwärts zur nordöstlichen Schlossecke." },
 spreefront: { number: "02", title: "Die alte Spreefront", subtitle: "Die unordentlichste Seite war die älteste.", period: "1443—1950/51", tag: "Das andere Schloss", description: "Nicht alles am alten Schloss war barock und symmetrisch. Am Wasser lagen Jahrhunderte nebeneinander: Flügel, Giebel und der Turm des Grünen Huts.", detail: "Heute steht an der Ostseite Franco Stellas moderne Fassade. Die KI-Vision folgt einer Archivaufnahme aus der Library of Congress. Sie zeigt einen Ausschnitt der historischen Spreefront, nicht die vollständige Ostfassade; das Standortfoto von 2023 hat einen anderen Blickwinkel.", viewpoint: "Rathausbrücke, Gehweg auf der Südseite. Blick flussabwärts entlang der Ostseite des Schlosses." },
 bauakademie: { number: "03", title: "Schinkels Bauakademie", subtitle: "Ein ganzes Gebäude, in einer Ecke erinnert.", period: "1832/36—1962", tag: "Der rote Faden", description: "Roter Backstein, Terrakotta, ein klares Raster: Schinkels Bauakademie machte aus einem Zweckbau eine neue Idee von Architektur.", detail: "Das Gebäude brannte 1945 aus und wurde 1962 abgetragen. Das Standortfoto von 2022 zeigt die wiedererrichtete Musterecke; die KI-Vision interpretiert das vollständige Haus in einer anderen Perspektive. Die Datierung der historischen Bildvorlage ist widersprüchlich: Dateiname 1888, Quellenbeschreibung 1911.", viewpoint: "Schinkelplatz, nördlicher Rand. Blick nach Süden auf das ehemalige Bauakademiegrundstück." },
};
function image(source: (typeof manifest.stops)[number]["before" | "after"]): ImageCredit {
 const kind = source.kind;
 if (kind !== "photo" && kind !== "ai_reconstruction" && kind !== "archive_photo") throw new Error(`Invalid image kind: ${kind}`);
 return { src: asset(source.localPath.replace(/^public\//, "")), title: source.title, author: source.author, date: source.date, dateNote: source.dateNote, license: source.license, licenseUrl: source.licenseUrl, sourceUrl: source.sourceUrl, changes: source.changes, kind };
}
export const stops: Stop[] = manifest.stops.map(s => {
 const position = geometry.stops.find(p => p.id === s.id);
 if (!position || !copy[s.id]) throw new Error(`Missing stop configuration: ${s.id}`);
 return { ...copy[s.id], id: s.id, lat: position.lat, lng: position.lng, before: image(s.before), after: image(s.after), references: s.references.map(image), sources: (archiveManifest.stops.find(a => a.id === s.id)?.citations ?? []).map(c => ({ label: c.title, url: c.url })) };
});
export const route: Point[] = geometry.route.map(({ lat, lng }) => ({ lat, lng }));
export const start: Point = route[0];
