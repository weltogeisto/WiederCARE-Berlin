"use client";

import type { CSSProperties } from "react";
import type { Stop } from "../lib/types";

type Props = {
  stop: Stop;
  value: number;
  onChange: (value: number) => void;
};

export default function ProposalComparison({ stop, value, onChange }: Props) {
  const style = { "--proposal-site-share": `${value}%` } as CSSProperties;
  return (
    <section className="proposal-comparison" aria-label={`Bildvergleich: ${stop.title}`}>
      <div className="proposal-side-labels" style={style}>
        <div className="proposal-side-label proposal-side-label-site">
          <span>Standortfoto</span>
          <small>{stop.before.date} · kein Livebild</small>
        </div>
        <div className="proposal-side-label proposal-side-label-vision">
          <span>Mögliche Zukunft · KI-Vision</span>
          <small>Experimenteller Bildvergleich</small>
        </div>
      </div>
      <div className="proposal-image-stage" style={style}>
        <div className="proposal-image-pane proposal-image-pane-site">
          <img src={stop.before.src} alt={`${stop.title}: Standortfoto, ${stop.before.date}`} draggable={false} />
        </div>
        <div className="proposal-image-pane proposal-image-pane-vision">
          <img src={stop.after.src} alt={`${stop.title}: KI-Vision nach historischer Bildvorlage`} draggable={false} />
        </div>
        <div className="proposal-swipe-divider" aria-hidden="true"><span>‹ ›</span></div>
        <input
          className="proposal-swipe"
          data-testid="proposal-swipe"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          aria-label="Bildvergleich verschieben: Standortfoto und KI-Vision"
          aria-valuetext={`${value}% Standortfoto, ${100 - value}% KI-Vision`}
          onChange={event => onChange(Number(event.currentTarget.value))}
        />
      </div>
      <div className="proposal-comparison-footer">
        <span><strong>Experimenteller Bildvergleich · unterschiedliche Blickwinkel</strong><br />Keine ausgerichtete Rekonstruktion. Die Standortaufnahme und die historische Vorlage zeigen verschiedene Perspektiven.</span>
        <span className="proposal-range-ends" aria-hidden="true"><span>0 · KI-Vision</span><span>Standortfoto · 100</span></span>
      </div>
    </section>
  );
}
