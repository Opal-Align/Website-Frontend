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
import relayIcon from "../../assets/relay.svg";

/* ─── Constants ───────────────────────────────────────────────────── */
const N            = 4;
const BURST_DUR    = 700;    // ms — dissolve burst duration (each direction)
const PS           = 3;      // burst particle pixel size
const EASE         = [0.22, 1, 0.36, 1];

/* Vertical headline ticker — same language as LogoStream tagline, on Y */
const HEADLINE_LINES = [
  "Follow-Ups Sent",
  "Workflows Automated",
  "Gaps Identified",
  "Continuous recovery",
];

const headlineVariants = {
  enter: {
    y: "100%",
    opacity: 0,
    filter: "blur(8px)",
  },
  center: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.45, ease: [0.55, 0, 0.78, 0] },
  },
};

function HeadlineTicker({ active }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HEADLINE_LINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [active]);

  return (
    <div className="pf-headline-ticker" aria-live="polite">
      <div className="pf-headline-inner">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            className="pf-hl-bold pf-headline-line"
            variants={headlineVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {HEADLINE_LINES[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const OPAL_SOFT_GLOW = "rgba(255,255,255,0.28)";
const BG = "#0a0a0a";
const ICON_BOX = 140; // px — square icon tile
const ICON_INNER = 70; // px — icon asset size
const CARD_ICON_INNER = 60;

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
export default function PlatformSection({ navbarHeight = 80, autoplayMs = 4500 }) {
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
          height: calc(100svh - var(--pf-nav-h, var(--page-nav-h, 80px)));
          min-height: calc(100svh - var(--pf-nav-h, var(--page-nav-h, 80px)));
          max-height: calc(100svh - var(--pf-nav-h, var(--page-nav-h, 80px)));
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: clamp(14px, 2vh, 24px) 0 0;
          box-sizing: border-box;
        }

        .pf-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(16px, 2.5vh, 28px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
        }

        .pf-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
        }
        .pf-hl-bold {
          display: block;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
          white-space: nowrap;
        }
        .pf-hl-muted {
          display: block;
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.48);
          line-height: 1.14;
        }

        /* Vertical ticker (LogoStream tagline, on Y — scrolls upward) */
        .pf-headline-ticker {
          width: 100%;
          max-width: min(1100px, 100%);
          margin: 0 auto;
          overflow: hidden;
          height: clamp(52px, 7vh, 72px);
          padding: 0 8px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pf-headline-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .pf-headline-line {
          position: absolute;
          left: 0;
          right: 0;
          text-align: center;
          width: 100%;
          padding: 0 12px;
          box-sizing: border-box;
          line-height: 1.15;
          white-space: nowrap;
        }

        .pf-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          max-width: 1020px;
          width: 100%;
          margin: 0 auto;
          padding: 0 clamp(16px, 3vw, 52px) clamp(8px, 1.2vh, 16px);
          box-sizing: border-box;
        }

        /* ── Service-style icon row ── */
        .pf-tabs {
          display: flex; gap: clamp(4px, 0.5vw, 8px);
          align-items: flex-start; flex-shrink: 0;
          width: 100%; margin-bottom: clamp(20px, 2.8vh, 32px);
          margin-top: 0;
        }
        .pf-tab {
          position: relative; cursor: pointer;
          background: none; border: none; padding: 0; font: inherit;
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
        }
        .pf-tab:focus-visible .pf-icon-box { outline: 2px solid rgba(255,255,255,0.55); outline-offset: 3px; }

        /* Square icon tile — width fills its flex column, aspect-ratio keeps it square */
        .pf-icon-wrap {
          position: relative; width: 100%;
          display: flex; justify-content: center;
        }
        .pf-icon-box {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          max-width: min(${ICON_BOX}px, 18vh);
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
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.2em;
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
          position: relative; border-radius: 20px; overflow: hidden; cursor: default;
          display: flex; flex-direction: column;
          border: 1px solid rgba(255,255,255,0.1);
          background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          flex: 1 1 auto;
          min-height: min(34vh, 320px);
          max-height: none;
          align-self: stretch;
        }
        .pf-tile-glass-shine { position:absolute; inset:0; opacity:0.7; pointer-events:none; z-index:0; background:radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.08), transparent 42%); }
        .pf-tile-glass-edge { position:absolute; left:0; right:0; top:0; height:1px; z-index:1; pointer-events:none; background-image: ${OPAL_LIGHT_GRADIENT}; }

        .pf-card-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          height: 100%;
          padding: clamp(22px, 3vh, 36px) clamp(24px, 3vw, 40px);
          gap: clamp(12px, 1.6vh, 18px);
          min-height: 0;
          flex: 1;
          justify-content: flex-start;
        }
        .pf-card-icon { display: none; }
        .pf-card-autoplay {
          margin-top: auto;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1vh, 12px);
          width: 100%;
          padding-top: clamp(4px, 0.8vh, 10px);
        }
        .pf-card-title {
          font-size: clamp(20px, 2.5vh, 26px);
          font-weight: 700;
          line-height: 1.34;
          color: rgba(255,255,255,0.94);
          max-width: 540px;
        }
        .pf-card-features {
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: clamp(8px, 1.2vh, 12px);
          flex: 1 1 auto;
          min-height: 0;
        }
        .pf-card-feature {
          display: inline-flex;
          align-items: flex-start;
          gap: 9px;
          font-size: clamp(15px, 1.65vh, 18px);
          line-height: 1.46;
          color: rgba(255,255,255,0.55);
          text-align: left;
        }
        .pf-card-footer {
          font-size: clamp(10.5px, 1.15vh, 12px);
          color: rgba(255,255,255,0.24);
          flex-shrink: 0;
        }
        .pf-tile-glyph {
          position: absolute;
          bottom: 12px;
          right: 16px;
          z-index: 10;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: rgba(255,255,255,0.18);
          pointer-events: none;
        }

        /* ── Mobile-only card label & dots (hidden on desktop) ── */
        .pf-card-label { display: none; }
        .pf-dot-row { display: none; }

        @media (max-width: 600px) {
          .pf-section-inner {
            height: 100%;
            min-height: 0;
            max-height: 100%;
            overflow: hidden;
            padding-bottom: 16px;
          }
          .pf-body {
            flex: 1 1 auto;
            min-height: 0;
            padding: 0 16px;
          }
          .pf-header {
            margin-bottom: 12px;
            padding: 0 14px;
          }
          .pf-heading { gap: 8px; }
          .pf-hl-bold {
            font-size: clamp(17px, 4.8vw, 22px);
            white-space: nowrap;
          }
          .pf-headline-ticker {
            height: clamp(40px, 10vw, 52px);
            max-width: 100%;
            padding: 0 4px;
          }
          .pf-headline-line { padding: 0 4px; }
          .pf-hl-muted { font-size: clamp(14px, 4.2vw, 18px); color: rgba(255,255,255,0.52); }

          /* ── Hide the 4-tab icon row on mobile ── */
          .pf-tabs { display: none !important; }

          /* ── Card fills remaining flex space (never exceeds the viewport card) ── */
          .pf-tile {
            flex: 1 1 auto;
            min-height: 0;
            max-height: none;
            height: auto;
          }
          .pf-card-content {
            height: 100%;
            justify-content: flex-start;
            padding: 24px 20px 20px;
            gap: 12px;
            overflow: hidden;
          }
          .pf-card-icon { display: flex; }
          .pf-card-autoplay {
            margin-top: auto;
            padding-top: 8px;
            flex-shrink: 0;
          }

          /* ── Large centered icon in card ── */
          .pf-card-icon img {
            width: 72px !important;
            height: 72px !important;
          }

          /* ── Service name label below big icon ── */
          .pf-card-label {
            display: block;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.35);
            margin-top: -4px;
          }

          .pf-card-title {
            font-size: clamp(16px, 4.5vw, 20px);
            line-height: 1.38;
          }
          .pf-card-feature {
            font-size: clamp(12px, 3.4vw, 14px);
            line-height: 1.45;
            width: 100%;
            max-width: 290px;
          }

          /* ── Footer text hidden; replaced by dot indicators ── */
          .pf-card-footer { display: none !important; }

          /* ── Dot indicator row ── */
          .pf-dot-row {
            display: flex;
            gap: 8px;
            align-items: center;
            justify-content: center;
            padding-top: 4px;
            flex-shrink: 0;
          }
          .pf-dot {
            appearance: none; -webkit-appearance: none;
            border: none; background: none; padding: 0; margin: 0; cursor: pointer;
            width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
          }
          .pf-dot::after {
            content: '';
            display: block;
            width: 6px; height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.22);
            transition: width 0.3s ease, background 0.3s ease, border-radius 0.3s ease;
          }
          .pf-dot.active::after {
            width: 22px;
            border-radius: 3px;
            background: rgba(255,255,255,0.75);
          }

          .pf-tile-glyph { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf-wave-ring { animation: none !important; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="platform"
        style={{
          position: "relative",
          scrollMarginTop: "var(--page-nav-h, 80px)",
          // Fill the parent .home-slide exactly (avoids svh vs mobile
          // toolbar mismatch that created phantom overflow on phones).
          height: "100%",
          maxHeight: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          className="pf-section-inner"
          style={{ ["--pf-nav-h"]: `${navbarHeight}px` }}
        >
          {/* ── Centered header ── */}
          <div className="pf-header">
            <div className="pf-heading">
              <motion.span
                className="pf-hl-muted"
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                The platform
              </motion.span>
              <HeadlineTicker active={inView} />
              <motion.span
                className="pf-hl-muted"
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                One guided operating system.
              </motion.span>
            </div>
          </div>

          <div className="pf-body">
            {/* ── Service-style icon row ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="pf-tabs"
              onPointerEnter={(e) => { if (e.pointerType === "mouse") hoverRef.current = true; }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") hoverRef.current = false; }}
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
              onPointerEnter={(e) => { if (e.pointerType === "mouse") { hoverRef.current = true; setTileHovered(true); } }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") { hoverRef.current = false; setTileHovered(false); } }}
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

              <div
                className="pf-card-content"
                style={{
                  opacity: isSettled ? 1 : 0,
                  transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
                }}
              >
                <motion.div
                  key={mod.id}
                  className="pf-card-icon"
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <ModuleIcon src={mod.icon} active size={CARD_ICON_INNER} />
                  <span className="pf-card-label">{mod.label}</span>
                </motion.div>

                <div className="pf-card-title">
                  {mod.title}
                </div>

                <div style={{
                  width: "min(200px, 38%)", height: 1,
                  background: "rgba(255,255,255,0.10)", flexShrink: 0,
                }} />

                <div className="pf-card-features">
                  {mod.features.map((feat, fi) => (
                    <div key={fi} className="pf-card-feature">
                      <span style={{ color: "#ffffff", flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pf-card-autoplay">
                  <div style={{
                    width: "min(240px, 64%)", height: 1.5,
                    background: "rgba(255,255,255,0.06)", borderRadius: 2,
                    overflow: "hidden", flexShrink: 0,
                  }}>
                    <div ref={barRef} style={{
                      height: "100%", background: "rgba(255,255,255,0.55)", width: "0%",
                    }} />
                  </div>
                  <div className="pf-card-footer">
                    auto-advancing — click an icon to jump, hover to pause
                  </div>

                  {/* Dot indicators — visible only on mobile */}
                  <div className="pf-dot-row" aria-label="Service navigation">
                  {MODULES.map((m, i) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`pf-dot${displayIndex === i ? " active" : ""}`}
                      onClick={() => goToIndex(i)}
                      aria-label={`Switch to ${m.label}`}
                      aria-pressed={displayIndex === i}
                    />
                  ))}
                  </div>
                </div>
              </div>

              <span
                className="pf-tile-glyph"
                style={{
                  opacity: isSettled ? 1 : 0,
                  transition: `opacity ${phase === "out" ? BURST_DUR : 260}ms ease`,
                }}
              >
                {mod.glyph}
              </span>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}