"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useInView, motion } from "framer-motion";

/* ─── Word pool ─────────────────────────────────────────────────────────── */
const WORDS = [
  { text: "Revenue Leaking",    tier: 1 },
  { text: "A/R Aging",          tier: 1 },
  { text: "Losing Touch",       tier: 1 },
  { text: "Unused Capacity",    tier: 1 },

  { text: "Missed Collections", tier: 2 },
  { text: "Dormant Patients",   tier: 2 },
  { text: "Unscheduled Care",   tier: 2 },
  { text: "Blind Spots",        tier: 2 },
  { text: "Write-Offs",         tier: 2 },
  { text: "No Follow-Up",       tier: 2 },
  { text: "Declined Cases",     tier: 2 },
  { text: "Oblivion",           tier: 2 },
  { text: "Empty Chairs",       tier: 2 },
  { text: "Lost Demand",        tier: 2 },

  { text: "Billed",             tier: 3 },
  { text: "Aged Out",           tier: 3 },
  { text: "Scattered",          tier: 3 },
  { text: "Unreachable",        tier: 3 },
  { text: "Uncollected",        tier: 3 },
  { text: "Invisible",          tier: 3 },
  { text: "Overdue",            tier: 3 },
  { text: "Gaps",               tier: 3 },
  { text: "No-Shows",           tier: 3 },
  { text: "Slipping",           tier: 3 },
  { text: "Unjustified",        tier: 3 },
  { text: "Disconnected",       tier: 3 },
  { text: "Headcount",          tier: 3 },
  { text: "Manual",             tier: 3 },
  { text: "Reactive",           tier: 3 },
  { text: "Delayed",            tier: 3 },
  { text: "Unmeasured",         tier: 3 },
  { text: "Forgotten",          tier: 3 },
  { text: "Siloed",             tier: 3 },
  { text: "Fragmented",         tier: 3 },
];

const TIER_STYLE = {
  1: { fontSize: "clamp(20px,3.2vw,34px)", fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.025em", charW: 0.62 },
  2: { fontSize: "clamp(13px,1.8vw,20px)", fontWeight: 600, color: "rgba(255,255,255,0.38)", letterSpacing: "-0.01em",  charW: 0.58 },
  3: { fontSize: "clamp(10px,1.1vw,13px)", fontWeight: 400, color: "rgba(255,255,255,0.14)", letterSpacing: "0.01em",   charW: 0.55 },
};

// Center font sizes when a word flies in
const TIER_CENTER_PX = { 1: 58, 2: 50, 3: 42 };

const TIER_PX = { 1: 27, 2: 17, 3: 11.5 };

// Animation durations (ms)
const FLY_IN_DUR  = 600;
const HOLD_DUR    = 750;
const FLY_OUT_DUR = 600;
const GAP_DUR     = 180;

/* ─── Deterministic seeded random ──────────────────────────────────────── */
const seed = (n) => { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); };

/* ─── Easing ────────────────────────────────────────────────────────────── */
const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const easeInCubic    = (t) => t * t * t;
const lerpN          = (a, b, t) => a + (b - a) * t;

