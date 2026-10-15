let audio: AudioContext | null = null;
export function unlockAudio() {
  try { audio ??= new AudioContext(); if (audio.state === "suspended") void audio.resume().catch(() => undefined); } catch { /* Sound is optional. */ }
}
export function chime(enabled: boolean, kind: "found" | "done" = "found") {
  if (!enabled || !audio || audio.state !== "running") return;
  const ctx = audio;
  [kind === "found" ? 523.25 : 392, 659.25, 783.99].forEach((hz, i) => {
    const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
    const at = ctx.currentTime + i * 0.09;
    oscillator.type = "sine"; oscillator.frequency.value = hz;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(0.07, at + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.4);
    oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(at); oscillator.stop(at + 0.42);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
