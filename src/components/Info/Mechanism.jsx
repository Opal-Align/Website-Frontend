import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, AnimatePresence } from "framer-motion";

const NAVY = "#08060C";
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #B8EEFF 0%, #D4AAFF 30%, #FFB8F5 60%, #AAFFD4 100%)";
const OPAL_STOPS = [
  { offset: "0%", color: "#B8EEFF" },
  { offset: "30%", color: "#D4AAFF" },
  { offset: "60%", color: "#FFB8F5" },
  { offset: "100%", color: "#AAFFD4" },
];
const gradientText = {
  backgroundImage: OPAL_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

// ── Particle canvas ──────────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let dots = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      dots = Array.from({ length: Math.floor((canvas.width * canvas.height) / 13000) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.25 + 0.25,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.38 + 0.08,
        hue: [190, 230, 275, 315, 155][Math.floor(Math.random() * 5)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${d.hue}, 85%, 86%, ${d.a})`;
        ctx.fill();
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -2) d.x = canvas.width + 2;
        if (d.x > canvas.width + 2) d.x = -2;
        if (d.y < -2) d.y = canvas.height + 2;
        if (d.y > canvas.height + 2) d.y = -2;
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Spark icon ───────────────────────────────────────────────────────────────
function Spark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <defs>
        <linearGradient id="mechanismSparkGradient" x1="0" y1="18" x2="18" y2="0">
          {OPAL_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M9 0 L10.2 7.8 L18 9 L10.2 10.2 L9 18 L7.8 10.2 L0 9 L7.8 7.8 Z"
        fill="url(#mechanismSparkGradient)"
      />
    </svg>
  );
}

// ── Flow node data ────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", label: "Identify",   sub: "Surface every revenue gap — in real time" },
  { num: "02", label: "Strategize", sub: "Design & configure the tone, methods & rhythm of practice to patient outreach" },
  { num: "03", label: "Throttle",   sub: "Activate & engage the multi-channel automation" },
  { num: "04", label: "Calibrate",  sub: "Intelligently tunes strategy with each patient & practice signal" },
  { num: "05", label: "Guide",      sub: "Clear exceptions & supplement automation with guided task management" },
];

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const slideRight = {
  hidden: { opacity: 0, x: 36 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

const connectorVariant = {
  hidden: { scaleY: 0, originY: 0 },
  visible: (delay = 0) => ({
    scaleY: 1,
    transition: { duration: 0.4, ease: "easeOut", delay },
  }),
};

// ── Main component ────────────────────────────────────────────────────────────
export default function MechanismSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, {
    once: false,
    margin: "-18% 0px -18% 0px",
  });
  const [hoveredNode, setHoveredNode] = useState(null);

  return (
    <section
      id="system"
      ref={sectionRef}
      className="mechanism-section"
      style={{
        position: "relative",
        height: "100svh",
        background: NAVY,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google font import via style tag — swap for your build tool's font loader */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;1,9..40,200&display=swap');

        @media (max-width: 960px) {
          .mechanism-section {
            height: auto !important;
            min-height: 100svh !important;
            align-items: flex-start !important;
            overflow: hidden !important;
          }

          .mechanism-grid {
            grid-template-columns: 1fr !important;
            max-width: 720px !important;
            padding: 72px 24px 56px !important;
            gap: 36px !important;
          }

          .mechanism-left,
          .mechanism-right {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          .mechanism-right {
            align-items: stretch !important;
          }

          .mechanism-flow {
            max-width: 100% !important;
          }
        }

        @media (max-width: 640px) {
          .mechanism-grid {
            padding: 64px 18px 48px !important;
            gap: 28px !important;
          }

          .mechanism-eyebrow-line {
            max-width: 44px !important;
          }

          .mechanism-eyebrow-text {
            font-size: 10px !important;
            letter-spacing: 0.14em !important;
            white-space: nowrap !important;
          }

          .mechanism-headline-word {
            font-size: clamp(34px, 13vw, 54px) !important;
            line-height: 0.96 !important;
          }

          .mechanism-body {
            font-size: 14.5px !important;
            line-height: 1.72 !important;
            max-width: 100% !important;
            margin-bottom: 22px !important;
          }

          .mechanism-cta {
            padding: 10px 22px !important;
            font-size: 11px !important;
          }

          .mechanism-node {
            gap: 14px !important;
            padding: 11px 16px !important;
            border-radius: 28px !important;
          }

          .mechanism-step-num {
            font-size: 30px !important;
            min-width: 34px !important;
          }

          .mechanism-step-label {
            font-size: 20px !important;
          }

          .mechanism-step-sub {
            font-size: 11px !important;
            line-height: 1.35 !important;
          }

          .mechanism-connector {
            margin-left: 44px !important;
            height: 8px !important;
          }
        }
      `}</style>

      {/* Shared dark astral background — keeps this section in the same world as hero/modules */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 22% 28%, rgba(184,238,255,0.10) 0%, transparent 34%),
            radial-gradient(ellipse at 76% 62%, rgba(255,184,245,0.12) 0%, transparent 36%),
            radial-gradient(ellipse at 52% 12%, rgba(212,170,255,0.10) 0%, transparent 30%),
            ${NAVY}
          `,
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 48%, transparent 35%, ${NAVY}cc 78%, ${NAVY}f5 100%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <ParticleField />

      {/* ── Grid ── */}
      <div
        className="mechanism-grid"
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(36px, 5vh, 56px) clamp(24px, 4vw, 52px) clamp(28px, 4vh, 42px)",
          gap: "clamp(20px, 4vw, 54px)",
          boxSizing: "border-box",
        }}
      >
        {/* ══ LEFT ══ */}
        <div
          className="mechanism-left"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 48,
          }}
        >
          {/* Eyebrow */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: "clamp(20px, 3.4vh, 32px)",
            }}
          >
            <motion.div
              animate={inView ? { rotate: [0, 360] } : {}}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
            >
              <Spark size={17} />
            </motion.div>
            <div className="mechanism-eyebrow-line" style={{ flex: 1, maxWidth: 72, height: 1, background: "rgba(255,255,255,0.18)" }} />
            <span
              className="mechanism-eyebrow-text"
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.38)",
                fontWeight: 300,
              }}
            >
              The Operating System
            </span>
            <div className="mechanism-eyebrow-line" style={{ flex: 1, maxWidth: 72, height: 1, background: "rgba(255,255,255,0.18)" }} />
          </motion.div>

          {/* Display headline — staggered words */}
          <div style={{ marginBottom: "clamp(18px, 3vh, 28px)", overflow: "hidden" }}>
            {[
              { text: "A system", solid: true },
              { text: "that ", solid: true, accent: "runs" },
              { text: "your", outline: true },
              { text: "practice", solid: true },
              { text: "like it", solid: true, green: true },
              { text: "should.", outline: true },
            ].map((line, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <motion.div
                  custom={0.1 + i * 0.07}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                >
                  <span
                    className="mechanism-headline-word"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(42px, 6.3vw, 76px)",
                      lineHeight: 0.93,
                      display: "block",
                      letterSpacing: "-0.01em",
                      color: line.outline
                        ? "transparent"
                        : line.green
                        ? "transparent"
                        : "#fff",
                      ...(line.green ? gradientText : {}),
                      WebkitTextStroke: line.outline ? "1.5px rgba(255,255,255,0.2)" : undefined,
                    }}
                  >
                    {line.text}
                    {line.accent && (
                      <span style={gradientText}>{line.accent}</span>
                    )}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Body */}
          <motion.p
            className="mechanism-body"
            custom={0.65}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            style={{
              fontSize: "clamp(15.5px, 1.15vw, 17px)",
              lineHeight: 1.85,
              color: "rgba(244,248,255,0.72)",
              fontWeight: 350,
              maxWidth: 430,
              margin: "0 0 clamp(22px, 4vh, 36px)",
              textShadow: "0 0 18px rgba(184,238,255,0.08)",
            }}
          >
            OPAL gOS continuously scans your operations, surfaces every gap,
            and directs your team to the next highest-impact action —
            automatically.
          </motion.p>

          {/* CTA */}
          <motion.div
            custom={0.8}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.button
              className="mechanism-cta"
              whileHover={{ backgroundColor: "rgba(212,170,255,0.08)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid transparent",
                borderRadius: 100,
                padding: "12px 28px",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fff",
                cursor: "pointer",
                background: `
                  linear-gradient(${NAVY}, ${NAVY}) padding-box,
                  ${OPAL_LIGHT_GRADIENT} border-box
                `,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
              }}
            >
              <span style={gradientText}>See it in action</span>
              <motion.svg
                width={13}
                height={13}
                viewBox="0 0 13 13"
                fill="none"
                whileHover={{ x: 2, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <defs>
                  <linearGradient id="mechanismArrowGradient" x1="0" y1="13" x2="13" y2="0">
                    {OPAL_STOPS.map((s) => (
                      <stop key={s.offset} offset={s.offset} stopColor={s.color} />
                    ))}
                  </linearGradient>
                </defs>
                <path
                  d="M1 12 L11 2 M11 2 H4.5 M11 2 V8.5"
                  stroke="url(#mechanismArrowGradient)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </motion.svg>
            </motion.button>
          </motion.div>
        </div>

        {/* ══ RIGHT ══ */}
        <div
          className="mechanism-right"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingLeft: 20,
            position: "relative",
          }}
        >

          {/* Flow nodes */}
          <div className="mechanism-flow" style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: 430 }}>
            {STEPS.map((step, i) => (
              <div key={i}>
                {/* Node */}
                <motion.div
                  custom={0.3 + i * 0.16}
                  variants={slideRight}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  onHoverStart={() => setHoveredNode(i)}
                  onHoverEnd={() => setHoveredNode(null)}
                  style={{ position: "relative" }}
                >
                  <motion.div
                    className="mechanism-node"
                    animate={{
                      borderColor:
                        hoveredNode === i
                          ? "rgba(212,170,255,0.52)"
                          : "rgba(255,255,255,0.1)",
                      backgroundColor:
                        hoveredNode === i
                          ? "rgba(212,170,255,0.055)"
                          : "rgba(255,255,255,0.025)",
                      opacity:
                        hoveredNode !== null && hoveredNode !== i ? 0.32 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      padding: "clamp(11px, 1.6vh, 16px) 28px",
                      borderRadius: 100,
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "default",
                    }}
                  >
                    {/* Number */}
                    <motion.span
                      className="mechanism-step-num"
                      animate={{
                        color:
                          hoveredNode === i
                            ? "#D4AAFF"
                            : "rgba(255,255,255,0.14)",
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: "clamp(32px, 3vw, 42px)",
                        lineHeight: 1,
                        minWidth: 42,
                      }}
                    >
                      {step.num}
                    </motion.span>

                    {/* Label + sub */}
                    <div style={{ flex: 1 }}>
                      <motion.span
                        className="mechanism-step-label"
                        animate={{
                          color:
                            hoveredNode === i
                              ? "#fff"
                              : "rgba(255,255,255,0.72)",
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          display: "block",
                          fontSize: "clamp(19px, 1.9vw, 26px)",
                          fontWeight: 400,
                          letterSpacing: "0.015em",
                          lineHeight: 1.05,
                        }}
                      >
                        {step.label}
                      </motion.span>
                      <span
                        className="mechanism-step-sub"
                        style={{
                          fontSize: "clamp(12px, 1vw, 13px)",
                          color: "rgba(235,242,255,0.46)",
                          letterSpacing: "0.04em",
                          fontWeight: 300,
                          display: "block",
                        }}
                      >
                        {step.sub}
                      </span>
                    </div>

                    {/* Trailing dot */}
                    <motion.div
                      animate={{
                        backgroundColor:
                          hoveredNode === i
                            ? "#D4AAFF"
                            : "rgba(255,255,255,0.12)",
                        scale: hoveredNode === i ? 1.3 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        flexShrink: 0,
                      }}
                    />
                  </motion.div>
                </motion.div>

                {/* Connector line between nodes */}
                {i < STEPS.length - 1 && (
                  <motion.div
                    className="mechanism-connector"
                    custom={0.48 + i * 0.14}
                    variants={connectorVariant}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    style={{
                      marginLeft: 58,
                      height: "clamp(8px, 1.4vh, 14px)",
                      width: 1,
                      background: "rgba(255,255,255,0.1)",
                      transformOrigin: "top",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}