"use client";
import { useState } from "react";
import type { Credit, Fix } from "@/data/fixes";
import { Art, isPlate } from "./Art";

function Shot({ src, tag, alt, credit }: { src: string; tag: string; alt: string; credit?: Credit }) {
  return (
    <figure className="shot">
      <div className="shot-frame">
        <img src={src} alt={alt} decoding="async" />
        <span className="tag tag-l">{tag}</span>
      </div>
      {credit && (
        <figcaption>
          {credit.label} · {credit.author} ·{" "}
          {credit.licenseUrl ? (
            <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">{credit.license}</a>
          ) : (
            credit.license
          )}{" "}
          · <a href={credit.source} target="_blank" rel="noopener noreferrer">Source</a>
        </figcaption>
      )}
    </figure>
  );
}

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
      {standIn ? (
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
      ) : (
        // Real images have different camera positions, so they stay apart: no registered slider.
        <div className="pair">
          <Shot src={fix.before} tag="Today" alt={`${fix.where} today`} credit={fix.beforeCredit} />
          <Shot
            src={fix.after}
            tag={fix.aiAfter ? "AI vision" : "Restored"}
            alt={`${fix.title}: ${fix.aiAfter ? "AI reconstruction vision" : "restored view"}`}
            credit={fix.afterCredit}
          />
        </div>
      )}
      <h2>{fix.title}</h2>
      <p className="meta">{fix.where}, {fix.period}</p>
      <p>{fix.story}</p>
      <p>{fix.today}</p>
      {fix.aiAfter && (
        <p className="note">
          AI reconstruction vision, coloured and interpreted from an archive photograph. The two views differ in angle
          and light, and fine details are not checked against building surveys.
        </p>
      )}
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
