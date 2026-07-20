"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import opalLogo from "../../assets/OPAL.svg";
import opalGosLogo from "../../assets/opal-gos.svg";
import {
  IDENTIFY_IDX,
  useLoopSession,
} from "./LoopSession.jsx";
/* Re-export so existing named imports keep working if any remain */
export { LoopSessionProvider } from "./LoopSession.jsx";

const OPAL_LOGO_RATIO = 3520 / 1214;
const OPAL_GOS_LOGO_RATIO = 1;

const STEP_DATA = [
  {
    num: "04", label: "Calibrate",
    body: `gOS learns from every response. Timing adjusts. Pattern sharpens. <strong>Month six performs better than month one</strong> — automatically.`,
  },
  {
    num: "05", label: "Guide",
    body: `What automation can't resolve gets handed to your team — queued, prioritized, and ready to act on. <strong>Guides you forward. Starts the loop again.</strong>`,
  },
  {
    num: "06", label: "Resolve",
    body: `Every outcome logged, every edge case closed. <strong>Issues resolved, loops completed, revenue recovered.</strong> The system resets — and begins again.`,
  },
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
];

const N = STEP_DATA.length;
const STEP_ANGLES = [-60, 0, 60, 120, 180, 240];
// Column layout: left 01–03 bottom→top, right 04–06 top→bottom (STEP_DATA order unchanged)
const LEFT_COLUMN  = [5, 4, 3]; // render 03, 02, 01 top-down → 01 sits at bottom
const RIGHT_COLUMN = [0, 1, 2]; // render 04, 05, 06 top-down
const MOBILE_SEQUENCE = [3, 4, 5, 0, 1, 2]; // 01 Identify → 06 Resolve, top to bottom
const ORBIT_DURATION = 14000;
const MANUAL_PAUSE   = 7000;
const BG             = "#0a0a0a";
const NODE_SIZE      = 96;
const NODE_ACTIVE_SCALE = 1.14;
const ORBIT_PAD      = 6;
const INNER_RING_RATIO = 0.58; // inner orbit ring — higher = closer to outer ring

function degToRad(d) { return d * Math.PI / 180; }
function calcOrbitRadius(W, H) {
  const nodeOuter = (NODE_SIZE * NODE_ACTIVE_SCALE) / 2 + 3 + ORBIT_PAD;
  const target = (Math.min(W, H) - nodeOuter * 2) / 2;
  return Math.max(120, target);
}

