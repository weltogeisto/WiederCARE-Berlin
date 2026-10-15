"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { Fix } from "@/data/fixes";
import type { LngLat } from "@/lib/geo";

export type MapApi = {
  setUser: (p: LngLat) => void;
  follow: (p: LngLat) => void;
};

type Props = {
  fixes: Fix[];
  found: string[];
  start: LngLat;
  apiRef: { current: MapApi | null };
  onTap: (p: LngLat) => void;
  onDragStart: () => void;
  onDrag: (p: LngLat) => void;
  onOpen: (f: Fix) => void;
};

const PIN_SVG =
  '<svg viewBox="0 0 36 44" width="36" height="44" aria-hidden="true"><path d="M18 43C18 43 3 28 3 17a15 15 0 0 1 30 0c0 11-15 26-15 26z" fill="#8f2f25" stroke="#fff" stroke-width="2.5"/><path d="M10 23v-7l8-6 8 6v7z" fill="#fff"/><rect x="15.5" y="17.5" width="5" height="5.5" fill="#8f2f25"/></svg>';

export default function MapView({ fixes, found, start, apiRef, onTap, onDragStart, onDrag, onOpen }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pins = useRef<Map<string, maplibregl.Marker>>(new Map());
  const cb = useRef({ onTap, onDragStart, onDrag, onOpen });
  cb.current = { onTap, onDragStart, onDrag, onOpen };

  useEffect(() => {
    // Turbopack breaks MapLibre's default worker URL; scripts/copy-worker.mjs puts the worker in /public.
    maplibregl.setWorkerUrl(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/maplibre-gl-worker.mjs`);
    const map = new maplibregl.Map({
      container: el.current as HTMLDivElement,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [13.4005, 52.5176],
      zoom: 16.2,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const dot = document.createElement("div");
    dot.className = "user-dot";
    dot.addEventListener("click", (e) => e.stopPropagation());
    const user = new maplibregl.Marker({ element: dot, draggable: true }).setLngLat(start).addTo(map);
    user.on("dragstart", () => cb.current.onDragStart());
    user.on("drag", () => {
      const p = user.getLngLat();
      cb.current.onDrag([p.lng, p.lat]);
    });

    map.on("click", (e) => cb.current.onTap([e.lngLat.lng, e.lngLat.lat]));

    apiRef.current = {
      setUser: (p) => user.setLngLat(p),
      follow: (p) => map.easeTo({ center: p, duration: 320, easing: (t) => t, essential: true }),
    };

    const pinMap = pins.current;
    return () => {
      apiRef.current = null;
      pinMap.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const f of fixes) {
      if (!found.includes(f.id) || pins.current.has(f.id)) continue;
      const b = document.createElement("button");
      b.className = "fix-pin";
      b.setAttribute("aria-label", f.title);
      b.innerHTML = PIN_SVG;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        cb.current.onOpen(f);
      });
      pins.current.set(f.id, new maplibregl.Marker({ element: b, anchor: "bottom" }).setLngLat([f.lng, f.lat]).addTo(map));
    }
    for (const [id, marker] of Array.from(pins.current)) {
      if (!found.includes(id)) {
        marker.remove();
        pins.current.delete(id);
      }
    }
  }, [fixes, found]);

  return <div ref={el} className="map" />;
}
