"use client";
import { useState } from "react";
import type { Fix } from "@/data/fixes";
import { Art, isPlate } from "./Art";

export default function FixSheet({
  fix,
  onClose,
  onReplay,
}: {
  fix: Fix;
  onClose: () => void;
  onReplay: () => void;
}) {
  const [pct, setPct] = useState(50);
  const standIn = isPlate(fix.before) || isPlate(fix.after);
  return (
    <section className="sheet" role="dialog" aria-label={fix.title}>
      <div className="compare">
        <div className="layer"><Art src={fix.before} /></div>
        <div className="layer" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
          <Art src={fix.after} />
        </div>
        <div className="divider" style={{ left: `${pct}%` }} />
        <span className="tag tag-l">Restored</span>
        <span className="tag tag-r">Today</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          aria-label="Compare the restored view with today"
        />
      </div>
      <h2>{fix.title}</h2>
      <p className="meta">{fix.where}, {fix.period}</p>
      <p>{fix.story}</p>
      <p>{fix.today}</p>
      {standIn && (
        <p className="note">Stand-in illustration. The real photo and reconstruction replace it in the next phase.</p>
      )}
      <div className="row">
        <button className="btn primary" onClick={onReplay}>Replay the rebuild</button>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </section>
  );
}
