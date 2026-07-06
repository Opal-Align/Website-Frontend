"use client";

/**
 * PlatformSection.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * AUTOPLAY-TILE version.
 *
 * • No more scroll-jacking. The section sits in normal document flow.
 * • A single tile shows one module at a time. Every module gets an
 *   AUTOPLAY_MS window; while it's the active one, a ring drawn around its
 *   icon fills up (and a thin bar under the tile fills with it) to show
 *   how much of that window is left. When the ring completes, the tile
 *   dissolves out, the next module dissolves in (same burst-particle
 *   effect as before), and the ring resets on the new icon.
 * • Clicking an icon jumps straight to that module and resets the timer.
 * • Hovering the tile or the icon row pauses the countdown — nothing
 *   changes out from under someone mid-read.
 * • prefers-reduced-motion: the ring still shows position but never
 *   auto-advances; switching only happens via click.
 * • The ring/bar are updated imperatively via refs on every animation
 *   frame — not React state — so the 60fps tick never triggers a
 *   re-render. Only an actual module change touches state.
 *
 * Props:
 *   navbarHeight  number  Top padding so the tile doesn't sit under a fixed navbar (default 64).
 *   autoplayMs    number  How long each module stays active before advancing (default 4500).
 *
 * Dependencies: framer-motion   (npm i framer-motion)
 * Usage:        <PlatformSection navbarHeight={64} />
 *               Drop into any React / Next.js page on a dark (#0a0a0a) bg.
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";

/* ─── Constants ───────────────────────────────────────────────────── */
const N            = 4;
const BURST_DUR    = 700;    // ms — dissolve burst duration (each direction)
const PS           = 3;      // burst particle pixel size
const EASE         = [0.22, 1, 0.36, 1];
const RING_R        = 37;
const RING_CIRC     = 2 * Math.PI * RING_R;

/* ─── Inline icons (swap for <img src=... /> if you have real assets) ── */
const IconSchedule = ({ active }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
    stroke={active ? "#0a0a0a" : "rgba(255,255,255,0.45)"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);
const IconProduce = ({ active }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
    stroke={active ? "#0a0a0a" : "rgba(255,255,255,0.45)"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
    <path d="M4 7h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
    <path d="M3 7l4-4h10l4 4" />
    <circle cx="12" cy="13" r="2.5" />
  </svg>
);
const IconCollect = ({ active }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
    stroke={active ? "#0a0a0a" : "rgba(255,255,255,0.45)"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
    <circle cx="12" cy="7" r="3.5" />
    <line x1="12" y1="5.5" x2="12" y2="8.5" />
    <path d="M3 19c0-2 2.5-3.5 5-3.5h8c2.5 0 5 1.5 5 3.5" />
  </svg>
);
const IconRelay = ({ active }) => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="none"
    stroke={active ? "#0a0a0a" : "rgba(255,255,255,0.45)"} strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.4s" }}>
    <path d="M5 3L5 21" />
    <path d="M5 3L14 6L5 10" />
    <path d="M19 10L19 21" />
    <path d="M19 10L10 13L19 17" />
  </svg>
);

/* ─── Data ─────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "schedule", label: "Schedule", num: "01", glyph: "α · 001", Icon: IconSchedule,
    title: "Identified, verified, and filled — automatically.",
    features: [
      "Fills from prioritized waitlist in real time",
      "No-show risk flagged 48 hrs ahead",
      "One view — no calls, no spreadsheets",
    ],
  },
  {
    id: "produce", label: "Produce", num: "02", glyph: "β · 002", Icon: IconProduce,
    title: "Reengaged, reactivated, recovered — automatically.",
    features: [
      "Treatment plans auto-queued into workflow",
      "Right outreach, right channel, right time",
      "Accepted → scheduled → completed",
    ],
  },
  {
    id: "collect", label: "Collect", num: "03", glyph: "γ · 003", Icon: IconCollect,
    title: "Surfaced, pursued, collected, documented — automatically.",
    features: [
      "Highest-recovery balances surfaced first",
      "Automated statements and payment links",
      "Denial patterns caught before write-off",
    ],
  },
  {
    id: "relay", label: "Relay", num: "04", glyph: "δ · 004", Icon: IconRelay,
    title: "Centralized, real-time, prioritized, and interactive.",
    features: [
      "SMS, email, and portal unified in one view",
      "Auto-routing to the right channel every time",
      "Full patient history, always in context",
    ],
  },
];

/* ─── Particle helpers ────────────────────────────────────────────── */
function buildBurst(W, H) {
  const cols = Math.ceil(W / PS), rows = Math.ceil(H / PS), pts = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pts.push({
        x: c * PS, y: r * PS,
        ox: (Math.random() - 0.5) * W * 0.6,
        oy: (Math.random() - 0.5) * H * 0.6,
        delay: Math.random() * 0.4,
      });
  return pts;
}
function buildTwinkle(w, h) {
  const count = Math.round((w * h) / 1600);
  const pts = [];
  for (let i = 0; i < count; i++) {
    pts.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      baseAlpha: Math.random() * 0.5 + 0.15,
      speed: Math.random() * 0.05 + 0.02,
      offset: Math.random() * Math.PI * 2,
    });
  }
  return pts;
}
function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }

