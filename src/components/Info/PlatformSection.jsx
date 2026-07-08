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
import scheduleIcon from "../../assets/schedule.svg";
import productionIcon from "../../assets/production.svg";
import collectIcon from "../../assets/collect.svg";
import relayIcon from "../../assets/relay.svg";

/* ─── Constants ───────────────────────────────────────────────────── */
const N            = 4;
const BURST_DUR    = 700;    // ms — dissolve burst duration (each direction)
const PS           = 3;      // burst particle pixel size
const EASE         = [0.22, 1, 0.36, 1];
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const OPAL_SOFT_GLOW = "rgba(255,255,255,0.28)";
const BG = "#0a0a0a";
const ICON_BOX = 96; // px — square icon tile
const ICON_INNER = 46; // px — icon asset size
const CARD_ICON_BOX = 64; // px — icon on content card
const CARD_ICON_INNER = 32;

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
        position: "relative",
        zIndex: 2,
        transition: "opacity 0.4s",
        filter: "brightness(0) invert(1)",
        opacity: active ? 0.95 : 0.38,
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
    id: "relay", label: "Relay", num: "04", glyph: "δ · 004", icon: relayIcon,
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
  const ringRef     = useRef(null);   // bottom-up fill inside active square
  const edgeRef     = useRef(null);   // left page-mark strip
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
    const pct = `${p * 100}%`;
    if (ringRef.current) ringRef.current.style.height = pct;
    if (edgeRef.current) edgeRef.current.style.height = pct;
    if (barRef.current) barRef.current.style.width = pct;
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .pf-section-inner {
          background: ${BG};
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }

        .pf-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(28px, 4.2vh, 52px);
          width: 100%;
        }

        .pf-eyebrow {
          display: block;
          font-size: clamp(8px, 0.9vw, 10px);
          letter-spacing: 0.38em;
          color: rgba(255,255,255,0.32);
          text-transform: uppercase;
          margin-bottom: clamp(6px, 1vh, 10px);
        }

        .pf-hl-hero {
          display: block;
          font-size: clamp(20px, 3.2vw, 36px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          max-width: 720px;
          margin: 0 auto;
        }

        .pf-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          max-width: 1020px;
          width: 100%;
          margin: 0 auto;
          padding: 0 clamp(16px, 3vw, 52px) clamp(14px, 2vh, 28px);
          box-sizing: border-box;
        }

        /* ── Service-style icon row ── */
        .pf-tabs {
          display: flex; gap: clamp(12px, 2vw, 24px);
          align-items: flex-start; flex-shrink: 0;
          width: 100%; margin-bottom: clamp(16px, 2.4vh, 24px);
          margin-top: clamp(4px, 0.6vh, 8px);
        }
        .pf-tab {
          position: relative; cursor: pointer;
          background: none; border: none; padding: 0; font: inherit;
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .pf-tab:focus-visible .pf-icon-box { outline: 2px solid rgba(255,255,255,0.55); outline-offset: 3px; }

        /* Square icon tile */
        .pf-icon-wrap {
          position: relative; width: 100%;
          display: flex; justify-content: center;
        }
        .pf-icon-box {
          position: relative; flex-shrink: 0;
          width: clamp(80px, 11vw, ${ICON_BOX}px);
          height: clamp(80px, 11vw, ${ICON_BOX}px);
          border-radius: 0;
          display: flex; align-items: center; justify-content: center;
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.28);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
          transition: border-color 0.45s, box-shadow 0.45s, transform 0.45s;
          overflow: hidden;
        }
        .pf-tab:not(.hero) .pf-icon-box {
          opacity: 0.55;
          border-color: rgba(255,255,255,0.14);
        }
        .pf-tab.hero .pf-icon-box {
          opacity: 1;
          border-color: rgba(255,255,255,0.72);
          transform: translateY(-4px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.35),
            0 0 28px rgba(255,255,255,0.22),
            0 8px 24px rgba(0,0,0,0.35);
        }
        .pf-tab:hover .pf-icon-box { opacity: 0.85; border-color: rgba(255,255,255,0.4); }

        /* Page-mark loader — fills bottom→top inside square */
        .pf-tab-fill {
          position: absolute; left: 0; bottom: 0; width: 100%; height: 0%;
          background: linear-gradient(to top, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%);
          pointer-events: none; z-index: 0;
        }
        .pf-tab-fill-edge {
          position: absolute; left: 0; top: 0; width: 3px; height: 0%;
          background: linear-gradient(180deg, #ffffff, rgba(255,255,255,0.45));
          box-shadow: 0 0 10px rgba(255,255,255,0.5);
          pointer-events: none; z-index: 1;
        }

        /* Label below square */
        .pf-tab-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          transition: color 0.35s;
          text-align: center;
        }
        .pf-tab.hero .pf-tab-label { color: rgba(255,255,255,0.88); }

        .pf-wave-ring {
          position: absolute; inset: -4px;
          pointer-events: none; border: 1px solid rgba(255,255,255,0.35);
        }

        /* ── Content tile ── */
        .pf-tile {
          position: relative; border-radius: 22px; overflow: hidden; cursor: default;
          display: flex; flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          flex: 1 1 auto; max-height: 46vh; min-height: 0;
          align-self: stretch;
        }
        .pf-tile-glass-shine { position:absolute; inset:0; opacity:0.7; pointer-events:none; z-index:0; background:radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.08), transparent 42%); }
        .pf-tile-glass-edge { position:absolute; left:0; right:0; top:0; height:1px; z-index:1; pointer-events:none; background-image: ${OPAL_LIGHT_GRADIENT}; }

        @media (max-width: 600px) {
          .pf-tabs { gap: 8px !important; }
          .pf-icon-box { width: 72px !important; height: 72px !important; }
          .pf-tab-label { font-size: 8px !important; letter-spacing: 0.16em !important; }
          .pf-hl-hero { font-size: clamp(22px, 7vw, 32px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-wave-ring { animation: none !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="platform"
        style={{ position: "relative"}}
      >
        <div
          className="pf-section-inner"
          style={{
            height: `calc(100vh - ${navbarHeight}px)`, minHeight: 560,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            padding: "clamp(20px,3vh,40px) 0 0",
            boxSizing: "border-box",
          }}
        >
          {/* ── Centered header ── */}
          <div className="pf-header">
            <motion.span {...fadeUp(0.04)} className="pf-eyebrow">
              Where the revenue comes back
            </motion.span>
            <motion.span {...fadeUp(0.1)} className="pf-hl-hero">
              Four services.
            </motion.span>
          </div>

          <div className="pf-body">
            {/* ── Service-style icon row ── */}
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
                    <div className="pf-icon-wrap">
                      <div className="pf-icon-box">
                        {isHero && (
                          <>
                            <div ref={ringRef} className="pf-tab-fill" />
                            <div ref={edgeRef} className="pf-tab-fill-edge" />
                          </>
                        )}
                        {isHero && [0, 0.7, 1.4].map((delay) => (
                          <motion.span
                            key={delay}
                            className="pf-wave-ring"
                            animate={{ scale: [1, 1.12], opacity: [0.35, 0] }}
                            transition={{
                              duration: 2.4, repeat: Infinity,
                              ease: [0.22, 1, 0.36, 1], delay,
                            }}
                          />
                        ))}
                        <ModuleIcon src={m.icon} active={isHero} size={ICON_INNER} />
                      </div>
                    </div>

                    <span className="pf-tab-label">{m.label}</span>
                  </button>
                );
              })}
            </motion.div>

            {/* ── Single tile — content swaps as activeIndex changes ── */}
            <motion.div
              ref={tileRef}
              className="pf-tile"
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(255,255,255,0.35)",
                boxShadow: "0 12px 48px rgba(255,255,255,0.08)",
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
                  position: "absolute", inset: 0, borderRadius: 22,
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
                padding: "clamp(20px, 2.6vh, 30px) clamp(22px, 2.8vw, 36px)",
                gap: 14, minHeight: 0, flex: 1,
                opacity: isSettled ? 1 : 0,
                transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
              }}>
                <motion.div
                  key={mod.id}
                  className="pf-card-icon"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{
                    width: CARD_ICON_BOX,
                    height: CARD_ICON_BOX,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.2), 0 0 20px rgba(255,255,255,0.12)",
                  }}
                >
                  <ModuleIcon src={mod.icon} active size={CARD_ICON_INNER} />
                </motion.div>

                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.24)", letterSpacing: "0.1em" }}>
                  {mod.num}/0{N} · {mod.label}
                </span>

                <div style={{
                  fontSize: "clamp(16px, 1.9vh, 20px)", fontWeight: 700, lineHeight: 1.36,
                  color: "rgba(255,255,255,0.94)", maxWidth: 500,
                }}>
                  {mod.title}
                </div>

                <div style={{
                  width: "min(200px, 38%)", height: 1,
                  background: "rgba(255,255,255,0.10)", flexShrink: 0,
                }} />

                <div style={{
                  flex: 1, width: "100%", maxWidth: 460,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  {mod.features.map((feat, fi) => (
                    <div key={fi} style={{
                      display: "inline-flex", alignItems: "flex-start",
                      gap: 9, marginTop: fi === 0 ? 0 : 9,
                      fontSize: "clamp(12.5px, 1.25vh, 14.5px)", lineHeight: 1.48,
                      color: "rgba(255,255,255,0.55)", textAlign: "left",
                    }}>
                      <span style={{ color: "#ffffff", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  width: "min(260px, 68%)", height: 1.5,
                  background: "rgba(255,255,255,0.06)", borderRadius: 2,
                  overflow: "hidden", flexShrink: 0, marginTop: 4,
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

          </div>
        </div>
      </section>
    </>
  );
}