// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, AnimatePresence } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  company?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Honestly, the biggest difference is we're not digging through ledgers anymore. Opal just shows us who needs attention, and the automation takes care of most of the follow-ups.",
    name: "Practice Owner",
  },
  {
    quote:
      "Collections used to feel like a guessing game. Now it's very clear who we need to contact and when, and the system handles a lot of it automatically.",
    name: "Office Manager",
  },
  {
    quote:
      "I like that it takes the pressure off the front desk. Patients are getting reminders and follow-ups without the team having to constantly call.",
    name: "Clinical Assistant",
  },
  {
    quote:
      "We're seeing more patients come back in just from the automated messages. It's consistent, which we were never able to do manually.",
    name: "Treatment Coordinator",
  },
];

const NAVY = "#07080D";
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";
const gradientText: React.CSSProperties = {
  backgroundImage: OPAL_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Typewriter for full quote text — resets when `text` or `runKey` changes. */
function TypewriterQuote({
  text,
  runKey,
  active,
  charsPerTick = 2,
  tickMs = 22,
}: {
  text: string;
  runKey: number;
  active: boolean;
  charsPerTick?: number;
  tickMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (!active) {
      setLen(0);
      return;
    }
    if (reduced) {
      setLen(text.length);
      return;
    }
    setLen(0);
    let cur = 0;
    const id = window.setInterval(() => {
      cur = Math.min(text.length, cur + charsPerTick);
      setLen(cur);
      if (cur >= text.length) window.clearInterval(id);
    }, tickMs);
    return () => window.clearInterval(id);
  }, [text, runKey, active, reduced, charsPerTick, tickMs]);

  const visible = text.slice(0, len);
  const done = len >= text.length;

  return (
    <>
      <span className="sr-only">{text}</span>
      <p
        aria-hidden
        className="leading-relaxed text-[15px] sm:text-base md:text-[17px] min-h-32 sm:min-h-36 md:min-h-40"
        style={{ color: "rgba(244,248,255,0.88)" }}
      >
        {visible}
        {!done && (
          <motion.span
            className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-0.5 rounded-sm"
            style={{ backgroundImage: OPAL_LIGHT_GRADIENT }}
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </p>
    </>
  );
}

function StarsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let id: number;
    let stars: Array<{
      x: number;
      y: number;
      r: number;
      base: number;
      tw: boolean;
      ph: number;
      sp: number;
      hue: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const count = Math.floor((canvas.width * canvas.height) / 2600);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r:
          Math.random() < 0.04
            ? Math.random() * 1.5 + 0.8
            : Math.random() * 0.55 + 0.1,
        base: Math.random() * 0.55 + 0.08,
        tw: Math.random() > 0.55,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.5 + 0.18,
        hue: [200, 235, 285, 320, 160][Math.floor(Math.random() * 5)],
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        let a = s.base;
        if (s.tw) a = s.base * (0.35 + 0.65 * Math.sin(t * 0.001 * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
        if (s.r > 1.2) {
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.32})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y);
          ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3);
          ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    id = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

/** Per-quote screen time = typing time + comfortable read hold. */
const TYPE_TICK_MS = 22;
const TYPE_CHARS_PER_TICK = 2;
const READ_HOLD_MS = 2500;
function getDurationFor(text: string, reduced: boolean) {
  if (reduced) return READ_HOLD_MS;
  const typeMs = Math.ceil(text.length / TYPE_CHARS_PER_TICK) * TYPE_TICK_MS;
  return typeMs + READ_HOLD_MS;
}

const TestimonialSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-12%" });
  const [active, setActive] = useState(0);
  const [typeKey, setTypeKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();

  const item = testimonials[active];
  const duration = getDurationFor(item.quote, reduced);

  // Restart typewriter when active or visibility changes
  useEffect(() => {
    setTypeKey((k) => k + 1);
  }, [active, inView]);

  // Auto-advance via rAF — pauses on hover or off-screen, resumes from where it left
  const progressRef = useRef(0);
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [active, inView]);

  useEffect(() => {
    if (!inView || paused) return;
    let raf: number;
    let last: number | null = null;
    let completed = false;

    const step = (t: number) => {
      if (last == null) last = t;
      const dt = t - last;
      last = t;
      progressRef.current = Math.min(1, progressRef.current + dt / duration);
      setProgress(progressRef.current);
      if (progressRef.current >= 1) {
        if (!completed) {
          completed = true;
          setActive((i) => (i + 1) % testimonials.length);
        }
        return;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, paused, duration]);

  return (
    <section
      id="testimonials"
      className="tm-section relative flex flex-col overflow-hidden"
      style={{
        backgroundColor: "transparent",
        scrollMarginTop: "var(--page-nav-h, 80px)",
      }}
    >
      <StarsCanvas />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 46%, ${NAVY}cc 82%, ${NAVY}f7 100%)`,
        }}
      />

      <div
        ref={ref}
        className="tm-inner relative z-10 flex flex-col flex-1 min-h-0 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-6 md:pt-10 md:pb-8"
      >
        {/* Header */}
        <div className="tm-header">
          <div className="tm-heading">
            <motion.span
              className="tm-hl-muted"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Testimonials
            </motion.span>
            <motion.span
              className="tm-hl-bold"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              VOICES FROM OUR PARTNERS
            </motion.span>
          </div>
        </div>

        {/* Main stage — one quote at a time = true full-viewport “page” */}
        <div className="tm-stage flex-1 min-h-0 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="group relative mx-auto w-full max-w-3xl"
              style={{ borderRadius: 28 }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-70 group-hover:opacity-100"
                style={{
                  borderRadius: 28,
                  padding: 1.2,
                  background: OPAL_LIGHT_GRADIENT,
                  WebkitMask:
                    "linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)",
                  WebkitMaskComposite: "xor",
                  mask: "linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)",
                  maskComposite: "exclude",
                }}
              />

              <div
                className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col gap-4 md:gap-5"
                style={{
                  borderRadius: 28,
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="leading-none select-none shrink-0"
                    style={{
                      ...gradientText,
                      fontFamily: "'Bebas Neue', 'Montserrat', sans-serif",
                      fontSize: "clamp(44px, 10vw, 72px)",
                    }}
                  >
                    “
                  </span>
                  <div className="relative mt-1 shrink-0">
                    <div
                      className="w-[7px] h-[7px] rounded-full"
                      style={{
                        backgroundImage: OPAL_LIGHT_GRADIENT,
                        boxShadow: "0 0 14px 4px rgba(255,255,255,0.45)",
                      }}
                    />
                  </div>
                </div>

                <TypewriterQuote
                  text={item.quote}
                  runKey={typeKey}
                  active={inView}
                  charsPerTick={TYPE_CHARS_PER_TICK}
                  tickMs={TYPE_TICK_MS}
                />

                <div
                  className="h-px"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0.04))",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: inView ? 1 : 0 }}
                  transition={{ delay: reduced ? 0 : 0.35, duration: 0.5 }}
                >
                  <p
                    className="font-semibold tracking-tight text-base sm:text-[17px]"
                    style={{ color: "rgba(255,255,255,0.95)" }}
                  >
                    {item.name}
                  </p>
                  {(item.role || item.company) && (
                    <p
                      className="text-[12px] sm:text-[13px] mt-1"
                      style={{ color: "rgba(244,248,255,0.55)" }}
                    >
                      {[item.role, item.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Auto-rotation progress strip — replaces click carousel */}
        <div className="tm-progress shrink-0 mt-5 md:mt-auto pt-0 md:pt-6 space-y-4 md:space-y-5">
          <div
            role="tablist"
            aria-label="Testimonials auto-rotation"
            className="mx-auto flex w-full max-w-3xl items-center gap-2 sm:gap-3"
          >
            {testimonials.map((_, i) => {
              const isActive = i === active;
              const isPast = i < active;
              const fill = isActive ? progress : isPast ? 1 : 0;
              return (
                <div
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  className="relative h-[3px] flex-1 overflow-hidden rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${fill * 100}%`,
                      backgroundImage: OPAL_LIGHT_GRADIENT,
                      boxShadow: isActive
                        ? "0 0 12px rgba(255,255,255,0.45)"
                        : "none",
                      transition: isActive
                        ? "none"
                        : "width 0.4s ease-out",
                    }}
                  />
                </div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center gap-3 pt-2 border-t border-white/10"
          >
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(255,255,255,0.28), transparent)",
              }}
            />
            <span
              className="text-[9px] sm:text-[10px] tracking-[0.28em] sm:tracking-[0.32em] uppercase whitespace-nowrap"
              style={{ color: "rgba(244,248,255,0.4)" }}
            >
              trusted · validated · proven
            </span>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(255,255,255,0.28), transparent)",
              }}
            />
          </motion.div>
        </div>
      </div>

      <style>{`

        .tm-section {
          --tm-nav-h: var(--page-nav-h, 80px);
          min-height: calc(100svh - var(--tm-nav-h));
          height: calc(100svh - var(--tm-nav-h));
          max-height: calc(100svh - var(--tm-nav-h));
        }

        .tm-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(16px, 2.5vh, 28px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }

        .tm-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
          width: 100%;
        }

        .tm-hl-bold {
          display: block;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
        }

        .tm-hl-muted {
          display: block;
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.48);
          line-height: 1.14;
        }

        @media (max-width: 600px) {
          .tm-section {
            height: auto;
            min-height: 0;
            max-height: none;
          }
          .tm-inner {
            flex: unset;
            min-height: 0;
            padding-top: 20px;
            padding-bottom: 28px;
          }
          .tm-stage {
            flex: unset;
            justify-content: flex-start;
          }
          .tm-progress {
            gap: 16px;
          }
          .tm-header { margin-bottom: 12px; padding: 0 14px; }
          .tm-heading { gap: 8px; }
          .tm-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
          .tm-hl-muted { font-size: clamp(14px, 4.2vw, 18px); color: rgba(255,255,255,0.52); }
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;
