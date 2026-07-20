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

// Center scale when a word flies in (fontSize stays fixed — scale avoids clipping)
const TIER_CENTER_SCALE = { 1: 2.15, 2: 2.45, 3: 2.85 };
const TIER_CENTER_SCALE_MOBILE = { 1: 1.55, 2: 1.75, 3: 2.05 };

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

function pushOutsideCenter(x, y, cx, cy, minDist, W, H, halfW, halfH) {
  let dx = x - cx;
  let dy = y - cy;
  let d = Math.hypot(dx, dy);
  if (d < minDist) {
    if (d < 1) {
      const angle = Math.atan2(dy || 0.01, dx || 0.01);
      dx = Math.cos(angle);
      dy = Math.sin(angle);
    } else {
      dx /= d;
      dy /= d;
    }
    x = cx + dx * minDist;
    y = cy + dy * minDist;
  }
  const mx = halfW + 12;
  const my = halfH + 12;
  return {
    x: Math.max(mx, Math.min(W - mx, x)),
    y: Math.max(my, Math.min(H - my, y)),
  };
}

/* ─── Build word positions ──────────────────────────────────────────────── */
function buildLayout(W, H) {
  if (!W || !H) return [];

  const isMobile = W < 600;
  const cx = W / 2;
  const cy = H / 2;
  // Center clearance: tight on desktop (words fill in), larger on mobile (featured word needs room)
  const safeRx = isMobile ? W * 0.36 : W * 0.14;
  const safeRy = isMobile ? H * 0.30 : H * 0.13;
  const minDist = isMobile
    ? Math.max(W * 0.34, H * 0.28, 88)
    : Math.max(W * 0.06, H * 0.08, 48);
  const minDistForTier = (tier) => {
    if (isMobile) return minDist;
    if (tier === 1) return minDist;
    if (tier === 2) return minDist * 0.55;
    return minDist * 0.2;
  };

  const safeZoneForTier = (tier, px_, py_) => {
    const tierRx = isMobile ? safeRx : safeRx * (tier === 1 ? 1 : tier === 2 ? 0.65 : 0.35);
    const tierRy = isMobile ? safeRy : safeRy * (tier === 1 ? 1 : tier === 2 ? 0.65 : 0.35);
    return Math.pow((px_ - cx) / tierRx, 2) + Math.pow((py_ - cy) / tierRy, 2) < 1;
  };
  const insets = isMobile ? { 1: 0.08, 2: 0.04, 3: 0.02 } : { 1: 0.14, 2: 0.06, 3: 0.015 };
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
      const inSafeZone = safeZoneForTier(word.tier, px_, py_);
      const pad = word.tier === 1 ? 18 : word.tier === 2 ? 14 : 10;
      const collides = placed.some((p) =>
        Math.abs(p.x - px_) < p.halfW + halfW + pad &&
        Math.abs(p.y - py_) < p.halfH + halfH + pad
      );
      tries++;
      if (!inSafeZone && !collides) { x = px_; y = py_; found = true; }
    }

    if (!found) {
      // Spiral outward from safe-zone edge — never fall back into the center
      for (let ring = 0; ring < 32 && !found; ring++) {
        const angle = seed(i * 19 + ring * 7) * Math.PI * 2;
        const rx = safeRx + (isMobile ? 24 : 16) + ring * (isMobile ? 10 : 14);
        const ry = safeRy + (isMobile ? 18 : 12) + ring * (isMobile ? 8 : 12);
        const px_ = cx + Math.cos(angle) * rx;
        const py_ = cy + Math.sin(angle) * ry;
        const pad = word.tier === 1 ? 18 : word.tier === 2 ? 14 : 10;
        const collides = placed.some((p) =>
          Math.abs(p.x - px_) < p.halfW + halfW + pad &&
          Math.abs(p.y - py_) < p.halfH + halfH + pad
        );
        if (!collides && px_ > xMin && px_ < xMax && py_ > yMin && py_ < yMax) {
          x = px_; y = py_; found = true;
        }
      }
    }

    if (!found) {
      const angle = seed(i * 23) * Math.PI * 2;
      const dist = minDistForTier(word.tier);
      x = cx + Math.cos(angle) * dist;
      y = cy + Math.sin(angle) * dist;
    }

    ({ x, y } = pushOutsideCenter(x, y, cx, cy, minDistForTier(word.tier), W, H, halfW, halfH));

    placed.push({
      ...word, x, y, halfW, halfH, isMobile,
      floatAmp:   (isMobile ? 2 : 1) * (seed(i * 3)  * 5 + 2),
      floatFreq:  seed(i * 5)  * 0.0004 + 0.0003,
      floatPhase: seed(i * 11) * Math.PI * 2,
      delay:      seed(i * 13) * 0.8,
      restPx:     TIER_PX[word.tier],
      centerPx:   TIER_PX[word.tier] * (isMobile ? TIER_CENTER_SCALE_MOBILE[word.tier] : TIER_CENTER_SCALE[word.tier]),
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
  const busyRef       = useRef(false);

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
    queueRef.current = 0;
    busyRef.current = false;
    activeRef.current = -1;
    clearTimeout(timerRef.current);
  }, [words]);

  /* ── Sequence: one word at a time flies to center ───────────────────────── */
  const snapWordToRest = useCallback((layout, states, i, now) => {
    const word = layout[i];
    if (!word || !states[i]) return;
    const restStyle = TIER_STYLE[word.tier];
    const restOpacity = parseFloat(restStyle.color.match(/[\d.]+\)$/)?.[0] ?? "0.5");
    const floatX = word.x + Math.sin(now * word.floatFreq + word.floatPhase) * word.floatAmp;
    const floatY = word.y + Math.cos(now * word.floatFreq * 0.7 + word.floatPhase) * word.floatAmp;
    states[i].x = floatX;
    states[i].y = floatY;
    states[i].opacity = restOpacity;
    states[i].fontSize = word.restPx;
    phaseRef.current[i] = { phase: "rest", startTime: now };
  }, []);

  const scheduleNext = useCallback(() => {
    const layout = layoutRef.current;
    if (!layout.length || busyRef.current) return;

    const now = performance.now();
    const idx = queueRef.current % layout.length;
    queueRef.current++;

    // Force any straggler back to rest before the next word takes center
    layout.forEach((_, i) => {
      if (i !== idx && phaseRef.current[i]?.phase !== "rest") {
        snapWordToRest(layout, stateRef.current, i, now);
      }
    });

    busyRef.current = true;
    phaseRef.current[idx] = { phase: "flyIn", startTime: now };
    activeRef.current = idx;

    timerRef.current = setTimeout(() => {
      phaseRef.current[idx] = { phase: "hold", startTime: performance.now() };

      timerRef.current = setTimeout(() => {
        phaseRef.current[idx] = { phase: "flyOut", startTime: performance.now() };

        timerRef.current = setTimeout(() => {
          snapWordToRest(layout, stateRef.current, idx, performance.now());
          activeRef.current = -1;
          busyRef.current = false;
          timerRef.current = setTimeout(scheduleNext, GAP_DUR);
        }, FLY_OUT_DUR);
      }, HOLD_DUR);
    }, FLY_IN_DUR);
  }, [snapWordToRest]);

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
    const isMobile = W < 600;
    const activeIdx = activeRef.current;
    const centerBusy = activeIdx >= 0 && (
      phaseRef.current[activeIdx]?.phase === "flyIn" ||
      phaseRef.current[activeIdx]?.phase === "hold" ||
      phaseRef.current[activeIdx]?.phase === "flyOut"
    );

    layout.forEach((word, i) => {
      const el = els[i];
      if (!el || !states[i]) return;

      const restStyle  = TIER_STYLE[word.tier];
      const restOpacity = parseFloat(restStyle.color.match(/[\d.]+\)$/)?.[0] ?? "0.5");
      const ph          = phases[i];

      const floatX = word.x + Math.sin(now * word.floatFreq + word.floatPhase) * word.floatAmp;
      const floatY = word.y + Math.cos(now * word.floatFreq * 0.7 + word.floatPhase) * word.floatAmp;

      let tx, ty, top, tFont;

      if (ph.phase === "flyIn") {
        const t = Math.min(1, (now - ph.startTime) / FLY_IN_DUR);
        const e = easeInOutCubic(t);
        tx  = lerpN(word.x, cx, e);
        ty  = lerpN(word.y, cy, e);
        top = lerpN(restOpacity, 1, e);
        tFont = lerpN(word.restPx, word.centerPx, e);
      } else if (ph.phase === "hold") {
        tx = cx; ty = cy; top = 1; tFont = word.centerPx;
      } else if (ph.phase === "flyOut") {
        const t = Math.min(1, (now - ph.startTime) / FLY_OUT_DUR);
        const e = easeInOutCubic(t);
        tx  = lerpN(cx, floatX, e);
        ty  = lerpN(cy, floatY, e);
        top = lerpN(1, restOpacity, easeInCubic(t));
        tFont = lerpN(word.centerPx, word.restPx, e);
      } else {
        tx = floatX; ty = floatY; top = restOpacity; tFont = word.restPx;
        if (centerBusy && i !== activeIdx) {
          top = restOpacity * (isMobile ? 0.22 : 0.38);
        }
      }

      const s = states[i];
      const isActive = ph.phase === "flyIn" || ph.phase === "hold" || ph.phase === "flyOut";
      const moveSpd = isActive ? 0.38 : 0.12;
      const fadeSpd = isActive ? 0.22 : 0.1;
      const fontSpd = isActive ? 0.32 : 0.12;

      if (ph.phase === "hold") {
        s.x = cx;
        s.y = cy;
        s.opacity = 1;
        s.fontSize = word.centerPx;
      } else {
        s.x = lerpN(s.x, tx, moveSpd);
        s.y = lerpN(s.y, ty, moveSpd);
        s.opacity = lerpN(s.opacity, top, fadeSpd);
        s.fontSize = lerpN(s.fontSize, tFont, fontSpd);
      }

      el.style.left = `${Math.round(s.x)}px`;
      el.style.top = `${Math.round(s.y)}px`;
      el.style.opacity = `${s.opacity}`;
      el.style.fontSize = `${Math.round(s.fontSize * 2) / 2}px`;
      el.style.transform = "translate(-50%, -50%)";
      el.style.fontWeight = i === activeRef.current ? "800" : `${restStyle.fontWeight}`;
      el.style.zIndex = i === activeRef.current ? "10" : word.tier === 1 ? "2" : "1";
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Start / stop animation based on inView ─────────────────────────────── */
  useEffect(() => {
    if (!inView || !words.length) {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
      animatingRef.current = false;
      busyRef.current = false;
      activeRef.current = -1;
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
        if (states[i]) {
          states[i].opacity = op;
          states[i].x = word.x;
          states[i].y = word.y;
          states[i].fontSize = word.restPx;
        }
        if (els[i]) {
          els[i].style.opacity = `${op}`;
          els[i].style.left = `${Math.round(word.x)}px`;
          els[i].style.top = `${Math.round(word.y)}px`;
          els[i].style.fontSize = `${word.restPx}px`;
          els[i].style.transform = "translate(-50%, -50%)";
        }
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
      busyRef.current = false;
      activeRef.current = -1;
    };
  }, [inView, words, animate, scheduleNext]);

  return (
    <>
      <style>{`

        .pwm-section {
          --pwm-nav-h: var(--page-nav-h, 80px);
          scroll-margin-top: var(--pwm-nav-h);
          background: #0a0a0a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300; color: #fff;
          padding: 0;
          height: calc(100svh - var(--pwm-nav-h));
          min-height: calc(100svh - var(--pwm-nav-h));
          max-height: calc(100svh - var(--pwm-nav-h));
          display: flex; flex-direction: column;
          overflow: hidden; position: relative;
        }
        .pwm-inner {
          max-width: 1300px; margin: 0 auto; width: 100%; height: 100%;
          display: flex; flex-direction: column; flex: 1; min-height: 0;
          padding: 1.75rem 2rem 1.5rem; box-sizing: border-box;
        }
        .pwm-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(16px, 2.5vh, 28px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
        }
        .pwm-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
        }
        .pwm-hl-bold {
          display: block;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
        }
        .pwm-hl-muted {
          display: block;
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.48);
          line-height: 1.14;
        }
        .pwm-map-wrap {
          position: relative; width: 100%;
          flex: 1 1 auto; min-height: 0;
          margin: clamp(1.25rem, 2.5vh, 2rem) 0 0;
          overflow: hidden;
        }
        .pwm-word {
          position: absolute;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          line-height: 1.1;
          color: #ffffff;
          transform: translate(-50%, -50%);
          transform-origin: center center;
          will-change: left, top, opacity, font-size;
          letter-spacing: -0.02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          backface-visibility: hidden;
        }

        @media (max-width: 600px) {
          .pwm-section {
            --pwm-nav-h: var(--page-nav-h, 80px);
            height: calc(100svh - var(--pwm-nav-h));
            min-height: calc(100svh - var(--pwm-nav-h));
            max-height: calc(100svh - var(--pwm-nav-h));
            overflow: hidden;
          }
          .pwm-inner { padding: 1.25rem 1rem 1rem; }
          .pwm-header { margin-bottom: 16px; padding: 0 14px; }
          .pwm-heading { gap: 8px; }
          .pwm-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
          .pwm-hl-muted { font-size: clamp(14px, 4.2vw, 18px); color: rgba(255,255,255,0.52); }
          .pwm-map-wrap { min-height: 0; margin-top: 1rem; overflow: hidden; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pwm-word { transition: none !important; }
        }
      `}</style>

      <section
        id="problem"
        className="pwm-section"
        ref={sectionRef}
        style={{
          // Keep this card exactly one viewport tall so .home-slide never
          // reports spurious overflow and the snap controller can advance.
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div className="pwm-inner">

          <div className="pwm-header">
            <div className="pwm-heading">
              <motion.span
                className="pwm-hl-muted"
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                The Structural Problem
              </motion.span>
              <motion.span
                className="pwm-hl-bold"
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                THE GAPS YOU CAN'T SEE.
              </motion.span>
              <motion.span
                className="pwm-hl-muted"
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                The Revenue You're Losing.
              </motion.span>
            </div>
          </div>

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
                  fontSize: `${word.restPx}px`,
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