"use client";
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import type { Point } from "../lib/geo";
import type { Stop } from "../lib/types";
import Icon from "./Icon";
import { asset } from "../lib/assets";

type Props = { point: Point; route: Point[]; stops: Stop[]; found: Set<string>; onWalk: (p: Point) => void; onDrag: (p: Point) => void; onSelect: (id: string) => void; follow: boolean };
export default function MapView(props: Props) {
 const node = useRef<HTMLDivElement>(null); const map = useRef<maplibregl.Map | null>(null);
 const walker = useRef<maplibregl.Marker | null>(null); const markers = useRef(new Map<string, maplibregl.Marker>());
 const latest = useRef(props); const [unavailable, setUnavailable] = useState(false); const [ready, setReady] = useState(false);
 useEffect(() => { latest.current = props; });
 useEffect(() => {
  if (!node.current) return;
  let instance: maplibregl.Map | null = null; const stopMarkers = markers.current;
  const failTimer = setTimeout(() => { if (!instance?.isStyleLoaded()) setUnavailable(true); }, 14000);
  try {
   maplibregl.setWorkerUrl(asset("vendor/maplibre-gl-worker.mjs"));
   instance = new maplibregl.Map({ container: node.current, style: "https://tiles.openfreemap.org/styles/liberty", center: [latest.current.point.lng, latest.current.point.lat], zoom: 16.2, maxZoom: 19, minZoom: 13, attributionControl: false, pitch: 0, maxPitch: 0 });
   map.current = instance;
   // Attribution is rendered by the shell, above the mobile dock.
   instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
   const el = document.createElement("div"); el.className = "walker"; el.setAttribute("aria-label", "Deine Position · zieh mich");
   el.innerHTML = '<span class="walker-pulse"></span><span class="walker-core"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="5" r="2"/><path d="m10 10 3-2 3 4 3 1M13 8l-2 7-4 5m4-5 4 1 1 5M10 10l-3 4-3 1"/></svg></span>';
   const dot = new maplibregl.Marker({ element: el, draggable: true }).setLngLat([latest.current.point.lng, latest.current.point.lat]).addTo(instance); walker.current = dot;
   dot.on("dragstart", () => latest.current.onDrag({ lat: dot.getLngLat().lat, lng: dot.getLngLat().lng }));
   dot.on("dragend", () => latest.current.onDrag({ lat: dot.getLngLat().lat, lng: dot.getLngLat().lng }));
   instance.on("click", e => latest.current.onWalk({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
   instance.on("styleimagemissing", e => { if (instance && !instance.hasImage(e.id)) instance.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) }); });
   instance.on("load", () => {
    if (!instance) return; clearTimeout(failTimer); setReady(true); setUnavailable(false);
    // Original palette: a quiet atlas, not the source app's yellow skin.
    for (const layer of instance.getStyle().layers) {
     if (layer.type === "background") instance.setPaintProperty(layer.id, "background-color", "#eeece4");
     if (layer.type === "fill" && /water/i.test(layer.id)) instance.setPaintProperty(layer.id, "fill-color", "#a9c4c4");
     if (layer.type === "fill" && /building/i.test(layer.id)) { instance.setPaintProperty(layer.id, "fill-color", "#d7d0bf"); instance.setPaintProperty(layer.id, "fill-outline-color", "#b8ae99"); }
     if (layer.type === "fill" && /park|landcover|landuse.*grass/i.test(layer.id)) instance.setPaintProperty(layer.id, "fill-color", "#dbe0d0");
     if (layer.type === "symbol" && /poi|housenumber|transit/i.test(layer.id)) instance.setLayoutProperty(layer.id, "visibility", "none");
    }
    instance.addSource("tour-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: latest.current.route.map(p => [p.lng, p.lat]) } } });
    instance.addLayer({ id: "tour-route-halo", type: "line", source: "tour-route", paint: { "line-color": "#fffaf1", "line-width": 7, "line-opacity": 0.85 } });
    instance.addLayer({ id: "tour-route-line", type: "line", source: "tour-route", paint: { "line-color": "#b34a31", "line-width": 3, "line-dasharray": [1.1, 1.7] }, layout: { "line-cap": "round" } });
    const bounds = new maplibregl.LngLatBounds(); latest.current.route.forEach(p => bounds.extend([p.lng, p.lat]));
    instance.fitBounds(bounds, { padding: { top: 95, right: 68, bottom: window.innerWidth < 760 ? 300 : 90, left: 55 }, duration: 0, maxZoom: 16.7 });
   });
  } catch { queueMicrotask(() => setUnavailable(true)); }
  return () => { clearTimeout(failTimer); stopMarkers.forEach(m => m.remove()); stopMarkers.clear(); walker.current?.remove(); instance?.remove(); map.current = null; };
 }, []);
 useEffect(() => {
  walker.current?.setLngLat([props.point.lng, props.point.lat]);
  if (props.follow && map.current && ready) map.current.easeTo({ center: [props.point.lng, props.point.lat], duration: 150, padding: { top: 0, left: 0, right: 0, bottom: window.innerWidth < 760 ? 200 : 0 } });
 }, [props.point, props.follow, ready]);
 useEffect(() => {
  if (!map.current || !ready) return;
  const instance = map.current;
  for (const [id, marker] of markers.current) if (!props.found.has(id)) { marker.remove(); markers.current.delete(id); }
  props.stops.filter(s => props.found.has(s.id)).forEach(s => {
   if (markers.current.has(s.id)) return;
   const el = document.createElement("button"); el.className = "stop-pin"; el.textContent = s.number; el.setAttribute("aria-label", `${s.title} ansehen`);
   el.addEventListener("click", e => { e.stopPropagation(); latest.current.onSelect(s.id); });
   markers.current.set(s.id, new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([s.lng, s.lat]).addTo(instance));
  });
  const source = instance.getSource("tour-route") as GeoJSONSource | undefined;
  source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: props.route.map(p => [p.lng, p.lat]) } });
 }, [props.stops, props.found, props.route, ready]);
 return <><div className="map-canvas" ref={node} aria-label="Interaktive Karte um das Berliner Schloss" data-map-ready={ready} />
  {unavailable && <div className="map-fallback"><Icon name="compass" size={36} /><h2>Die Karte macht gerade Pause.</h2><p>Dein Browser oder die Verbindung kann die Kartenkacheln nicht laden. Der geführte Spaziergang und die Archivbilder funktionieren trotzdem.</p><svg viewBox="0 0 360 260" aria-label="Schematische Route"><path d="M270 10Q230 90 255 140T210 255" stroke="#a9c4c4" strokeWidth="30" fill="none" /><rect x="140" y="85" width="80" height="80" fill="#d7d0bf"/><text x="155" y="128">Schloss</text><path d="M140 45H280V185H75V220" stroke="#b34a31" strokeWidth="3" fill="none" strokeDasharray="5 5"/><text x="12" y="250">Schema · keine Navigationskarte</text></svg></div>}
 </>;
}
