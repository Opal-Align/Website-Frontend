import { useEffect, useRef, useState, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, animate } from "framer-motion";
import clientLogo from "../../assets/client_white.png";

const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const OPAL_SOFT_GLOW = "rgba(255,255,255,0.28)";
const gradientText = {
  backgroundImage: OPAL_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

const stats = [
  {
    target: 18, prefix: "$", suffix: "K+",
    label: "Recovered Revenue",
    desc: "Automation drove A/R recovery in a single pilot, across two practices.",
    glyph: "α · 001",
  },
  {
    target: 1, prefix: "", suffix: "K+",
    label: "Communications Triggered",
    desc: "Outreach attempts per session vastly outnumber what is humanely achievable.",
    glyph: "β · 002",
  },
  {
    target: 625, prefix: "", suffix: "",
    label: "Hours Saved",
    desc: "Manual labor dependence is eliminated instantly.",
    glyph: "γ · 003",
  },
  {
    target: 16, prefix: "", suffix: "×",
    label: "Productivity Multiplier",
    desc: "Existing teams became exponentially more effective.",
    glyph: "δ · 004",
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

function Counter({ target, prefix, suffix, inView }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration: 2.2,
      ease: [0, 0.55, 0.45, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return ctrl.stop;
  }, [inView, target]);

  return (
    <span
      className="font-semibold tracking-tight"
      style={{
        ...gradientText,
        fontSize: "clamp(2.8rem, 5vw, 4.2rem)",
        lineHeight: 1,
        filter: `drop-shadow(0 0 24px ${OPAL_SOFT_GLOW})`,
      }}
    >
      {prefix}{val}{suffix}
    </span>
  );
}

function Card({ stat, index, inView }) {
  const [hovered, setHovered] = useState(false);

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

      <div className="relative z-10 p-6 md:p-8 flex flex-col gap-4 min-h-[245px]">

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
        <Counter {...stat} inView={inView} />

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
      <span
        className="text-[11px] md:text-xs tracking-[0.22em] uppercase transition-colors duration-300"
        style={{ color: hovered ? "rgba(34,211,238,0.9)" : "rgba(255,255,255,0.4)" }}
      >
        Client
      </span>
      
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

  return (
    <div
      id="impact"
      className="relative overflow-hidden py-16 md:py-24"
      style={{ backgroundColor: "transparent" }}
    >
      <Process />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-left mb-14 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white/45 leading-tight">
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
          className="text-center text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight font-['Montserrat'] mb-8 md:mb-10 mt-10 md:mt-24"
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
          className="flex items-center gap-4 mb-10 md:mb-12"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} stat={stat} index={i} inView={inView} />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-4 mt-10 border-t border-white/10 pt-6"
        >
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.28), transparent)` }} />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/28">
             observed · catalogued · verified
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)` }} />
        </motion.div>

      </div>
    </div>
  );
}