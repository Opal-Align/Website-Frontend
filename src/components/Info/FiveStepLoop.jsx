"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STEP_DATA = [
  {
    num: "01", label: "Identify",
    body: `Every revenue lever — aged A/R, unscheduled treatment, dormant patients, missed collections — is scanned continuously. <strong>The moment a gap opens, gOS surfaces it.</strong>`,
  },
  {
    num: "02", label: "Strategize",
    body: `Channels, pattern, message tone, escalation thresholds — <strong>all configured to your practice, your providers, your patients.</strong> Your playbook. At machine scale.`,
  },
  {
    num: "03", label: "Engage",
    body: `Multi-channel, multi-touch outreach — sequenced and dispatched automatically. <strong>The right message, to the right person, at the right time.</strong>`,
  },
  {
    num: "04", label: "Calibrate",
    body: `gOS learns from every response. Timing adjusts. Pattern sharpens. <strong>Month six performs better than month one</strong> — automatically.`,
  },
  {
    num: "05", label: "Guide",
    body: `What automation can't resolve gets handed to your team — queued, prioritized, and ready to act on. <strong>Guides you forward. Starts the loop again.</strong>`,
  },
];

const STEP_ANGLES = STEP_DATA.map((_, i) => -90 + i * 72); // evenly spaced on circle
const ORBIT_DURATION = 18000; // ms for one full rotation
const MANUAL_PAUSE   = 7000;  // ms before auto-resume after manual click

const BG = "#0a0a0a";

