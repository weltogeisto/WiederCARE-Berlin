"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Point } from "../lib/geo";
import { stops } from "../lib/content";
import type { ImageCredit, Stop } from "../lib/types";
import FixComposer from "./FixComposer";
import ProposalComparison from "./ProposalComparison";
import VotesPanel from "./VotesPanel";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="proposal-map-loading" role="status">Stadtplan wird geladen …</div>,
});
const allStopIds = new Set(stops.map(stop => stop.id));
const contextBounds = (point: Point): Point[] => [point, point]; // Zero-length extent: MapView needs bounds, but no walking route is drawn.
const ignorePoint = () => undefined;
const inspirationUrl = "https://www.instagram.com/architekturrebellion.berlin?cplk=MTM5bWVudmg5YjBzZQ==";

function Credit({ image }: { image: ImageCredit }) {
  const kind = image.kind === "ai_reconstruction" ? "KI-Vision" : image.kind === "archive_photo" ? "Historische Vorlage" : "Standortfoto";
  return (
    <div className="proposal-credit">
      <span className="proposal-eyebrow">{kind} · {image.date}</span>
      <strong>{image.title}</strong>
      <span>{image.author}</span>
      <span>{image.dateNote}</span>
      <span>{image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a> : image.license}</span>
      <a href={image.sourceUrl} target="_blank" rel="noreferrer">Bildquelle öffnen ↗</a>
      <p>{image.changes}</p>
    </div>
  );
}

