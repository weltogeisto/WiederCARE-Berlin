import type { ReactElement, ReactNode } from "react";

// Stand-in illustrations for the three fixes. Phase 5 replaces them with real before photos
// and image-model after-images: set before/after in data/fixes.ts to image URLs.

const W = 400;
const H = 440;

function Grid(p: {
  x: number; y: number; cols: number; rows: number; w: number; h: number;
  gx: number; gy: number; fill: string; skip?: (r: number, c: number) => boolean;
}) {
  const out: ReactElement[] = [];
  for (let r = 0; r < p.rows; r++)
    for (let c = 0; c < p.cols; c++) {
      if (p.skip?.(r, c)) continue;
      out.push(<rect key={`${r}-${c}`} x={p.x + c * p.gx} y={p.y + r * p.gy} width={p.w} height={p.h} fill={p.fill} />);
    }
  return <>{out}</>;
}

function Scene({ ground, children }: { ground: "water" | "paving"; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="art">
      <rect width={W} height={H} fill="#c9dbe6" />
      <rect y="330" width={W} height="110" fill={ground === "water" ? "#5f8ea3" : "#aeb4b8"} />
      {ground === "water" && (
        <path d="M20 350h70M150 362h90M270 348h80M60 380h110M230 392h100" stroke="#7fa8bb" strokeWidth="2" />
      )}
      {children}
    </svg>
  );
}

function Trees() {
  return (
    <g fill="#6f9a7a">
      <circle cx="352" cy="300" r="34" />
      <circle cx="384" cy="318" r="26" />
    </g>
  );
}

function Rail() {
  return (
    <g>
      <rect y="396" width={W} height="44" fill="#3e4a56" />
      <rect y="390" width={W} height="8" fill="#56636f" />
    </g>
  );
}

const WIN = "#5b6b7a";
const SAND = "#d3c4a6";
const ROOF = "#7b4a3a";

function Palace() {
  return (
    <g>
      <rect x="30" y="130" width="190" height="200" fill="#cdbfa4" />
      <rect x="24" y="108" width="202" height="24" fill="#8a7f6b" />
      <Grid x={48} y={150} cols={5} rows={4} w={18} h={26} gx={34} gy={44} fill={WIN} />
    </g>
  );
}

function F1Before() {
  return (
    <Scene ground="water">
      <Trees />
      <Palace />
      <Rail />
    </Scene>
  );
}

function F1After() {
  return (
    <Scene ground="water">
      <Trees />
      <rect x="212" y="188" width="180" height="142" fill={SAND} />
      <polygon points="206,188 302,128 398,188" fill={ROOF} />
      {[262, 302, 342].map((x) => (
        <g key={x}>
          <rect x={x - 9} y="160" width="18" height="22" fill={SAND} />
          <polygon points={`${x - 11},160 ${x},146 ${x + 11},160`} fill={ROOF} />
          <rect x={x - 4} y="166" width="8" height="12" fill={WIN} />
        </g>
      ))}
      <Grid x={228} y={206} cols={4} rows={3} w={16} h={24} gx={38} gy={40} fill={WIN} />
      <Palace />
      <Rail />
    </Scene>
  );
}

function F2Before() {
  return (
    <Scene ground="water">
      <rect x="20" y="124" width="360" height="206" fill="#b8bcbf" />
      <rect x="14" y="112" width="372" height="14" fill="#8d9296" />
      <Grid x={34} y={142} cols={12} rows={5} w={18} h={28} gx={29} gy={37} fill="#7f95a3" />
      <Rail />
    </Scene>
  );
}

function F2After() {
  return (
    <Scene ground="water">
      <rect x="20" y="190" width="112" height="140" fill={SAND} />
      <polygon points="14,190 76,138 138,190" fill={ROOF} />
      <Grid x={34} y={208} cols={3} rows={3} w={16} h={22} gx={32} gy={36} fill={WIN} skip={(r, c) => r === 0 && c === 1} />
      <rect x="130" y="146" width="100" height="184" fill="#cdbfa4" />
      <polygon points="124,146 180,98 236,146" fill={ROOF} />
      <Grid x={146} y={164} cols={3} rows={4} w={16} h={24} gx={30} gy={40} fill={WIN} />
      <rect x="232" y="118" width="46" height="212" fill="#b9a98a" />
      <polygon points="226,118 255,52 284,118" fill="#4f8f7a" />
      <Grid x={248} y={140} cols={1} rows={4} w={14} h={22} gx={0} gy={46} fill={WIN} />
      <rect x="278" y="172" width="108" height="158" fill={SAND} />
      <polygon points="272,172 332,126 392,172" fill={ROOF} />
      <Grid x={292} y={190} cols={3} rows={3} w={16} h={22} gx={32} gy={40} fill={WIN} skip={(r, c) => r === 2 && c === 2} />
      <Rail />
    </Scene>
  );
}

function Corner() {
  return (
    <g>
      <rect x="24" y="150" width="64" height="180" fill="#a5432f" />
      <rect x="24" y="206" width="64" height="5" fill="#c9654a" />
      <rect x="24" y="262" width="64" height="5" fill="#c9654a" />
      <rect x="18" y="138" width="76" height="14" fill="#7e2f20" />
      <Grid x={38} y={162} cols={1} rows={3} w={22} h={30} gx={0} gy={56} fill="#3b2a26" />
    </g>
  );
}

function F3Before() {
  return (
    <Scene ground="paving">
      <Trees />
      <Corner />
      <g fill="#8a94a0">
        <rect x="96" y="300" width="290" height="4" />
        <rect x="96" y="318" width="290" height="4" />
        {[96, 150, 204, 258, 312, 366].map((x) => (
          <rect key={x} x={x} y="296" width="4" height="34" />
        ))}
      </g>
    </Scene>
  );
}

function F3After() {
  return (
    <Scene ground="paving">
      <Trees />
      <rect x="24" y="150" width="352" height="180" fill="#a5432f" />
      <rect x="18" y="138" width="364" height="14" fill="#7e2f20" />
      <rect x="24" y="206" width="352" height="5" fill="#c9654a" />
      <rect x="24" y="262" width="352" height="5" fill="#c9654a" />
      <Grid x={38} y={162} cols={8} rows={3} w={22} h={30} gx={43} gy={56} fill="#3b2a26" skip={(r, c) => r === 2 && (c === 3 || c === 4)} />
      <path d="M178 330V292a22 22 0 0 1 44 0V330z" fill="#2b1f1b" />
    </Scene>
  );
}

const PLATES: Record<string, () => ReactElement> = {
  "f1-before": F1Before,
  "f1-after": F1After,
  "f2-before": F2Before,
  "f2-after": F2After,
  "f3-before": F3Before,
  "f3-after": F3After,
};

export const isPlate = (src: string) => src.startsWith("plate:");

export function Art({ src }: { src: string }) {
  if (isPlate(src)) {
    const Plate = PLATES[src.slice(6)];
    return Plate ? <Plate /> : null;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="art" src={src} alt="" />;
}
