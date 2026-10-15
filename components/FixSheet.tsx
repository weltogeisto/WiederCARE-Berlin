"use client";
import { useState } from "react";
import type { Stop } from "../lib/types";
import Modal from "./Modal";
import Icon from "./Icon";
import CrewReveal from "./CrewReveal";

export default function FixSheet({ stop, revealing, sound, onRevealDone, onClose }: { stop: Stop; revealing: boolean; sound: boolean; onRevealDone: () => void; onClose: () => void }) {
 const [replay, setReplay] = useState(0);
 const [playing, setPlaying] = useState(false);
 const [view, setView] = useState<"before" | "vision">("vision");
 const image = view === "before" ? stop.before : stop.after;
 return <Modal title={`Fundstück ${stop.number} / 03`} onClose={onClose} className="fix-sheet">
  <div className="stop-heading"><span className="eyebrow accent">{stop.tag} · {stop.period}</span><h2>{stop.title}</h2><p>{stop.subtitle}</p></div>
  {revealing || playing ? <CrewReveal key={`${stop.id}-${replay}`} stop={stop} sound={sound} onDone={() => { setPlaying(false); setView("vision"); if (revealing) onRevealDone(); }}/> : <>
   <div className="compare-tools vision-tools"><div className="segmented" aria-label="Getrennte Bildansichten"><button aria-pressed={view === "before"} onClick={() => setView("before")}>Standortfoto</button><button aria-pressed={view === "vision"} onClick={() => setView("vision")}>KI-Vision</button></div><button className="icon-button" aria-label="Crew-Reveal wiederholen" onClick={() => { setReplay(n => n + 1); setPlaying(true); }}><Icon name="reset"/></button></div>
   <figure className="vision-frame" data-testid="image-view" data-view={view}>
    <img className="vision-image" src={image.src} alt={image.title} />
    <figcaption><strong>{view === "before" ? `Standortfoto · ${image.date}` : "KI-Rekonstruktionsvision"}</strong><a href={image.src} target="_blank" rel="noreferrer" aria-label="Ganzes Bild separat öffnen">Bild öffnen ↗</a></figcaption>
   </figure>
   <p className="honesty-note">Verschiedene Blickwinkel, keine deckungsgleiche Rekonstruktion im Standortfoto. Farben und Details der KI-Vision sind interpretiert.</p>
  </>}
  <details className="archive-references" data-testid="archive-references"><summary>Historische Bildvorlagen <span>+</span></summary><div className="reference-gallery">{stop.references.map(reference => <figure key={reference.src}><a href={reference.src} target="_blank" rel="noreferrer"><img src={reference.src} alt={reference.title} loading="lazy"/></a><figcaption><strong>{reference.title}</strong><span>{reference.dateNote}</span><a href={reference.sourceUrl} target="_blank" rel="noreferrer">{reference.author} ↗</a></figcaption></figure>)}</div></details>
  <div className="stop-story"><p className="lead">{stop.description}</p><p>{stop.detail}</p><div className="viewpoint"><Icon name="pin"/><div><strong>Blickpunkt der Demo</strong><span>{stop.viewpoint}</span></div></div></div>
  <details className="sources"><summary>Bildnachweise & historische Quellen <span>↗</span></summary><div className="source-grid">{[stop.before, stop.after, ...stop.references].map(credit => <div key={credit.src}><span className="eyebrow">{credit.kind === "ai_reconstruction" ? "KI-Adaption" : credit.kind === "archive_photo" ? "Historische Referenz" : "Standortfoto"} · {credit.date}</span><a href={credit.sourceUrl} target="_blank" rel="noreferrer">{credit.title} ↗</a><p>{credit.author} · {credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noreferrer">{credit.license}</a> : credit.license}<br/>{credit.dateNote}<br/>{credit.changes}</p></div>)}</div>{stop.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</details>
 </Modal>;
}
