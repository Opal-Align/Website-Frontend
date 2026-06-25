"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, AnimatePresence } from "framer-motion";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

/* ─── Constants ──────────────────────────────────────────────────────── */
const AUTO_MS = 4200;

const STEPS = [
  {
    num: "01",
    label: "Identify",
    tagline: "Real-time visibility your reports never had.",
    body: [
      "Every revenue lever — aged A/R, unscheduled treatment, dormant patients, missed collections — is scanned continuously. ",
      { bold: "The moment a gap opens, gOS surfaces it." },
      " Your team stops hunting for problems and starts solving them — because gOS already knows where they are.",
    ],
  },
  {
    num: "02",
    label: "Strategize",
    tagline: "Your playbook. At machine scale.",
    body: [
      "Channels, cadences, message tone, escalation thresholds — ",
      { bold: "all configured to your practice, your providers, your patients." },
      " gOS doesn't impose a generic workflow. It learns how your practice operates and executes that logic at a volume no team ever could.",
    ],
  },
  {
    num: "03",
    label: "Engage",
    tagline: "Volume your team can't match. Automatically.",
    body: [
      "Multi-channel, multi-touch outreach — sequenced and dispatched automatically. ",
      { bold: "The right message, to the right person, at the right time." },
      " While your team is focused on patients in the chair, gOS is working every account that isn't.",
    ],
  },
  {
    num: "04",
    label: "Calibrate",
    tagline: "The system tunes itself. Your team doesn't have to.",
    body: [
      "gOS learns from every response. Timing adjusts. Cadence sharpens. Tone aligns to each patient's behavior. ",
      { bold: "Month six performs better than month one" },
      " — and your team doesn't do a thing differently to make that happen.",
    ],
  },
  {
    num: "05",
    label: "Guide",
    tagline: "Your team handles judgment. gOS handles everything else.",
    body: [
      "What automation can't resolve gets handed to your team — ",
      { bold: "queued, prioritized, and ready to act on." },
      " No digging. No guessing. Just the decisions that genuinely require a person, surfaced in the order they matter. ",
      { bold: "That's the G in gOS." },
    ],
  },
];

const HEADLINE = [
  { text: "FIVE",    color: "#FFFFFF" },
  { text: "STEPS.",  color: "#7AAFC2" },
  { text: "ONE",     color: "outline" },
  { text: "CON-",    color: "#FFFFFF" },
  { text: "TINUOUS", color: "#22D3EE" },
  { text: "LOOP.",   color: "outline" },
];

/* ─── Particle canvas ────────────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, dots = [];
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
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

/* ─── Body text renderer ─────────────────────────────────────────────── */
function BodyText({ segments }) {
  return (
    <p style={{ fontSize: "clamp(13px, 2vw, 15px)", lineHeight: 1.78, color: "rgba(255,255,255,0.6)", margin: 0 }}>
      {segments.map((seg, i) =>
        typeof seg === "string"
          ? <span key={i}>{seg}</span>
          : <strong key={i} style={{ color: "#fff", fontWeight: 600 }}>{seg.bold}</strong>
      )}
    </p>
  );
}

/* ─── Orbit diagram ──────────────────────────────────────────────────── */
function OrbitDiagram({ activeIndex, onStepClick, size = 320 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.43;
  function pos(i) {
    const angle = (i / STEPS.length) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} style={{ display: "block", overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(34,211,238,0.04)" strokeWidth={22} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="5 5" />
      <circle cx={cx} cy={cy} r={r * 0.64} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="3 8" />

      {STEPS.map((step, i) => {
        const p = pos(i);
        const isActive = i === activeIndex;
        const anchor = p.x < cx - 8 ? "end" : p.x > cx + 8 ? "start" : "middle";
        const lx = p.x < cx - 8 ? p.x - 13 : p.x > cx + 8 ? p.x + 13 : p.x;
        const ly = p.y < cy - 8 ? p.y - 14 : p.y + 14;
        const lw = step.label.length * 6.5 + 20;
        return (
          <g key={i} onClick={() => onStepClick(i)} style={{ cursor: "pointer" }}>
            <line x1={p.x} y1={p.y} x2={cx} y2={cy}
              stroke={isActive ? "rgba(34,211,238,0.28)" : "rgba(255,255,255,0.05)"}
              strokeWidth={isActive ? 1 : 0.7} strokeDasharray="4 4" />
            {isActive && <>
              <circle cx={p.x} cy={p.y} r={11}
                fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.25)" strokeWidth={1} />
              <rect
                x={anchor === "end" ? lx - lw : anchor === "start" ? lx : lx - lw / 2}
                y={ly - 10} width={lw} height={19} rx={9.5}
                fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.35)" strokeWidth={0.8} />
            </>}
            <circle cx={p.x} cy={p.y} r={isActive ? 6 : 4}
              fill={isActive ? "#22D3EE" : "rgba(255,255,255,0.22)"} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
              fontFamily="'Inter',sans-serif" fontSize={6.5} fontWeight={600}
              fill={isActive ? "#08060C" : "rgba(255,255,255,0.55)"}
              style={{ pointerEvents: "none" }}>{step.num}</text>
            <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="central"
              fontFamily="'Inter',sans-serif" fontSize={9}
              fontWeight={isActive ? 600 : 400}
              fill={isActive ? "#22D3EE" : "rgba(255,255,255,0.35)"}
              style={{ pointerEvents: "none" }}>{step.label}</text>
          </g>
        );
      })}

      {/* Centre badge */}
      <rect x={cx - 36} y={cy - 28} width={72} height={56} rx={13}
        fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
      <rect x={cx - 36} y={cy - 28} width={72} height={3} rx={1.5} fill="rgba(255,255,255,0.06)" />
      <image
        href={opalLogo}
        x={cx - 27} y={cy - 18}
        width={54} height={36}
        preserveAspectRatio="xMidYMid meet"
        style={{ opacity: 0.88 }}
      />
    </svg>
  );
}

