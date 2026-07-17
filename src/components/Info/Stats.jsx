import { useEffect, useRef, useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, animate } from "framer-motion";
import clientLogo from "../../assets/marquee-logo.svg";

const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const OPAL_SOFT_GLOW = "rgba(255,255,255,0.28)";
/* Matches the cyan glow on the marquee / client logo hover */
const MARQUEE_GLOW = "rgba(34,211,238,0.95)";
const MARQUEE_GLOW_SOFT = "rgba(34,211,238,0.55)";
const gradientText = {
  backgroundImage: OPAL_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

// Counting cards only — the "New Hires" card is rendered separately below
// since it never counts and behaves differently (stays at 0, pulses itself).
const stats = [
  {
    target: 100, unit: "K",
    label: "Recovered Revenue",
    desc: "Automation drove A/R recovery in a single pilot, across two practices.",
    glyph: "α · 001",
  },
  {
    target: 75, unit: "K",
    label: "Communications Triggered",
    desc: "Outreach attempts per session vastly outnumber what is humanely achievable.",
    glyph: "β · 002",
  },
  {
    target: 50, unit: "K",
    label: "Hours Saved",
    desc: "Manual labor dependence is eliminated instantly.",
    glyph: "γ · 003",
  },
];

function Process() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let id;
    let stars = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 2800) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() < 0.04 ? Math.random() * 1.5 + 0.8 : Math.random() * 0.6 + 0.1,
        base: Math.random() * 0.6 + 0.1,
        tw: Math.random() > 0.6,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        let a = s.base;
        if (s.tw) a = s.base * (0.35 + 0.65 * Math.sin(t * 0.001 * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
        if (s.r > 1.2) {
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.28})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    id = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── Animated Strikethrough ─── */
function AnimatedStrike({ children, inView }) {
  return (
    <span className="relative inline-block">
      <span className="text-white/60">{children}</span>
      <motion.span
        className="absolute left-0 top-1/2 h-[7px] rounded-full"
        style={{
          backgroundImage: OPAL_LIGHT_GRADIENT,
          boxShadow: `0 0 22px ${OPAL_SOFT_GLOW}`,
        }}
        initial={{ width: "0%" }}
        animate={inView ? { width: "100%" } : { width: "0%" }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
      />
    </span>
  );
}

/* ─── Invisible-Ink (iMessage-style) ─── */
function InvisibleInk({ children, hideDelay = 2000 }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const revealedRef = useRef(false);
  const hideTimerRef = useRef(null);
  const scatteringRef = useRef(false);

  const initParticles = useCallback((w, h) => {
    const count = Math.floor((w * h) / 18);
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * 0.9 + 0.1,
      vx: 0,
      vy: 0,
      sx: (Math.random() - 0.5) * 6,
      sy: (Math.random() - 0.5) * 6,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 2 + 1,
      fade: 1,
    }));
  }, []);

  const startAnimation = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");

    cancelAnimationFrame(rafRef.current);

    const draw = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      let alive = 0;

      for (const p of particles) {
        if (scatteringRef.current) {
          p.x += p.sx;
          p.y += p.sy;
          p.fade -= 0.02;
          if (p.fade <= 0) continue;
        } else {
          p.x += Math.sin(t * 0.003 * p.speed + p.phase) * 0.4;
          p.y += Math.cos(t * 0.003 * p.speed + p.phase + 1) * 0.3;
        }

        alive++;
        const flicker = scatteringRef.current
          ? p.fade
          : p.a * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.002 * p.speed + p.phase)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${flicker})`;
        ctx.fill();
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (!revealedRef.current) {
        particlesRef.current = initParticles(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    startAnimation();

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(hideTimerRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles, startAnimation]);

  const handleReveal = () => {
    clearTimeout(hideTimerRef.current);
    if (revealed) return;
    scatteringRef.current = true;
    setRevealed(true);
    revealedRef.current = true;
  };

  const handleHide = () => {
    hideTimerRef.current = setTimeout(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      scatteringRef.current = false;
      revealedRef.current = false;
      setRevealed(false);

      const rect = container.getBoundingClientRect();
      particlesRef.current = initParticles(rect.width, rect.height);
      startAnimation();
    }, hideDelay);
  };

  return (
    <span
      ref={containerRef}
      className="relative inline-block cursor-pointer"
      onClick={handleReveal}
      onMouseEnter={handleReveal}
      onMouseLeave={handleHide}
    >
      {/* Actual text */}
      <span
        className="relative z-0"
        style={{
          filter: revealed ? "blur(0px)" : "blur(10px)",
          opacity: revealed ? 1 : 0,
          ...(revealed ? gradientText : {}),
          textShadow: revealed
            ? "0 0 20px rgba(255,255,255,0.55), 0 0 44px rgba(255,255,255,0.24)"
            : "none",
          transition: revealed
            ? "filter 0.7s ease-out, opacity 0.7s ease-out, text-shadow 0.7s ease-out 0.3s"
            : "filter 0.9s ease-in 0.1s, opacity 0.9s ease-in 0.1s, text-shadow 0.4s ease-in",
        }}
      >
        {children}
      </span>

      {/* Particle overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          opacity: revealed ? 0 : 1,
          transition: revealed
            ? "opacity 0.7s ease-out"
            : "opacity 0.6s ease-in 0.3s",
        }}
      />
    </span>
  );
}

/* ─── Synced pulse hook ───
   Drives the trend-line draw-in on counting cards and the flat-line
   draw-in on the New Hires card, all from a single shared heartbeat. */
function usePulse(period = 3600, holdDuration = 2100) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let holdTimer;
    const fire = () => {
      setActive(true);
      holdTimer = setTimeout(() => setActive(false), holdDuration);
    };

    const initialTimer = setTimeout(fire, 800);
    const interval = setInterval(fire, period);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(holdTimer);
      clearInterval(interval);
    };
  }, [period, holdDuration]);

  return active;
}

/* ─── Trend line ───
   Draws itself in as a rising line + arrowhead each pulse, like a
   stock ticker climbing. This is the visual proof that the metric
   is still climbing — paired against FlatLine on the New Hires card,
   the contrast is the whole point: "zero new hires, everything else
   still trends up." */
function TrendArrow({ active }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0"
      style={{
        width: "0.95em",
        height: "0.68em",
        marginLeft: "0.22em",
        alignSelf: "center",
        position: "relative",
        filter: `drop-shadow(0 0 6px ${MARQUEE_GLOW_SOFT})`,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 34 24" fill="none" style={{ overflow: "visible" }}>
        {/* Rising line */}
        <motion.path
          d="M2 20 L11 11 L16 16 L27 4"
          stroke={MARQUEE_GLOW}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            active
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={
            active
              ? { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.3, ease: "easeIn" }
          }
        />
        {/* Arrowhead, draws in right after the line lands */}
        <motion.path
          d="M20 4 L28 4 L28 12"
          stroke={MARQUEE_GLOW}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            active
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={
            active
              ? { duration: 0.45, delay: 0.85, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.2, ease: "easeIn" }
          }
        />
      </svg>
    </span>
  );
}

/* ─── Flat line ───
   The New Hires counterpart to TrendArrow: a static horizontal line
   that draws in at the exact same moment the other cards' lines rise.
   Same motion language, opposite direction — headcount stays flat
   while everything else climbs. */
function FlatLine({ active }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0"
      style={{
        width: "0.95em",
        height: "0.68em",
        marginLeft: "0.22em",
        alignSelf: "center",
        position: "relative",
        filter: `drop-shadow(0 0 6px ${MARQUEE_GLOW_SOFT})`,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 34 24" fill="none" style={{ overflow: "visible" }}>
        <motion.path
          d="M2 12 L28 12"
          stroke={MARQUEE_GLOW}
          strokeWidth="2.75"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={
            active
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: 0, opacity: 0 }
          }
          transition={
            active
              ? { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.3, ease: "easeIn" }
          }
        />
        {/* Small end-cap dot instead of an arrowhead — nothing to point to, it's flat */}
        <motion.circle
          cx="28" cy="12" r="2.2"
          fill={MARQUEE_GLOW}
          initial={{ scale: 0, opacity: 0 }}
          animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={
            active
              ? { duration: 0.35, delay: 0.85, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.2, ease: "easeIn" }
          }
        />
      </svg>
    </span>
  );
}

function Counter({
  target,
  unit = "",
  inView,
  startDelay = 0,
  duration = 6,
  pulse = false,
  countsComplete = false,
}) {
  const [val, setVal] = useState(0);
  const [landed, setLanded] = useState(false);
  // Pulse only after this card lands — synced with the shared heartbeat
  // and the New Hires "0" once every counter has finished.
  const showPulse = pulse && (landed || countsComplete);

  useEffect(() => {
    if (!inView) {
      setVal(0);
      setLanded(false);
      return;
    }

    setLanded(false);
    let ctrl;
    const timer = setTimeout(() => {
      ctrl = animate(0, target, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setVal(Math.round(v)),
        onComplete: () => setLanded(true),
      });
    }, startDelay * 1000);

    return () => {
      clearTimeout(timer);
      ctrl?.stop();
    };
  }, [inView, target, startDelay, duration]);

  return (
    <div className="min-w-0 w-full">
      <motion.span
        className="font-semibold tracking-tight inline-flex items-center max-w-full"
        animate={landed ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          ...gradientText,
          fontSize: "clamp(2rem, 3.6vw, 3.25rem)",
          lineHeight: 1.05,
          whiteSpace: "nowrap",
          transformOrigin: "left center",
          filter: landed
            ? `drop-shadow(0 0 36px rgba(255,255,255,0.55)) drop-shadow(0 0 60px ${OPAL_SOFT_GLOW})`
            : `drop-shadow(0 0 24px ${OPAL_SOFT_GLOW})`,
          transition: "filter 0.5s ease-out",
        }}
      >
        <span>{val}{unit}</span>
        <TrendArrow active={showPulse} />
      </motion.span>
    </div>
  );
}

// Timing for the stat counters: a longer pause after the section loads
// before anything starts counting, a small stagger so cards kick off one
// after another, and a shared count duration so — regardless of stagger —
// every counter finishes at the exact same moment.
const COUNTER_LOAD_DELAY = 0.6; // pause before the first counter starts
const COUNTER_STAGGER = 0.15; // gap between each card's start time
const COUNT_DURATION = 6; // slow + noticeable — was 1.6, now 6s of visible ticking
const COUNTER_END_TIME = COUNTER_LOAD_DELAY + COUNTER_STAGGER * (stats.length - 1) + COUNT_DURATION;

function Card({ stat, index, inView, pulse, countsComplete }) {
  const [hovered, setHovered] = useState(false);
  const startDelay = COUNTER_LOAD_DELAY + index * COUNTER_STAGGER;
  const duration = COUNTER_END_TIME - startDelay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 1 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{
        scale: 1.035,
        borderColor: "rgba(255,255,255,0.42)",
        boxShadow: "0 18px 70px rgba(255,255,255,0.12)",
      }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-[28px] border cursor-default"
      style={{
        borderColor: "rgba(255,255,255,0.1)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
        backdropFilter: "blur(10px)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.08), transparent 42%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: OPAL_LIGHT_GRADIENT }}
      />

      <div className="relative z-10 p-4 md:p-6 flex flex-col gap-2 min-h-0 overflow-hidden">

        {/* Star dot */}
        <div className="absolute top-4 right-4">
          <div
            className="w-[6px] h-[6px] rounded-full"
            style={{
              backgroundImage: OPAL_LIGHT_GRADIENT,
              boxShadow: `0 0 12px 4px ${OPAL_SOFT_GLOW}`,
            }}
          />
          {hovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
            />
          )}
        </div>

        {/* Animated number */}
        <Counter
          {...stat}
          inView={inView}
          startDelay={startDelay}
          duration={duration}
          pulse={pulse}
          countsComplete={countsComplete}
        />

        {/* Label */}
        <h4 className="text-white/90 font-semibold tracking-tight text-lg leading-tight">
          {stat.label}
        </h4>

        <div className="h-px bg-white/10" />

        {/* Description */}
        <p className="text-sm text-white/55 leading-relaxed">{stat.desc}</p>

        {/* Greek index */}
        <span className="absolute bottom-3 right-4 text-[10px] tracking-widest text-white/18 hidden md:block">
          {stat.glyph}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── New Hires card ─── stays at 0, draws a flat line in sync with
   the other cards' rising trend lines — the deliberate contrast. */
function NewHiresCard({ inView, pulse, countsComplete }) {
  const [hovered, setHovered] = useState(false);
  const showPulse = pulse && countsComplete;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 1 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      whileHover={{
        scale: 1.035,
        borderColor: "rgba(255,255,255,0.42)",
        boxShadow: "0 18px 70px rgba(255,255,255,0.12)",
      }}
      transition={{ duration: 0.6, delay: 3 * 0.12, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-[28px] border cursor-default"
      style={{
        borderColor: "rgba(255,255,255,0.1)",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
        backdropFilter: "blur(10px)",
        zIndex: hovered ? 10 : 1,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.10), transparent 36%), radial-gradient(circle at 85% 90%, rgba(255,255,255,0.08), transparent 42%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: OPAL_LIGHT_GRADIENT }}
      />

      <div className="relative z-10 p-4 md:p-6 flex flex-col gap-2 min-h-0 overflow-hidden">

        <div className="absolute top-4 right-4">
          <div
            className="w-[6px] h-[6px] rounded-full"
            style={{
              backgroundImage: OPAL_LIGHT_GRADIENT,
              boxShadow: `0 0 12px 4px ${OPAL_SOFT_GLOW}`,
            }}
          />
          {hovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
            />
          )}
        </div>

        <motion.span
          className="font-semibold tracking-tight inline-flex items-center min-w-0 max-w-full overflow-hidden"
          animate={
            showPulse
              ? {
                  scale: 1.08,
                  filter:
                    "drop-shadow(0 0 36px rgba(255,255,255,0.7)) drop-shadow(0 0 60px rgba(255,255,255,0.45))",
                }
              : {
                  scale: 1,
                  filter: countsComplete
                    ? `drop-shadow(0 0 28px rgba(255,255,255,0.45)) drop-shadow(0 0 48px ${OPAL_SOFT_GLOW})`
                    : `drop-shadow(0 0 24px ${OPAL_SOFT_GLOW})`,
                }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            ...gradientText,
            fontSize: "clamp(2rem, 3.6vw, 3.25rem)",
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            transformOrigin: "left center",
          }}
        >
          <span>0</span>
          <FlatLine active={showPulse} />
        </motion.span>

        <h4 className="text-white/90 font-semibold tracking-tight text-lg leading-tight">
          New Hires
        </h4>

        <div className="h-px bg-white/10" />

        <p className="text-sm text-white/55 leading-relaxed">
          Existing teams became exponentially more effective without adding headcount.
        </p>

        <span className="absolute bottom-3 right-4 text-[10px] tracking-widest text-white/18 hidden md:block">
          δ · 004
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Client attribution pill (cyan hover) ─── */
function ClientBadge() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-4 px-7 py-4 rounded-full border transition-all duration-300"
      style={{
        borderColor: hovered ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.12)",
        background: hovered
          ? "linear-gradient(145deg, rgba(34,211,238,0.12), rgba(34,211,238,0.03))"
          : "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        backdropFilter: "blur(10px)",
        boxShadow: hovered ? "0 0 30px rgba(34,211,238,0.28)" : "none",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >

      <img
        src={clientLogo}
        alt="Advanced Dental Arts"
        className="h-9 md:h-11 w-auto object-contain transition-all duration-300"
        style={{
          filter: hovered
            ? "drop-shadow(0 0 10px rgba(34,211,238,0.85))"
            : "none",
          opacity: hovered ? 1 : 0.85,
        }}
      />
    </div>
  );
}

export default function Processes() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  const pulse = usePulse();
  const [countsComplete, setCountsComplete] = useState(false);

  useEffect(() => {
    if (!inView) {
      setCountsComplete(false);
      return;
    }

    const timer = setTimeout(
      () => setCountsComplete(true),
      COUNTER_END_TIME * 1000,
    );

    return () => clearTimeout(timer);
  }, [inView]);

  return (
    <div
      id="impact"
      className="relative st-section"
      style={{
        backgroundColor: "transparent",
        height: "calc(100svh - var(--page-nav-h, 80px))",
        minHeight: "calc(100svh - var(--page-nav-h, 80px))",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "clamp(32px, 5vh, 64px) 0",
        boxSizing: "border-box",
        scrollMarginTop: "var(--page-nav-h, 80px)",
        overflow: "hidden",
      }}
    >
      <Process />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Section header */}
        <header className="st-header">
          <div className="st-heading">
            <motion.span
              className="st-hl-bold"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              ROI REFRAME
            </motion.span>
          </div>
        </header>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-left mb-8 md:mb-10"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white/45 leading-tight">
            They sell{" "}
            <AnimatedStrike inView={inView}>ROI</AnimatedStrike>.<br />{" "}
            We deliver <InvisibleInk>Realtime Operational Impact</InvisibleInk>.
          </h2>
        </motion.div>

        {/* Hero header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight font-['Montserrat'] mb-5 md:mb-6 mt-6 md:mt-8"
          style={{
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            textShadow: "0 0 60px rgba(255,255,255,0.10)",
          }}
        >
          gOS in Action
        </motion.h2>

        {/* ─── Client attribution bridge ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex items-center gap-4 mb-6 md:mb-7"
        >
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15))" }}
          />
          <ClientBadge />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.15))" }}
          />
        </motion.div>
        {/* ─── End client attribution bridge ─── */}

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <Card key={i} stat={stat} index={i} inView={inView} pulse={pulse} countsComplete={countsComplete} />
          ))}
          <NewHiresCard inView={inView} pulse={pulse} countsComplete={countsComplete} />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-4 mt-6 border-t border-white/10 pt-4"
        >
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.28), transparent)` }} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/28">
             observed · catalogued · verified
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)` }} />
        </motion.div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .st-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(24px, 3.5vh, 40px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }

        .st-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
        }

        .st-hl-bold {
          display: block;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
          white-space: nowrap;
        }

        @media (max-width: 600px) {
          /* Tall on mobile — home-slide scrolls this content; keep overflow
             clipped to the section box so only .home-slide is the scrollport. */
          .st-section {
            height: auto !important;
            min-height: calc(100svh - var(--page-nav-h, 80px)) !important;
            max-height: none !important;
            overflow: hidden !important;
            justify-content: flex-start !important;
            padding: 28px 0 48px !important;
          }
          .st-header { margin-bottom: 20px; padding: 0 14px; }
          .st-heading { gap: 8px; }
          .st-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
        }
      `}</style>
    </div>
  );
}