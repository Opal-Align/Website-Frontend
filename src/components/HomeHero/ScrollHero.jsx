// ScrollHero.jsx — Leo Burnett-style pinned hero with enamel particle background
// Drop-in ready. No external assets needed except your opalLogo import.
// Replace the opalLogo import path to match your project.

// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useId, useCallback } from "react";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

const NAVY = "#08060C";
const HERO_HEADLINE_SIZE = "clamp(2.4rem, 6.2vw, 5.2rem)";
const SCROLL_LENGTH = "300vh";

const OPAL_STOPS = [
  { offset: "0%",   color: "#FFFFFF" },
  { offset: "50%",  color: "#9AA2AE" },
  { offset: "100%", color: "#FFFFFF" },
];
const OPAL_TEXT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #C4CAD4 50%, #FFFFFF 100%)";

// ─── Animated word ──────────────────────────────────────────────────────────
function AnimatedWord({ children, start, end, progress, accent = false }) {
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [40, 0]);
  const accentStyle = accent
    ? {
        backgroundImage: OPAL_TEXT_GRADIENT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }
    : { color: "inherit" };

  return (
    <span className="inline-block overflow-hidden align-bottom leading-tight">
      <motion.span
        style={{
          opacity,
          y,
          display: "inline-block",
          willChange: "transform, opacity",
          ...accentStyle,
        }}
      >
        {children}
      </motion.span>
      {"\u00A0"}
    </span>
  );
}

