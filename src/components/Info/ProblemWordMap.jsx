"use client";

import { useRef, useEffect, useState } from "react";
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

// rough px font size per tier at a "typical" viewport, used only for collision math
const TIER_PX = { 1: 27, 2: 17, 3: 11.5 };

const PROBLEMS = [
  { label: "A/R",      text: "Your practice billed it. Your A/R aged it into oblivion." },
  { label: "Patients", text: "Your practice isn't losing patients. It's losing touch with them." },
  { label: "Capacity", text: "Your practice has capacity. Your demand says otherwise." },
  { label: "Revenue",  text: "Your practice is leaking revenue. You just can't see where." },
];

/* ─── Deterministic seeded random ──────────────────────────────────────── */
const seed = (n) => { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); };

/* ─── Build word positions: fills the full container, avoids the center safe-zone,
       and rejects placements that collide with already-placed words ──────── */
function buildLayout(W, H) {
  if (!W || !H) return [];

  const cx = W / 2, cy = H / 2;

  // Center safe-zone (ellipse, in px) — sized to comfortably cover the
  // rotating problem-statement text box (max-width ~440px, up to 3 lines),
  // not just a small fraction of the container, so nothing renders behind it.
  const safeRx = Math.min(Math.max(W * 0.24, 260), W * 0.46);
  const safeRy = Math.min(Math.max(H * 0.20, 100), H * 0.4);

  // Rectangular sampling zone per tier, as a fraction inset from each edge.
  // Small inset (tier 3) = words are allowed almost all the way into the
  // corners; larger inset (tier 1) keeps the biggest words a bit more
  // central so they don't collide with your navbar/edges.
  const insets = {
    1: 0.14,
    2: 0.06,
    3: 0.015,
  };

  const placed = [];
  const MAX_TRIES = 100;

  // approx half-width/half-height of a word's bounding box, for collision checks
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

    while (tries < MAX_TRIES && !found) {
      const px_ = xMin + seed(i * 17 + tries * 3) * (xMax - xMin);
      const py_ = yMin + seed(i * 7 + tries * 5) * (yMax - yMin);

      // reject if inside the center safe-zone
      const inSafeZone =
        Math.pow((px_ - cx) / safeRx, 2) + Math.pow((py_ - cy) / safeRy, 2) < 1;

      // reject if it collides with an already-placed word (simple AABB w/ padding)
      const pad = 10;
      const collides = placed.some((p) => {
        const dx = Math.abs(p.x - px_);
        const dy = Math.abs(p.y - py_);
        return dx < p.halfW + halfW + pad && dy < p.halfH + halfH + pad;
      });

      tries++;

      if (!inSafeZone && !collides) {
        x = px_; y = py_; found = true;
      } else if (tries === MAX_TRIES) {
        // last resort: keep the last candidate even if imperfect, just clamp it later
        x = px_; y = py_;
      }
    }

    // Clamp inside container with margin so nothing clips the edge
    const mx = halfW + 12;
    const my = halfH + 12;
    x = Math.max(mx, Math.min(W - mx, x));
    y = Math.max(my, Math.min(H - my, y));

    placed.push({
      ...word,
      x, y, halfW, halfH,
      floatAmp:   seed(i * 3)  * 5 + 2,
      floatFreq:  seed(i * 5)  * 0.3 + 0.15,
      floatPhase: seed(i * 11) * Math.PI * 2,
      delay:      seed(i * 13) * 0.8,
    });
  });

  return placed;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProblemWordMap() {
  const containerRef = useRef(null);
  const sectionRef   = useRef(null);
  const timerRef     = useRef(null);
  const inView       = useInView(sectionRef, { once: false, margin: "-80px" });

  const [words, setWords]                 = useState([]);
  const [activeProblem, setActiveProblem]  = useState(0);

  /* resize observer */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e.contentRect;
      setWords(buildLayout(w, h));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* auto-rotate */
  useEffect(() => {
    if (!inView) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setActiveProblem((p) => (p + 1) % PROBLEMS.length);
    }, 3400);
    return () => clearInterval(timerRef.current);
  }, [inView]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');

        @keyframes pwm-float-1 { from { transform: translate(-50%,-50%) translateY(0px);   } to { transform: translate(-50%,-50%) translateY(-7px);  } }
        @keyframes pwm-float-2 { from { transform: translate(-50%,-50%) translateY(0px);   } to { transform: translate(-50%,-50%) translateY(-5px);  } }
        @keyframes pwm-float-3 { from { transform: translate(-50%,-50%) translateY(0px);   } to { transform: translate(-50%,-50%) translateY(-4px);  } }

        .pwm-section {
          /* Adjust --pwm-nav-h to your actual navbar's rendered height so this
             hero occupies exactly the remaining viewport, no scroll/overflow. */
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
        .pwm-inner { max-width: 1300px; margin: 0 auto; width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1; min-height: 0; padding: 1.75rem 2rem 1.5rem; box-sizing: border-box; }

        .pwm-eyebrow {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; margin-bottom: 16px; flex-shrink: 0;
        }
        .pwm-eyebrow::before { content: '+'; color: rgba(255,255,255,0.25); font-size: 12px; }
        .pwm-eyebrow-text {
          font-size: 10.5px; letter-spacing: 0.2em;
          color: rgba(255,255,255,0.35); text-transform: uppercase; font-weight: 400;
        }
        .pwm-eyebrow::after { content: ''; width: 60px; height: 1px; background: rgba(255,255,255,0.08); }

        .pwm-heading { text-align: center; margin-bottom: 0; flex-shrink: 0; }
        .pwm-hl-bold  {
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

        /* Fills exactly the remaining vertical space in the section (which is
           itself sized to viewport-minus-navbar), so the hero never grows
           taller than the screen. */
        .pwm-map-wrap {
          position: relative; width: 100%;
          flex: 1 1 auto;
          min-height: 320px;
          margin: 1.5rem 0 0;
          overflow: hidden;
        }

        .pwm-vignette {
          position: absolute; inset: 0; pointer-events: none; z-index: 3;
          /* only shield the center text from the words directly behind it —
             no longer fades the edges, so the cloud stays visible corner to corner */
          background: radial-gradient(ellipse 38% 32% at 50% 50%, rgba(10,10,10,0.9) 0%, transparent 72%);
        }

        .pwm-spotlight {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(ellipse 48% 42% at 50% 50%, rgba(255,255,255,0.038) 0%, transparent 72%);
        }

        .pwm-center {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; pointer-events: none;
        }

        .pwm-problem-text {
          font-size: clamp(14px, 2vw, 20px);
          font-weight: 700; line-height: 1.42;
          letter-spacing: -0.018em; color: #fff;
          text-align: center; max-width: min(440px, 78%);
          pointer-events: none;
        }

        @media (max-width: 600px) {
          .pwm-section { --pwm-nav-h: 64px; min-height: 620px; }
          .pwm-inner { padding: 1.25rem 1rem 1rem; }
          .pwm-map-wrap { min-height: 300px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pwm-map-wrap span { animation: none !important; }
        }
      `}</style>

      <section className="pwm-section" ref={sectionRef}>
        <div className="pwm-inner">

          <motion.div className="pwm-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <span className="pwm-eyebrow-text">Where Practices Lose Revenue</span>
          </motion.div>

          <motion.div className="pwm-heading"
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
            {words.map((word, i) => {
              const style = TIER_STYLE[word.tier];
              const fullAlpha = parseFloat(style.color.match(/[\d.]+\)$/)?.[0] ?? "0.5");

              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: fullAlpha } : { opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.7, delay: inView ? word.delay * 0.9 : 0 },
                  }}
                  style={{
                    position: "absolute",
                    left: word.x,
                    top: word.y,
                    transform: "translate(-50%, -50%)",
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    color: "#ffffff",
                    letterSpacing: style.letterSpacing,
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                    userSelect: "none",
                    lineHeight: 1,
                    animationName: `pwm-float-${word.tier}`,
                    animationDuration: `${(1 / word.floatFreq) * 3.5}s`,
                    animationDelay: `${(word.floatPhase % (Math.PI * 2)) * 0.4}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDirection: "alternate",
                    willChange: "transform, opacity",
                    zIndex: word.tier === 1 ? 2 : 1,
                  }}
                >
                  {word.text}
                </motion.span>
              );
            })}

            <div className="pwm-spotlight" />
            <div className="pwm-vignette" />

            <div className="pwm-center">
              <div style={{
                position: "relative",
                width: "100%",
                minHeight: "clamp(52px, 8vw, 78px)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {PROBLEMS.map((p, i) => (
                  <motion.p
                    key={i}
                    className="pwm-problem-text"
                    style={{ position: "absolute", margin: 0 }}
                    initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                    animate={activeProblem === i
                      ? { opacity: 1, y: 0, filter: "blur(0px)" }
                      : { opacity: 0, y: -5, filter: "blur(3px)" }
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {p.text}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}