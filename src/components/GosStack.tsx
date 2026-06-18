import React, { useRef, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/* ─── Particle field ──────────────────────────────────────────────────
   Drifting dots in the OPAL hues — ported from MechanismSection so the
   ambient background is uniform across the site.
   ─────────────────────────────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let dots: {
      x: number; y: number; r: number;
      vx: number; vy: number; a: number; hue: number;
    }[] = [];
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dots = Array.from({ length: Math.floor((canvas.width * canvas.height) / 14000) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.3 + 0.06,
        hue: [190, 230, 275, 315, 155][Math.floor(Math.random() * 5)],
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue},80%,82%,${d.a})`;
        ctx.fill();
        d.x += d.vx; d.y += d.vy;
        if (d.x < -2) d.x = canvas.width + 2;
        if (d.x > canvas.width + 2) d.x = -2;
        if (d.y < -2) d.y = canvas.height + 2;
        if (d.y > canvas.height + 2) d.y = -2;
      }
      animId = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="gos-particles" />;
}

/**
 * Requires: npm install framer-motion lucide-react
 *
 * Animation sequence (triggers once, when the section scrolls into view):
 *   1. Left column   — eyebrow + headline, then the four feature rows, staggered
 *   2. Right column  — lead paragraph
 *   3. Orbit diagram — center mark, rings, dotted connections, then nodes
 *   4. CTA button
 *
 * Respects prefers-reduced-motion (shortens/removes movement, keeps fades).
 */

const FEATURES = [
  {
    eyebrow: "Integration",
    title: "No rip-and-replace.",
    body: "gOS connects to your EHR, PMS, and billing tools. Nothing gets removed. Everything gets connected.",
  },
  {
    eyebrow: "Deployment",
    title: "Live in days, not months.",
    body: "Activate gOS. That's all you do. No IT cycles, no training programs, no waiting.",
  },
  {
    eyebrow: "Operations",
    title: "No new headcount required.",
    body: "gOS runs the volume your team can't. The work gets done without adding a single seat.",
  },
  {
    eyebrow: "Results",
    title: "Value from day one.",
    body: "gOS identifies gaps and begins working them immediately. You don't wait for the system to prove itself.",
  },
];

const NODES = [
  { label: "EHR", angle: 0 },
  { label: "Claims", angle: 45 },
  { label: "PMS", angle: 90 },
  { label: "Marketing", angle: 135 },
  { label: "Billing", angle: 180 },
  { label: "Comms", angle: 225 },
  { label: "Scheduling", angle: 270 },
  { label: "Analytics", angle: 315 },
];
const INNER_RING_RADIUS = 24;
const OUTER_RING_RADIUS = 40;

// Nodes sit on the outer ring so the rings, spokes, and nodes all share the
// same center (50,50) — the orbit is one concentric system and the OPAL card
// simply sits at its middle, rather than appearing to define the center.
const NODE_RING_RADIUS = OUTER_RING_RADIUS;
const EASE = [0.22, 1, 0.36, 1] as const;

function polar(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) };
}

