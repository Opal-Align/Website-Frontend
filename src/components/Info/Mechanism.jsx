"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

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

/* ─── Render mixed text + bold segments ─────────────────────────────── */
function BodyText({ segments }) {
  return (
    <p className="text-[15px] leading-[1.82] text-white/60">
      {segments.map((seg, i) =>
        typeof seg === "string"
          ? <span key={i}>{seg}</span>
          : <strong key={i} className="text-white font-semibold">{seg.bold}</strong>
      )}
    </p>
  );
}

/* ─── Single accordion card ──────────────────────────────────────────── */
function StepCard({ step, isActive, onClick, timerKey }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className="relative overflow-hidden rounded-2xl border cursor-pointer"
      style={{
        borderColor: isActive ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.06)",
        backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      {/* Header row — always visible */}
      <div className="flex items-center gap-4 px-6 py-4">

        {/* Step number */}
        <span
          className="leading-none tabular-nums shrink-0 transition-colors duration-300"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(28px, 3vw, 42px)",
            minWidth: 44,
            color: isActive ? "#22D3EE" : "rgba(255,255,255,0.14)",
          }}
        >
          {step.num}
        </span>

        {/* Label */}
        <span
          className="flex-1 font-semibold leading-tight transition-colors duration-300"
          style={{
            fontSize: "clamp(17px, 1.8vw, 23px)",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.7)",
          }}
        >
          {step.label}
        </span>

        {/* Trailing dot */}
        <motion.div
          className="w-2 h-2 rounded-full shrink-0"
          animate={{ backgroundColor: isActive ? "#22D3EE" : "rgba(255,255,255,0.14)" }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Collapsed tagline */}
      <AnimatePresence initial={false}>
        {!isActive && (
          <motion.div
            key="tagline"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-4 text-[12.5px] italic text-white/32 leading-snug">
              {step.tagline}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded full body */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              <BodyText segments={step.body} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-advance progress bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={timerKey}
            className="absolute bottom-0 left-0 h-[2px] origin-left"
            style={{ backgroundColor: "#22D3EE", opacity: 0.5 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: AUTO_MS / 1000, ease: "linear" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────── */
export default function MechanismSection() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-12% 0px -12% 0px" });
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>

      <section
        id="system"
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ background: "transparent", minHeight: "100svh", fontFamily: "'Inter', sans-serif" }}
      >
        <ParticleField />

        {/* ── Two-column layout ── */}
        <div
          className="relative z-10 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-14"
          style={{ paddingTop: "clamp(56px, 8vh, 96px)", paddingBottom: "clamp(56px, 8vh, 96px)" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1.08fr)",
              gap: "clamp(32px, 5vw, 80px)",
              alignItems: "start",
            }}
            className="max-md:grid-cols-1!"
          >

            {/* ══ LEFT COLUMN ══ */}
            <div className="flex flex-col lg:sticky" style={{ top: "10vh" }}>

              {/* Eyebrow */}
              <motion.div
                {...fadeUp(0.05)}
                className="flex items-center gap-3 mb-4"
              >
                <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 13 }}>+</span>
                <div style={{ height: 1, width: 48, backgroundColor: "rgba(255,255,255,0.12)" }} />
                <span style={{ fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)", fontWeight: 300 }}>
                  The Operating System
                </span>
                <div style={{ height: 1, flex: 1, backgroundColor: "rgba(255,255,255,0.12)" }} />
              </motion.div>

              {/* Headline — each word reveals upward.
                  Sized against viewport height (min of vw/vh) so the full
                  6-line stack always fits the page and never pushes the CTA
                  out of view. */}
              <div style={{ lineHeight: 0, marginBottom: "clamp(20px, 3vh, 32px)" }}>
                {HEADLINE.map((line, i) => (
                  <div key={i} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%" }}
                      animate={inView ? { y: "0%" } : { y: "110%" }}
                      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1], delay: 0.1 + i * 0.07 }}
                    >
                      <span
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "clamp(40px, min(6.4vw, 7.4vh), 80px)",
                          lineHeight: 0.92,
                          display: "block",
                          letterSpacing: "-0.01em",
                          color: line.color === "outline" ? "transparent" : line.color,
                          WebkitTextStroke: line.color === "outline" ? "1.5px rgba(255,255,255,0.22)" : undefined,
                        }}
                      >
                        {line.text}
                      </span>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Body */}
              <motion.p
                {...fadeUp(0.72)}
                style={{
                  fontSize: "clamp(14px, 1.1vw, 16px)",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,0.50)",
                  maxWidth: 390,
                  margin: "0 0 clamp(18px, 2.6vh, 30px)",
                  fontWeight: 300,
                }}
              >
                gOS doesn&apos;t replace your team or your software. It sits on top of both —
                running the work that falls through the cracks, and handing your team only
                what needs a human decision.
              </motion.p>

              {/* CTA */}
              <motion.div {...fadeUp(0.88)}>
                <button
                  className="inline-flex items-center gap-2.5 transition-all duration-200 active:scale-[0.97]"
                  style={{
                    padding: "13px 28px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.42)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; e.currentTarget.style.background = "transparent"; }}
                >
                  Book a Demo
                  <span style={{ fontSize: 14 }}>↗</span>
                </button>
              </motion.div>

              {/* Step progress pills */}
              <motion.div {...fadeUp(1.02)} className="flex gap-2" style={{ marginTop: "clamp(18px, 2.6vh, 28px)" }}>
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    aria-label={`Step ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{
                      height: 6,
                      width: activeIndex === i ? 22 : 6,
                      backgroundColor: activeIndex === i ? "#22D3EE" : "rgba(255,255,255,0.18)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* ══ RIGHT COLUMN — accordion cards ══ */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
              className="flex flex-col"
              style={{ gap: 8 }}
            >
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.num}
                  step={step}
                  isActive={activeIndex === i}
                  onClick={() => handleClick(i)}
                  timerKey={`${i}-${timerKey}`}
                />
              ))}
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
}