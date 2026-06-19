// ScrollHero.jsx — Leo Burnett-style pinned hero with enamel particle background
// Drop-in ready. No external assets needed except your opalLogo import.
// Replace the opalLogo import path to match your project.

// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useId } from "react";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

const NAVY = "#08060C";
/** Same scale as all hero h1 lines — use for the logo wrapper so 1.1em matches the type. */
const HERO_HEADLINE_SIZE = "clamp(2.4rem, 6.2vw, 5.2rem)";
const SCROLL_LENGTH = "300vh";

// ─── OPAL cosmic palette (matches ModuleSection.jsx section title) ────────
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

// ─── Enamel particles hook ──────────────────────────────────────────────────
// Replaces useFilmGrain. Accepts the same canvasRef signature so the JSX below
// needs zero changes. Particles drift upward with a gentle sine-wave sway,
// fading in from the bottom and out near the top — evoking mineral enamel
// crystallisation against the dark background.
function useEnamelParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── Particle colours: pearl whites + the OPAL accent hues at low alpha ──
    const PALETTE = [
      [220, 235, 255], // cool pearl white
      [200, 220, 255], // icy blue-white
      [212, 170, 255], // OPAL lavender
      [184, 238, 255], // OPAL cyan
      [255, 184, 245], // OPAL pink
      [170, 255, 212], // OPAL mint
    ];

    const N = 220; // particle count
    let W = 0, H = 0;
    let particles = [];
    let raf;

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    }

    function makeParticle(forceY = null) {
      const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      return {
        x: Math.random() * W,
        // Spread initial positions across full height so the canvas isn't
        // empty on first frame; new particles always spawn at the bottom.
        y: forceY !== null ? forceY : Math.random() * H,
        r: Math.random() * 5.5 + 1.2,          // 1.2–6.7 px radius
        speed: Math.random() * 0.28 + 0.07,     // upward drift speed
        drift: (Math.random() - 0.5) * 0.22,    // horizontal sway amplitude
        phase: Math.random() * Math.PI * 2,     // sway phase offset
        col,
        // Max alpha varies per particle so the field has visual depth
        maxAlpha: Math.random() * 0.28 + 0.05,
      };
    }

    function init() {
      particles = Array.from({ length: N }, () => makeParticle());
    }

    function draw() {
      // Sync size if the element has resized between frames
      if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) {
        resize();
        init();
      }

      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;

      for (const p of particles) {
        // Move upward
        p.y -= p.speed;
        // Sine-wave horizontal sway
        p.x += Math.sin(t * 0.45 + p.phase) * p.drift;

        // Wrap horizontally so particles never leave the sides
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;

        // Recycle when it leaves the top
        if (p.y < -5) {
          const fresh = makeParticle(H + 5);
          Object.assign(p, fresh);
          continue;
        }

        // Fade in over the bottom 18% of the canvas, fade out over the top 18%
        const fadeIn  = Math.min(1, (H - p.y) / (H * 0.18));
        const fadeOut = Math.min(1, p.y / (H * 0.18));
        const alpha   = p.maxAlpha * Math.min(fadeIn, fadeOut);

        const [r, g, b] = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef]);
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ScrollHero() {
  const sectionRef = useRef(null);
  const grainRef = useRef(null);
  const pillGradientId = `opal-pill-${useId()}`;

  // Swap: useFilmGrain → useEnamelParticles (same ref, same signature)
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

  // Logo animation — size is driven by HERO_HEADLINE_SIZE (1.1em inside wrapper).
  // scroll scale: large hero moment → 1 (final size = headline line height, not a tiny 0.4x).
  const logoScale = useTransform(progress, [0.12, 0.32], [2.35, 1]);
  const logoX     = useTransform(progress, [0.12, 0.32], ["0vw", "0vw"]);
  const logoY     = useTransform(progress, [0.12, 0.32], ["0vh", "-35vh"]);

  // Headline lines
  const line1Opacity = useTransform(progress, [0.30, 0.36], [0, 1]);
  const line2Opacity = useTransform(progress, [0.46, 0.52], [0, 1]);
  const line3Opacity = useTransform(progress, [0.62, 0.68], [0, 1]);

  // Pill border
  const pillLength  = useTransform(progress, [0.76, 0.84], [0, 1]);
  const pillOpacity = useTransform(progress, [0.74, 0.76], [0, 1]);

  // Subhead + CTA
  const subheadOpacity = useTransform(progress, [0.84, 0.90], [0, 1]);
  const subheadY       = useTransform(progress, [0.84, 0.90], [20, 0]);

  // Scroll hint
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

          {/* ── ENAMEL PARTICLES ──────────────────────────────────────────── */}
          {/* Layer 1: animated particle canvas (same canvas ref as before) */}
          <canvas
            ref={grainRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              opacity: 0.85,
              mixBlendMode: "screen",
              zIndex: 1,
            }}
          />

          {/* Layer 2: soft radial vignette — keeps edges dark & dramatic */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 2,
              background: `radial-gradient(ellipse at 50% 42%, transparent 28%, ${NAVY}bb 68%, ${NAVY}f0 100%)`,
            }}
          />

          {/* Layer 3: bottom fade — blends into next section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{
              zIndex: 2,
              background: `linear-gradient(to bottom, transparent, ${NAVY})`,
            }}
          />
          {/* ─────────────────────────────────────────────────────────────── */}

          {/* Logo: same type scale as headlines — img is 1.1em of HERO_HEADLINE_SIZE */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-20 flex items-center justify-center"
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
          >
            <div className={mounted ? "logo-mount" : "logo-hidden"}>
              <img
                src={opalLogo}
                alt="OPAL gOS"
                className="h-[1.1em] w-auto max-w-[min(92vw,36rem)] object-contain object-center
                           select-none pointer-events-none"
                style={{
                  filter: "drop-shadow(0 8px 30px rgba(212,170,255,0.25))",
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

          {/* Headlines (font size = HERO_HEADLINE_SIZE) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <div
              className="w-full max-w-5xl text-center text-white"
              style={{ fontSize: HERO_HEADLINE_SIZE }}
            >

              <motion.h1
                style={{ opacity: line1Opacity }}
                className="hero-h1 font-['Montserrat'] font-light leading-[1.05]
                           tracking-tight"
              >
                <AnimatedWord progress={progress} start={0.34} end={0.42}>Recover</AnimatedWord>
                <AnimatedWord progress={progress} start={0.40} end={0.48} accent>Revenue.</AnimatedWord>
              </motion.h1>

              <motion.h1
                style={{ opacity: line2Opacity }}
                className="hero-h1 font-['Montserrat'] font-light leading-[1.05]
                           tracking-tight mt-2 md:mt-3"
              >
                <AnimatedWord progress={progress} start={0.48} end={0.55}>Maximize</AnimatedWord>
                <AnimatedWord progress={progress} start={0.54} end={0.61} accent>Margins.</AnimatedWord>
              </motion.h1>

              <motion.div
                style={{ opacity: line3Opacity }}
                className="relative inline-block mt-2 md:mt-3"
              >
                <motion.svg
                  aria-hidden
                  className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
                  preserveAspectRatio="none"
                  style={{ opacity: pillOpacity }}
                >
                  <defs>
                    <linearGradient
                      id={pillGradientId}
                      x1="0" y1="1" x2="1" y2="0"
                    >
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

                <h1
                  className="hero-h1 relative font-['Montserrat'] font-light
                             leading-[1.05] tracking-tight px-6 md:px-10 py-2 md:py-3"
                >
                  <AnimatedWord progress={progress} start={0.66} end={0.71}>Zero</AnimatedWord>
                  <AnimatedWord progress={progress} start={0.69} end={0.74}>new</AnimatedWord>
                  <AnimatedWord progress={progress} start={0.72} end={0.77} accent>hires.</AnimatedWord>
                </h1>
              </motion.div>

              <motion.p
                style={{ opacity: subheadOpacity, y: subheadY }}
                className="mt-8 md:mt-10 font-['Montserrat'] font-light text-white/55
                           text-[clamp(0.9rem,1.4vw,1.15rem)] tracking-[0.06em]"
              >
                The Guided Operating System for provider practices.
              </motion.p>

              {/* <motion.div
                style={{ opacity: ctaOpacity, y: ctaY }}
                className="mt-8 flex justify-center"
              >
                <button
                  className="font-['Montserrat'] text-[11px] tracking-[0.22em] uppercase
                             border px-8 py-3 rounded-full transition-all duration-300
                             text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                  style={{ borderColor: `${TEAL}66` }}
                >
                  Get Started
                </button>
              </motion.div> */}

            </div>
          </div>

        </div>
      </section>
    </>
  );
}