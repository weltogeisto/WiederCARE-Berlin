let ctx: AudioContext | null = null;
let on = true;
let flip = false;

export function initAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setSoundOn(v: boolean) {
  on = v;
}

function tone(freq: number, dur: number, type: OscillatorType, peak: number, at = 0) {
  if (!ctx || !on) return;
  const t0 = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function knock(freq: number) {
  if (!ctx || !on) return;
  const len = Math.floor(ctx.sampleRate * 0.06);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.value = 0.35;
  src.connect(f).connect(g).connect(ctx.destination);
  src.start();
  tone(140, 0.08, "triangle", 0.12);
}

export function hammer() {
  flip = !flip;
  knock(flip ? 1800 : 1400);
}

export function pop() {
  tone(660, 0.14, "sine", 0.12);
  tone(990, 0.2, "sine", 0.09, 0.09);
}

export function chime() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.5, "sine", 0.1, i * 0.12));
}