export default function ProposalApp() {
  const [activeId, setActiveId] = useState(stops[0]?.id ?? "");
  const [split, setSplit] = useState(50);
  const [mapOpen, setMapOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const selected: Stop = stops.find(stop => stop.id === activeId) ?? stops[0];

  useEffect(() => {
    const readHash = () => {
      const hashId = window.location.hash.slice(1);
      const match = stops.find(stop => stop.id === hashId) ?? stops[0];
      setActiveId(match.id);
      setSplit(50);
      setMapOpen(false);
    };
    queueMicrotask(readHash);
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const selectProposal = (id: string) => {
    const match = stops.find(stop => stop.id === id);
    if (!match) return;
    window.history.replaceState(null, "", `#${match.id}`);
    setActiveId(match.id);
    setSplit(50);
    setMapOpen(false);
  };

  return (
    <div className="proposal-app" data-release="stadtbild-proposals-v3">
      <header className="proposal-header">
        <Link className="proposal-brand" href="/" aria-label="Wiedersehen Berlin – Start">
          <span className="proposal-brand-mark">w.</span>
          <span>Wiedersehen<span className="proposal-brand-sub">BERLIN</span></span>
        </Link>
        <div className="proposal-header-kicker"><span aria-hidden="true" /> ARCHITEKTUR · STADTDEBATTE</div>
        <span className="proposal-independence">Unabhängiges Projekt</span>
      </header>

      <main className="proposal-main">
        <section className="proposal-hero" aria-labelledby="proposal-title">
          <div className="proposal-hero-copy">
            <span className="proposal-eyebrow">DREI ORTE · OFFENE ZUKÜNFTE</span>
            <h1 id="proposal-title">Berlin kann<br /><em>anders aussehen.</em></h1>
            <p>Vergleiche den heutigen Ort mit einer Vision nach historischen Quellen. Welche Zukunft würdest du unterstützen?</p>
          </div>
          <aside className="proposal-hero-aside">
            <span className="proposal-aside-number">01—03</span>
            <p>Historische Architektur als Anlass für eine öffentliche Debatte — nicht als fertiger Bauplan.</p>
            <a href={inspirationUrl} target="_blank" rel="noreferrer">Inspiration: Architekturrebellion Berlin ↗</a>
            <small>Eigenständiges Projekt; keine Verbindung oder Kooperation.</small>
          </aside>
        </section>

        <nav className="proposal-navigation" aria-label="Architekturvorschläge">
          <div className="proposal-navigation-head">
            <div><span className="proposal-eyebrow">WÄHLE EINEN ORT</span><h2>Drei Vorschläge für Berlin</h2></div>
            <span className="proposal-nav-hint">Alle drei sind sofort offen</span>
          </div>
          <div className="proposal-nav-grid">
            {stops.map(stop => (
              <a
                key={stop.id}
                className={`proposal-nav-card${stop.id === selected.id ? " is-active" : ""}`}
                href={`#${stop.id}`}
                aria-label={`Vorschlag öffnen: ${stop.title}`}
                aria-current={stop.id === selected.id ? "page" : undefined}
                onClick={() => selectProposal(stop.id)}
              >
                <span className="proposal-nav-number">{stop.number}</span>
                <span className="proposal-nav-copy"><strong>{stop.title}</strong><small>{stop.tag} · {stop.period}</small></span>
                <span className="proposal-nav-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </nav>

        <section className="proposal-current" id={selected.id} data-testid="proposal-current" data-proposal-id={selected.id} aria-labelledby="proposal-heading">
          <div className="proposal-current-heading">
            <div>
              <span className="proposal-eyebrow">VORSCHLAG {selected.number} / 03 · {selected.period}</span>
              <h2 id="proposal-heading">{selected.title}</h2>
              <p>{selected.subtitle}</p>
            </div>
            <button className="proposal-local-idea" type="button" onClick={() => setComposerOpen(true)}>+ Eigene Idee <span>(lokal)</span></button>
          </div>
          <ProposalComparison stop={selected} value={split} onChange={setSplit} />
          <button className="proposal-support-jump" type="button" onClick={() => document.querySelector(".proposal-support")?.scrollIntoView({ behavior: "auto", block: "start" })}>Diesen Vorschlag unterstützen ↓</button>
          <p className="proposal-description">{selected.description}</p>

          <div className="proposal-story-grid">
            <div className="proposal-story"><span className="proposal-eyebrow">WAS WAR — WAS KÖNNTE SEIN</span><p>{selected.detail}</p></div>
            <div className="proposal-viewpoint"><span className="proposal-eyebrow">ORT & BLICKRICHTUNG</span><p>{selected.viewpoint}</p><button type="button" onClick={() => setMapOpen(open => !open)} aria-expanded={mapOpen} aria-controls="proposal-map-panel">{mapOpen ? "Karte schließen −" : "Ort auf der Karte ansehen +"}</button></div>
          </div>
          {mapOpen && <div className="proposal-map-panel" id="proposal-map-panel">
            <p>Zoome etwas heraus, um alle drei Orte zu sehen. Wähle einen markierten Vorschlag, um ihn zu öffnen.</p>
            <div className="proposal-map-canvas"><MapView point={{ lat: selected.lat, lng: selected.lng }} route={contextBounds({ lat: selected.lat, lng: selected.lng })} stops={stops} found={allStopIds} onWalk={ignorePoint} onDrag={ignorePoint} onSelect={selectProposal} follow={false} /></div>
            <div className="proposal-map-attribution"><a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></div>
          </div>}

          <details className="proposal-history">
            <summary><span>Historische Bildvorlagen, Bildnachweise &amp; Quellen</span><span aria-hidden="true">＋</span></summary>
            <div className="proposal-history-body">
              <p className="proposal-history-intro">Die Vision ist eine Interpretation nach historischen Bildquellen. Sie ist keine Vermessung, kein maßstabsgetreuer Bauentwurf und kein nachgewiesener Ist-Zustand. Die Vergleichsbilder haben unterschiedliche Blickwinkel und sind nicht deckungsgleich.</p>
              <div className="proposal-reference-grid">
                {selected.references.map(reference => <figure key={reference.src}>
                  <a href={reference.src} target="_blank" rel="noreferrer" aria-label={`Historische Vorlage öffnen: ${reference.title}`}><img src={reference.src} alt={reference.title} loading="lazy" /></a>
                  <figcaption><strong>{reference.title}</strong><span>{reference.dateNote}</span><a href={reference.sourceUrl} target="_blank" rel="noreferrer">Quelle ↗</a></figcaption>
                </figure>)}
              </div>
              <div className="proposal-credit-grid">{[selected.before, selected.after, ...selected.references].map(image => <Credit key={image.src} image={image} />)}</div>
              {selected.sources.length > 0 && <div className="proposal-history-sources"><h3>Historischer Kontext</h3>{selected.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>}
            </div>
          </details>
        </section>

        <section className="proposal-support" aria-labelledby="proposal-support-title">
          <div className="proposal-support-heading"><span className="proposal-eyebrow">ÖFFENTLICHE UNTERSTÜTZUNG</span><h2 id="proposal-support-title">Welche Zukunft soll Gehör finden?</h2><p>Unterstütze den Vorschlag, der dich überzeugt. Das ist eine offene Unterstützungsbekundung — kein repräsentatives Meinungsbild und kein Bürgerentscheid.</p></div>
          <VotesPanel stopId={selected.id} />
        </section>

        <footer className="proposal-footer">
          <Link className="proposal-footer-brand" href="/">Wiedersehen Berlin</Link>
          <span>Historische Bilder und KI-Visionen als Einladung zum Gespräch.</span>
          <a href={inspirationUrl} target="_blank" rel="noreferrer">Inspiration ↗</a>
        </footer>
      </main>
      {composerOpen && <FixComposer point={{ lat: selected.lat, lng: selected.lng }} onClose={() => setComposerOpen(false)} />}
    </div>
  );
}
