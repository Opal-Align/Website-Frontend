"use client";

/**
 * PlatformSection.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * • No inner scroll container — drives entirely off real window scroll
 * • Section is 280vh tall; cards/header stick inside a 100vh viewport pin
 * • Cards are free-floating (no wrapping dark box)
 * • Dissolve particle transition (white pixel burst → dark card → solution)
 * • Narrative bar fades from "The problems…" → "how gOS solves it"
 * • Icon row lights up as each card reveals
 *
 * Props:
 *   navbarHeight  number  Height of your fixed navbar in px (default 64).
 *                         The sticky panel offsets by this amount so nothing
 *                         hides behind the nav, and scroll tracking starts
 *                         only once the section clears the navbar.
 *
 * Dependencies: framer-motion  (npm i framer-motion)
 * Usage: drop into any Next.js / React page on a dark background (#0a0a0a)
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useScroll, useMotionValueEvent } from "framer-motion";

import scheduleIcon from "../../assets/schedule.svg";
import produceIcon  from "../../assets/production.svg";
import collectIcon  from "../../assets/collect.svg";
import relayIcon    from "../../assets/relay.svg";

/* ─── Constants ───────────────────────────────────────────────────── */
const N              = 4;
const STAGGER        = 0.18;   // each card's reveal window starts this far apart (0–1)
const REVEAL_RANGE   = 0.20;   // width of each card's fill window
const THRESHOLD      = 0.88;   // progress at which the reveal fires
const DISSOLVE_DUR   = 900;    // ms
const PS             = 3;      // particle pixel size
const EASE           = [0.22, 1, 0.36, 1];

/* ─── Data ────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "schedule", label: "Schedule", num: "01",
    glyph: "α · 001",
    problem: {
      title: "Empty slots. Cancellations unbooked. Patients waiting.",
      body: "Open chairs cost you before anyone on the front desk has time to react.",
    },
    solution: {
      title: "Identified, verified, and filled — automatically.",
      features: [
        "Fills from prioritized waitlist in real time",
        "No-show risk flagged 48 hrs ahead",
        "One view — no calls, no spreadsheets",
      ],
    },
    Icon: ({ active }) => (
      <img src={scheduleIcon} alt="Schedule" style={{ width: 36, height: 36, objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "brightness(0) invert(1) opacity(0.28)", transition: "filter 0.4s" }} />
    ),
  },
  {
    id: "produce", label: "Produce", num: "02",
    glyph: "β · 002",
    problem: {
      title: "Unscheduled treatments. Declined cases. Overdue visits.",
      body: "Patients say yes and leave without booking. Production quietly disappears.",
    },
    solution: {
      title: "Reengaged, reactivated, recovered — automatically.",
      features: [
        "Treatment plans auto-queued into workflow",
        "Right outreach, right channel, right time",
        "Accepted → scheduled → completed",
      ],
    },
    Icon: ({ active }) => (
      <img src={produceIcon} alt="Produce" style={{ width: 36, height: 36, objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "brightness(0) invert(1) opacity(0.28)", transition: "filter 0.4s" }} />
    ),
  },
  {
    id: "collect", label: "Collect", num: "03",
    glyph: "γ · 003",
    problem: {
      title: "A/R aging out. Unjustified write-offs. No case files.",
      body: "Accounts age past 90 days. Collectible revenue becomes revenue written off.",
    },
    solution: {
      title: "Surfaced, pursued, collected, documented — automatically.",
      features: [
        "Highest-recovery balances surfaced first",
        "Automated statements and payment links",
        "Denial patterns caught before write-off",
      ],
    },
    Icon: ({ active }) => (
      <img src={collectIcon} alt="Collect" style={{ width: 36, height: 36, objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "brightness(0) invert(1) opacity(0.28)", transition: "filter 0.4s" }} />
    ),
  },
  {
    id: "relay", label: "Relay", num: "04",
    glyph: "δ · 004",
    problem: {
      title: "Every patient. Every channel. Scattered everywhere.",
      body: "No single person has the full picture — patients slip through every gap.",
    },
    solution: {
      title: "Centralized, real-time, prioritized, and interactive.",
      features: [
        "SMS, email, and portal unified in one view",
        "Auto-routing to the right channel every time",
        "Full patient history, always in context",
      ],
    },
    Icon: ({ active }) => (
      <img src={relayIcon} alt="Relay" style={{ width: 36, height: 36, objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "brightness(0) invert(1) opacity(0.28)", transition: "filter 0.4s" }} />
    ),
  },
];

/* ─── Particle helpers ────────────────────────────────────────────── */
function buildParticles(W, H) {
  const cols = Math.ceil(W / PS), rows = Math.ceil(H / PS), pts = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pts.push({
        x: c * PS, y: r * PS,
        ox: (Math.random() - 0.5) * W * 0.6,
        oy: (Math.random() - 0.5) * H * 0.6,
        delay: Math.random() * 0.55,
      });
  return pts;
}
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut3(t)    { return 1 - Math.pow(1 - t, 3); }

