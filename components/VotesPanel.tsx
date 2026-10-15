"use client";
import { useEffect, useState } from "react";
import manifest from "../research/public-proposals.json";
import { publicIssueSupport } from "../lib/votes";
import "../app/votes.css";

type VoteState = { id: string; refresh: number; status: "ready"; count: number } | { id: string; refresh: number; status: "error" };
export default function VotesPanel({ stopId }: { stopId: string }) {
 const proposal = manifest.proposals.find(p => p.id === stopId);
 const [state, setState] = useState<VoteState | null>(null);
 const [refresh, setRefresh] = useState(0);
 const current = state?.id === stopId && state.refresh === refresh ? state : null;
 useEffect(() => {
  if (!proposal) return;
  const controller = new AbortController(); let active = true;
  const timer = setTimeout(() => controller.abort(), 10000);
  fetch(`https://api.github.com/repos/${manifest.repository}/issues/${proposal.issueNumber}`, { signal: controller.signal, headers: { Accept: "application/vnd.github+json" }, credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store" })
   .then(async response => { if (!response.ok) throw new Error(`Public votes HTTP ${response.status}`); return response.json(); })
   .then(value => { const count = publicIssueSupport(value, proposal.issueNumber); if (active) setState({ id: stopId, refresh, status: "ready", count }); })
   .catch(() => { if (active) setState({ id: stopId, refresh, status: "error" }); })
   .finally(() => clearTimeout(timer));
  return () => { active = false; clearTimeout(timer); controller.abort(); };
 }, [proposal, stopId, refresh]);
 if (!proposal) return <aside className="votes-panel">Für diesen Vorschlag ist noch keine öffentliche Abstimmung eingerichtet.</aside>;
 return <aside className="votes-panel" aria-label="Öffentliche Unterstützung" data-testid="votes-panel" data-proposal-id={stopId} data-vote-status={current?.status ?? "loading"}>
  <div className="votes-head"><span className="eyebrow">DEIN STADTBILD. DEINE STIMME.</span><span className="votes-public">Öffentlich</span></div>
  <h3>Würdest du das unterstützen?</h3>
  <div className="votes-count" aria-live="polite">{!current ? <span>Öffentliche Stimmen werden geladen …</span> : current.status === "error" ? <span>Stimmenzahl derzeit nicht abrufbar. Die öffentliche Abstimmung auf GitHub bleibt erreichbar.</span> : <><strong data-testid="support-count">{current.count.toLocaleString("de-DE")}</strong><span>{current.count === 1 ? "Unterstützung" : "Unterstützungen"}<small>👍 am öffentlichen Vorschlag auf GitHub</small></span></>}</div>
  <a className="votes-cta" href={proposal.issueUrl} target="_blank" rel="noreferrer" data-testid="support-link">Vorschlag unterstützen <span aria-hidden="true">↗</span></a>
  <p className="votes-how">Auf GitHub dem Eröffnungsbeitrag ein <strong>👍</strong> geben. GitHub-Konto erforderlich; die Reaktion ist öffentlich. Entfernen zieht sie zurück.</p>
  <div className="votes-links"><button type="button" onClick={() => setRefresh(n => n + 1)} disabled={!current}>Stimmen aktualisieren</button><a href={`${proposal.issueUrl}#issuecomment-new`} target="_blank" rel="noreferrer">Einwand oder Alternative ↗</a></div>
  <p className="votes-caveat">Eine Unterstützung pro GitHub-Konto, nicht pro nachgewiesener Person. Offenes Stimmungsbild — keine repräsentative Umfrage und kein amtliches Verfahren.</p>
 </aside>;
}