export default function StackIntegrationSection() {
  const reduce = useReducedMotion();
  const rootRef = useRef(null);
  const isInView = useInView(rootRef, { once: false, margin: "-15% 0px -15% 0px" });
  const state = isInView ? "visible" : "hidden";

  const fadeUp = (delay = 0, distance = 18) => ({
    hidden: { opacity: 0, y: reduce ? 0 : distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.3 : 0.6, ease: EASE, delay: reduce ? 0 : delay },
    },
  });

  const ORBIT_BASE = reduce ? 0 : 1.3;

  return (
    <section className="gos-section" ref={rootRef}>
      <style>{`
        .gos-section {
          --bg: #08060C;
          --ink: #f2f0e9;
          --ink-soft: #c7c5c0;
          --muted: #71707a;
          --muted-2: #56555e;
          --body: #8b8a92;
          --line: rgba(255,255,255,0.09);
          --teal: #3fdbd2;
          --node-bg: #14151b;
          --node-border: rgba(255,255,255,0.09);
          position: relative;
          overflow: hidden;
          background: var(--bg);
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 56px 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--ink);
        }
        /* Ambient glows — matches MechanismSection for cross-site uniformity */
        .gos-section::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 18% 28%, rgba(155,109,255,0.09) 0%, transparent 40%),
            radial-gradient(ellipse at 78% 68%, rgba(34,211,238,0.08) 0%, transparent 38%),
            radial-gradient(ellipse at 50% 8%,  rgba(155,109,255,0.07) 0%, transparent 32%);
        }
        /* Vignette — matches MechanismSection */
        .gos-section::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: radial-gradient(ellipse at 50% 50%, transparent 28%, #08060Cbb 72%, #08060Cee 100%);
        }
        .gos-particles {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }
        .gos-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 48px;
        }
        .gos-grid {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 100px;
        }
        .gos-grid::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--line);
          transform: translateX(-50%);
        }
        .gos-eyebrow-top {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 16px;
        }
        .gos-eyebrow-top::before { content: "— "; }
        .gos-h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          font-size: clamp(1.9rem, 3vw, 2.7rem);
          line-height: 1.05;
          margin: 0;
          color: var(--ink);
        }
        .gos-h1 .italic-line {
          display: block;
          font-style: italic;
          font-weight: 400;
          color: var(--muted-2);
          margin-top: 2px;
        }
        .gos-divider {
          position: relative;
          height: 1px;
          background: var(--line);
          margin-top: 20px;
        }
        .gos-divider::before {
          content: "";
          position: absolute;
          left: 0;
          top: -6px;
          width: 6px;
          height: 6px;
          border-left: 1px solid var(--line);
          border-top: 1px solid var(--line);
        }
        .gos-feature-block { padding-top: 18px; }
        .gos-feature-eyebrow {
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          margin: 0 0 8px;
        }
        .gos-feature-title {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          font-size: clamp(1.1rem, 1.5vw, 1.3rem);
          line-height: 1.22;
          color: var(--ink);
          margin: 0 0 7px;
        }
        .gos-feature-body {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          line-height: 1.55;
          color: var(--body);
          max-width: 380px;
          margin: 0;
        }
        .gos-lead {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 400;
          font-size: clamp(1.2rem, 1.8vw, 1.45rem);
          line-height: 1.5;
          color: var(--ink-soft);
          margin: 0 0 44px;
          max-width: 460px;
        }
        .gos-lead strong { color: var(--ink); font-weight: 600; }
        .gos-orbit-wrap { display: flex; flex-direction: column; align-items: flex-end; }
        .gos-orbit {
          position: relative;
          width: 100%;
          max-width: 420px;
          aspect-ratio: 1 / 1;
        }
        .gos-orbit-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .gos-ring { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 1; }
        .gos-line { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 1; stroke-dasharray: 1.4 3; stroke-linecap: round; }
        .gos-tick { fill: rgba(63,219,210,0.85); }
        .gos-glow {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 38%;
          height: 38%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(63,219,210,0.28), transparent 70%);
          filter: blur(4px);
          pointer-events: none;
        }
        .gos-center {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 13%;
          min-width: 52px;
          aspect-ratio: 1/1;
          border-radius: 14px;
          background: linear-gradient(155deg, #154240, #0a2220);
          border: 1px solid rgba(63,219,210,0.35);
          box-shadow: 0 20px 50px rgba(20,190,180,0.16);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .gos-center .brand {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          font-size: clamp(11px, 2.6vw, 14px);
          letter-spacing: 0.03em;
          color: #8aefe7;
        }
        .gos-center .sub {
          font-size: clamp(7px, 1.6vw, 9px);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(138,239,231,0.7);
          margin-top: 3px;
        }
        .gos-node {
          position: absolute;
          z-index: 3;
          background: var(--node-bg);
          border: 1px solid var(--node-border);
          color: #eae9e4;
          font-size: clamp(10.5px, 2.4vw, 13px);
          font-weight: 500;
          padding: clamp(7px, 1.6vw, 9px) clamp(11px, 2.6vw, 16px);
          border-radius: 10px;
          white-space: nowrap;
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .gos-node:hover { border-color: var(--teal); }
        .gos-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 52px;
          padding: 15px 28px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: var(--ink);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          background: transparent;
          transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .gos-cta:hover { background: var(--ink); color: #0a0a0c; border-color: var(--ink); transform: translateY(-1px); }
        .gos-cta:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
        .gos-cta svg { transition: transform 0.25s ease; }
        .gos-cta:hover svg { transform: translate(2px, -2px); }
        .gos-sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
        }
        @media (max-width: 880px) {
          .gos-grid { grid-template-columns: 1fr; gap: 64px; }
          .gos-grid::before { display: none; }
          .gos-orbit-wrap { align-items: center; margin-top: 8px; }
          .gos-cta { align-self: center; }
        }
        @media (max-width: 560px) {
          .gos-container { padding: 0 24px; }
          .gos-section { padding: 72px 0; }
          .gos-lead { margin-bottom: 48px; }
        }
      `}</style>

      <ParticleField />

      <div className="gos-container">
        <motion.div className="gos-grid" initial="hidden" animate={state}>
          {/* LEFT COLUMN */}
          <div className="gos-col">
            <motion.div variants={fadeUp(0.05)}>
              <p className="gos-eyebrow-top">Your stack is our stack</p>
              <h2 className="gos-h1">
                One layer.
                <span className="italic-line">Every system.</span>
              </h2>
              <div className="gos-divider" />
            </motion.div>

            {FEATURES.map((f, i) => (
              <motion.div className="gos-feature-block" key={f.eyebrow} variants={fadeUp(0.28 + i * 0.13)}>
                <p className="gos-feature-eyebrow">{f.eyebrow}</p>
                <h3 className="gos-feature-title">{f.title}</h3>
                <p className="gos-feature-body">{f.body}</p>
                <div className="gos-divider" />
              </motion.div>
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="gos-col">
            <motion.p className="gos-lead" variants={fadeUp(0.85)}>
              <strong>gOS doesn&apos;t replace what you have.</strong> It sits on top — connecting your
              fragmented systems into a single operating layer that runs automatically.
            </motion.p>

            <div className="gos-orbit-wrap">
              <div className="gos-orbit">
                <p className="gos-sr-only">
                  Diagram: OPAL gOS at the center, connected to EHR, Claims, PMS, Marketing, Billing,
                  Comms, Scheduling, and Analytics.
                </p>

                {!reduce && (
                  <motion.div
                    className="gos-glow"
                    animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.06, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: ORBIT_BASE + 0.6 }}
                  />
                )}

<svg className="gos-orbit-svg" viewBox="0 0 100 100" aria-hidden="true">

{/* Inner Ring */}
<motion.circle
  cx="50"
  cy="50"
  r={INNER_RING_RADIUS}
  className="gos-ring"
  variants={{
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: reduce ? 0.01 : 0.9,
        ease: EASE,
        delay: ORBIT_BASE + 0.15,
      },
    },
  }}