/* ─── Tag badge ───────────────────────────────────────────────────── */
function Tag() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      textTransform: "uppercase", padding: "3px 9px 3px 7px", borderRadius: 99,
      background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.88)",
      width: "fit-content", flexShrink: 0,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
        background: "#ffffff", boxShadow: "0 0 6px 2px rgba(255,255,255,0.35)",
      }} />
      gOS
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function PlatformSection({ navbarHeight = 64, autoplayMs = 4500 }) {
  const sectionRef = useRef(null);
  const tileRef     = useRef(null);
  const canvasRef   = useRef(null);
  const ringRef     = useRef(null);   // <circle> of the currently-active icon's timer ring
  const barRef      = useRef(null);   // linear progress sliver under the tile

  /* animation-loop bookkeeping — lives in refs so RAF callbacks never see
     stale values and so there is exactly one owner for each loop. */
  const burstRafRef      = useRef(null);
  const idleRafRef       = useRef(null);
  const autoplayRafRef   = useRef(null);
  const twinkleRef       = useRef([]);
  const hoverRef         = useRef(false);   // true while hovering tile or icon row — pauses autoplay + boosts twinkle
  const phaseRef         = useRef("idle");  // mirrors `phase` state for the rAF loop's closure
  const displayIndexRef  = useRef(0);       // which module is currently painted on the tile
  const revealedOnceRef  = useRef(false);   // has the initial reveal burst run?
  const elapsedRef       = useRef(0);       // ms elapsed in the current module's autoplay window
  const lastTsRef        = useRef(null);
  const reducedMotionRef = useRef(false);

  /* React state — only what the render actually needs. */
  const [activeIndex,  setActiveIndex]  = useState(0);   // target module
  const [displayIndex, setDisplayIndex] = useState(0);   // module currently shown on the tile
  const [phase,        setPhase]        = useState("idle"); // "idle" | "out" | "in"

  const inView = useInView(sectionRef, { once: true, margin: "-8% 0px" });

  /* ── canvas helpers ──────────────────────────────────────────────── */
  const stopIdle = useCallback(() => {
    if (idleRafRef.current) { cancelAnimationFrame(idleRafRef.current); idleRafRef.current = null; }
  }, []);

  const stopBurst = useCallback(() => {
    if (burstRafRef.current) { cancelAnimationFrame(burstRafRef.current); burstRafRef.current = null; }
  }, []);

  const sizeCanvas = useCallback(() => {
    const tile = tileRef.current, cv = canvasRef.current;
    if (!tile || !cv) return { W: 0, H: 0 };
    const W = tile.clientWidth, H = tile.clientHeight;
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    return { W, H };
  }, []);

  /* Ambient twinkle loop — only runs while the tile is settled (phase === "idle"). */
  const startIdle = useCallback(() => {
    stopIdle();
    const cv = canvasRef.current;
    const { W, H } = sizeCanvas();
    if (!cv || W === 0 || H === 0) return;
    const ctx = cv.getContext("2d");
    twinkleRef.current = buildTwinkle(W, H);

    const tick = (ts) => {
      ctx.clearRect(0, 0, W, H);
      const boost = hoverRef.current ? 1.8 : 1;
      for (const p of twinkleRef.current) {
        const a = Math.min(1, p.baseAlpha * boost * (0.5 + 0.5 * Math.sin(ts * p.speed + p.offset)));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`;
        ctx.fill();
      }
      idleRafRef.current = requestAnimationFrame(tick);
    };
    idleRafRef.current = requestAnimationFrame(tick);
  }, [sizeCanvas, stopIdle]);

  /* Burst dissolve. dir "out" fades the current tile content away;
     dir "in" dissolves the new content in. Always calls onDone exactly once. */
  const runBurst = useCallback((dir, onDone) => {
    stopIdle();
    stopBurst();
    const cv = canvasRef.current;
    const { W, H } = sizeCanvas();
    if (!cv || W === 0 || H === 0) { onDone && onDone(); return; }
    const ctx = cv.getContext("2d");
    const pts = buildBurst(W, H);
    const t0 = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / BURST_DUR);
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const pt = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay + 0.001)));
        const e = easeOut3(pt);
        let rx, ry, alpha;
        if (dir === "in") {
          rx = p.x + p.ox * (1 - e); ry = p.y + p.oy * (1 - e); alpha = e;
        } else {
          rx = p.x + p.ox * e; ry = p.y + p.oy * e; alpha = 1 - e;
        }
        if (alpha < 0.02) continue;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(rx), Math.round(ry), PS, PS);
      }
      if (t < 1) {
        burstRafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        burstRafRef.current = null;
        onDone && onDone();
      }
    };
    burstRafRef.current = requestAnimationFrame(tick);
  }, [sizeCanvas, stopBurst, stopIdle]);

  /* ── the one state machine that owns transitions ─────────────────── */
  useEffect(() => {
    if (!inView) return;

    // First reveal — no "out" needed, just burst the first module in.
    if (!revealedOnceRef.current) {
      revealedOnceRef.current = true;
      setPhase("in");
      runBurst("in", () => { setPhase("idle"); startIdle(); });
      return;
    }

    if (activeIndex === displayIndexRef.current) return;

    setPhase("out");
    runBurst("out", () => {
      displayIndexRef.current = activeIndex;
      setDisplayIndex(activeIndex);
      setPhase("in");
      runBurst("in", () => { setPhase("idle"); startIdle(); });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, inView]);

  useEffect(() => () => { stopBurst(); stopIdle(); }, [stopBurst, stopIdle]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* Keep the canvas correctly sized if the tile is resized while idle. */
  useEffect(() => {
    if (phase !== "idle") return;
    const onResize = () => startIdle();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [phase, startIdle]);

  /* ── autoplay engine ──────────────────────────────────────────────
     Runs continuously on rAF the whole time the section is in view.
     It only *accumulates* elapsed time while settled, unpaused, and
     motion isn't reduced — but it updates the ring/bar every frame via
     refs (never React state) so this never causes a re-render. When
     the window fills, it advances activeIndex, which the effect above
     turns into the same dissolve burst used for clicks. ─────────────── */
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = !!(mq && mq.matches);
    const onChange = (e) => { reducedMotionRef.current = e.matches; };
    mq && mq.addEventListener && mq.addEventListener("change", onChange);
    return () => mq && mq.removeEventListener && mq.removeEventListener("change", onChange);
  }, []);

  const applyProgress = useCallback((p) => {
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(RING_CIRC * (1 - p));
    if (barRef.current) barRef.current.style.width = `${p * 100}%`;
  }, []);

  useEffect(() => {
    if (!inView) return;

    const tick = (now) => {
      if (lastTsRef.current == null) lastTsRef.current = now;
      const dt = now - lastTsRef.current;
      lastTsRef.current = now;

      const paused = hoverRef.current || phaseRef.current !== "idle" || reducedMotionRef.current;
      if (!paused) elapsedRef.current += dt;

      const progress = Math.min(1, elapsedRef.current / autoplayMs);
      applyProgress(progress);

      if (progress >= 1 && !paused) {
        elapsedRef.current = 0;
        const next = (displayIndexRef.current + 1) % N;
        setActiveIndex(next);
      }
      autoplayRafRef.current = requestAnimationFrame(tick);
    };

    autoplayRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoplayRafRef.current) cancelAnimationFrame(autoplayRafRef.current);
      autoplayRafRef.current = null;
      lastTsRef.current = null;
    };
  }, [inView, autoplayMs, applyProgress]);

  /* ── clicking an icon jumps straight there and resets the timer ──── */
  const goToIndex = useCallback((i) => {
    elapsedRef.current = 0;
    applyProgress(0);
    setActiveIndex(i);
  }, [applyProgress]);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.65, ease: EASE, delay },
  });

  const mod = MODULES[displayIndex];
  const isSettled = phase === "idle";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .pf-icon-col { position: relative; transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); cursor: pointer; background: none; border: none; padding: 0; font: inherit; }
        .pf-icon-col.hero .pf-icon-box { transform: scale(1.14) translateY(-3px); background: #ffffff !important; border-color: #ffffff !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.2), 0 0 32px rgba(255,255,255,0.28); }
        .pf-icon-col.hero .pf-icon-name { color: #ffffff !important; font-weight: 700; }
        .pf-icon-col:hover .pf-icon-box { border-color: rgba(255,255,255,0.28); }
        .pf-icon-col:focus-visible .pf-icon-box { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 3px; }
        .pf-icon-ring circle { transition: stroke-dashoffset 0.05s linear; }
        .pf-icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(8px,1.2vw,16px); flex-shrink: 0; margin-bottom: clamp(14px,2vh,22px); }
        .pf-tile { position:relative; border-radius:18px; padding: clamp(22px,3.4vh,34px) clamp(20px,2.6vw,34px); display:flex; flex-direction:column; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.14); backdrop-filter: blur(6px); flex: 1; min-height: 0; }
        .pf-tile:hover .pf-static-canvas { opacity: 1; }
        @media (max-width: 600px) {
          .pf-icon-grid { gap: 6px !important; }
          .pf-icon-box { width: 48px !important; height: 48px !important; border-radius: 12px !important; }
          .pf-icon-box svg { width: 22px !important; height: 22px !important; }
          .pf-icon-name { font-size: 8px !important; letter-spacing: 0.1em !important; }
          .pf-tile { padding: 20px 18px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-icon-ring circle { transition: none; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="platform"
        style={{ position: "relative", paddingTop: navbarHeight }}
      >
        <div style={{
          height: `calc(100vh - ${navbarHeight}px)`, minHeight: 560,
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          background: "transparent",
        }}>
          <div style={{
            flex: 1, minHeight: 0,
            display: "flex", flexDirection: "column",
            maxWidth: 1020, width: "100%", margin: "0 auto",
            padding: "clamp(20px,3vh,40px) clamp(16px,3vw,52px) clamp(14px,2vh,28px)",
            boxSizing: "border-box",
          }}>

            {/* ── Header ── */}
            <div style={{ flexShrink: 0, marginBottom: "clamp(8px,1vh,14px)" }}>
              <motion.div {...fadeUp(0.04)} style={{
                fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)", marginBottom: "clamp(6px,0.8vh,10px)",
              }}>
                The Platform
              </motion.div>

              <motion.div {...fadeUp(0.1)} style={{ marginBottom: "clamp(6px,0.8vh,10px)" }}>
                <span style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                  Four levers.{" "}
                </span>
                <span style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 800, color: "rgba(255,255,255,0.22)", lineHeight: 1.08, letterSpacing: "-0.02em" }}>
                  One operating layer.
                </span>
              </motion.div>

              <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px,2vw,28px)", flexWrap: "wrap" }}>
                <motion.p {...fadeUp(0.18)} style={{
                  fontSize: "clamp(12.5px,0.95vw,14.5px)", lineHeight: 1.65,
                  color: "rgba(255,255,255,0.42)", maxWidth: 480, fontWeight: 300,
                }}>
                  Every module targets a specific revenue leak. Together they run as a
                  single system — automatically, continuously, without adding headcount.
                </motion.p>

                <motion.div {...fadeUp(0.26)} style={{
                  fontSize: 11.5, letterSpacing: "0.07em", fontWeight: 600,
                  color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap",
                }}>
                  — how OPAL gOS solves it —
                </motion.div>
              </div>
            </div>

            {/* ── Icon row — clickable, drives which module is on the tile.
                 The active icon carries a ring that fills up as its autoplay
                 window elapses; hovering the row pauses the countdown. ──── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="pf-icon-grid"
              onMouseEnter={() => { hoverRef.current = true; }}
              onMouseLeave={() => { hoverRef.current = false; }}
            >
              {MODULES.map((m, i) => {
                const isHero = displayIndex === i;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`pf-icon-col${isHero ? " hero" : ""}`}
                    onClick={() => goToIndex(i)}
                    aria-pressed={isHero}
                    aria-label={`Show ${m.label} module`}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
                  >
                    <div style={{ position: "relative", width: 72, height: 72 }}>
                      {isHero && (
                        <svg
                          className="pf-icon-ring"
                          width={(RING_R + 4) * 2} height={(RING_R + 4) * 2}
                          viewBox={`0 0 ${(RING_R + 4) * 2} ${(RING_R + 4) * 2}`}
                          style={{ position: "absolute", top: -4, left: -4, pointerEvents: "none" }}
                        >
                          <circle
                            cx={RING_R + 4} cy={RING_R + 4} r={RING_R}
                            fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="2"
                          />
                          <circle
                            ref={ringRef}
                            cx={RING_R + 4} cy={RING_R + 4} r={RING_R}
                            fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"
                            transform={`rotate(-90 ${RING_R + 4} ${RING_R + 4})`}
                            style={{ strokeDasharray: `${RING_CIRC}`, strokeDashoffset: `${RING_CIRC}` }}
                          />
                        </svg>
                      )}
                      <div className="pf-icon-box" style={{
                        width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 16,
                        background: isHero ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.035)",
                        border: `1px solid ${isHero ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}`,
                        transition: "background 0.4s, border-color 0.4s, transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s",
                      }}>
                        <m.Icon active={isHero} />
                      </div>
                    </div>
                    <span className="pf-icon-name" style={{
                      fontSize: 9.5, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
                      color: isHero ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.20)",
                      transition: "color 0.4s",
                    }}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>

            {/* ── Single tile — content swaps as activeIndex changes ── */}
            <div
              ref={tileRef}
              className="pf-tile"
              onMouseEnter={() => { hoverRef.current = true; }}
              onMouseLeave={() => { hoverRef.current = false; }}
            >
              {/* Static/noise canvas — ambient while settled, boosted on hover */}
              <canvas
                ref={canvasRef}
                className="pf-static-canvas"
                style={{
                  position: "absolute", inset: 0, borderRadius: 18,
                  pointerEvents: "none", zIndex: 1, mixBlendMode: "screen",
                  opacity: isSettled ? 0.9 : 1, transition: "opacity 0.3s ease",
                }}
              />

              <div style={{
                position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%",
                opacity: isSettled ? 1 : 0,
                transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      background: "rgba(255,255,255,0.10)",
                    }}>
                      <mod.Icon active={false} />
                    </div>
                    <Tag />
                  </div>
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.20)", letterSpacing: "0.08em" }}>{mod.num}/0{N}</span>
                </div>

                <div style={{
                  fontSize: "clamp(17px,2.1vh,23px)", fontWeight: 700, lineHeight: 1.32,
                  color: "rgba(255,255,255,0.94)", marginBottom: 16, maxWidth: 560,
                }}>
                  {mod.title}
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 16, flexShrink: 0 }} />

                <div style={{ flex: 1 }}>
                  {mod.features.map((feat, fi) => (
                    <div key={fi} style={{
                      display: "flex", alignItems: "flex-start", gap: 9,
                      marginTop: fi === 0 ? 0 : 11,
                      fontSize: "clamp(13px,1.4vh,15px)", lineHeight: 1.5,
                      color: "rgba(255,255,255,0.62)",
                    }}>
                      <span style={{ color: "#ffffff", flexShrink: 0, marginTop: 1 }}>✓</span>
                      {feat}
                    </div>
                  ))}
                </div>

                {/* Linear echo of the ring's progress — fills across the current module's autoplay window */}
                <div style={{ height: 1.5, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 18, overflow: "hidden", flexShrink: 0 }}>
                  <div ref={barRef} style={{
                    height: "100%", background: "rgba(255,255,255,0.55)", width: "0%",
                  }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 10.5, color: "rgba(255,255,255,0.24)", flexShrink: 0 }}>
                  auto-advancing — click an icon to jump, hover to pause
                </div>
              </div>

              <span style={{
                position: "absolute", bottom: 12, right: 16, zIndex: 2,
                fontSize: 9.5, letterSpacing: "0.28em", color: "rgba(255,255,255,0.10)",
                pointerEvents: "none",
                opacity: isSettled ? 1 : 0,
                transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
              }}>
                {mod.glyph}
              </span>
            </div>

            {/* ── Footer bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.48 }}
              style={{
                flexShrink: 0, marginTop: "clamp(18px,2.6vh,28px)",
                display: "flex", flexWrap: "wrap",
                alignItems: "center", justifyContent: "space-between", gap: 12,
                paddingTop: "clamp(16px,2.2vh,24px)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p style={{
                fontSize: "clamp(11px,0.85vw,13px)", color: "rgba(255,255,255,0.26)",
                fontStyle: "italic", fontWeight: 300, lineHeight: 1.4, maxWidth: 480,
              }}>
                Every module runs automatically. Every action logged. Every gap worked.
              </p>
              <button
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "9px 22px", borderRadius: 8,
                  background: "#ffffff", color: "#0a0a0a",
                  fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em",
                  border: "none", cursor: "pointer",
                  transition: "background 0.2s, transform 0.15s",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "#e8e8e8"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                BOOK A DEMO
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M1 11L10 2M10 2H4.5M10 2V7.5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}