import { useRef, useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";

// Dynamic imports — partner SVGs (~2MB+) stay out of the initial bundle
// until the Stack section is near the viewport.
const LOGO_LOADERS = [
  () => import("../../assets/Carestack.svg"),
  () => import("../../assets/Cloud 9.svg"),
  () => import("../../assets/Curve.svg"),
  () => import("../../assets/Denticon.svg"),
  () => import("../../assets/Dentimax.svg"),
  () => import("../../assets/dentrix.svg"),
  () => import("../../assets/DentrixAscend.svg"),
  () => import("../../assets/dolphin.svg"),
  () => import("../../assets/Eaglesoft.svg"),
  () => import("../../assets/Open Dental.svg"),
];

// Every column is padded out to the same unique-logo count before it's
// duplicated for looping. This is the fix for the "choppy" columns: a
// column with only 2 logos had a much shorter track than one with 6, so it
// looped far more often and the reset was visible. Now every column has an
// equally long, equally dense track, just starting at a different offset
// in the logo list, so they feel varied but none of them "run out" early.
const UNIQUE_PER_COLUMN = 7;

function buildColumnLogos(allLogos, startIndex) {
  const list = [];
  for (let i = 0; i < UNIQUE_PER_COLUMN; i++) {
    list.push(allLogos[(startIndex + i) % allLogos.length]);
  }
  return list;
}

function usePartnerLogos(enabled) {
  const [logos, setLogos] = useState(null);

  useEffect(() => {
    if (!enabled || logos) return;
    let cancelled = false;
    Promise.all(LOGO_LOADERS.map((load) => load())).then((mods) => {
      if (!cancelled) setLogos(mods.map((m) => m.default));
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, logos]);

  return logos;
}

// px/second — kept constant across columns so every column scrolls at the
// same visual speed regardless of direction; only the starting offset and
// direction differ, which reads as organic rather than mechanical.
const PX_PER_SECOND = 26;
const CARD_HEIGHT_PX = 112; // approx card height + gap, used only to size duration
const TRACK_DURATION = Math.round((UNIQUE_PER_COLUMN * CARD_HEIGHT_PX) / PX_PER_SECOND);

const COLUMN_META = [
  { start: 0, direction: "up" },
  { start: 3, direction: "down" },
  { start: 6, direction: "up" },
  { start: 2, direction: "down" },
  { start: 5, direction: "up" },
  { start: 8, direction: "down" },
];

// How many columns show at each breakpoint. Hidden columns are simply not
// rendered on small screens (not just visually hidden) to keep things light.
const COLUMN_VISIBILITY = [
  "flex",                 // always
  "flex",                 // always
  "hidden sm:flex",       // from small screens up
  "hidden md:flex",       // from medium screens up
  "hidden lg:flex",       // from large screens up
  "hidden xl:flex",       // from extra-large screens up
];

function Column({ logos, direction, visibility }) {
  // Duplicate the (now equal-length, padded) column content so the loop is
  // seamless: we animate the track by exactly 50% of its own height, then
  // jump back to 0% unnoticed, since that 50% mark is pixel-identical to
  // the start (it's the same list repeated).
  const track = [...logos, ...logos];

  return (
    <div
      className={`${visibility} relative flex-1 min-w-0 h-full flex-col items-center group`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl">
        <div
          className={`flex flex-col gap-5 w-full will-change-transform group-hover:[animation-play-state:paused] ${
            direction === "up" ? "animate-scroll-up" : "animate-scroll-down"
          }`}
          style={{ animationDuration: `${TRACK_DURATION}s` }}
        >
          {track.map((logo, i) => (
            <LogoCard key={i} logo={logo} />
          ))}
        </div>
      </div>

      {/* Column highlight overlay, brightens on hover of this column only */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-white/4 group-hover:ring-1 group-hover:ring-white/15" />
    </div>
  );
}

function LogoCard({ logo }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 w-full h-24 md:h-28 rounded-xl border border-white/10 bg-white/3 backdrop-blur-sm
                 transition-all duration-300 hover:scale-[1.04] hover:bg-white/[0.07] hover:border-white/25"
    >
      <span
        role="img"
        aria-label="Integration logo"
        className="block h-8 md:h-10 w-[70%] opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          backgroundColor: "#E5E7EB",
          WebkitMaskImage: `url("${logo}")`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          WebkitMaskSize: "contain",
          maskImage: `url("${logo}")`,
          maskRepeat: "no-repeat",
          maskPosition: "center",
          maskSize: "contain",
        }}
      />
    </div>
  );
}

export default function LogoStream() {
  const sectionRef = useRef(null);
  // Prefetch logos well before the slide is focused (sticky stack).
  const nearView = useInView(sectionRef, { once: true, margin: "600px 0px" });
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const logos = usePartnerLogos(nearView);

  const columns = useMemo(() => {
    if (!logos) return null;
    return COLUMN_META.map((meta) => ({
      logos: buildColumnLogos(logos, meta.start),
      direction: meta.direction,
    }));
  }, [logos]);

  return (
    <div
      id="stack"
      ref={sectionRef}
      className="ls-section relative w-full"
      style={{ background: "#0a0a0a", scrollMarginTop: "var(--page-nav-h, 80px)" }}
    >
      {/* Edge fades, top & bottom, so columns appear to scroll into the void */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to bottom, #0a0a0a, transparent)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to top, #0a0a0a, transparent)" }} />

      <div className="ls-inner relative mx-auto max-w-6xl px-4 sm:px-6">
        <header className="ls-header">
          <div className="ls-heading">
            <motion.span
              className="ls-hl-muted"
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Our Partners
            </motion.span>
            <motion.span
              className="ls-hl-bold"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              YOUR SYSTEMS UNCHANGED
            </motion.span>
          </div>
        </header>

        <div className="ls-columns flex gap-4 md:gap-5">
          {columns
            ? columns.map((col, i) => (
                <Column
                  key={i}
                  logos={col.logos}
                  direction={col.direction}
                  visibility={COLUMN_VISIBILITY[i]}
                />
              ))
            : COLUMN_VISIBILITY.map((visibility, i) => (
                <div
                  key={i}
                  className={`${visibility} relative flex-1 min-w-0 h-full`}
                  aria-hidden
                />
              ))}
        </div>
      </div>

      <style>{`
        .ls-section {
          --ls-nav-h: var(--page-nav-h, 80px);
          height: calc(100svh - var(--ls-nav-h));
          min-height: calc(100svh - var(--ls-nav-h));
          max-height: calc(100svh - var(--ls-nav-h));
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(20px, 3vh, 40px) 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        .ls-inner {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .ls-header {
          position: relative;
          z-index: 20;
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(20px, 3vh, 40px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }

        .ls-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
          width: 100%;
        }

        /* Matches ProblemWordMap / Testimonial heading system */
        .ls-hl-muted {
          display: block;
          font-size: var(--page-hl-muted-size);
          font-weight: var(--page-hl-muted-weight);
          letter-spacing: var(--page-hl-muted-tracking);
          color: var(--page-hl-muted-color);
          line-height: var(--page-hl-muted-lh);
          text-align: center;
          padding-top: clamp(16px, 2.5vh, 28px);
        }
        .ls-hl-bold {
          display: block;
          font-size: var(--page-hl-bold-size);
          font-weight: var(--page-hl-bold-weight);
          letter-spacing: var(--page-hl-bold-tracking);
          color: #fff;
          line-height: var(--page-hl-bold-lh);
          text-align: center;
          text-shadow: none;
          filter: none;
          -webkit-font-smoothing: antialiased;
        }

        .ls-columns {
          position: relative;
          z-index: 1;
          flex: 1 1 auto;
          min-height: 280px;
          height: auto;
          max-height: none;
        }

        @media (max-width: 600px) {
          .ls-section {
            height: auto;
            min-height: calc(100svh - var(--ls-nav-h));
            max-height: none;
            overflow: visible;
          }
          .ls-columns { min-height: 320px; height: 380px; }
          .ls-header { margin-bottom: 24px; padding: 0 14px; }
          .ls-heading { gap: 8px; width: 100%; }
        }

        @keyframes scroll-up {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(0, -50%, 0); }
        }
        @keyframes scroll-down {
          from { transform: translate3d(0, -50%, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }
        .animate-scroll-up {
          animation-name: scroll-up;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-scroll-down {
          animation-name: scroll-down;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-up, .animate-scroll-down {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