function polarToXY(r, deg, cx, cy) {
  const rad = degToRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Elapsed ms so the scan arm sits on Identify's angle. */
function elapsedForIdentify() {
  let delta = STEP_ANGLES[IDENTIFY_IDX] - STEP_ANGLES[0];
  if (delta < 0) delta += 360;
  return (delta / 360) * ORBIT_DURATION;
}

/* ─── Orbital canvas hook ─────────────────────────────────────────── */
function useOrbitalCanvas({
  canvasRef,
  containerRef,
  setActive,
  active = IDENTIFY_IDX,
  zoneActive = true,
  resetEpoch = 0,
}) {
  const sparklesRef    = useRef([]);
  const starsRef       = useRef([]);
  const startTimeRef   = useRef(null);
  const manualRef      = useRef(false);
  const manualTimerRef = useRef(null);
  const lastActRef     = useRef(-1);
  const activeIdxRef   = useRef(IDENTIFY_IDX);
  const rafRef         = useRef(null);
  const dimsRef        = useRef({ W: 0, H: 0, cx: 0, cy: 0, stepR: 0 });
  const zoneActiveRef  = useRef(zoneActive);

  const [nodeXY, setNodeXY] = useState(Array(N).fill({ left: "50%", top: "50%" }));

  useEffect(() => { zoneActiveRef.current = zoneActive; }, [zoneActive]);

  /* Cards (or shared session) can change active without going through userActivate */
  useEffect(() => {
    if (active === activeIdxRef.current) return;
    activeIdxRef.current = active;
    lastActRef.current = active;
    manualRef.current = true;
    clearTimeout(manualTimerRef.current);
    manualTimerRef.current = setTimeout(() => {
      manualRef.current = false;
    }, MANUAL_PAUSE);
  }, [active]);

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

  /* Snap scan + highlight back to Identify after leaving the loop zone. */
  useEffect(() => {
    if (resetEpoch === 0) return;
    clearTimeout(manualTimerRef.current);
    manualRef.current = false;
    lastActRef.current = -1;
    activeIdxRef.current = IDENTIFY_IDX;
    startTimeRef.current = performance.now() - elapsedForIdentify();
    setActive(IDENTIFY_IDX);
  }, [resetEpoch, setActive]);

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
    const stepR = calcOrbitRadius(W, H);
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

    // Start on Identify rather than Calibrate
    startTimeRef.current = performance.now() - elapsedForIdentify();
    lastActRef.current = -1;
    activateStep(IDENTIFY_IDX);

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
      const glowR = stepR * 0.38 + 18;
      const ag = ctx.createRadialGradient(gp.x, gp.y, 0, gp.x, gp.y, glowR);
      ag.addColorStop(0,    "rgba(255,255,255,0.13)");
      ag.addColorStop(0.35, "rgba(255,255,255,0.05)");
      ag.addColorStop(1,    "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(gp.x, gp.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = ag; ctx.fill();

      /* dashed spokes from center to each node */
      for (let i = 0; i < STEP_ANGLES.length; i++) {
        const p = polarToXY(stepR, STEP_ANGLES[i], cx, cy);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = i === ai ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth   = i === ai ? 1 : 0.5;
        ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* scan angle — freeze on Identify while the loop zone is off-screen */
      if (!startTimeRef.current) startTimeRef.current = ts - elapsedForIdentify();
      const paused = !zoneActiveRef.current;
      if (paused) {
        startTimeRef.current = ts - elapsedForIdentify();
      }
      const elapsed = paused
        ? elapsedForIdentify()
        : (ts - startTimeRef.current) % ORBIT_DURATION;
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
      ctx.beginPath(); ctx.arc(cx, cy, stepR * INNER_RING_RATIO, 0, Math.PI * 2);
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

      /* auto-activate by proximity — only while loop zone is on-screen */
      if (!manualRef.current && zoneActiveRef.current) {
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
    const container = containerRef.current;
    const ro = container ? new ResizeObserver(resize) : null;
    if (container) ro.observe(container);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(manualTimerRef.current);
      ro?.disconnect();
      window.removeEventListener("resize", resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resize, activateStep]);

  return { nodeXY, userActivate };
}

/* ─── Shared styles ──────────────────────────────────────────────── */
function FslStyles() {
  return (
    <style>{`
      .fsl-section {
        --fsl-nav-h: var(--page-nav-h, 80px);
        scroll-margin-top: var(--fsl-nav-h);
        background: ${BG};
        color: #fff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 300;
        height: calc(100svh - var(--fsl-nav-h));
        min-height: calc(100svh - var(--fsl-nav-h));
        max-height: calc(100svh - var(--fsl-nav-h));
        display: flex;
        flex-direction: column;
        padding: clamp(14px, 2vh, 24px) clamp(20px, 3vw, 40px) clamp(12px, 1.5vh, 20px);
        box-sizing: border-box;
        overflow: hidden;
      }

      .fsl-heading {
        text-align: center;
        margin-bottom: clamp(6px, 1vh, 12px);
        flex-shrink: 0;
      }
      .fsl-brand-opal {
        display: inline-block;
        margin-bottom: 6px;
        line-height: 0;
      }
      .fsl-brand-opal img {
        display: block;
        height: clamp(28px, 3.8vw, 44px);
        width: auto;
        aspect-ratio: ${OPAL_LOGO_RATIO};
        object-fit: contain;
        animation: logoGlowMorphSoft 10s ease-in-out infinite;
      }
      .fsl-presents-text {
        display: block;
        font-size: clamp(8px, 0.9vw, 10px);
        letter-spacing: 0.38em;
        color: rgba(255,255,255,0.32);
        text-transform: uppercase;
        margin-bottom: clamp(6px, 1vh, 10px);
      }
      .fsl-ampersand {
        letter-spacing: 0;
        margin-top: clamp(5px, 0.8vh, 8px);
        margin-bottom: clamp(4px, 0.6vh, 8px);
      }
      .fsl-hl-hero {
        display: block;
        font-size: clamp(20px, 3.2vw, 36px);
        font-weight: 800;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: -0.03em;
        line-height: 1;
        max-width: 720px;
        margin: 0 auto;
      }
      .fsl-loop-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .fsl-loop-text {
        font-size: clamp(11px, 1.2vw, 14px);
        font-weight: 400;
        color: rgba(255,255,255,0.28);
        text-transform: uppercase;
        letter-spacing: 0.16em;
      }
      .fsl-logo-gos {
        font-size: clamp(18px, 2.4vw, 28px);
        font-weight: 600;
        color: #fff;
        letter-spacing: -0.02em;
        line-height: 1;
      }

      .fsl-orbit-stage {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      .fsl-bottom {
        display: flex;
        gap: clamp(10px, 1.5vw, 24px);
        align-items: stretch;
        justify-content: center;
        flex: 1;
        min-height: 0;
        width: 100%;
        max-width: min(1280px, 96vw);
        margin: 0 auto;
      }
      .fsl-col {
        flex: 0 0 clamp(260px, 24vw, 340px);
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: clamp(10px, 1.4vh, 18px) 0;
        border-top: 1px solid rgba(255,255,255,0.07);
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }
      .fsl-col-right { order: 3; }
      .fsl-col-left  { order: 1; }
      .fsl-col-mobile { display: none; }
      .fsl-orbital   { order: 2; align-self: center; }

      .fsl-steps { display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-evenly; margin-bottom: 0; }

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
        display: flex; align-items: center; justify-content: center;
        padding: 14px 18px 12px;
      }
      .fsl-sc-title {
        font-size: clamp(15px, 1.5vh, 17px); font-weight: 700;
        text-align: center; width: 100%;
        color: rgba(255,255,255,0.38);
        transition: color 0.3s;
      }
      .fsl-card.active .fsl-sc-title { color: #fff; }
      .fsl-card-body {
        overflow: hidden; max-height: 0;
        transition: max-height 0.38s ease, padding 0.3s;
        padding: 0 18px;
      }
      .fsl-card.active .fsl-card-body { max-height: 120px; padding: 0 18px 16px; }
      .fsl-card-body p {
        font-size: clamp(12.5px, 1.35vh, 14px); font-weight: 300;
        color: rgba(255,255,255,0.42); line-height: 1.62;
        border-top: 1px solid rgba(255,255,255,0.07); padding-top: 10px; margin: 0;
      }
      .fsl-card-body p strong { color: rgba(255,255,255,0.82); font-weight: 600; }

      .fsl-orbital {
        flex: 1 1 auto;
        position: relative;
        min-width: 0;
      }
      .fsl-node-circle {
        width: ${NODE_SIZE}px; height: ${NODE_SIZE}px; border-radius: 50%;
        background: rgba(10,10,10,0.97);
        border: 1.5px solid rgba(255,255,255,0.18);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        transition: border-color 0.35s, background 0.35s, box-shadow 0.4s, transform 0.35s;
        box-shadow: 0 0 0 3px ${BG};
      }
      .fsl-node.active .fsl-node-circle {
        border-color: rgba(255,255,255,0.9);
        background: #fff;
        transform: scale(${NODE_ACTIVE_SCALE});
        box-shadow:
          0 0 0 3px ${BG},
          0 0 0 5px rgba(255,255,255,0.18),
          0 0 18px rgba(255,255,255,0.38),
          0 0 45px rgba(255,255,255,0.15),
          0 0 75px rgba(255,255,255,0.06);
      }
      .fsl-sn-name {
        font-size: 13px; font-weight: 500; line-height: 1.12;
        letter-spacing: 0.01em; text-align: center;
        padding: 0 6px; max-width: 94%;
        color: rgba(255,255,255,0.42);
        transition: color 0.3s, font-size 0.3s;
      }
      .fsl-node.active .fsl-sn-name { color: rgba(0,0,0,0.72); font-size: 13.5px; font-weight: 600; }

      @keyframes logoGlowMorph {
        0%, 88%, 100% {
          filter: brightness(0) invert(1)
                  drop-shadow(0 0 0px rgba(255,255,255,0))
                  drop-shadow(0 0 0px rgba(255,255,255,0))
                  drop-shadow(0 0 0px rgba(255,255,255,0));
        }
        12%, 75% {
          filter: brightness(0) invert(1)
                  drop-shadow(0 0 8px rgba(255,255,255,0.45))
                  drop-shadow(0 0 20px rgba(255,255,255,0.18))
                  drop-shadow(0 0 40px rgba(255,255,255,0.08));
        }
      }
      @keyframes logoGlowMorphSoft {
        0%, 88%, 100% {
          filter: drop-shadow(0 0 0px rgba(255,255,255,0))
                  drop-shadow(0 0 0px rgba(255,255,255,0))
                  drop-shadow(0 0 0px rgba(255,255,255,0));
        }
        12%, 75% {
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.45))
                  drop-shadow(0 0 20px rgba(255,255,255,0.18))
                  drop-shadow(0 0 40px rgba(255,255,255,0.08));
        }
      }
      .fsl-center-badge {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        display: flex; align-items: center; justify-content: center;
        z-index: 22; pointer-events: none;
        line-height: 0;
      }
      .fsl-cb-logo {
        display: block;
        width: clamp(68px, 16%, 104px);
        height: clamp(68px, 16%, 104px);
        aspect-ratio: ${OPAL_GOS_LOGO_RATIO};
        object-fit: contain;
        animation: logoGlowMorph 10s ease-in-out infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .fsl-cb-logo { animation: none; filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(255,255,255,0.45)); }
        .fsl-brand-opal img { animation: none; filter: drop-shadow(0 0 8px rgba(255,255,255,0.45)); }
      }

      /* Cards-only slide — fill the full sticky viewport */
      .fsl-cards-only {
        padding: clamp(10px, 1.5vh, 18px) clamp(14px, 4vw, 24px);
      }
      .fsl-cards-only .fsl-bottom {
        max-width: none;
        width: 100%;
        flex: 1;
        min-height: 0;
      }
      .fsl-cards-only .fsl-col-mobile {
        display: none;
      }

      @media (max-width: 767px) {
        .fsl-section {
          padding: 20px 16px;
        }
        .fsl-hl-hero { font-size: clamp(22px, 7vw, 32px); }
        .fsl-brand-opal img {
          height: clamp(24px, 8vw, 38px);
          width: auto;
          aspect-ratio: ${OPAL_LOGO_RATIO};
        }
        .fsl-sn-name { font-size: 12px; }
        .fsl-node.active .fsl-sn-name { font-size: 12.5px; }

        .fsl-cards-only {
          padding: 8px 12px;
        }
        .fsl-cards-only .fsl-bottom {
          flex-direction: column;
          gap: 0;
          align-items: stretch;
          height: 100%;
        }
        .fsl-cards-only .fsl-col-left,
        .fsl-cards-only .fsl-col-right { display: none !important; }
        .fsl-cards-only .fsl-col-mobile {
          display: flex !important;
          flex-direction: column;
          align-items: stretch;
          width: 100%;
          max-width: none;
          margin: 0;
          flex: 1;
          min-height: 0;
          border: none !important;
          border-top: none !important;
          border-bottom: none !important;
          padding: 0 !important;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-steps {
          width: 100%;
          max-width: none;
          flex: 1;
          min-height: 0;
          gap: 6px;
          justify-content: stretch;
          align-items: stretch;
        }
        /* Inactive rows stay compact; active grows enough for full copy */
        .fsl-cards-only .fsl-col-mobile .fsl-card {
          width: 100%;
          max-width: none;
          flex: 0.72 1 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-card.active {
          flex: 2.1 1 0;
          justify-content: center;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-card-header {
          padding: 8px 12px 6px;
          flex-shrink: 0;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-card.active .fsl-card-header {
          padding-bottom: 4px;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-sc-title {
          font-size: 13.5px;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-card.active .fsl-card-body {
          max-height: none;
          flex: 0 1 auto;
          padding: 0 12px 10px;
          overflow: visible;
        }
        .fsl-cards-only .fsl-col-mobile .fsl-card-body p {
          font-size: 11.5px;
          line-height: 1.45;
          padding-top: 6px;
        }
      }
    `}</style>
  );
}

/** Slide 1 — heading + orbital loop (nav #loop) */
export function FiveStepLoopOrbit() {
  const { active, setActive, zoneActive, resetEpoch } = useLoopSession(true);
  const [orbitDim, setOrbitDim] = useState(560);
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const stageRef     = useRef(null);

  const { nodeXY, userActivate } = useOrbitalCanvas({
    canvasRef, containerRef, setActive, active, zoneActive, resetEpoch,
  });

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      const dim = Math.min(w, h) * (window.innerWidth < 768 ? 0.92 : 0.88);
      setOrbitDim(Math.round(Math.max(280, dim)));
    };
    measure();
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const ro = stageRef.current ? new ResizeObserver(measure) : null;
    if (stageRef.current) ro.observe(stageRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  return (
    <>
      <FslStyles />
      <section id="loop" className="fsl-section">
        <div className="fsl-heading">
          <div className="fsl-brand-opal">
            <img src={opalLogo} alt="OPAL" />
          </div>
          <span className="fsl-presents-text">presents</span>
          <span className="fsl-hl-hero">The Guided Operating System</span>
          <span className="fsl-presents-text fsl-ampersand">&</span>
          <div className="fsl-loop-row">
            <span className="fsl-loop-text">The</span>
            <span className="fsl-logo-gos">gOS</span>
            <span className="fsl-loop-text">Loop</span>
          </div>
        </div>

        <div ref={stageRef} className="fsl-orbit-stage">
          <div
            ref={containerRef}
            className="fsl-orbital"
            style={{ width: orbitDim, height: orbitDim, flexShrink: 0 }}
          >
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
                    <span className="fsl-sn-name">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="fsl-center-badge">
              <img src={opalGosLogo} alt="OPAL gOS" className="fsl-cb-logo" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Slide 2 — step detail cards */
export function FiveStepLoopCards() {
  const { active, setActive } = useLoopSession(true);

  const renderStepCard = (step, globalIdx) => (
    <div
      key={step.num}
      className={`fsl-card${active === globalIdx ? " active" : ""}`}
      onClick={() => setActive(globalIdx)}
    >
      <div className="fsl-card-header">
        <span className="fsl-sc-title">{step.label}</span>
      </div>
      <div className="fsl-card-body">
        <p dangerouslySetInnerHTML={{ __html: step.body }} />
      </div>
    </div>
  );

  return (
    <>
      <FslStyles />
      <section className="fsl-section fsl-cards-only">
        <div className="fsl-bottom">
          <div className="fsl-col fsl-col-left">
            <div className="fsl-steps">
              {LEFT_COLUMN.map((idx) => renderStepCard(STEP_DATA[idx], idx))}
            </div>
          </div>
          <div className="fsl-col fsl-col-right">
            <div className="fsl-steps">
              {RIGHT_COLUMN.map((idx) => renderStepCard(STEP_DATA[idx], idx))}
            </div>
          </div>
          <div className="fsl-col fsl-col-mobile">
            <div className="fsl-steps">
              {MOBILE_SEQUENCE.map((idx) => renderStepCard(STEP_DATA[idx], idx))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** Desktop — full loop: header + orbit + step cards in one viewport */
export default function FiveStepLoop() {
  const { active, setActive, zoneActive, resetEpoch } = useLoopSession(true);
  const [orbitDim, setOrbitDim] = useState(560);
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const bottomRef    = useRef(null);
  const leftColRef   = useRef(null);

  const { nodeXY, userActivate } = useOrbitalCanvas({
    canvasRef, containerRef, setActive, active,
    zoneActive,
    resetEpoch,
  });

  useEffect(() => {
    const measure = () => {
      const bottomEl = bottomRef.current;
      if (!bottomEl) return;
      const bottomH = bottomEl.clientHeight;
      const bottomW = bottomEl.clientWidth;
      const colW = leftColRef.current?.offsetWidth ?? 272;
      const gap = 20;
      const centerW = bottomW - colW * 2 - gap * 2;
      const dim = Math.min(bottomH * 0.98, centerW * 0.98);
      setOrbitDim(Math.round(Math.max(360, dim)));
    };
    measure();
    requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const bottomEl = bottomRef.current;
    const ro = bottomEl ? new ResizeObserver(measure) : null;
    if (bottomEl) ro.observe(bottomEl);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  const renderStepCard = (step, globalIdx) => (
    <div
      key={step.num}
      className={`fsl-card${active === globalIdx ? " active" : ""}`}
      onClick={() => userActivate(globalIdx)}
    >
      <div className="fsl-card-header">
        <span className="fsl-sc-title">{step.label}</span>
      </div>
      <div className="fsl-card-body">
        <p dangerouslySetInnerHTML={{ __html: step.body }} />
      </div>
    </div>
  );

  return (
    <>
      <FslStyles />
      <section id="loop" className="fsl-section fsl-desktop-combined">
        <div className="fsl-heading">
          <div className="fsl-brand-opal">
            <img src={opalLogo} alt="OPAL" />
          </div>
          <span className="fsl-presents-text">presents</span>
          <span className="fsl-hl-hero">The Guided Operating System</span>
          <span className="fsl-presents-text fsl-ampersand">&</span>
          <div className="fsl-loop-row">
            <span className="fsl-loop-text">The</span>
            <span className="fsl-logo-gos">gOS</span>
            <span className="fsl-loop-text">Loop</span>
          </div>
        </div>

        <div ref={bottomRef} className="fsl-bottom">
          <div ref={leftColRef} className="fsl-col fsl-col-left">
            <div className="fsl-steps">
              {LEFT_COLUMN.map((idx) => renderStepCard(STEP_DATA[idx], idx))}
            </div>
          </div>

          <div
            ref={containerRef}
            className="fsl-orbital"
            style={{ width: orbitDim, height: orbitDim, flexShrink: 0 }}
          >
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
                    <span className="fsl-sn-name">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="fsl-center-badge">
              <img src={opalGosLogo} alt="OPAL gOS" className="fsl-cb-logo" />
            </div>
          </div>

          <div className="fsl-col fsl-col-right">
            <div className="fsl-steps">
              {RIGHT_COLUMN.map((idx) => renderStepCard(STEP_DATA[idx], idx))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