/* ─── Build word positions ──────────────────────────────────────────────── */
function buildLayout(W, H) {
  if (!W || !H) return [];

  const cx = W / 2, cy = H / 2;
  const safeRx = Math.min(Math.max(W * 0.24, 260), W * 0.46);
  const safeRy = Math.min(Math.max(H * 0.20, 100), H * 0.4);
  const insets = { 1: 0.14, 2: 0.06, 3: 0.015 };
  const placed = [];

  const wordExtent = (word) => {
    const px = TIER_PX[word.tier];
    const style = TIER_STYLE[word.tier];
    const halfW = (word.text.length * px * style.charW) / 2;
    const halfH = px * 0.72;
    return { halfW, halfH };
  };

  WORDS.forEach((word, i) => {
    const inset = insets[word.tier];
    const { halfW, halfH } = wordExtent(word);
    const xMin = W * inset, xMax = W * (1 - inset);
    const yMin = H * inset, yMax = H * (1 - inset);
    let x = cx, y = cy, tries = 0, found = false;

    while (tries < 100 && !found) {
      const px_ = xMin + seed(i * 17 + tries * 3) * (xMax - xMin);
      const py_ = yMin + seed(i * 7  + tries * 5) * (yMax - yMin);
      const inSafeZone = Math.pow((px_ - cx) / safeRx, 2) + Math.pow((py_ - cy) / safeRy, 2) < 1;
      const pad = 10;
      const collides = placed.some((p) =>
        Math.abs(p.x - px_) < p.halfW + halfW + pad &&
        Math.abs(p.y - py_) < p.halfH + halfH + pad
      );
      tries++;
      if (!inSafeZone && !collides) { x = px_; y = py_; found = true; }
      else if (tries === 100) { x = px_; y = py_; }
    }

    const mx = halfW + 12, my = halfH + 12;
    x = Math.max(mx, Math.min(W - mx, x));
    y = Math.max(my, Math.min(H - my, y));

    placed.push({
      ...word, x, y, halfW, halfH,
      floatAmp:   seed(i * 3)  * 5 + 2,
      floatFreq:  seed(i * 5)  * 0.0004 + 0.0003,
      floatPhase: seed(i * 11) * Math.PI * 2,
      delay:      seed(i * 13) * 0.8,
      restPx:     TIER_PX[word.tier],
    });
  });

  return placed;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProblemWordMap() {
  const containerRef  = useRef(null);
  const sectionRef    = useRef(null);
  const rafRef        = useRef(null);
  const timerRef      = useRef(null);
  const elsRef        = useRef([]);
  const stateRef      = useRef([]);
  const phaseRef      = useRef([]);
  const activeRef     = useRef(-1);
  const queueRef      = useRef(0);
  const layoutRef     = useRef([]);
  const animatingRef  = useRef(false);

  const inView = useInView(sectionRef, { once: false, margin: "-80px" });
  const [words, setWords] = useState([]);

  /* ── Build layout on resize ─────────────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      const layout = buildLayout(w, h);
      setWords(layout);
      layoutRef.current = layout;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Sync span refs after words render ──────────────────────────────────── */
  useEffect(() => {
    if (!words.length) return;
    // state per word: current animated x/y/opacity/fontSize
    stateRef.current = words.map((w) => ({
      x: w.x, y: w.y,
      opacity: 0,
      fontSize: w.restPx,
    }));
    phaseRef.current = words.map(() => ({ phase: "rest", startTime: 0 }));
  }, [words]);

  /* ── Sequence: one word at a time flies to center ───────────────────────── */
  const scheduleNext = useCallback(() => {
    const layout = layoutRef.current;
    if (!layout.length) return;

    const idx = queueRef.current % layout.length;
    queueRef.current++;

    phaseRef.current[idx] = { phase: "flyIn", startTime: performance.now() };
    activeRef.current = idx;

    timerRef.current = setTimeout(() => {
      phaseRef.current[idx] = { phase: "flyOut", startTime: performance.now() };

      timerRef.current = setTimeout(() => {
        phaseRef.current[idx] = { phase: "rest", startTime: performance.now() };
        activeRef.current = -1;
        timerRef.current = setTimeout(scheduleNext, GAP_DUR);
      }, FLY_OUT_DUR);
    }, FLY_IN_DUR + HOLD_DUR);
  }, []);

  /* ── rAF loop ───────────────────────────────────────────────────────────── */
  const animate = useCallback((now) => {
    const layout = layoutRef.current;
    const els    = elsRef.current;
    const states = stateRef.current;
    const phases = phaseRef.current;
    const container = containerRef.current;
    if (!container || !layout.length) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const W  = container.clientWidth;
    const H  = container.clientHeight;
    const cx = W / 2;
    const cy = H / 2;

    layout.forEach((word, i) => {
      const el = els[i];
      if (!el || !states[i]) return;

      const restStyle  = TIER_STYLE[word.tier];
      const restOpacity = parseFloat(restStyle.color.match(/[\d.]+\)$/)?.[0] ?? "0.5");
      const restFontSz  = word.restPx;
      const centerFontSz = TIER_CENTER_PX[word.tier];
      const ph          = phases[i];

      const floatX = word.x + Math.sin(now * word.floatFreq + word.floatPhase) * word.floatAmp;
      const floatY = word.y + Math.cos(now * word.floatFreq * 0.7 + word.floatPhase) * word.floatAmp;

      let tx, ty, top, tfs;

      if (ph.phase === "flyIn") {
        const t = Math.min(1, (now - ph.startTime) / FLY_IN_DUR);
        const e = easeInOutCubic(t);
        tx  = lerpN(word.x, cx, e);
        ty  = lerpN(word.y, cy, e);
        top = lerpN(restOpacity, 1, e);
        tfs = lerpN(restFontSz, centerFontSz, e);
      } else if (ph.phase === "hold") {
        tx = cx; ty = cy; top = 1; tfs = centerFontSz;
      } else if (ph.phase === "flyOut") {
        const t = Math.min(1, (now - ph.startTime) / FLY_OUT_DUR);
        const e = easeInOutCubic(t);
        tx  = lerpN(cx, floatX, e);
        ty  = lerpN(cy, floatY, e);
        top = lerpN(1, restOpacity, easeInCubic(t));
        tfs = lerpN(centerFontSz, restFontSz, e);
      } else {
        tx = floatX; ty = floatY; top = restOpacity; tfs = restFontSz;
      }

      const spd = ph.phase === "rest" ? 0.1 : 0.2;
      const s   = states[i];
      s.x       = lerpN(s.x, tx, spd);
      s.y       = lerpN(s.y, ty, spd);
      s.opacity = lerpN(s.opacity, top, 0.1);
      s.fontSize= lerpN(s.fontSize, tfs, 0.15);

      el.style.left      = `${s.x}px`;
      el.style.top       = `${s.y}px`;
      el.style.opacity   = `${s.opacity}`;
      el.style.fontSize  = `${s.fontSize}px`;
      el.style.fontWeight = i === activeRef.current ? "800" : `${restStyle.fontWeight}`;
      el.style.zIndex    = i === activeRef.current ? "10" : word.tier === 1 ? "2" : "1";
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Start / stop animation based on inView ─────────────────────────────── */
  useEffect(() => {
    if (!inView || !words.length) {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      animatingRef.current = false;
      return;
    }

    if (animatingRef.current) return;
    animatingRef.current = true;

    // fade-in pass then hand off to main loop
    let fadeStart = null;
    const fadeIn = (now) => {
      if (!fadeStart) fadeStart = now;
      const t = Math.min(1, (now - fadeStart) / 900);
      const layout = layoutRef.current;
      const els    = elsRef.current;
      const states = stateRef.current;

      layout.forEach((word, i) => {
        const restOpacity = parseFloat(TIER_STYLE[word.tier].color.match(/[\d.]+\)$/)?.[0] ?? "0.5");
        const op = restOpacity * t;
        if (states[i]) { states[i].opacity = op; states[i].x = word.x; states[i].y = word.y; }
        if (els[i]) { els[i].style.opacity = `${op}`; els[i].style.left = `${word.x}px`; els[i].style.top = `${word.y}px`; }
      });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(fadeIn);
      } else {
        rafRef.current = requestAnimationFrame(animate);
        timerRef.current = setTimeout(scheduleNext, 400);
      }
    };

    rafRef.current = requestAnimationFrame(fadeIn);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      animatingRef.current = false;
    };
  }, [inView, words, animate, scheduleNext]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');

        .pwm-section {
          --pwm-nav-h: 84px;
          background: #0a0a0a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300; color: #fff;
          padding: 0;
          height: calc(100svh - var(--pwm-nav-h));
          min-height: 560px;
          display: flex; flex-direction: column;
          overflow: hidden; position: relative;
        }
        .pwm-inner {
          max-width: 1300px; margin: 0 auto; width: 100%; height: 100%;
          display: flex; flex-direction: column; flex: 1; min-height: 0;
          padding: 1.75rem 2rem 1.5rem; box-sizing: border-box;
        }
        .pwm-eyebrow {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 16px; flex-shrink: 0;
        }
        .pwm-eyebrow-text {
          font-size: 10.5px; letter-spacing: 0.2em;
          color: rgba(255,255,255,0.35); text-transform: uppercase; font-weight: 400;
        }
        .pwm-heading { text-align: center; margin-bottom: 0; flex-shrink: 0; }
        .pwm-hl-bold {
          display: block;
          font-size: clamp(30px, 5vw, 50px); font-weight: 800;
          letter-spacing: -0.028em; color: #fff; line-height: 1.05;
        }
        .pwm-hl-muted {
          display: block;
          font-size: clamp(26px, 4.4vw, 44px); font-weight: 800;
          letter-spacing: -0.028em; color: rgba(255,255,255,0.26);
          line-height: 1.05; margin-top: 4px;
        }
        .pwm-map-wrap {
          position: relative; width: 100%;
          flex: 1 1 auto; min-height: 320px;
          margin: 1.5rem 0 0; overflow: hidden;
        }
        .pwm-word {
          position: absolute;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          line-height: 1;
          color: #ffffff;
          transform: translate(-50%, -50%);
          will-change: left, top, opacity, font-size;
          letter-spacing: -0.02em;
        }

        @media (max-width: 600px) {
          .pwm-section { --pwm-nav-h: 64px; min-height: 620px; }
          .pwm-inner { padding: 1.25rem 1rem 1rem; }
          .pwm-map-wrap { min-height: 300px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pwm-word { transition: none !important; }
        }
      `}</style>

      <section className="pwm-section" ref={sectionRef}>
        <div className="pwm-inner">

          <motion.div
            className="pwm-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="pwm-eyebrow-text">Where Practices Lose Revenue</span>
          </motion.div>

          <motion.div
            className="pwm-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <span className="pwm-hl-bold">The gaps you can't see.</span>
            <span className="pwm-hl-muted">The revenue you're losing.</span>
          </motion.div>

          <motion.div
            ref={containerRef}
            className="pwm-map-wrap"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                className="pwm-word"
                ref={(el) => { elsRef.current[i] = el; }}
                style={{
                  left: word.x,
                  top: word.y,
                  fontSize: TIER_STYLE[word.tier].fontSize,
                  fontWeight: TIER_STYLE[word.tier].fontWeight,
                  opacity: 0,
                }}
              >
                {word.text}
              </span>
            ))}
          </motion.div>

        </div>
      </section>
    </>
  );
}