/* ─── Single accordion card ──────────────────────────────────────────── */
function StepCard({ step, isActive, onClick, timerKey }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      style={{
        position: "relative", overflow: "hidden", borderRadius: 16,
        border: `1px solid ${isActive ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.06)"}`,
        backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        cursor: "pointer",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2vw, 16px)", padding: "clamp(10px, 1.4vh, 14px) clamp(14px, 2.5vw, 20px)" }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(20px, 3vw, 40px)",
          lineHeight: 1, minWidth: 34, flexShrink: 0,
          color: isActive ? "#22D3EE" : "rgba(255,255,255,0.14)",
          transition: "color 0.3s",
        }}>{step.num}</span>
        <span style={{
          flex: 1, fontWeight: 600, lineHeight: 1.2,
          fontSize: "clamp(14px, 1.8vw, 22px)",
          color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
          transition: "color 0.3s",
        }}>{step.label}</span>
        <motion.div
          animate={{ backgroundColor: isActive ? "#22D3EE" : "rgba(255,255,255,0.14)" }}
          transition={{ duration: 0.3 }}
          style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }}
        />
      </div>

      {/* Collapsed tagline */}
      <AnimatePresence initial={false}>
        {!isActive && (
          <motion.div key="tagline"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}>
            <p style={{ padding: "0 clamp(14px,2.5vw,20px) clamp(10px,1.4vh,14px)", fontSize: "clamp(11.5px,1.4vw,12.5px)", fontStyle: "italic", color: "rgba(255,255,255,0.3)", lineHeight: 1.4, margin: 0 }}>
              {step.tagline}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div key="body"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 clamp(14px,2.5vw,20px) clamp(12px,1.8vh,20px)" }}>
              <BodyText segments={step.body} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div key={timerKey}
            style={{ position: "absolute", bottom: 0, left: 0, height: 2, backgroundColor: "#22D3EE", opacity: 0.5, transformOrigin: "left center" }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: AUTO_MS / 1000, ease: "linear" }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────── */
export default function MechanismSection() {
  const sectionRef  = useRef(null);
  const inView      = useInView(sectionRef, { once: false, margin: "-12% 0px -12% 0px" });
  const [activeIndex, setActiveIndex] = useState(0);
  const [timerKey, setTimerKey]       = useState(0);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % STEPS.length);
      setTimerKey(k => k + 1);
    }, AUTO_MS);
  }, []);

  useEffect(() => {
    if (inView) startTimer();
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [inView, startTimer]);

  const handleClick = (i) => {
    setActiveIndex(i);
    setTimerKey(k => k + 1);
    startTimer();
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1], delay },
  });

  /* ── Eyebrow + Headline + Body + CTA + Pills — shared across layouts ── */
  const eyebrow = (
    <motion.div {...fadeUp(0.05)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 13 }}>+</span>
      <div style={{ height: 1, width: 48, background: "rgba(255,255,255,0.12)" }} />
      <span style={{ fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", fontWeight: 300 }}>
        The Operating System
      </span>
      <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.12)" }} />
    </motion.div>
  );

  const headline = (
    <div style={{ lineHeight: 0, marginBottom: "clamp(20px, 3vh, 32px)" }}>
      {HEADLINE.map((line, i) => (
        <div key={i} style={{ overflow: "hidden" }}>
          <motion.div
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.07 }}
          >
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, min(6.4vw, 7.4vh), 80px)",
              lineHeight: 0.92, display: "block", letterSpacing: "-0.01em",
              color: line.color === "outline" ? "transparent" : line.color,
              WebkitTextStroke: line.color === "outline" ? "1.5px rgba(255,255,255,0.22)" : undefined,
            }}>{line.text}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );

  const bodyCta = (
    <>
      <motion.p {...fadeUp(0.72)} style={{
        fontSize: "clamp(13px, 1.1vw, 16px)", lineHeight: 1.7,
        color: "rgba(255,255,255,0.50)", maxWidth: "min(390px, 100%)",
        margin: "0 0 clamp(18px, 2.6vh, 30px)", fontWeight: 300,
      }}>
        gOS doesn&apos;t replace your team or your software. It sits on top of both —
        running the work that falls through the cracks, and handing your team only
        what needs a human decision.
      </motion.p>

      <motion.div {...fadeUp(0.88)}>
        <button
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "13px 28px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.1em", textTransform: "uppercase",
            background: "transparent", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.42)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "transparent"; }}
        >
          Book a Demo <span style={{ fontSize: 14 }}>↗</span>
        </button>
      </motion.div>

      <motion.div {...fadeUp(1.02)} style={{ display: "flex", gap: 8, marginTop: "clamp(18px, 2.6vh, 28px)" }}>
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => handleClick(i)} aria-label={`Step ${i + 1}`}
            style={{
              height: 6, width: activeIndex === i ? 22 : 6,
              backgroundColor: activeIndex === i ? "#22D3EE" : "rgba(255,255,255,0.18)",
              borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s",
            }} />
        ))}
      </motion.div>
    </>
  );

  const orbitNode = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <OrbitDiagram activeIndex={activeIndex} onStepClick={handleClick} size={320} />
    </motion.div>
  );

  const accordionCards = (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
      className="ms-step-cards"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {STEPS.map((step, i) => (
        <StepCard key={step.num} step={step}
          isActive={activeIndex === i}
          onClick={() => handleClick(i)}
          timerKey={`${i}-${timerKey}`} />
      ))}
    </motion.div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');

        /* Mobile: single column stack — header → orbit → cards */
        .ms-layout-mobile  { display: flex; flex-direction: column; gap: clamp(20px, 4vh, 36px); }
        .ms-layout-desktop { display: none; }

        /* Desktop: two-column grid — orbit+text left, cards right */
        @media (min-width: 768px) {
          .ms-layout-mobile  { display: none; }
          .ms-layout-desktop {
            display: grid;
            grid-template-columns: minmax(0,1fr) minmax(0,1.08fr);
            gap: clamp(32px, 5vw, 80px);
            align-items: start;
          }
        }

        .ms-left-col { display: flex; flex-direction: column; }
        @media (min-width: 1024px) {
          .ms-left-col { position: sticky; top: 10vh; }
        }

        /* Orbit container sizing */
        .ms-orbit-desktop { width: 100%; max-width: 340px; margin-bottom: clamp(24px, 3.5vh, 40px); }
        .ms-orbit-mobile  { width: 100%; max-width: clamp(200px, 70vw, 300px); margin: 0 auto; }

        /* Tighten accordion cards on small screens */
        @media (max-width: 480px) {
          .ms-step-cards { gap: 6px !important; }
        }
      `}</style>

      <section
        id="system"
        ref={sectionRef}
        style={{
          position: "relative", overflow: "hidden",
          background: "transparent", minHeight: "100svh",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <ParticleField />

        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 1280, margin: "0 auto",
          padding: "clamp(36px, 7vh, 96px) clamp(16px, 4vw, 56px)",
          boxSizing: "border-box",
        }}>

          {/* ══ MOBILE layout ══ */}
          <div className="ms-layout-mobile">
            {/* 1 — Header text */}
            <div>
              {eyebrow}
              {headline}
              {bodyCta}
            </div>
            {/* 2 — Orbit */}
            <div className="ms-orbit-mobile">{orbitNode}</div>
            {/* 3 — Cards */}
            {accordionCards}
          </div>

          {/* ══ DESKTOP layout ══ */}
          <div className="ms-layout-desktop">
            {/* Left: orbit on top, text below */}
            <div className="ms-left-col">
              <div className="ms-orbit-desktop">{orbitNode}</div>
              {eyebrow}
              {headline}
              {bodyCta}
            </div>
            {/* Right: accordion */}
            {accordionCards}
          </div>

        </div>
      </section>
    </>
  );
}