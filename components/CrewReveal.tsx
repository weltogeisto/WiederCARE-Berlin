"use client";
import { useEffect, useRef } from "react";
import type { Fix } from "@/data/fixes";
import { chime, hammer } from "@/lib/sound";
import { Art } from "./Art";

// Timeline (ms): crew walks in 0-1000, scaffolding rises 1000-2500, wipe 2500-6000, crew leaves 6000-7000.
const TOTAL_MS = 7000;

function Figure({ x, delay }: { x: number; delay: number }) {
  return (
    <g transform={`translate(${x} 392)`}>
      <rect x="-8" y="-10" width="6" height="18" fill="#1f2d3d" />
      <rect x="2" y="-10" width="6" height="18" fill="#1f2d3d" />
      <rect x="-10" y="-38" width="20" height="30" rx="5" fill="#2a4a6b" />
      <rect x="-10" y="-34" width="20" height="13" rx="3" fill="#f2c94c" />
      <rect x="-10" y="-29" width="20" height="2.5" fill="#fff" />
      <circle cx="0" cy="-48" r="9" fill="#e0b894" />
      <path d="M-11 -50a11 11 0 0 1 22 0z" fill="#f28c28" />
      <rect x="-14" y="-50" width="28" height="3" rx="1.5" fill="#f28c28" />
      <g className="arm" style={{ animationDelay: `${2.6 + delay}s` }}>
        <rect x="8" y="-52" width="5" height="22" rx="2.5" fill="#2a4a6b" />
        <rect x="6" y="-58" width="16" height="7" rx="1" fill="#6b7280" />
      </g>
    </g>
  );
}

function Scaffold() {
  return (
    <svg className="scaffold" viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g stroke="#3b4654" strokeWidth="3" strokeLinecap="round" fill="none">
        {[40, 140, 240, 340].map((x) => (
          <path key={x} d={`M${x} 336V90`} />
        ))}
        {[130, 200, 270].map((y) => (
          <path key={y} d={`M30 ${y}H350`} />
        ))}
        <path d="M40 336L140 200M140 336L240 200M240 336L340 200M40 200L140 130M240 200L340 130" strokeWidth="2" />
      </g>
    </svg>
  );
}

export default function CrewReveal({ fix, onDone }: { fix: Fix; onDone: () => void }) {
  const finished = useRef(false);
  const done = useRef(onDone);
  done.current = onDone;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    done.current();
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    if (reduced) {
      timers.push(window.setTimeout(chime, 900), window.setTimeout(finish, 2200));
    } else {
      for (let t = 2600; t < 6000; t += 340) timers.push(window.setTimeout(hammer, t));
      timers.push(window.setTimeout(chime, 6000), window.setTimeout(finish, TOTAL_MS));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="reveal" onClick={finish} role="dialog" aria-label={`Rebuilding: ${fix.title}`}>
      <div className="reveal-stage">
        <div className="layer"><Art src={fix.before} /></div>
        <div className="layer reveal-after"><Art src={fix.after} /></div>
        <div className="edge" />
        <Scaffold />
        <svg className="crew" viewBox="0 0 400 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <Figure x={96} delay={0} />
          <Figure x={196} delay={0.12} />
          <Figure x={296} delay={0.24} />
        </svg>
      </div>
      <div className="reveal-caption">
        <strong>{fix.title}</strong>
        <span>Tap to skip</span>
      </div>
    </div>
  );
}
