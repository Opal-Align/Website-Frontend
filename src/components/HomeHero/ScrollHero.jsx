"use client";

import { useRef, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

/**
 * ScrollHero.jsx
 * --------------
 * Requires: npm install framer-motion
 *
 * Add Fraunces font to your project:
 *   <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;1,400&display=swap" rel="stylesheet" />
 *
 * Scroll sequence (section is 250vh tall, panel is sticky):
 *   0 → 35%   OPAL logo sits centered, full opacity
 *   35 → 45%  Logo drifts upward, shrinks, fades out
 *   32 → 65%  Headline + body rises in from below
 *   44 → 72%  CTAs follow with slight delay
 */

const NAVY = "#08060C";

/* ─── Enamel particles hook ──────────────────────────────────────────────
   Particles drift upward with a gentle sine-wave sway, fading in from the
   bottom and out near the top — evoking mineral enamel crystallisation
   against the dark background.
   ───────────────────────────────────────────────────────────────────── */
function useEnamelParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Pearl whites + OPAL accent hues at low alpha
    const PALETTE = [
      [220, 235, 255], // cool pearl white
      [200, 220, 255], // icy blue-white
      [212, 170, 255], // OPAL lavender
      [184, 238, 255], // OPAL cyan
      [255, 184, 245], // OPAL pink
      [170, 255, 212], // OPAL mint
    ];

    const N = 220;
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
        y: forceY !== null ? forceY : Math.random() * H,
        r: Math.random() * 5.5 + 1.2,
        speed: Math.random() * 0.28 + 0.07,
        drift: (Math.random() - 0.5) * 0.22,
        phase: Math.random() * Math.PI * 2,
        col,
        maxAlpha: Math.random() * 0.28 + 0.05,
      };
    }

    function init() {
      particles = Array.from({ length: N }, () => makeParticle());
    }

    function draw() {
      if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) {
        resize();
        init();
      }

      ctx.clearRect(0, 0, W, H);
      const t = performance.now() / 1000;

      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(t * 0.45 + p.phase) * p.drift;

        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;

        if (p.y < -5) {
          Object.assign(p, makeParticle(H + 5));
          continue;
        }

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

/* ─── Main Hero Component ─────────────────────────────────────────── */
export default function ScrollHero() {
  const ref = useRef(null);
  const grainRef = useRef(null);

  useEnamelParticles(grainRef);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const springCfg = { stiffness: 80, damping: 22 };

  /* Logo transforms */
  const logoYRaw     = useTransform(scrollYProgress, [0, 0.45], ["0vh", "-22vh"]);
  const logoScaleRaw = useTransform(scrollYProgress, [0, 0.45], [1, 0.7]);
  const logoOpRaw    = useTransform(scrollYProgress, [0, 0.18, 0.42], [1, 1, 0]);
  const logoY        = useSpring(logoYRaw,     springCfg);
  const logoScale    = useSpring(logoScaleRaw, springCfg);
  const logoOp       = useSpring(logoOpRaw,    springCfg);

  /* Content transforms */
  const contentYRaw  = useTransform(scrollYProgress, [0.32, 0.65], ["44px", "0px"]);
  const contentOpRaw = useTransform(scrollYProgress, [0.32, 0.65], [0, 1]);
  const contentY     = useSpring(contentYRaw,  springCfg);
  const contentOp    = useSpring(contentOpRaw, springCfg);

  /* CTA transforms */
  const ctaYRaw  = useTransform(scrollYProgress, [0.44, 0.72], ["32px", "0px"]);
  const ctaOpRaw = useTransform(scrollYProgress, [0.44, 0.72], [0, 1]);
  const ctaY     = useSpring(ctaYRaw,  springCfg);
  const ctaOp    = useSpring(ctaOpRaw, springCfg);

  return (
    /* Scroll track — 250vh gives enough runway for all animation phases */
    <div ref={ref} className="relative h-[250vh]" style={{ backgroundColor: NAVY }}>

      {/* Sticky viewport */}
      <div
        className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: NAVY }}
      >
        {/* Layer 1: enamel particle canvas */}
        <canvas
          ref={grainRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.85, mixBlendMode: "screen", zIndex: 1 }}
        />

        {/* Layer 2: radial vignette — keeps edges dark & dramatic */}
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

        {/* ── OPAL Logo — exits upward on scroll ── */}
        <motion.div
          style={{ y: logoY, scale: logoScale, opacity: logoOp }}
          className="absolute z-20 flex items-center justify-center"
          aria-label="OPAL gOS"
        >
          <img
            src={opalLogo}
            alt="OPAL gOS"
            className="h-auto w-auto max-w-[min(90vw,34rem)] object-contain object-center
                       select-none pointer-events-none"
            style={{ filter: "drop-shadow(0 8px 30px rgba(212,170,255,0.25))" }}
            draggable={false}
          />
        </motion.div>

        {/* ── Hero Copy — enters on scroll ── */}
        <motion.div
          style={{ y: contentY, opacity: contentOp }}
          className="relative z-10 w-full max-w-[760px] px-6 md:px-10"
        >
          {/* Eyebrow */}
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-white/[0.28] mb-6">
            The guided operating system for healthcare
          </p>

          {/* Headline */}
          <h1
            className="m-0 font-semibold text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1.08] tracking-[-0.01em] text-[#f0ede6]"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Your team is doing everything right.
            <span
              className="block italic font-normal text-[#f0ede6]/40 mt-1"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Revenue is still leaking.
            </span>
          </h1>

          {/* Body copy */}
          <p className="text-[clamp(15px,1.5vw,17px)] leading-[1.72] text-[#f0ede6]/60 max-w-[560px] mt-9 mb-0">
            <strong className="text-[#f0ede6]/90 font-semibold">
              Not a people problem. A volume problem.
            </strong>{" "}
            The work physically cannot be done at the scale your practice requires. OPAL gOS runs
            the operating layer — automatically identifying gaps, executing outreach, and guiding
            your team to only what needs a human decision.
          </p>
        </motion.div>

        {/* ── CTAs — slightly delayed entry ── */}
        <motion.div
          style={{ y: ctaY, opacity: ctaOp }}
          className="absolute z-10 bottom-[max(56px,10vh)] left-0 right-0 px-6 md:px-10 max-w-[760px] mx-auto"
        >
          <div className="flex flex-wrap gap-4">

            {/* Primary CTA */}
            <a
              href="#demo"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold no-underline
                         bg-[#f0ede6] text-[#0c1828]
                         shadow-[0_4px_20px_rgba(0,0,0,0.35)]
                         hover:shadow-[0_8px_28px_rgba(0,0,0,0.45)]
                         hover:-translate-y-0.5
                         transition-all duration-200 group"
            >
              Book a demo
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>

            {/* Secondary CTA */}
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold no-underline
                         text-[#f0ede6]/75 border border-white/16
                         hover:border-white/35 hover:text-[#f0ede6]
                         hover:-translate-y-0.5
                         transition-all duration-200"
            >
              See how it works
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
