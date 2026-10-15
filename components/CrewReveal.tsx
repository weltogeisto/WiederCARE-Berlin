"use client";
import { useEffect, useRef, useState } from "react";
import type { Stop } from "../lib/types";
import Icon from "./Icon";

function Worker({ index }: { index: number }) {
 return <div className={`crew-worker worker-${index}`} aria-hidden="true"><svg viewBox="0 0 48 72"><ellipse cx="24" cy="68" rx="16" ry="3" fill="#252d2b" opacity=".16"/><g className="worker-legs" stroke="#252d2b" strokeWidth="7" strokeLinecap="round"><path d="m19 46-4 17h-5"/><path d="m29 46 4 17h5"/></g><path d="M14 28h20l3 21H11Z" fill={index === 1 ? "#476e68" : "#c26443"}/><path d="M19 29v20m10-20v20" stroke="#f1d9a2" strokeWidth="3"/><circle cx="24" cy="19" r="10" fill={index === 2 ? "#9e7156" : "#e8b792"}/><path d="M12 17a12 12 0 0 1 24 0H12Z" fill="#e2ad4f"/><path d="M9 18h30" stroke="#a77732" strokeWidth="3" strokeLinecap="round"/><path d="M13 33 5 44m30-11 8 7" stroke={index === 2 ? "#9e7156" : "#e8b792"} strokeWidth="6" strokeLinecap="round"/><g className="worker-tool"><path d="m40 31 4 18" stroke="#594936" strokeWidth="3"/><path d="m36 30 11-2" stroke="#495954" strokeWidth="5" strokeLinecap="round"/></g><circle cx="21" cy="21" r="1" fill="#252d2b"/><circle cx="28" cy="21" r="1" fill="#252d2b"/></svg></div>;
}
export default function CrewReveal({ stop, onDone, sound }: { stop: Stop; onDone: () => void; sound: boolean }) {
 const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
 const [visionVisible, setVisionVisible] = useState(reduced);
 const [phase, setPhase] = useState("Die Zeitreise-Crew kommt …"); const done = useRef(false); const callback = useRef(onDone);
 useEffect(() => { callback.current = onDone; }, [onDone]);
 useEffect(() => {
  const timers = reduced ? [] : [setTimeout(() => setPhase("Ein Gerüst für die Erinnerung."), 1000), setTimeout(() => setPhase("Vom Standortfoto zur historischen Vision."), 2500), setTimeout(() => setVisionVisible(true), 3200), setTimeout(() => setPhase("Willkommen zurück."), 6000)];
  const finish = setTimeout(() => { if (!done.current) { done.current = true; callback.current(); } }, reduced ? 500 : 7000);
  return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
 }, [reduced]);
 const skip = () => { if (!done.current) { done.current = true; callback.current(); } };
 return <div className={`reveal ${reduced ? "reveal-reduced" : ""}`} data-testid="crew-reveal" onClick={skip}>
  <div className="reveal-stage" aria-label={`Foto und KI-Vision: ${stop.title}`}>
   <img className="reveal-photo reveal-before" src={stop.before.src} alt={stop.before.title} />
   <img className="reveal-photo reveal-after" src={stop.after.src} alt={`${stop.title}, KI-Rekonstruktionsvision`} />
   <div className="scaffold" aria-hidden="true"><i/><i/><i/><b/><b/><b/></div>
   {!reduced && <div className="crew-line"><Worker index={0}/><Worker index={1}/><Worker index={2}/></div>}
   <span className="photo-stamp">{visionVisible ? "KI-Rekonstruktionsvision" : `Standortfoto · ${stop.before.date}`}</span>
  </div>
  <div className="reveal-caption"><span className="eyebrow">{reduced ? "KI-Rekonstruktionsvision" : phase}</span><button className="text-button" onClick={e => { e.stopPropagation(); skip(); }}>Überspringen <Icon name="arrow" size={16}/></button></div>
  <p className="honesty-note">Standortfoto → KI-Vision nach Archivvorlage. Andere Perspektive; Farben und Details sind interpretiert.{sound ? "" : " Ton ist aus."}</p>
 </div>;
}
