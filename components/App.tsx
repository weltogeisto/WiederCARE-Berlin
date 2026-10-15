"use client";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { FIXES, type Fix } from "@/data/fixes";
import { haversine, pointAt, type LngLat, type Path } from "@/lib/geo";
import { DEMO_SPEED, DEMO_START, DEMO_WAYPOINTS, DISCOVER_RADIUS_M, TAP_SPEED, routeVia } from "@/lib/walk";
import { initAudio, pop, setSoundOn } from "@/lib/sound";
import CrewReveal from "./CrewReveal";
import FixSheet from "./FixSheet";
import type { MapApi } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

const STORE = "wiedercare:found:v1";

type Mode = "idle" | "demo" | "tap" | "gps";
type Walk = { path: Path; d: number; speed: number };

export default function App() {
  const fixes = FIXES;
  const [found, setFound] = useState<string[]>([]);
  const [reveal, setReveal] = useState<Fix | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const [sheet, setSheet] = useState<Fix | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [sound, setSound] = useState(true);
  const [note, setNote] = useState("");

  const map = useRef<MapApi | null>(null);
  const pos = useRef<LngLat>(DEMO_START);
  const walk = useRef<Walk | null>(null);
  const paused = useRef(false);
  const revealing = useRef(false);
  const foundRef = useRef<string[]>([]);
  const fixesRef = useRef<Fix[]>(FIXES);
  const gps = useRef<number | null>(null);
  const job = useRef(0);
  const lastFollow = useRef(0);

  const saveFound = useCallback((list: string[]) => {
    foundRef.current = list;
    setFound(list);
    try {
      localStorage.setItem(STORE, JSON.stringify(list));
    } catch {}
  }, []);

  const startReveal = useCallback((fix: Fix) => {
    revealing.current = true;
    paused.current = true;
    setSheet(null);
    setReplayKey((k) => k + 1);
    setReveal(fix);
  }, []);

  const discover = useCallback(
    (fix: Fix) => {
      saveFound([...foundRef.current, fix.id]);
      pop();
      startReveal(fix);
    },
    [saveFound, startReveal],
  );

  const moveTo = useCallback(
    (p: LngLat, opts: { follow?: boolean; silent?: boolean } = {}) => {
      pos.current = p;
      if (!opts.silent) map.current?.setUser(p);
      if (opts.follow) {
        const now = performance.now();
        if (now - lastFollow.current > 280) {
          lastFollow.current = now;
          map.current?.follow(p);
        }
      }
      if (revealing.current) return;
      for (const f of fixesRef.current) {
        if (foundRef.current.includes(f.id)) continue;
        if (haversine(p, [f.lng, f.lat]) <= DISCOVER_RADIUS_M) {
          discover(f);
          break;
        }
      }
    },
    [discover],
  );

  const stopGps = useCallback(() => {
    if (gps.current !== null) {
      navigator.geolocation.clearWatch(gps.current);
      gps.current = null;
    }
  }, []);

  // Restore progress. Fixes are bundled: GitHub Pages is static, so there is no API route.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "[]");
      if (Array.isArray(saved)) {
        foundRef.current = saved;
        setFound(saved);
      }
    } catch {}
    return stopGps;
  }, [stopGps]);

  // Walk loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const w = walk.current;
      if (w && !paused.current) {
        w.d = Math.min(w.path.total, w.d + w.speed * dt);
        moveTo(pointAt(w.path, w.d), { follow: true });
        if (w.d >= w.path.total && walk.current === w) {
          walk.current = null;
          setMode("idle");
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [moveTo]);

  const cancelMotion = useCallback(() => {
    job.current++;
    walk.current = null;
    stopGps();
    setMode("idle");
    setNote("");
  }, [stopGps]);

  const startDemo = async () => {
    initAudio();
    cancelMotion();
    const mine = job.current;
    paused.current = false;
    revealing.current = false;
    setReveal(null);
    setSheet(null);
    saveFound([]);
    setMode("demo");
    setNote("Planning the walk…");
    moveTo(DEMO_START, { follow: true });
    const path = await routeVia(DEMO_WAYPOINTS);
    if (job.current !== mine) return;
    setNote("");
    moveTo(path.pts[0], { follow: true });
    walk.current = { path, d: 0, speed: DEMO_SPEED };
  };

  const onTap = async (target: LngLat) => {
    if (revealing.current) return;
    initAudio();
    cancelMotion();
    const mine = job.current;
    setMode("tap");
    const path = await routeVia([pos.current, target]);
    if (job.current !== mine) return;
    walk.current = { path, d: 0, speed: TAP_SPEED };
  };

  const onDrag = (p: LngLat) => moveTo(p, { silent: true });

  const toggleGps = () => {
    if (mode === "gps") {
      cancelMotion();
      return;
    }
    if (!navigator.geolocation) {
      setNote("This device has no GPS.");
      return;
    }
    initAudio();
    cancelMotion();
    setMode("gps");
    setNote("Waiting for GPS…");
    gps.current = navigator.geolocation.watchPosition(
      (g) => {
        setNote("");
        moveTo([g.coords.longitude, g.coords.latitude], { follow: true });
      },
      (e) => {
        cancelMotion();
        setNote(e.code === 1 ? "Location is blocked. Allow it in your browser settings." : "No GPS signal.");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
  };

  const onRevealDone = useCallback(() => {
    revealing.current = false;
    paused.current = false;
    setReveal(null);
  }, []);

  return (
    <main>
      <MapView
        fixes={fixes}
        found={found}
        start={DEMO_START}
        apiRef={map}
        onTap={onTap}
        onDragStart={cancelMotion}
        onDrag={onDrag}
        onOpen={setSheet}
      />
      <header className="hud-top">
        <div className="brand">
          <h1>WiederCARE</h1>
          <p>{found.length}/{fixes.length} fixes found</p>
        </div>
      </header>
      <div className="hud-bottom">
        <p className="hint" role="status">
          {note || "Tap the map to walk there. Drag the blue dot."}
        </p>
        <div className="row">
          <button className="btn primary" onClick={startDemo} aria-pressed={mode === "demo"}>Demo walk</button>
          <button className="btn" onClick={toggleGps} aria-pressed={mode === "gps"}>My GPS</button>
          <button
            className="btn"
            aria-pressed={sound}
            onClick={() => {
              initAudio();
              setSoundOn(!sound);
              setSound(!sound);
            }}
          >
            {sound ? "Sound on" : "Sound off"}
          </button>
        </div>
      </div>
      {sheet && (
        <FixSheet fix={sheet} onClose={() => setSheet(null)} onReplay={() => startReveal(sheet)} />
      )}
      {reveal && <CrewReveal key={replayKey} fix={reveal} onDone={onRevealDone} />}
    </main>
  );
}
