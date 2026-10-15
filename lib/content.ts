import manifest from "../research/berlin-assets.json";
import geometry from "../research/berlin-route.json";
import { asset } from "./assets";
import type { Stop, ImageCredit } from "./types";
import type { Point } from "./geo";
const copy: Record<string, Omit<Stop, "id" | "lat" | "lng" | "before" | "after" | "sources">> = {
 apotheke: { number: "01", title: "Der Apothekenflügel", subtitle: "Ein verschwundener Nachbar des Schlosses.", period: "1585—1950", tag: "Die fehlende Ecke", description: "Hier schob sich einst ein Renaissanceflügel zwischen Schloss und Spree. Wo heute Luft ist, lagen die Räume der Hofapotheke.", detail: "Für die neue Kaiser-Wilhelm-Straße und ihre Brücke wurde der Flügel im späten 19. Jahrhundert verkürzt. Unsere Postkarte zeigt diese verkürzte Gestalt um 1900 — nicht den älteren Bau, der weiter in die heutige Straße hineinragte. Bei der Schlossrekonstruktion kehrte dieser Teil nicht zurück.", viewpoint: "Liebknechtbrücke, südlicher Gehweg. Blick stromaufwärts zur nordöstlichen Schlossecke." },
 spreefront: { number: "02", title: "Die alte Spreefront", subtitle: "Die unordentlichste Seite war die älteste.", period: "1443—1950/51", tag: "Das andere Schloss", description: "Nicht alles am alten Schloss war barock und symmetrisch. Am Wasser lagen Jahrhunderte nebeneinander: Flügel, Giebel und der Turm des Grünen Huts.", detail: "An der Ostseite blieb die mittelalterliche und Renaissance-Geschichte des Schlosses sichtbar. Heute steht dort Franco Stellas moderne Fassade. Max Missmanns Aufnahme von 1903 hält die verlorene, unregelmäßige Spreefront fest.", viewpoint: "Rathausbrücke, Gehweg auf der Südseite. Blick flussabwärts entlang der Ostseite des Schlosses." },
 bauakademie: { number: "03", title: "Schinkels Bauakademie", subtitle: "Ein ganzes Gebäude, in einer Ecke erinnert.", period: "1832/36—1962", tag: "Der rote Faden", description: "Roter Backstein, Terrakotta, ein klares Raster: Schinkels Bauakademie machte aus einem Zweckbau eine neue Idee von Architektur.", detail: "Das Gebäude brannte 1945 aus und wurde 1962 abgetragen. Die neuere Aufnahme von 2022 zeigt das Grundstück mit einer wiedererrichteten Musterecke. Das Archivfoto zeigt das vollständige Haus; seine Datierung ist in den Quellen widersprüchlich und wird deshalb ausdrücklich als unklar angegeben.", viewpoint: "Schinkelplatz, nördlicher Rand. Blick nach Süden auf das ehemalige Bauakademiegrundstück." },
};
function image(source: (typeof manifest.stops)[number]["before" | "after"], stopId: string, historical: boolean): ImageCredit {
 const date = stopId === "apotheke" ? (historical ? "um 1900" : "Datum unklar") : stopId === "spreefront" ? (historical ? "1903" : "2021") : historical ? "1888 / 1911*" : "2022";
 return { src: asset(source.localPath.replace(/^public\//, "")), title: source.title, author: source.author, date, dateNote: source.date, license: source.license.replace("Public domain (Commons file page)", "Gemeinfrei (Commons)"), licenseUrl: source.licenseUrl, sourceUrl: source.sourceUrl };
}
export const stops: Stop[] = manifest.stops.map(s => {
 const position = geometry.stops.find(p => p.id === s.id); if (!position || !copy[s.id]) throw new Error(`Missing stop configuration: ${s.id}`);
 return { ...copy[s.id], id: s.id, lat: position.lat, lng: position.lng, before: image(s.before, s.id, false), after: image(s.after, s.id, true), sources: s.citations.map(c => ({ label: c.title, url: c.url })) };
});
export const route: Point[] = geometry.route.map(({ lat, lng }) => ({ lat, lng }));
export const start: Point = route[0];