/>

{/* Outer Ring */}
<motion.circle
  cx="50"
  cy="50"
  r={OUTER_RING_RADIUS}
  className="gos-ring"
  variants={{
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: reduce ? 0.01 : 0.9,
        ease: EASE,
        delay: ORBIT_BASE + 0.22,
      },
    },
  }}
/>

{/* 8 radial spokes */}
{[0,45,90,135,180,225,270,315].map((angle) => {
  const p = polar(angle, OUTER_RING_RADIUS);

  return (
    <motion.line
      key={angle}
      x1="50"
      y1="50"
      x2={p.x}
      y2={p.y}
      className="gos-line"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: reduce ? 0.01 : 0.5,
            ease: EASE,
            delay: ORBIT_BASE + 0.35,
          },
        },
      }}
    />
  );
})}

{/* cyan dots on cardinal directions */}
{[0,90,180,270].map((a) => {
  const p = polar(a, INNER_RING_RADIUS);

  return (
    <motion.circle
      key={`tick-${a}`}
      cx={p.x}
      cy={p.y}
      r="1.2"
      className="gos-tick"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            delay: ORBIT_BASE + 0.5,
          },
        },
      }}
    />
  );
})}
</svg>

                              <motion.div
                                  className="gos-center"
                                  variants={{
                                      hidden: { opacity: 0, x: "-50%", y: "-50%", scale: reduce ? 1 : 0.7 },
                                      visible: { opacity: 1, x: "-50%", y: "-50%", scale: 1, transition: { duration: reduce ? 0.3 : 0.55, ease: EASE, delay: ORBIT_BASE } },
                                  }}
                              >
                                  <span className="brand">OPAL</span>
                                  <span className="sub">gOS</span>
                              </motion.div>

                              {NODES.map((n, i) => {
                                  const p = polar(n.angle, NODE_RING_RADIUS);
                                  return (
                                  <motion.div
                                      key={n.label}
                                      className="gos-node"
                                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                      variants={{
                                          hidden: { opacity: 0, x: "-50%", y: "-50%", scale: reduce ? 1 : 0.6 },
                                          visible: {
                                              opacity: 1,
                                              x: "-50%",
                                              y: "-50%",
                                              scale: 1,
                                              transition: {
                                                  duration: reduce ? 0.25 : 0.4,
                                                  ease: EASE,
                                                  delay: ORBIT_BASE + 0.6 + i * 0.045,
                                              },
                                          },
                                      }}
                                  >
                                      {n.label}
                                  </motion.div>
                                  );
                              })}
              </div>

              <motion.a href="#" className="gos-cta" variants={fadeUp(ORBIT_BASE + 1.05)}>
                Book a demo
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}