function degToRad(d) { return d * Math.PI / 180; }
function polarToXY(r, deg, cx, cy) {
  const rad = degToRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/* ─── Orbital canvas hook ─────────────────────────────────────────── */
function useOrbitalCanvas({ canvasRef, containerRef, setActive }) {
  const sparklesRef    = useRef([]);
  const starsRef       = useRef([]);
  const startTimeRef   = useRef(null);
  const manualRef      = useRef(false);
  const manualTimerRef = useRef(null);
  const lastActRef     = useRef(-1);
  const rafRef         = useRef(null);
  const dimsRef        = useRef({ W: 0, H: 0, cx: 0, cy: 0, stepR: 0 });

  // expose node positions for HTML elements
  const [nodeXY, setNodeXY] = useState(Array(5).fill({ left: "50%", top: "50%" }));

  const spawnSparkles = useCallback((x, y) => {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.2 + 0.6;
      sparklesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1.0, decay: Math.random() * 0.035 + 0.02,
        r: Math.random() * 2 + 1,
      });
    }
  }, []);

  const activateStep = useCallback((idx) => {
    if (idx === lastActRef.current) return;
    lastActRef.current = idx;
    setActive(idx);
    const { cx, cy, stepR } = dimsRef.current;
    if (stepR > 0) {
      const { x, y } = polarToXY(stepR, STEP_ANGLES[idx], cx, cy);
      spawnSparkles(x, y);
    }
  }, [setActive, spawnSparkles]);

  const userActivate = useCallback((idx) => {
    manualRef.current = true;
    clearTimeout(manualTimerRef.current);
    activateStep(idx);
    manualTimerRef.current = setTimeout(() => { manualRef.current = false; }, MANUAL_PAUSE);
  }, [activateStep]);

  const resize = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const W = rect.width, H = rect.height;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const minDim = Math.min(W, H);
    const cx = W / 2, cy = H / 2;
    const stepR = minDim * 0.36;
    dimsRef.current = { W, H, cx, cy, stepR };

    // recompute node positions
    const positions = STEP_ANGLES.map(deg => {
      const { x, y } = polarToXY(stepR, deg, cx, cy);
      return { left: (x / W * 100) + "%", top: (y / H * 100) + "%" };
    });
    setNodeXY(positions);

    // reinit stars
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    resize();

    const canvas = canvasRef.current;
    if (!canvas) return;

    function frame(ts) {
      const ctx = canvas.getContext("2d");
      const { W, H, cx, cy, stepR } = dimsRef.current;
      if (W === 0) { rafRef.current = requestAnimationFrame(frame); return; }

      ctx.clearRect(0, 0, W, H);

      // bg glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, stepR * 1.4);
      grad.addColorStop(0,   "rgba(255,255,255,0.04)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.01)");
      grad.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, stepR * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      // twinkling stars
      for (const s of starsRef.current) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(ts * s.twinkleSpeed + s.twinkleOffset));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; ctx.fill();
      }

      // rings
      ctx.beginPath(); ctx.arc(cx, cy, stepR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, stepR * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();

      // rotating scanner
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) % ORBIT_DURATION;
      const scanDeg = -90 + (elapsed / ORBIT_DURATION) * 360;

      // sweep arc (gradient trail)
      const TRAIL = 100;
      const startRad = degToRad(scanDeg - TRAIL);
      const endRad   = degToRad(scanDeg);
      const SLICES = 20;
      for (let i = 0; i < SLICES; i++) {
        const a0 = startRad + (i / SLICES) * (endRad - startRad);
        const a1 = startRad + ((i + 1) / SLICES) * (endRad - startRad);
        ctx.beginPath(); ctx.arc(cx, cy, stepR, a0, a1);
        ctx.strokeStyle = `rgba(255,255,255,${((i / SLICES) * 0.55).toFixed(3)})`;
        ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
      }

      // scan dot
      const { x: sdx, y: sdy } = polarToXY(stepR, scanDeg, cx, cy);
      const dotGrad = ctx.createRadialGradient(sdx, sdy, 0, sdx, sdy, 18);
      dotGrad.addColorStop(0,   "rgba(255,255,255,0.45)");
      dotGrad.addColorStop(0.4, "rgba(255,255,255,0.12)");
      dotGrad.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(sdx, sdy, 18, 0, Math.PI * 2);
      ctx.fillStyle = dotGrad; ctx.fill();
      ctx.beginPath(); ctx.arc(sdx, sdy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255,255,255,0.6)"; ctx.shadowBlur = 10;
      ctx.fill(); ctx.shadowBlur = 0;

      // sparkles
      sparklesRef.current = sparklesRef.current.filter(s => s.life > 0);
      for (const s of sparklesRef.current) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.life * 0.85).toFixed(2)})`; ctx.fill();
        s.x += s.vx; s.y += s.vy; s.vx *= 0.93; s.vy *= 0.93; s.life -= s.decay;
      }

      // auto-activate when scanner crosses a step angle
      if (!manualRef.current) {
        const norm = ((scanDeg % 360) + 360) % 360;
        STEP_ANGLES.forEach((deg, i) => {
          const sn = ((deg % 360) + 360) % 360;
          let diff = Math.abs(norm - sn);
          if (diff > 180) diff = 360 - diff;
          if (diff < 4) activateStep(i);
        });
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(manualTimerRef.current);
      window.removeEventListener("resize", resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resize, activateStep]);

  return { nodeXY, userActivate };
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function FiveStepLoop() {
  const [active, setActive] = useState(0);
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const { nodeXY, userActivate } = useOrbitalCanvas({
    canvasRef, containerRef, setActive,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .fsl-book:hover { border-color: #fff !important; background: #fff !important; color: ${BG} !important; }
        .fsl-book:hover .fsl-arrow { transform: translate(2px,-2px); }
        .fsl-card:hover { border-color: rgba(255,255,255,0.15) !important; }
        .fsl-node-circle { transition: border-color 0.35s, background 0.35s, box-shadow 0.35s, transform 0.35s; }

        /* Mobile-first layout */
        .fsl-section    { background: ${BG}; color: #fff; font-family: 'Inter',-apple-system,BlinkMacSystemFont,sans-serif; overflow-x: hidden; }
        .fsl-container  { width: 100%; max-width: 1200px; margin: 0 auto; box-sizing: border-box; display: flex; flex-direction: column; padding: clamp(28px,5vh,44px) clamp(16px,5vw,36px) clamp(24px,4vh,36px); gap: clamp(24px,4vh,32px); }
        .fsl-left       { width: 100%; display: flex; flex-direction: column; }
        .fsl-orbital    { width: 100%; height: clamp(220px,55vw,300px); position: relative; }

        /* Tablet / Desktop */
        @media (min-width: 768px) {
          .fsl-section   { height: 100vh; min-height: 600px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
          .fsl-container { flex-direction: row; align-items: flex-start; gap: clamp(28px,4vw,52px); padding: clamp(24px,4vh,40px) clamp(20px,4vw,52px); }
          .fsl-left      { flex-shrink: 0; width: 380px; }
          .fsl-orbital   { flex: 1; height: clamp(340px,70vh,580px); }
        }
      `}</style>

      <section className="fsl-section">
        <div className="fsl-container">

          {/* ══ LEFT — text + cards ══ */}
          <div className="fsl-left" style={{ paddingTop: 2 }}>

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "clamp(10px,1.8vh,20px)" }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>+</span>
              <span style={{ fontSize: 10.5, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
                The Guided Operating System
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Headline */}
            <div style={{ marginBottom: "clamp(10px,1.6vh,16px)", lineHeight: 0.9, letterSpacing: "-0.01em" }}>
              {[
                { text: "FIVE",    cls: "white" },
                { text: "STEPS.",  cls: "mid"   },
                { text: "ONE",     cls: "ghost" },
                { text: "CON-",    cls: "white" },
                { text: "TINUOUS", cls: "mid"   },
                { text: "LOOP.",   cls: "ghost" },
              ].map((w) => (
                <span key={w.text} style={{
                  display: "block",
                  fontSize: "clamp(28px, min(3.8vw, 4.8vh), 42px)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: w.cls === "ghost" ? "transparent" : w.cls === "mid" ? "rgba(255,255,255,0.45)" : "#ffffff",
                  WebkitTextStroke: w.cls === "ghost" ? "1px rgba(255,255,255,0.22)" : undefined,
                }}>
                  {w.text}
                </span>
              ))}
            </div>

            {/* Body */}
            <p style={{ fontSize: "clamp(12px,1.1vw,13px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.68, maxWidth: "min(340px,100%)", marginBottom: "clamp(10px,1.8vh,22px)" }}>
              Every step runs continuously — automated where it can be, guided where it must be. The loop never stops.
            </p>

            {/* Step cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "clamp(10px,1.8vh,22px)" }}>
              {STEP_DATA.map((step, i) => {
                const isActive = active === i;
                return (
                  <div key={step.num} className="fsl-card" onClick={() => userActivate(i)} style={{ border: `1px solid ${isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, cursor: "pointer", overflow: "hidden", background: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)", transition: "border-color 0.3s, background 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "clamp(9px,1.2vh,12px) 16px" }}>
                      <span style={{ fontSize: 15, fontWeight: 800, minWidth: 24, letterSpacing: "-0.02em", lineHeight: 1, color: isActive ? "#ffffff" : "rgba(255,255,255,0.18)", transition: "color 0.3s" }}>{step.num}</span>
                      <span style={{ flex: 1, fontSize: "clamp(13px,1.3vw,14px)", fontWeight: 700, color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)", transition: "color 0.3s" }}>{step.label}</span>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isActive ? "#ffffff" : "rgba(255,255,255,0.12)", boxShadow: isActive ? "0 0 7px rgba(255,255,255,0.4)" : "none", transition: "background 0.3s, box-shadow 0.3s" }} />
                    </div>
                    <div style={{ maxHeight: isActive ? "clamp(80px,15vh,120px)" : 0, overflow: "hidden", padding: isActive ? "0 16px clamp(8px,1.2vh,13px)" : "0 16px", transition: "max-height 0.38s ease, padding 0.3s" }}>
                      <p style={{ fontSize: "clamp(11px,1.1vw,12px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.65, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10, margin: 0 }} dangerouslySetInnerHTML={{ __html: step.body }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Book Demo */}
            <button className="fsl-book" style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "clamp(9px,1.3vh,12px) 22px", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: 40, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#ffffff", textTransform: "uppercase", cursor: "pointer", background: "transparent", width: "fit-content", transition: "border-color 0.25s, background 0.25s, color 0.25s", marginBottom: "clamp(10px,1.5vh,16px)" }}>
              BOOK A DEMO
              <svg className="fsl-arrow" viewBox="0 0 14 14" fill="none" width="12" height="12" style={{ transition: "transform 0.2s" }}>
                <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Scroll dots */}
            <div style={{ display: "flex", gap: 5 }}>
              {STEP_DATA.map((_, i) => (
                <button key={i} onClick={() => userActivate(i)} style={{ border: "none", cursor: "pointer", padding: 0, borderRadius: 2, height: 3, width: active === i ? 32 : 20, background: active === i ? "#ffffff" : "rgba(255,255,255,0.12)", transition: "background 0.25s, width 0.25s" }} />
              ))}
            </div>
          </div>

          {/* ══ ORBITAL — single ref, CSS controls size on mobile vs desktop ══ */}
          <div ref={containerRef} className="fsl-orbital">
            <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            <div style={{ position: "absolute", inset: 0 }}>
              {STEP_DATA.map((step, i) => {
                const isActive = active === i;
                return (
                  <div key={step.num} onClick={() => userActivate(i)} style={{ position: "absolute", left: nodeXY[i]?.left ?? "50%", top: nodeXY[i]?.top ?? "50%", transform: "translate(-50%,-50%)", zIndex: 20, cursor: "pointer" }}>
                    <div className="fsl-node-circle" style={{ width: 60, height: 60, borderRadius: "50%", background: isActive ? "#ffffff" : "rgba(10,10,10,0.97)", border: `1.5px solid ${isActive ? "#ffffff" : "rgba(255,255,255,0.18)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: isActive ? `0 0 0 3px ${BG},0 0 0 4px rgba(255,255,255,0.3),0 0 20px rgba(255,255,255,0.15)` : `0 0 0 2px ${BG}`, transform: isActive ? "scale(1.18)" : "scale(1)", transition: "all 0.35s" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1, letterSpacing: "0.04em", color: isActive ? BG : "rgba(255,255,255,0.35)", transition: "color 0.3s" }}>{step.num}</span>
                      <span style={{ fontSize: 9, fontWeight: 500, lineHeight: 1, color: isActive ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.28)", transition: "color 0.3s" }}>{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 82, height: 82, borderRadius: 15, background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.42)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, boxShadow: "0 0 36px rgba(255,255,255,0.06)", zIndex: 22 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", letterSpacing: "0.06em" }}>OPAL</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em" }}>GOS</span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}

