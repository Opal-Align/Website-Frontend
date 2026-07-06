"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

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

const STEP_ANGLES   = STEP_DATA.map((_, i) => -90 + i * 72);
const ORBIT_DURATION = 14000;
const MANUAL_PAUSE   = 7000;
const BG             = "#0a0a0a";

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
  const activeIdxRef   = useRef(0);
  const rafRef         = useRef(null);
  const dimsRef        = useRef({ W: 0, H: 0, cx: 0, cy: 0, stepR: 0 });

  const [nodeXY, setNodeXY] = useState(Array(5).fill({ left: "50%", top: "50%" }));

  const spawnSparkles = useCallback((x, y) => {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.4 + 0.4;
      sparklesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1.0, decay: Math.random() * 0.028 + 0.014,
        r: Math.random() * 2.2 + 1,
      });
    }
  }, []);

  const activateStep = useCallback((idx) => {
    if (idx === lastActRef.current) return;
    lastActRef.current = idx;
    activeIdxRef.current = idx;
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
    const cx = W / 2, cy = H / 2;
    const stepR = Math.min(W, H) * 0.36;
    dimsRef.current = { W, H, cx, cy, stepR };

    const positions = STEP_ANGLES.map(deg => {
      const { x, y } = polarToXY(stepR, deg, cx, cy);
      return { left: (x / W * 100) + "%", top: (y / H * 100) + "%" };
    });
    setNodeXY(positions);

    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.0 + 0.2,
      alpha: Math.random() * 0.4 + 0.08,
      twinkleSpeed: Math.random() * 0.018 + 0.004,
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

      /* stars */
      for (const s of starsRef.current) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(ts * s.twinkleSpeed + s.twinkleOffset));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; ctx.fill();
      }

      /* active node glow */
      const ai = activeIdxRef.current;
      const gp = polarToXY(stepR, STEP_ANGLES[ai], cx, cy);
      const ag = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, 70);
      ag.addColorStop(0,    "rgba(255,255,255,0.13)");
      ag.addColorStop(0.35, "rgba(255,255,255,0.05)");
      ag.addColorStop(1,    "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(gp.x, gp.y, 70, 0, Math.PI * 2);
      ctx.fillStyle = ag; ctx.fill();

      /* dashed spokes from center to each node */
      for (let i = 0; i < STEP_ANGLES.length; i++) {
        const p = polarToXY(stepR, STEP_ANGLES[i], cx, cy);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = i === ai ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth   = i === ai ? 1 : 0.5;
        ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* scan angle */
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) % ORBIT_DURATION;
      const scanDeg = STEP_ANGLES[0] + (elapsed / ORBIT_DURATION) * 360;
      const TRAIL   = 110;

      /* filled radar wedge */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, stepR, degToRad(scanDeg - TRAIL), degToRad(scanDeg));
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.025)";
      ctx.fill();

      /* outer orbit ring */
      ctx.beginPath(); ctx.arc(cx, cy, stepR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 1.5; ctx.stroke();

      /* inner ring */
      ctx.beginPath(); ctx.arc(cx, cy, stepR * 0.44, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1; ctx.stroke();

      /* glowing sweep edge */
      const sRad = degToRad(scanDeg - TRAIL), eRad = degToRad(scanDeg);
      const SLICES = 22;
      for (let i = 0; i < SLICES; i++) {
        const a0 = sRad + (i / SLICES) * (eRad - sRad);
        const a1 = sRad + ((i + 1) / SLICES) * (eRad - sRad);
        ctx.beginPath(); ctx.arc(cx, cy, stepR, a0, a1);
        ctx.strokeStyle = `rgba(255,255,255,${((i / SLICES) * 0.65).toFixed(3)})`;
        ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();
      }

      /* scan dot halo + dot */
      const sd = polarToXY(stepR, scanDeg, cx, cy);
      const dotG = ctx.createRadialGradient(sd.x, sd.y, 0, sd.x, sd.y, 15);
      dotG.addColorStop(0,   "rgba(255,255,255,0.5)");
      dotG.addColorStop(0.4, "rgba(255,255,255,0.12)");
      dotG.addColorStop(1,   "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(sd.x, sd.y, 15, 0, Math.PI * 2);
      ctx.fillStyle = dotG; ctx.fill();

      ctx.beginPath(); ctx.arc(sd.x, sd.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 12;
      ctx.fill(); ctx.shadowBlur = 0;

      /* sparkles */
      sparklesRef.current = sparklesRef.current.filter(s => s.life > 0);
      for (const s of sparklesRef.current) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(s.life * 0.75).toFixed(2)})`; ctx.fill();
        s.x += s.vx; s.y += s.vy; s.vx *= 0.93; s.vy *= 0.93; s.life -= s.decay;
      }

      /* auto-activate by proximity */
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .fsl-section {
          background: ${BG};
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 32px 52px 28px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* heading */
        .fsl-heading {
          text-align: center;
          margin-bottom: 32px;
          flex-shrink: 0;
        }

        .fsl-presents {
          display: flex; align-items: center; justify-content: center;
          gap: 9px; margin-bottom: 22px;
        }
        .fsl-logo-opal {
          border: 1.5px solid rgba(255,255,255,0.65);
          border-radius: 2px; padding: 1px 4px;
          font-size: 10px; font-weight: 800; color: #fff; letter-spacing: 0.06em;
        }
        .fsl-logo-gos { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.7); }
        .fsl-presents-text { font-size: 9.5px; letter-spacing: 0.26em; color: rgba(255,255,255,0.25); text-transform: uppercase; }

        .fsl-hl-hero {
          display: block; font-size: clamp(38px,6.4vw,64px); font-weight: 800;
          color: #fff; text-transform: uppercase; letter-spacing: -0.03em; line-height: 0.98;
          max-width: 780px; margin: 0 auto;
        }

        .fsl-loop-row {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; margin-top: 14px;
        }
        .fsl-loop-text {
          font-size: 12px; font-weight: 400;
          color: rgba(255,255,255,0.25); text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        .fsl-section-body {
          font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.38);
          line-height: 1.68; max-width: 600px; margin: 9px auto 0;
        }

        /* bottom row */
        .fsl-bottom {
          display: flex; gap: 48px;
          align-items: center; justify-content: center;
          flex: 1;
        }
        .fsl-left { flex: 0 0 400px; display: flex; flex-direction: column; }

        /* step cards */
        .fsl-steps { display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px; }

        .fsl-card {
          position: relative;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; cursor: pointer; overflow: hidden;
          background: rgba(255,255,255,0.03);
          transition: border-color 0.3s, background 0.3s, box-shadow 0.4s;
        }
        .fsl-card:hover { border-color: rgba(255,255,255,0.14); }
        .fsl-card.active {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.055);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.05), 0 0 24px rgba(255,255,255,0.07), 0 0 52px rgba(255,255,255,0.03);
        }
        .fsl-card::after {
          content: ''; position: absolute; top: 11px; right: 11px;
          width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,0.13);
          transition: background 0.3s, box-shadow 0.3s;
        }
        .fsl-card.active::after {
          background: rgba(255,255,255,0.6);
          box-shadow: 0 0 5px rgba(255,255,255,0.45);
        }

        .fsl-card-header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px 11px;
        }
        .fsl-sc-num {
          font-size: 26px; font-weight: 800; letter-spacing: -0.03em;
          line-height: 1; color: rgba(255,255,255,0.13);
          transition: color 0.3s;
        }
        .fsl-card.active .fsl-sc-num { color: #fff; }
        .fsl-sc-title {
          font-size: 14px; font-weight: 700; flex: 1;
          color: rgba(255,255,255,0.38);
          transition: color 0.3s;
        }
        .fsl-card.active .fsl-sc-title { color: #fff; }

        .fsl-card-body {
          overflow: hidden; max-height: 0;
          transition: max-height 0.38s ease, padding 0.3s;
          padding: 0 18px;
        }
        .fsl-card.active .fsl-card-body { max-height: 110px; padding: 0 18px 15px; }
        .fsl-card-body p {
          font-size: 11.5px; font-weight: 300;
          color: rgba(255,255,255,0.42); line-height: 1.65;
          border-top: 1px solid rgba(255,255,255,0.07); padding-top: 10px; margin: 0;
        }
        .fsl-card-body p strong { color: rgba(255,255,255,0.82); font-weight: 600; }

        /* book button */
        .fsl-book {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          border: 1px solid rgba(255,255,255,0.45); border-radius: 999px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          color: #fff; text-transform: uppercase; cursor: pointer;
          background: transparent; width: fit-content;
          transition: border-color 0.25s, background 0.25s, color 0.25s;
        }
        .fsl-book:hover { border-color: #fff; background: #fff; color: ${BG}; }
        .fsl-book svg { width: 10px; height: 10px; transition: transform 0.2s; }
        .fsl-book:hover svg { transform: translate(2px,-2px); }

        /* dots */
        .fsl-dots { display: flex; gap: 5px; margin-top: 14px; }
        .fsl-dot {
          width: 18px; height: 2.5px; border-radius: 2px;
          background: rgba(255,255,255,0.1); cursor: pointer;
          transition: background 0.25s, width 0.25s; border: none;
        }
        .fsl-dot.active { background: #fff; width: 28px; }

        /* orbital */
        .fsl-orbital {
          flex: 0 0 460px; height: 480px; position: relative;
        }

        /* node circles */
        .fsl-node-circle {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(10,10,10,0.97);
          border: 1.5px solid rgba(255,255,255,0.18);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 2px;
          transition: border-color 0.35s, background 0.35s, box-shadow 0.4s, transform 0.35s;
          box-shadow: 0 0 0 3px ${BG};
        }
        .fsl-node.active .fsl-node-circle {
          border-color: rgba(255,255,255,0.9);
          background: #fff;
          transform: scale(1.2);
          box-shadow:
            0 0 0 3px ${BG},
            0 0 0 5px rgba(255,255,255,0.18),
            0 0 18px rgba(255,255,255,0.38),
            0 0 45px rgba(255,255,255,0.15),
            0 0 75px rgba(255,255,255,0.06);
        }
        .fsl-sn-num {
          font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
          line-height: 1; color: rgba(255,255,255,0.35);
          transition: color 0.3s, font-size 0.3s;
        }
        .fsl-node.active .fsl-sn-num { color: ${BG}; font-size: 11px; }
        .fsl-sn-name {
          font-size: 7.5px; font-weight: 400; line-height: 1;
          color: rgba(255,255,255,0.28);
          transition: color 0.3s, font-size 0.3s;
        }
        .fsl-node.active .fsl-sn-name { color: rgba(0,0,0,0.55); font-size: 8px; }

        /* center badge */
        .fsl-center-badge {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 72px; height: 72px; border-radius: 13px;
          background: rgba(14,14,14,0.98);
          border: 1.5px solid rgba(255,255,255,0.38);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          z-index: 22; pointer-events: none;
        }
        .fsl-cb-opal {
          border: 1.5px solid rgba(255,255,255,0.65);
          border-radius: 2px; padding: 1px 4px;
          font-size: 9px; font-weight: 800; color: #fff; letter-spacing: 0.06em;
        }
        .fsl-cb-gos {
          font-size: 8px; font-weight: 500;
          color: rgba(255,255,255,0.45); letter-spacing: 0.16em;
        }

        @media (max-width: 767px) {
          .fsl-section { padding: 24px 16px 20px; }
          .fsl-bottom { flex-direction: column; gap: 24px; }
          .fsl-left { flex: unset; width: 100%; }
          .fsl-orbital { flex: unset; width: 100%; height: clamp(240px,60vw,320px); }
          .fsl-hl-hero { font-size: clamp(32px,9vw,48px); }
        }
      `}</style>

      <section className="fsl-section">

        {/* ══ HEADING ══ */}
        <div className="fsl-heading">
          <div className="fsl-presents">
            <span className="fsl-logo-opal">OPAL</span>
            <span className="fsl-presents-text">presents</span>
          </div>

          <span className="fsl-hl-hero">The Guided Operating System</span>

          <div className="fsl-loop-row">
            <span className="fsl-loop-text">The</span>
            <span className="fsl-logo-gos">gOS</span>
            <span className="fsl-loop-text">Loop</span>
          </div>
        </div>

        {/* ══ BOTTOM ROW ══ */}
        <div className="fsl-bottom">

          {/* LEFT */}
          <div className="fsl-left">
            <div className="fsl-steps">
              {STEP_DATA.map((step, i) => (
                <div
                  key={step.num}
                  className={`fsl-card${active === i ? " active" : ""}`}
                  onClick={() => userActivate(i)}
                >
                  <div className="fsl-card-header">
                    <span className="fsl-sc-num">{step.num}</span>
                    <span className="fsl-sc-title">{step.label}</span>
                  </div>
                  <div className="fsl-card-body">
                    <p dangerouslySetInnerHTML={{ __html: step.body }} />
                  </div>
                </div>
              ))}
            </div>

            {/* <button className="fsl-book">
              Book a Demo
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button> */}

            <div className="fsl-dots">
              {STEP_DATA.map((_, i) => (
                <button
                  key={i}
                  className={`fsl-dot${active === i ? " active" : ""}`}
                  onClick={() => userActivate(i)}
                />
              ))}
            </div>
          </div>

          {/* ORBITAL */}
          <div ref={containerRef} className="fsl-orbital">
            <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />

            <div style={{ position:"absolute", inset:0 }}>
              {STEP_DATA.map((step, i) => (
                <div
                  key={step.num}
                  className={`fsl-node${active === i ? " active" : ""}`}
                  onClick={() => userActivate(i)}
                  style={{
                    position:"absolute",
                    left: nodeXY[i]?.left ?? "50%",
                    top:  nodeXY[i]?.top  ?? "50%",
                    transform: "translate(-50%,-50%)",
                    zIndex: 20, cursor: "pointer",
                  }}
                >
                  <div className="fsl-node-circle">
                    <span className="fsl-sn-num">{step.num}</span>
                    <span className="fsl-sn-name">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Center badge — OPAL gOS text, matching HTML design */}
            <div className="fsl-center-badge">
              <span className="fsl-cb-opal">OPAL</span>
              <span className="fsl-cb-gos">gOS</span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}