// ─── Starfield hook ──────────────────────────────────────────────────────────
function useEnamelParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = 0, H = 0, raf;
    let mouseX = 0, mouseY = 0;
    let smoothX = 0, smoothY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth  - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let stars = [];

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
    }

    function makeStar(randomZ = true) {
      return {
        x: (Math.random() - 0.5),
        y: (Math.random() - 0.5),
        z: randomZ ? Math.random() : 1,
        speed: Math.random() * 0.00065 + 0.00022,
        twinkle: Math.random() > 0.55,
        twinklePeriod: Math.random() * 4 + 2,
        twinklePhase:  Math.random() * Math.PI * 2,
        twinkleDepth:  Math.random() * 0.4 + 0.15,
        px: null, py: null,
      };
    }

    function init() {
      stars = Array.from({ length: 1000 }, () => makeStar(true));
    }

    function draw() {
      if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) { resize(); init(); }

      smoothX += (mouseX - smoothX) * 0.055;
      smoothY += (mouseY - smoothY) * 0.055;

      ctx.fillStyle = "rgba(8,6,12,0.20)";
      ctx.fillRect(0, 0, W, H);

      const t = performance.now() / 1000;
      const cx = W / 2;
      const cy = H / 2;

      for (const s of stars) {
        s.z -= s.speed;

        if (s.z <= 0) {
          Object.assign(s, makeStar(false));
          s.px = null; s.py = null;
          continue;
        }

        const perspective = 1 / s.z;
        const parallaxStrength = (1 - s.z) * 0.06;
        const sx = cx + (s.x + smoothX * parallaxStrength) * W * perspective;
        const sy = cy + (s.y + smoothY * parallaxStrength) * H * perspective;

        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) {
          s.px = null; s.py = null;
          continue;
        }

        const nearness = 1 - s.z;
        const r = Math.max(0.12, nearness * 2.4);
        let alpha = Math.min(1, nearness * 1.5);

        if (s.twinkle && s.z > 0.35) {
          const osc = Math.sin(t / s.twinklePeriod * Math.PI * 2 + s.twinklePhase);
          alpha *= 1 - s.twinkleDepth * 0.5 + s.twinkleDepth * 0.5 * osc;
        }
        alpha = Math.max(0, Math.min(1, alpha));

        if (s.px !== null && nearness > 0.5) {
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.30})`;
          ctx.lineWidth = r * 0.55;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        if (nearness > 0.75 && r > 1.2) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3.5);
          g.addColorStop(0, `rgba(255,255,255,${alpha * 0.22})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.beginPath();
          ctx.arc(sx, sy, r * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        s.px = sx;
        s.py = sy;
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [canvasRef]);
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ScrollHero() {
  const sectionRef = useRef(null);
  const grainRef   = useRef(null);
  const pillGradientId = `opal-pill-${useId()}`;

  useEnamelParticles(grainRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.3,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Click handler — scrolls to 70% of the section so every headline
  //    reveals naturally. Because all animations are purely scroll-driven,
  //    scrolling back afterward is fully reversible with no extra state.
  const handleLogoClick = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop + section.offsetHeight * 0.50, behavior: "smooth" });
  }, []);

  // All animated values driven solely by scroll progress
  const allLinesOpacity = useTransform(progress, [0.30, 0.38], [0, 1]);
  const pillLength      = useTransform(progress, [0.46, 0.54], [0, 1]);
  const pillOpacity     = useTransform(progress, [0.44, 0.46], [0, 1]);
  const subheadOpacity  = useTransform(progress, [0.56, 0.62], [0, 1]);
  const subheadY        = useTransform(progress, [0.56, 0.62], [20, 0]);

  const logoScale = useTransform(progress, [0.12, 0.32], [2.35, 1]);
  const logoX     = useTransform(progress, [0.12, 0.32], ["0vw", "0vw"]);
  const logoY     = useTransform(progress, [0.12, 0.32], ["0vh", "-35vh"]);

  const hintOpacity = useTransform(progress, [0, 0.05], [1, 0]);

  return (
    <>
      <style>{`
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.72); filter: blur(20px); }
          55%  { opacity: 1; filter: blur(0px); }
          78%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        .logo-mount  { animation: logoIn 1.15s cubic-bezier(0.16,1,0.3,1) forwards; }
        .logo-hidden { opacity: 0; }
        .hero-h1     { font-size: inherit; }
        .logo-clickable { cursor: pointer; }
        .logo-clickable:hover img {
          filter: drop-shadow(0 8px 40px rgba(255,255,255,0.32)) !important;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="relative w-full"
        style={{ height: SCROLL_LENGTH, backgroundColor: NAVY }}
      >
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{ backgroundColor: NAVY }}
        >
          <canvas
            ref={grainRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.85, mixBlendMode: "screen", zIndex: 1 }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 2,
              background: `radial-gradient(ellipse at 50% 42%, transparent 28%, ${NAVY}bb 68%, ${NAVY}f0 100%)`,
            }}
          />

          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{ zIndex: 2, background: `linear-gradient(to bottom, transparent, ${NAVY})` }}
          />

          {/* Logo — clickable */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center logo-clickable"
            style={{
              fontSize: HERO_HEADLINE_SIZE,
              x: logoX,
              y: logoY,
              translateX: "-50%",
              translateY: "-50%",
              scale: logoScale,
              transformOrigin: "center center",
              willChange: "transform",
            }}
            onClick={handleLogoClick}
          >
            <div className={mounted ? "logo-mount" : "logo-hidden"}>
              <img
                src={opalLogo}
                alt="OPAL gOS"
                className="h-[1.1em] w-auto max-w-[min(92vw,36rem)] object-contain object-center select-none pointer-events-none"
                style={{
                  filter: "drop-shadow(0 8px 30px rgba(255,255,255,0.18))",
                  transition: "filter 0.3s ease",
                }}
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
            style={{ opacity: hintOpacity }}
          >
            <span className="font-['Montserrat'] text-white/40 text-[10px] tracking-[0.3em] uppercase">
              Scroll
            </span>
            <motion.div
              className="w-px h-8 origin-top"
              style={{ backgroundImage: OPAL_TEXT_GRADIENT, opacity: 0.6 }}
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Headlines */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <div
              className="w-full max-w-5xl text-center text-white"
              style={{ fontSize: HERO_HEADLINE_SIZE }}
            >
              <motion.h1
                style={{ opacity: allLinesOpacity }}
                className="hero-h1 font-['Montserrat'] font-light leading-[1.05] tracking-tight"
              >
                <AnimatedWord progress={progress} start={0.30} end={0.38}>Recover</AnimatedWord>
                <AnimatedWord progress={progress} start={0.30} end={0.38} accent>Revenue.</AnimatedWord>
              </motion.h1>

              <motion.h1
                style={{ opacity: allLinesOpacity }}
                className="hero-h1 font-['Montserrat'] font-light leading-[1.05] tracking-tight mt-2 md:mt-3"
              >
                <AnimatedWord progress={progress} start={0.30} end={0.38}>Maximize</AnimatedWord>
                <AnimatedWord progress={progress} start={0.30} end={0.38} accent>Margins.</AnimatedWord>
              </motion.h1>

              <motion.div
                style={{ opacity: allLinesOpacity }}
                className="relative inline-block mt-2 md:mt-3"
              >
                <motion.svg
                  aria-hidden
                  className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
                  preserveAspectRatio="none"
                  style={{ opacity: pillOpacity }}
                >
                  <defs>
                    <linearGradient id={pillGradientId} x1="0" y1="1" x2="1" y2="0">
                      {OPAL_STOPS.map((s) => (
                        <stop key={s.offset} offset={s.offset} stopColor={s.color} />
                      ))}
                    </linearGradient>
                  </defs>
                  <motion.rect
                    x="2" y="2"
                    width="calc(100% - 4px)"
                    height="calc(100% - 4px)"
                    rx="9999" ry="9999"
                    fill="transparent"
                    stroke={`url(#${pillGradientId})`}
                    strokeWidth="1.5"
                    style={{ pathLength: pillLength }}
                  />
                </motion.svg>

                <h1 className="hero-h1 relative font-['Montserrat'] font-light leading-[1.05] tracking-tight px-6 md:px-10 py-2 md:py-3">
                  <AnimatedWord progress={progress} start={0.30} end={0.38}>Zero</AnimatedWord>
                  <AnimatedWord progress={progress} start={0.30} end={0.38}>new</AnimatedWord>
                  <AnimatedWord progress={progress} start={0.30} end={0.38} accent>hires.</AnimatedWord>
                </h1>
              </motion.div>

              <motion.p
                style={{ opacity: subheadOpacity, y: subheadY }}
                className="mt-8 md:mt-10 font-['Montserrat'] font-light text-white/55 text-[clamp(0.9rem,1.4vw,1.15rem)] tracking-[0.06em]"
              >
                The Guided Operating System for provider practices.
              </motion.p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}