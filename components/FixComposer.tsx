"use client";
import { useEffect, useState } from "react";
import type { Point } from "../lib/geo";
import { saveDraft, listDrafts, deleteDraft, type Draft } from "../lib/drafts";
import Modal from "./Modal";
import Icon from "./Icon";

async function resizePhoto(file: File): Promise<Blob> {
 if (file.size > 20 * 1024 * 1024) throw new Error("Das Foto ist zu groß. Bitte nimm ein Bild unter 20 MB.");
 if (!/image\/(jpeg|png|webp|avif|heic|heif)/i.test(file.type)) throw new Error("Bitte wähle ein JPG-, PNG- oder WebP-Foto.");
 let bitmap: ImageBitmap;
 try { bitmap = await createImageBitmap(file); } catch { throw new Error("Dieses Bildformat kann dein Browser nicht lesen. Bitte als JPG oder PNG speichern."); }
 try {
  const scale = Math.min(1, 1536 / Math.max(bitmap.width, bitmap.height)); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d"); if (!context) throw new Error("Die Fotoverarbeitung ist in diesem Browser nicht verfügbar.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Das Foto konnte nicht vorbereitet werden.")), "image/jpeg", 0.85));
 } finally { bitmap.close(); }
}
function Thumb({ photo }: { photo: Blob }) {
 const [url, setUrl] = useState("");
 useEffect(() => { const src = URL.createObjectURL(photo); queueMicrotask(() => setUrl(src)); return () => URL.revokeObjectURL(src); }, [photo]);
 return url ? <img src={url} alt="Dein lokal gespeichertes Foto"/> : null;
}
function dataUrl(blob: Blob): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Export fehlgeschlagen.")); reader.readAsDataURL(blob); }); }
async function downloadDraft(draft: Draft) {
 const data = { ...draft, before: await dataUrl(draft.before), after: draft.after ? await dataUrl(draft.after) : null, format: "wiedercare-draft-v1", visibility: "local-only" };
 const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = `wiedercare-${draft.id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function FixComposer({ point, onClose }: { point: Point; onClose: () => void }) {
 const [before, setBefore] = useState<Blob | null>(null); const [after, setAfter] = useState<Blob | null>(null); const [title, setTitle] = useState(""); const [instruction, setInstruction] = useState(""); const [position, setPosition] = useState<Point | null>(null);
 const [drafts, setDrafts] = useState<Draft[]>([]); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [busy, setBusy] = useState(false); const [removing, setRemoving] = useState<string | null>(null);
 useEffect(() => { let active = true; listDrafts().then(items => { if (active) setDrafts(items); }).catch(() => { if (active) setError("Lokaler Speicher nicht verfügbar. Prüfe die Browser-Einstellungen; es wurde nichts hochgeladen."); }); return () => { active = false; }; }, []);
 const photo = async (file: File | undefined, kind: "before" | "after") => { if (!file) return; setBusy(true); setError(""); setNotice(""); try { const blob = await resizePhoto(file); if (kind === "before") setBefore(blob); else setAfter(blob); } catch (e) { setError(e instanceof Error ? e.message : "Das Foto konnte nicht gelesen werden."); } finally { setBusy(false); } };
 const submit = async (event: React.SubmitEvent<HTMLFormElement>) => {
  event.preventDefault(); if (!before || busy) return; setError(""); setNotice(""); setBusy(true);
  try {
   const draft: Draft = { id: crypto.randomUUID(), title: title.trim(), instruction: instruction.trim(), before, ...(after ? { after } : {}), lat: position?.lat ?? null, lng: position?.lng ?? null, createdAt: new Date().toISOString() };
   await saveDraft(draft); setDrafts(await listDrafts()); setBefore(null); setAfter(null); setTitle(""); setInstruction(""); setPosition(null); setNotice("Gespeichert. Deine Idee bleibt nur in diesem Browser.");
  } catch (e) { setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen. Vielleicht ist der Gerätespeicher voll."); } finally { setBusy(false); }
 };
 const remove = async (id: string) => { try { await deleteDraft(id); setDrafts(await listDrafts()); setRemoving(null); setNotice("Lokaler Entwurf gelöscht."); } catch { setError("Löschen fehlgeschlagen."); } };
 return <Modal title="Deine kleine Stadtwerkstatt" onClose={onClose} className="composer"><div className="stop-heading"><span className="eyebrow accent">Deine Stadt. Deine Idee.</span><h2>Was fehlt hier?</h2><p>Halte einen Ort fest, der eine zweite Zukunft verdient.</p></div>
  <div className="privacy-note"><Icon name="info"/><p><strong>Nur auf deinem Gerät.</strong> Kein Upload, kein Konto, keine KI-Kosten. Diese kostenlose Version sammelt Fotoideen — sie erzeugt keine Nachher-Bilder. Ein eigenes fertiges Bild kannst du ergänzen.</p></div>
  <form onSubmit={submit}>
   <div className="photo-inputs"><label className={`photo-pick ${before ? "has-photo" : ""}`}>{before ? <Thumb photo={before}/> : <><Icon name="camera" size={32}/><strong>Ein Foto hinzufügen</strong><span>JPG, PNG, WebP · max. 20 MB</span></>}<input data-testid="before-input" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" onChange={e => void photo(e.target.files?.[0], "before")} disabled={busy}/></label><label className="camera-pick"><Icon name="camera" size={18}/> Kamera öffnen<input type="file" accept="image/*" capture="environment" onChange={e => void photo(e.target.files?.[0], "before")} disabled={busy}/></label></div>
   <label className="field">Wie heißt deine Idee?<input name="title" required minLength={2} maxLength={80} placeholder="Zum Beispiel: Ein Garten statt Asphalt" value={title} onChange={e => setTitle(e.target.value)}/></label>
   <label className="field">Was würdest du verändern?<textarea name="instruction" required minLength={3} maxLength={400} rows={3} placeholder="Beschreibe, was hier anders sein könnte …" value={instruction} onChange={e => setInstruction(e.target.value)}/></label>
   <div className="position-choice"><button type="button" className="text-button" onClick={() => setPosition(position ? null : point)}><Icon name={position ? "check" : "pin"}/>{position ? "Kartenposition übernommen · entfernen" : "Kartenposition hinzufügen"}</button><span>Position des blauen Punkts, nicht automatisch dein Geräte-GPS.</span></div>
   <details className="optional-after"><summary>Schon ein eigenes Nachher-Bild? <span>Optional</span></summary><label className="field">Eigenes Nachher-Bild ergänzen<input data-testid="after-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => void photo(e.target.files?.[0], "after")}/></label>{after && <div className="after-thumb"><Thumb photo={after}/><span>Dein Bild wird mit dem Entwurf gespeichert.</span></div>}</details>
   {error && <p role="alert" className="error-note">{error}</p>}{notice && <p role="status" className="success-note">{notice}</p>}
   <button className="primary-button full-width" type="submit" disabled={!before || !title.trim() || !instruction.trim() || busy}>{busy ? "Wird vorbereitet …" : "Idee auf diesem Gerät speichern"}<Icon name="arrow"/></button>
  </form>
  <section className="drafts"><div className="section-heading"><h3>Deine Sammlung</h3><span>{drafts.length} / 12</span></div>{drafts.length === 0 ? <p className="empty-note">Noch keine eigenen Ideen. Fotos werden auf 1536 px verkleinert, Metadaten dabei entfernt. Löschen der Browserdaten löscht auch diese Sammlung — exportiere Wichtiges.</p> : drafts.map(d => <article className="draft-card" key={d.id}><Thumb photo={d.before}/><div><h4>{d.title}</h4><p>{d.instruction}</p><span className="draft-badge">Nur lokal{d.after ? " · mit Nachher-Bild" : " · Fotoidee"}</span><div className="draft-actions"><button type="button" className="text-button" onClick={() => void downloadDraft(d).catch(() => setError("Export fehlgeschlagen."))}><Icon name="download" size={16}/> Export</button><button type="button" className="text-button danger" onClick={() => removing === d.id ? void remove(d.id) : setRemoving(d.id)}><Icon name="trash" size={16}/>{removing === d.id ? "Wirklich löschen" : "Löschen"}</button></div></div></article>)}</section>
 </Modal>;
}
