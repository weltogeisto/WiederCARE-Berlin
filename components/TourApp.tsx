"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { stops, route, start } from "../lib/content";
import { haversine, interpolate, nearestUndiscovered, type Point } from "../lib/geo";
import { advanceWalk, findFirstEncounter, pathLength } from "../lib/walk";
import { readFoundIds as loadFoundIds, writeFoundIds as saveFoundIds, readSoundEnabled, writeSoundEnabled as saveSound } from "../lib/storage";
import { chime, unlockAudio } from "../lib/audio";
import type { Stop } from "../lib/types";
import { REPOSITORY } from "../lib/assets";
import Icon from "./Icon";
import Modal from "./Modal";
import FixSheet from "./FixSheet";
import FixComposer from "./FixComposer";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="map-loading"><span/><p>Der Stadtplan wird aufgefaltet …</p></div> });
type Mode = "idle" | "demo" | "paused" | "walk" | "gps" | "complete";
function Skyline() { return <svg className="skyline" viewBox="0 0 360 86" fill="none" aria-hidden="true"><path d="M4 79H356M17 78V53h30v25m-24-25V38h18v15m-9-15V23m-5 9h10M58 78V46h39V31h16v15h24v32m-70-22v13m14-13v13m21-22v22m18-13v13M151 78V39h39v39m-35-39 15-14 16 14m-16-14V10m-7 9h14m-15 34v16m15-16v16M208 78V31h54v47m-49-47V20h44v11m-35-11V10h26v10m-13-10V3m-17 43v13m14-13v13m14-13v13m25 32V55h32V38h32v40m-52-13v9m30-24v17m28-9v20" stroke="currentColor" strokeWidth="1.5"/><path d="M146 83H268" stroke="var(--accent)" strokeWidth="2"/></svg>; }
export default function TourApp() {
 const [point, setPoint] = useState<Point>(start); const [found, setFound] = useState<Set<string>>(new Set()); const [mode, setMode] = useState<Mode>("idle"); const [sound, setSound] = useState(false);
 const [selected, setSelected] = useState<{ stop: Stop; revealing: boolean } | null>(null); const [composer, setComposer] = useState(false); const [about, setAbout] = useState(false); const [expanded, setExpanded] = useState(false); const [notice, setNotice] = useState(""); const [gpsError, setGpsError] = useState("");
 const foundRef = useRef(found); const pointRef = useRef(point); const soundRef = useRef(sound); const progress = useRef(0); const target = useRef<Point | null>(null); const returnMode = useRef<Mode>("idle"); const watch = useRef<number | null>(null); const selectedRef = useRef(false);
 const [hasProgress, setHasProgress] = useState(false);
 const totalLength = pathLength(route);
 const updatePoint = useCallback((p: Point) => { pointRef.current = p; setPoint(p); }, []);
 const updateFound = useCallback((ids: Set<string>) => { foundRef.current = ids; setFound(ids); saveFoundIds(ids); }, []);
 useEffect(() => {
  queueMicrotask(() => { const valid = new Set([...loadFoundIds()].filter(id => stops.some(s => s.id === id))); foundRef.current = valid; setFound(valid); const enabled = readSoundEnabled(undefined, false); soundRef.current = enabled; setSound(enabled); });
  return () => { if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current); };
 }, []);
 const stopGPS = useCallback(() => { if (watch.current !== null) navigator.geolocation?.clearWatch(watch.current); watch.current = null; }, []);
 const discover = useCallback((stop: Stop, resume: Mode) => {
  if (foundRef.current.has(stop.id) || selectedRef.current) return;
  updateFound(new Set([...foundRef.current, stop.id])); returnMode.current = resume; selectedRef.current = true; setSelected({ stop, revealing: true }); setMode("paused"); setExpanded(false); setNotice(`${stop.title} entdeckt.`); chime(soundRef.current);
 }, [updateFound]);
 useEffect(() => {
  if (mode !== "demo" && mode !== "walk") return;
  let frame = 0; let last = 0; let active = true;
  const tick = (time: number) => {
   if (!active) return; const dt = last ? Math.min((time - last) / 1000, 0.2) : 0; last = time;
   if (mode === "demo") {
    const next = advanceWalk(route, progress.current, dt, 14); const hit = findFirstEncounter(route, progress.current, next.distance, stops, foundRef.current, 35);
    if (hit) { progress.current = hit.distance; updatePoint(hit.position); discover(stops.find(s => s.id === hit.fix.id)!, "demo"); return; }
    progress.current = next.distance; updatePoint(next.position);
    if (next.done) { setMode("complete"); setNotice("Drei Orte. Eine Stadt, die du jetzt anders siehst."); chime(soundRef.current, "done"); return; }
   } else if (target.current) {
    const remaining = haversine(pointRef.current, target.current); const p = remaining > 0.05 ? interpolate(pointRef.current, target.current, Math.min(1, dt * 1.4 / remaining)) : target.current; updatePoint(p);
    const foundStop = nearestUndiscovered(p, stops, foundRef.current, 35); if (foundStop) { discover(stops.find(s => s.id === foundStop.id)!, "walk"); return; }
    if (remaining < 0.1) { setMode("idle"); target.current = null; return; }
   }
   frame = requestAnimationFrame(tick);
  }; frame = requestAnimationFrame(tick); return () => { active = false; cancelAnimationFrame(frame); };
 }, [mode, discover, updatePoint]);
 useEffect(() => {
  if (!notice) return;
  const timeout = setTimeout(() => setNotice(""), 6000); return () => clearTimeout(timeout);
 }, [notice]);
 const begin = () => {
  unlockAudio(); stopGPS(); setGpsError(""); setExpanded(false);
  if (mode === "demo") { setMode("paused"); return; }
  if (mode === "paused" && progress.current > 0) { setMode("demo"); return; }
  progress.current = 0; target.current = null; setHasProgress(true); updatePoint(start); updateFound(new Set()); setMode("demo"); setNotice("Die Zeitreise läuft mit 10-facher Gehgeschwindigkeit.");
 };
 const repeat = () => { stopGPS(); progress.current = 0; target.current = null; setHasProgress(false); updateFound(new Set()); updatePoint(start); setMode("idle"); setNotice("Die Route ist wieder unentdeckt. Deine eigenen Fotoideen bleiben erhalten."); };
 const walkTo = (p: Point) => { stopGPS(); target.current = p; setMode("walk"); setNotice("Du gehst zum markierten Punkt · 1,4 m/s."); };
 const dragTo = (p: Point) => { stopGPS(); target.current = null; updatePoint(p); setMode("idle"); const s = nearestUndiscovered(p, stops, foundRef.current, 35); if (s) discover(stops.find(stop => stop.id === s.id)!, "idle"); };
 const finishReveal = () => {
  selectedRef.current = false;
  if (returnMode.current === "demo" || returnMode.current === "walk" || returnMode.current === "gps") { setSelected(null); setMode(returnMode.current); }
  else setSelected(s => s ? { ...s, revealing: false } : null);
 };
 const closeSheet = () => { selectedRef.current = false; setSelected(null); returnMode.current = "idle"; setMode("paused"); };
 const openStop = (id: string) => { const stop = stops.find(s => s.id === id); if (!stop || !foundRef.current.has(id)) return; returnMode.current = "idle"; selectedRef.current = true; setSelected({ stop, revealing: false }); setMode("paused"); };
 const gps = () => {
  stopGPS(); setMode("idle"); setGpsError("");
  if (!navigator.geolocation) { setGpsError("Dein Browser unterstützt GPS nicht. Du kannst die Demo starten oder den Punkt ziehen."); return; }
  setNotice("GPS wird angefragt. Dein Standort bleibt in diesem Browser.");
  watch.current = navigator.geolocation.watchPosition(position => {
   const p = { lat: position.coords.latitude, lng: position.coords.longitude };
   if (position.coords.accuracy > 70) { setGpsError("GPS ist noch ungenau. Geh möglichst ins Freie; Entdeckungen warten auf ein genaueres Signal."); return; }
   setGpsError(""); updatePoint(p); if (!selectedRef.current) setMode("gps");
   if (haversine(p, start) > 3000) { setNotice("Du bist außerhalb der Schlossrunde. Die Demo bringt dich kostenlos nach Berlin."); return; }
   if (!selectedRef.current) { const s = nearestUndiscovered(p, stops, foundRef.current, 35); if (s) discover(stops.find(stop => stop.id === s.id)!, "gps"); }
  }, error => { stopGPS(); setMode("idle"); setGpsError(error.code === 1 ? "Standort nicht freigegeben. Kein Problem: Demo, Tippen und Ziehen funktionieren ohne GPS." : "GPS konnte nicht ermittelt werden. Versuch es draußen erneut oder starte die Demo."); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 });
 };
 const toggleSound = () => { unlockAudio(); const enabled = !sound; setSound(enabled); soundRef.current = enabled; saveSound(enabled); if (enabled) chime(true); };
 const running = mode === "demo"; const completed = mode === "complete"; const count = found.size;
 return <div className="tour-app" data-release="wiedersehen-approved-visions-v2" data-mode={mode} data-lat={point.lat} data-lng={point.lng}>
  <header className="app-header"><a className="brand" href="./" aria-label="Wiedersehen Berlin Startseite"><span className="brand-mark">w.</span><span>Wiedersehen<span className="brand-sub">BERLIN</span></span></a><div className="header-center"><span className="live-dot"/> EIN SPAZIERGANG DURCH ZWEI ZEITEN</div><div className="header-right"><span className="free-label">Ohne Konto. Ohne Kosten.</span><button className="icon-button" aria-label="Über dieses Projekt" onClick={() => { setMode(m => m === "demo" || m === "walk" ? "paused" : m); setAbout(true); }}><Icon name="info"/></button></div></header>
  <main className="tour-main"><section className={`editorial ${expanded ? "expanded" : ""}`} aria-label="Dein Spaziergang">
   <div className="edition-label"><span>BERLIN–MITTE</span><span>SPAZIERGANG № 01</span></div>
   <div className="editorial-heading"><h1>Eine Stadt.<br/><em>Zwei Zeiten.</em></h1><p>Drei verschwundene Bauwerke.<br/>Eine Runde um das Schloss.<br className="desktop-only"/> Und ein neuer Blick auf Berlin.</p></div>
   <Skyline/>
   <div className="walk-meta"><span><Icon name="pin" size={14}/>{(totalLength / 1000).toFixed(1).replace(".", ",")} km</span><span>3 Fundstücke</span><span>Demo ≈ {Math.ceil((totalLength / 14 + 21) / 60)} Min.</span></div>
   <div className="main-action"><button className="primary-button" onClick={completed ? repeat : begin} data-testid="demo-button"><Icon name={running ? "pause" : completed ? "reset" : "play"}/>{running ? "Spaziergang pausieren" : completed ? "Noch einmal entdecken" : mode === "paused" && hasProgress ? "Spaziergang fortsetzen" : "Zeitreise starten"}<span className="button-tail">{running ? "10×" : "→"}</span></button><p className="action-note">{running ? "Der Punkt folgt der Route. Du kannst jederzeit eingreifen." : "Als Demo von überall. Oder zu Fuß vor Ort."}</p></div>
   <button className="collection-toggle" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}><span>DEINE FUNDSTÜCKE</span><span>{count} / 3 <b>{expanded ? "−" : "+"}</b></span></button>
   <ol className="stop-list">{stops.map(stop => <li key={stop.id} className={found.has(stop.id) ? "is-found" : ""}><button onClick={() => openStop(stop.id)} disabled={!found.has(stop.id)}><span className="stop-number">{found.has(stop.id) ? <Icon name="check" size={16}/> : stop.number}</span><span className="stop-name"><strong>{stop.title}</strong><small>{found.has(stop.id) ? "Entdeckt · Vision öffnen" : stop.viewpoint.split(",")[0]}</small></span><span className="stop-arrow">↗</span></button></li>)}</ol>
   <div className="editorial-footer"><span>Geschichte zum Wiederfinden.</span><button className="text-button" onClick={() => setAbout(true)}>Über das Projekt ↗</button></div>
  </section>
  <section className="map-region" aria-label="Die Schlossrunde"><MapView point={point} route={route} stops={stops} found={found} onWalk={walkTo} onDrag={dragTo} onSelect={openStop} follow={mode === "gps"}/>
   <div className="map-topline"><div className="map-title"><span className="eyebrow">RUND UM DAS SCHLOSS</span><span>Folge der gestrichelten Spur.</span></div><div className="collection-counter" aria-label={`${count} von 3 Orten entdeckt`}><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="18"/><circle className="counter-fill" cx="22" cy="22" r="18" pathLength="100" style={{ strokeDashoffset: 100 - count / 3 * 100 }}/></svg><strong data-testid="found-count">{count}<span>/3</span></strong></div></div>
   <div className="map-controls"><button className={`control-button ${mode === "gps" ? "active" : ""}`} onClick={gps} aria-label="Meinen GPS-Standort nutzen"><Icon name="gps"/><span>Mein Standort</span></button><button className="control-button" onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Ton ausschalten" : "Ton einschalten"}><Icon name={sound ? "sound" : "mute"}/></button><button className="control-button" onClick={repeat} aria-label="Spaziergang zurücksetzen"><Icon name="reset"/></button></div>
   <div className="map-compass" aria-hidden="true"><span>N</span><Icon name="compass" size={32}/></div>
   {gpsError && <div className="gps-error" role="alert"><Icon name="info"/><span>{gpsError}</span><button className="icon-button" aria-label="GPS-Hinweis schließen" onClick={() => setGpsError("")}><Icon name="close" size={16}/></button></div>}
   {notice && <div className="tour-toast" role="status">{notice}</div>}
   {completed && <div className="completion-card" data-testid="tour-complete"><span className="eyebrow accent">DIE RUNDE IST VOLLSTÄNDIG</span><h2>Berlin hat mehr<br/>als eine Gegenwart.</h2><p>Alle drei Orte sind wieder auf deiner Karte. Öffne ein Fundstück — oder sammle deine eigene Idee.</p></div>}
   <div className="map-bottom"><span><i className="position-key"/> Tippen zum Gehen · Punkt ziehen</span><button className="compose-button" onClick={() => { stopGPS(); setMode("paused"); setComposer(true); }}><Icon name="plus"/><span>Eigene Idee</span></button></div>
   <div className="map-attribution"><a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">© OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></div>
  </section></main>
  <span className="sr-only" aria-live="polite">{count} von 3 historischen Orten entdeckt.</span>
  {selected && <FixSheet key={selected.stop.id} stop={selected.stop} revealing={selected.revealing} sound={sound} onRevealDone={finishReveal} onClose={closeSheet}/>}
  {composer && <FixComposer point={point} onClose={() => setComposer(false)}/>}
  {about && <Modal title="Über Wiedersehen Berlin" onClose={() => setAbout(false)} className="about"><div className="stop-heading"><span className="eyebrow accent">Eine kleine Liebeserklärung an die Stadt</span><h2>Nicht weg.<br/><em>Nur nicht mehr da.</em></h2></div><div className="stop-story"><p className="lead">Manche Gebäude fehlen so lange, dass man ihr Fehlen nicht mehr bemerkt. Diese Runde macht drei davon wieder sichtbar.</p><p>Die Apothekenflügel-Seite, die alte Spreefront des Schlosses und Schinkels Bauakademie: Drei Fundstücke an einem Spaziergang. Komm näher als 35 Meter, und die kleine Zeitreise-Crew öffnet den Blick zurück.</p><h3>Was du hier wirklich siehst</h3><p>Datierte Standortfotos aus 2021–2023 und drei für diese Demo freigegebene KI-Rekonstruktionsvisionen nach historischen Bildvorlagen. Keine Live-Fotos und keine deckungsgleiche Rekonstruktion: Die Blickwinkel unterscheiden sich, Farben und feine Details sind interpretiert. Die Spreefront-Vision zeigt nur einen Teil der alten Ostfassade. Historische Referenzen und alle Bildnachweise stehen direkt beim Fundstück.</p><h3>Kostenlos, nicht datenhungrig.</h3><p>Diese Version läuft statisch auf GitHub Pages. Kein Login, keine Werbung, keine Analyse-Cookies, keine bezahlten KI-Aufrufe. Fundstücke und Fotoideen bleiben auf deinem Gerät. Kartenkacheln lädt dein Browser von OpenFreeMap; GitHub und der Kartendienst erhalten dabei technisch notwendige Verbindungsdaten. GPS wird nur nach deinem Tippen angefragt und nicht von der App hochgeladen.</p><h3>Ein Spaziergang, kein Navigationssystem.</h3><p>Die Demo folgt einer aus OpenStreetMap abgeleiteten Route. Standortpunkte sind ungefähre Demo-Blickpunkte, keine GPS-Daten eigener Fotos. Beachte vor Ort Verkehr, Baustellen und Zugänglichkeit; die Karte prüft keine aktuellen Sperrungen. Die Orte auf dem Bildschirm sind keine Bauanträge.</p><a className="repo-link" href={`https://github.com/${REPOSITORY}/tree/main`} target="_blank" rel="noreferrer">Quellcode & Dokumentation auf GitHub <Icon name="arrow"/></a><p className="tiny-note">Originalgestaltung und Umsetzung: Astra / Hermes. Inspiriert von der Idee ortsbasierter Vorher-Nachher-Entdeckungen, ohne fremden Code, Figuren oder Sounds zu kopieren.</p></div></Modal>}
 </div>;
}
