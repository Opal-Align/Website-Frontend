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
import { motion, useInView, AnimatePresence } from "framer-motion";
import scheduleIcon from "../../assets/schedule.svg";
import productionIcon from "../../assets/production.svg";
import collectIcon from "../../assets/collect.svg";
import envelopeIcon from "../../assets/relay.svg";

/* ─── Constants ───────────────────────────────────────────────────── */
const N            = 4;
const BURST_DUR    = 700;    // ms — dissolve burst duration (each direction)
const PS           = 3;      // burst particle pixel size
const EASE         = [0.22, 1, 0.36, 1];
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const OPAL_SOFT_GLOW = "rgba(255,255,255,0.28)";
const TAB_H = 52;   // px — uniform height

/* ─── Module icon ─────────────────────────────────────────────────── */
function ModuleIcon({ src, active, size = 30 }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        transition: "opacity 0.4s, filter 0.4s",
        filter: active ? "brightness(0)" : "brightness(0) invert(1)",
        opacity: active ? 0.9 : 0.45,
      }}
    />
  );
}

/* ─── Data ─────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "schedule", label: "Schedule", num: "01", glyph: "α · 001", icon: scheduleIcon,
    title: "Identified, verified, and filled — automatically.",
    features: [
      "Fills from prioritized waitlist in real time",
      "No-show risk flagged 48 hrs ahead",
      "One view — no calls, no spreadsheets",
    ],
  },
  {
    id: "produce", label: "Produce", num: "02", glyph: "β · 002", icon: productionIcon,
    title: "Reengaged, reactivated, recovered — automatically.",
    features: [
      "Treatment plans auto-queued into workflow",
      "Right outreach, right channel, right time",
      "Accepted → scheduled → completed",
    ],
  },
  {
    id: "collect", label: "Collect", num: "03", glyph: "γ · 003", icon: collectIcon,
    title: "Surfaced, pursued, collected, documented — automatically.",
    features: [
      "Highest-recovery balances surfaced first",
      "Automated statements and payment links",
      "Denial patterns caught before write-off",
    ],
  },
  {
    id: "relay", label: "Relay", num: "04", glyph: "δ · 004", icon: envelopeIcon,
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
function easeOut3(t) { return 1 - Math.pow(1 - t, 3); }

/* ─── Main component ──────────────────────────────────────────────── */
export default function PlatformSection({ navbarHeight = 64, autoplayMs = 4500 }) {
  const sectionRef = useRef(null);
  const tileRef     = useRef(null);
  const canvasRef   = useRef(null);
  const ringRef     = useRef(null);   // fill-bar div inside the active tab pill
  const barRef      = useRef(null);   // progress sliver under the content card

  /* animation-loop bookkeeping — lives in refs so RAF callbacks never see
     stale values and so there is exactly one owner for each loop. */
  const burstRafRef      = useRef(null);
  const autoplayRafRef   = useRef(null);
  const hoverRef         = useRef(false);
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
  const [tileHovered,  setTileHovered]  = useState(false);

  const inView = useInView(sectionRef, { once: true, margin: "-8% 0px" });

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

  /* Burst dissolve. dir "out" fades the current tile content away;
     dir "in" dissolves the new content in. Always calls onDone exactly once. */
  const runBurst = useCallback((dir, onDone) => {
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
  }, [sizeCanvas, stopBurst]);

  /* ── the one state machine that owns transitions ─────────────────── */
  useEffect(() => {
    if (!inView) return;

    // First reveal — no "out" needed, just burst the first module in.
    if (!revealedOnceRef.current) {
      revealedOnceRef.current = true;
      setPhase("in");
      runBurst("in", () => { setPhase("idle"); });
      return;
    }

    if (activeIndex === displayIndexRef.current) return;

    setPhase("out");
    runBurst("out", () => {
      displayIndexRef.current = activeIndex;
      setDisplayIndex(activeIndex);
      setPhase("in");
      runBurst("in", () => { setPhase("idle"); });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, inView]);

  useEffect(() => () => { stopBurst(); }, [stopBurst]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

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
    if (ringRef.current) ringRef.current.style.width = `${p * 100}%`;
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

        /* ── Tab row ── */
        .pf-tabs { display: flex; gap: 8px; align-items: stretch; flex-shrink: 0; width: 100%; margin-bottom: clamp(6px,1vh,12px); }
        .pf-tab {
          position: relative; overflow: hidden; cursor: pointer;
          background: none; border: none; padding: 0; font: inherit;
          display: flex; align-items: center; justify-content: center;
          height: ${TAB_H}px; border-radius: 14px;
          flex: 1; min-width: 0;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.028);
          transition: flex-grow 0.52s cubic-bezier(0.22,1,0.36,1), border-color 0.4s, background 0.4s;
        }
        .pf-tab:hover { border-color: rgba(255,255,255,0.18); }
        .pf-tab.hero { flex: 3; border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.06); }
        .pf-tab:focus-visible { outline: 2px solid rgba(255,255,255,0.5); outline-offset: 2px; }

        /* Fill sweep — imperatively driven left→right */
        .pf-tab-fill {
          position: absolute; left: 0; top: 0; height: 100%; width: 0%;
          background: linear-gradient(90deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.07) 100%);
          pointer-events: none; z-index: 0;
        }

        /* Inner content row */
        .pf-tab-inner { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; padding: 0 14px 0 10px; width: 100%; }
        .pf-tab:not(.hero) .pf-tab-inner { padding: 0; justify-content: center; }

        /* Icon box */
        .pf-icon-box {
          position: relative; flex-shrink: 0;
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.12);
          transition: background 0.4s, border-color 0.4s;
        }
        .pf-tab:not(.hero) .pf-icon-box { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); }

        /* Label */
        .pf-tab-label {
          font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.82);
          white-space: nowrap; overflow: hidden;
        }

        /* Pulse rings on active icon */
        .pf-wave-ring {
          position: absolute; inset: -5px; border-radius: 13px;
          pointer-events: none; border: 1.5px solid rgba(255,255,255,0.30);
        }

        /* ── Content tile ── */
        .pf-tile { position:relative; border-radius:28px; overflow:hidden; cursor:default; display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.1); background:linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018)); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); flex: 1; min-height: 0; }
        .pf-tile-glass-shine { position:absolute; inset:0; opacity:0.7; pointer-events:none; z-index:0; background:radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.08), transparent 42%); }
        .pf-tile-glass-edge { position:absolute; left:0; right:0; top:0; height:1px; z-index:1; pointer-events:none; background-image: ${OPAL_LIGHT_GRADIENT}; }

        @media (max-width: 600px) {
          .pf-tabs { gap: 5px !important; }
          .pf-tab { height: 44px !important; border-radius: 11px !important; }
          .pf-icon-box { width: 28px !important; height: 28px !important; border-radius: 7px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-wave-ring { animation: none !important; }
          .pf-tab { transition: none !important; }
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

            {/* ── Tab row — active tab expands with a left→right fill loader ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="pf-tabs"
              onMouseEnter={() => { hoverRef.current = true; }}
              onMouseLeave={() => { hoverRef.current = false; }}
            >
              {MODULES.map((m, i) => {
                const isHero = displayIndex === i;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`pf-tab${isHero ? " hero" : ""}`}
                    onClick={() => goToIndex(i)}
                    aria-pressed={isHero}
                    aria-label={`Show ${m.label} module`}
                  >
                    {/* Left-to-right progress fill — updated imperatively every RAF frame */}
                    {isHero && <div ref={ringRef} className="pf-tab-fill" />}

                    <div className="pf-tab-inner">
                      {/* Icon with pulse rings */}
                      <div className="pf-icon-box">
                        {isHero && [0, 0.7, 1.4].map((delay) => (
                          <motion.span
                            key={delay}
                            className="pf-wave-ring"
                            animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
                            transition={{
                              duration: 2.4, repeat: Infinity,
                              ease: [0.22, 1, 0.36, 1], delay,
                            }}
                          />
                        ))}
                        <ModuleIcon src={m.icon} active={isHero} size={18} />
                      </div>

                      {/* Label fades in when tab is active */}
                      <AnimatePresence>
                        {isHero && (
                          <motion.span
                            className="pf-tab-label"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, delay: 0.18 }}
                          >
                            {m.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            {/* ── Single tile — content swaps as activeIndex changes ── */}
            <motion.div
              ref={tileRef}
              className="pf-tile"
              whileHover={{
                scale: 1.035,
                borderColor: "rgba(255,255,255,0.42)",
                boxShadow: "0 18px 70px rgba(255,255,255,0.12)",
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onMouseEnter={() => { hoverRef.current = true; setTileHovered(true); }}
              onMouseLeave={() => { hoverRef.current = false; setTileHovered(false); }}
            >
              <div className="pf-tile-glass-shine" aria-hidden />
              <div className="pf-tile-glass-edge" aria-hidden />

              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute", inset: 0, borderRadius: 28,
                  pointerEvents: "none", zIndex: 1, mixBlendMode: "screen",
                  opacity: phase === "idle" ? 0 : 1,
                  transition: "opacity 0.2s ease",
                }}
              />

              <div className="absolute top-4 right-4 z-10">
                <div
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    backgroundImage: OPAL_LIGHT_GRADIENT,
                    boxShadow: `0 0 12px 4px ${OPAL_SOFT_GLOW}`,
                  }}
                />
                {tileHovered && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 5, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.35)",
                    }}
                  />
                )}
              </div>

              <div style={{
                position: "relative", zIndex: 10, display: "flex", flexDirection: "column",
                alignItems: "center", textAlign: "center", height: "100%",
                padding: "clamp(28px,3.8vh,40px) clamp(24px,3vw,40px)",
                gap: 16, minHeight: 245,
                opacity: isSettled ? 1 : 0,
                transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
              }}>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 10, width: "100%",
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}>
                    <ModuleIcon src={mod.icon} active size={28} />
                  </div>
                  <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}>
                    {mod.num}/0{N}
                  </span>
                </div>

                <div style={{
                  fontSize: "clamp(17px,2.1vh,23px)", fontWeight: 700, lineHeight: 1.38,
                  color: "rgba(255,255,255,0.94)", maxWidth: 520,
                }}>
                  {mod.title}
                </div>

                <div style={{
                  width: "min(200px, 40%)", height: 1,
                  background: "rgba(255,255,255,0.10)", flexShrink: 0,
                }} />

                <div style={{
                  flex: 1, width: "100%", maxWidth: 480,
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  {mod.features.map((feat, fi) => (
                    <div key={fi} style={{
                      display: "inline-flex", alignItems: "flex-start",
                      gap: 9, marginTop: fi === 0 ? 0 : 11,
                      fontSize: "clamp(13px,1.4vh,15px)", lineHeight: 1.5,
                      color: "rgba(255,255,255,0.55)", textAlign: "left",
                    }}>
                      <span style={{ color: "#ffffff", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  width: "min(280px, 70%)", height: 1.5,
                  background: "rgba(255,255,255,0.06)", borderRadius: 2,
                  overflow: "hidden", flexShrink: 0,
                }}>
                  <div ref={barRef} style={{
                    height: "100%", background: "rgba(255,255,255,0.55)", width: "0%",
                  }} />
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.24)", flexShrink: 0 }}>
                  auto-advancing — click an icon to jump, hover to pause
                </div>
              </div>

              <span style={{
                position: "absolute", bottom: 12, right: 16, zIndex: 10,
                fontSize: 10, letterSpacing: "0.3em",
                color: "rgba(255,255,255,0.18)", pointerEvents: "none",
                opacity: isSettled ? 1 : 0,
                transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
              }}>
                {mod.glyph}
              </span>
            </motion.div>

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