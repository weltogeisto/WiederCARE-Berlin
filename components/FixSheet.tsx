"use client";
import { useState } from "react";
import type { Stop } from "../lib/types";
import Modal from "./Modal";
import Icon from "./Icon";
import CrewReveal from "./CrewReveal";
export default function FixSheet({ stop, revealing, sound, onRevealDone, onClose }: { stop: Stop; revealing: boolean; sound: boolean; onRevealDone: () => void; onClose: () => void }) {
 const [replay, setReplay] = useState(0); const [playing, setPlaying] = useState(false); const [split, setSplit] = useState(50); const [view, setView] = useState<"compare" | "archive">("compare");
 return <Modal title={`Fundstück ${stop.number} / 03`} onClose={onClose} className="fix-sheet">
  <div className="stop-heading"><span className="eyebrow accent">{stop.tag} · {stop.period}</span><h2>{stop.title}</h2><p>{stop.subtitle}</p></div>
  {revealing || playing ? <CrewReveal key={`${stop.id}-${replay}`} stop={stop} sound={sound} onDone={() => { setPlaying(false); if (revealing) onRevealDone(); }}/> : <>
   <div className={`compare-frame ${view === "archive" ? "archive-full" : ""}`} data-testid="comparison">
    <img src={stop.after.src} alt={stop.after.title} />
    {view === "compare" && <><div className="compare-before" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}><img src={stop.before.src} alt={stop.before.title}/></div><div className="compare-divider" style={{ left: `${split}%` }}><span>‹ ›</span></div><label className="sr-only" htmlFor="comparison-range">Anteil der neueren Ansicht</label><input id="comparison-range" className="compare-input" type="range" min="0" max="100" value={split} onChange={e => setSplit(Number(e.target.value))}/></>}
    <span className="photo-stamp stamp-left">{view === "compare" ? `Neuere Ansicht · ${stop.before.date}` : "Archivansicht"}</span><span className="photo-stamp">{stop.after.date}</span>
   </div>
   <div className="compare-tools"><div className="segmented" aria-label="Bildansicht"><button aria-pressed={view === "compare"} onClick={() => setView("compare")}>Blickwechsel</button><button aria-pressed={view === "archive"} onClick={() => setView("archive")}>Ganzes Archivbild</button></div><button className="icon-button" aria-label="Crew-Reveal wiederholen" onClick={() => { setReplay(n => n + 1); setPlaying(true); }}><Icon name="reset"/></button></div>
   <p className="honesty-note">Echte Fotografien aus verschiedenen Zeiten und Blickwinkeln. Kein deckungsgleiches Vorher/Nachher, keine KI-Rekonstruktion.</p>
  </>}
  <div className="stop-story"><p className="lead">{stop.description}</p><p>{stop.detail}</p><div className="viewpoint"><Icon name="pin"/><div><strong>Dein Blickpunkt</strong><span>{stop.viewpoint}</span></div></div></div>
  <details className="sources"><summary>Bildnachweise & historische Quellen <span>↗</span></summary><div className="source-grid">{[stop.before, stop.after].map((image, i) => <div key={image.src}><span className="eyebrow">{i ? "Archiv" : "Neuere Aufnahme"} · {image.date}</span><a href={image.sourceUrl} target="_blank" rel="noreferrer">{image.title} ↗</a><p>{image.author} · {image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a> : image.license}<br/>WebP-Konvertierung, Größe angepasst.<br/>{image.dateNote}</p></div>)}</div>{stop.sources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</details>
 </Modal>;
}