/* ─── Tag badge ───────────────────────────────────────────────────── */
function Tag({ type }) {
  const isSol = type === "solution";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
      textTransform: "uppercase", padding: "3px 8px", borderRadius: 99,
      background: isSol ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)",
      color: isSol ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.38)",
      width: "fit-content", flexShrink: 0,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
        background: isSol ? "#ffffff" : "rgba(255,255,255,0.35)",
        boxShadow: isSol ? "0 0 6px 2px rgba(255,255,255,0.35)" : "none",
      }} />
      {isSol ? "gOS" : "Problem"}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function PlatformSection({ navbarHeight = 64 }) {
  const sectionRef  = useRef(null);
  const slotRefs    = useRef([]);
  const canvasRefs  = useRef([]);
  const rafIdsRef   = useRef(new Array(N).fill(null));
  const revealedRef = useRef(new Array(N).fill(false));

  const [progs,    setProgs]    = useState(new Array(N).fill(0));
  const [revealed, setRevealed] = useState(new Array(N).fill(false));
  const [heroIdx,  setHeroIdx]  = useState(-1);
  const [narrT,    setNarrT]    = useState(0);

  const inView = useInView(sectionRef, { once: true, margin: "-8% 0px" });

  /* Framer scroll — offset accounts for navbar so tracking starts once
     the section top reaches the bottom of the navbar, not the page top */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: [`start ${navbarHeight}px`, "end end"],
  });

  /* ── Dissolve animation ── */
  const runDissolve = useCallback((i, dir, onDone) => {
    const cv   = canvasRefs.current[i];
    const slot = slotRefs.current[i];
    const sol  = slot?.querySelector(".pf-sol");
    if (!cv || !slot || !sol) return;

    const W = slot.clientWidth, H = slot.clientHeight;
    cv.width = W; cv.height = H;
    cv.style.display = "block";
    const ctx = cv.getContext("2d");
    const pts = buildParticles(W, H);
    if (rafIdsRef.current[i]) cancelAnimationFrame(rafIdsRef.current[i]);
    const t0 = performance.now();
    sol.style.opacity = dir === "reveal" ? "0" : "1";

    function tick(now) {
      const t = Math.min(1, (now - t0) / DISSOLVE_DUR);
      ctx.clearRect(0, 0, W, H);
      sol.style.opacity = dir === "reveal"
        ? String(Math.max(0, (t - 0.4) / 0.6))
        : String(Math.max(0, 1 - t * 1.6));

      for (const p of pts) {
        const pt = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay + 0.001)));
        const e  = easeOut3(pt);
        let rx, ry, cr, alpha;
        if (dir === "reveal") {
          rx = p.x + p.ox * (1 - e); ry = p.y + p.oy * (1 - e);
          cr = Math.round(lerp(255, 24, e)); alpha = e;
        } else {
          rx = p.x + p.ox * e; ry = p.y + p.oy * e;
          cr = Math.round(lerp(24, 255, e)); alpha = 1 - e;
        }
        if (alpha < 0.01) continue;
        ctx.fillStyle = `rgba(${cr},${cr},${cr},${alpha.toFixed(3)})`;
        ctx.fillRect(Math.round(rx), Math.round(ry), PS, PS);
      }

      if (t < 1) {
        rafIdsRef.current[i] = requestAnimationFrame(tick);
      } else {
        cv.style.display = "none";
        sol.style.opacity = dir === "reveal" ? "1" : "0";
        rafIdsRef.current[i] = null;
        if (onDone) onDone();
      }
    }
    rafIdsRef.current[i] = requestAnimationFrame(tick);
  }, []);

  const reveal = useCallback((i) => {
    if (revealedRef.current[i]) return;
    revealedRef.current[i] = true;
    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
    setHeroIdx(i);
    runDissolve(i, "reveal", null);
  }, [runDissolve]);

  const hide = useCallback((i) => {
    if (!revealedRef.current[i]) return;
    revealedRef.current[i] = false;
    runDissolve(i, "hide", () => {
      setRevealed(prev => { const n = [...prev]; n[i] = false; return n; });
    });
    const last = revealedRef.current.lastIndexOf(true);
    setHeroIdx(last);
  }, [runDissolve]);

  /* Drive reveals from scroll progress */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const newProgs = MODULES.map((_, i) =>
      Math.max(0, Math.min(1, (v - i * STAGGER) / REVEAL_RANGE))
    );
    setProgs(newProgs);
    newProgs.forEach((cp, i) => {
      if (cp >= THRESHOLD && !revealedRef.current[i]) reveal(i);
      else if (cp < THRESHOLD && revealedRef.current[i]) hide(i);
    });
    const revCount = revealedRef.current.filter(Boolean).length;
    setNarrT(revCount / N);
  });

  /* Cleanup RAF on unmount */
  useEffect(() => {
    const ids = rafIdsRef.current;
    return () => { ids.forEach(id => id && cancelAnimationFrame(id)); };
  }, []);

  /* Narrative bar interpolation */
  const narrPOp = narrT === 0 ? 1 : Math.max(0, 1 - narrT * 2.5);
  const narrSOp = narrT === 0 ? 0 : Math.max(0, narrT * 1.8 - 0.4);
  const narrPY  = -Math.min(1, narrT * 2) * 8;
  const narrSY  = narrT === 0 ? 14 : (1 - narrT) * 10;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .pf-card-slot { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
        .pf-card-slot.hero { transform: scale(1.04); z-index: 5; }
        .pf-icon-col { transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); }
        .pf-icon-col.hero .pf-icon-box { transform: scale(1.18) translateY(-3px); background: rgba(255,255,255,0.12) !important; }
        .pf-icon-col.hero .pf-icon-box svg { stroke: #ffffff !important; }
        .pf-icon-col.hero .pf-icon-name { color: #ffffff !important; font-weight: 700; }
        .pf-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(10px,1.4vw,18px); }
        .pf-icon-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(6px,1vw,14px); flex-shrink: 0; margin-bottom: clamp(10px,1.5vh,18px); }
        @media (max-width: 600px) {
          .pf-grid-4 { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .pf-icon-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 6px !important; }
          .pf-card-slot { height: 200px !important; }
          .pf-icon-box { width: 48px !important; height: 48px !important; border-radius: 12px !important; }
          .pf-icon-box img { width: 24px !important; height: 24px !important; }
          .pf-icon-name { font-size: 8px !important; letter-spacing: 0.1em !important; }
          .pf-narr-wrap { display: none !important; }
        }
      `}</style>

      {/*
        280vh section height gives ~3x the card scroll reveal room.
        The inner sticky div pins at top:0 and stays 100vh while
        the user scrolls through the remaining height.
      */}
      <section
        ref={sectionRef}
        id="platform"
        style={{ height: "280vh", position: "relative" }}
      >
        {/* ── Sticky viewport — offsets below navbar ── */}
        <div style={{
          position: "sticky", top: navbarHeight,
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
                <span style={{
                  fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 700,
                  color: "#fff", lineHeight: 1.08, letterSpacing: "-0.02em",
                }}>
                  Four levers.{" "}
                </span>
                <span style={{
                  fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 700,
                  color: "rgba(255,255,255,0.22)", lineHeight: 1.08, letterSpacing: "-0.02em",
                }}>
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

                {/* Narrative crossfade */}
                <motion.div {...fadeUp(0.26)} className="pf-narr-wrap" style={{ position: "relative", height: 22, minWidth: 280, overflow: "hidden" }}>
                  <div style={{
                    fontSize: 11.5, letterSpacing: "0.07em", position: "absolute",
                    whiteSpace: "nowrap", pointerEvents: "none",
                    color: "rgba(255,255,255,0.28)", opacity: narrPOp,
                    transform: `translateY(${narrPY}px)`,
                    transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                  }}>
                    — The problems revenue teams face —
                  </div>
                  <div style={{
                    fontSize: 11.5, letterSpacing: "0.07em", position: "absolute",
                    whiteSpace: "nowrap", pointerEvents: "none",
                    color: "rgba(255,255,255,0.75)", opacity: narrSOp,
                    transform: `translateY(${narrSY}px)`,
                    transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                  }}>
                    — how OPAL gOS solves it —
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ── Icon row ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
              className="pf-icon-grid"
            >
              {MODULES.map((mod, i) => {
                const isActive = revealed[i];
                const isHero   = heroIdx === i;
                return (
                  <div
                    key={mod.id}
                    className={`pf-icon-col${isHero ? " hero" : ""}`}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}
                  >
                    <div
                      className="pf-icon-box"
                      style={{
                        width: 72, height: 72,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 16,
                        background: isActive ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.035)",
                        border: `1px solid ${isActive ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.06)"}`,
                        transition: "background 0.4s, border-color 0.4s",
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.28)",
                      }}
                    >
                      <mod.Icon active={isActive} />
                    </div>
                    <span
                      className="pf-icon-name"
                      style={{
                        fontSize: 9.5, fontWeight: 600, letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.20)",
                        transition: "color 0.4s",
                      }}
                    >
                      {mod.label}
                    </span>
                  </div>
                );
              })}
            </motion.div>

            {/* ── Cards grid — FREE FLOATING, no container box ── */}
            <div className="pf-grid-4">
              {MODULES.map((mod, i) => {
                const isRev  = revealed[i];
                const isHero = heroIdx === i;
                const prog   = progs[i] ?? 0;

                return (
                  <div
                    key={mod.id}
                    ref={el => slotRefs.current[i] = el}
                    className={`pf-card-slot${isHero ? " hero" : ""}`}
                    style={{ position: "relative", height: "clamp(220px, 30vh, 300px)" }}
                  >
                    {/* Dissolve canvas — sits above both faces */}
                    <canvas
                      ref={el => canvasRefs.current[i] = el}
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: 16,
                        pointerEvents: "none", zIndex: 10, display: "none",
                      }}
                    />

                    {/* ── Problem face ── */}
                    <div style={{
                      position: "absolute", inset: 0,
                      borderRadius: 16,
                      padding: "clamp(14px,2vh,20px) clamp(14px,1.5vw,18px)",
                      display: "flex", flexDirection: "column",
                      background: "rgba(255,255,255,0.025)",
                      border: `1px solid ${isRev ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}`,
                      backdropFilter: "blur(6px)",
                      transform: isRev
                        ? "translateY(12px) translateZ(-28px) rotateX(12deg) scale(0.92)"
                        : "none",
                      opacity: isRev ? 0.4 : 1,
                      zIndex: 2,
                      transition: "transform 0.7s cubic-bezier(0.32,0.72,0,1), opacity 0.6s ease, border-color 0.4s",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <Tag type="problem" />
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.14)", letterSpacing: "0.08em" }}>{mod.num}/04</span>
                      </div>

                      <div style={{
                        fontSize: "clamp(11.5px,1.2vh,13.5px)", fontWeight: 600,
                        lineHeight: 1.4, color: "rgba(255,255,255,0.88)", marginBottom: 8,
                      }}>
                        {mod.problem.title}
                      </div>
                      <div style={{
                        fontSize: "clamp(10.5px,1.05vh,12px)", lineHeight: 1.65,
                        color: "rgba(255,255,255,0.32)", flex: 1,
                      }}>
                        {mod.problem.body}
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 1.5, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 10, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{
                          height: "100%", background: "rgba(255,255,255,0.22)",
                          width: `${prog * 100}%`, transition: "width 0.06s linear",
                        }} />
                      </div>
                      <div style={{ marginTop: 5, fontSize: 10, color: "rgba(255,255,255,0.18)", flexShrink: 0 }}>
                        ↓ scroll to reveal
                      </div>
                    </div>

                    {/* ── Solution face ── */}
                    <div
                      className="pf-sol"
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: 16,
                        padding: "clamp(14px,2vh,20px) clamp(14px,1.5vw,18px)",
                        display: "flex", flexDirection: "column",
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${isRev ? "rgba(255,255,255,0.32)" : "transparent"}`,
                        backdropFilter: "blur(6px)",
                        boxShadow: isRev && isHero ? "0 0 0 1px rgba(255,255,255,0.08), 0 16px 48px rgba(255,255,255,0.06)" : "none",
                        zIndex: 3,
                        opacity: isRev ? 1 : 0,
                        pointerEvents: isRev ? "all" : "none",
                        transition: "opacity 0.1s, border-color 0.5s, box-shadow 0.5s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <Tag type="solution" />
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}>{mod.num}/04</span>
                      </div>

                      <div style={{
                        fontSize: "clamp(11.5px,1.2vh,13.5px)", fontWeight: 600,
                        lineHeight: 1.4, color: "rgba(255,255,255,0.90)", marginBottom: 8,
                      }}>
                        {mod.solution.title}
                      </div>

                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8, flexShrink: 0 }} />

                      <div style={{ flex: 1 }}>
                        {mod.solution.features.map((feat, fi) => (
                          <div key={fi} style={{
                            display: "flex", alignItems: "flex-start", gap: 6,
                            marginTop: fi === 0 ? 0 : 5,
                            fontSize: "clamp(10.5px,1.05vh,12px)", lineHeight: 1.5,
                            color: "rgba(255,255,255,0.48)",
                          }}>
                            <span style={{ color: "#ffffff", flexShrink: 0, marginTop: 1 }}>✓</span>
                            {feat}
                          </div>
                        ))}
                      </div>

                      {/* Full progress bar on solution */}
                      <div style={{ height: 1.5, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginTop: 10, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ height: "100%", background: "rgba(255,255,255,0.55)", width: "100%" }} />
                      </div>
                      <div style={{ marginTop: 5, fontSize: 10, color: "rgba(255,255,255,0.30)", flexShrink: 0 }}>
                        ↑ scroll up to reset
                      </div>
                    </div>

                    {/* Greek glyph watermark */}
                    <span style={{
                      position: "absolute", bottom: 10, right: 12, zIndex: 4,
                      fontSize: 9, letterSpacing: "0.28em", color: "rgba(255,255,255,0.10)",
                      pointerEvents: "none",
                    }}>
                      {mod.glyph}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* ── Footer bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: EASE, delay: 0.48 }}
              style={{
                flexShrink: 0,
                marginTop: "clamp(20px,3vh,36px)",
                display: "flex", flexWrap: "wrap",
                alignItems: "center", justifyContent: "space-between", gap: 12,
                paddingTop: "clamp(16px,2.2vh,24px)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p style={{
                fontSize: "clamp(11px,0.85vw,13px)",
                color: "rgba(255,255,255,0.26)", fontStyle: "italic",
                fontWeight: 300, lineHeight: 1.4, maxWidth: 480,
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
                  <path d="M1 11L10 2M10 2H4.5M10 2V7.5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}