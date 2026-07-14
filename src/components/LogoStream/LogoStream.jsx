import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Carestack from "../../assets/Carestack.svg";
import Cloud9 from "../../assets/Cloud 9.svg";
import Curve from "../../assets/Curve.svg";
import Denticon from "../../assets/Denticon.svg";
import Dentimax from "../../assets/Dentimax.svg";
import Dentrix from "../../assets/dentrix.svg";
import DentrixAscend from "../../assets/DentrixAscend.svg";
import Dolphin from "../../assets/dolphin.svg";
import Eaglesoft from "../../assets/Eaglesoft.svg";
import OpenDental from "../../assets/Open Dental.svg";

const ALL_LOGOS = [
  Carestack,
  Cloud9,
  Curve,
  Denticon,
  Dentimax,
  Dentrix,
  DentrixAscend,
  Dolphin,
  Eaglesoft,
  OpenDental,
];

// Every column is padded out to the same unique-logo count before it's
// duplicated for looping. This is the fix for the "choppy" columns: a
// column with only 2 logos had a much shorter track than one with 6, so it
// looped far more often and the reset was visible. Now every column has an
// equally long, equally dense track, just starting at a different offset
// in the logo list, so they feel varied but none of them "run out" early.
const UNIQUE_PER_COLUMN = 7;

function buildColumnLogos(startIndex) {
  const list = [];
  for (let i = 0; i < UNIQUE_PER_COLUMN; i++) {
    list.push(ALL_LOGOS[(startIndex + i) % ALL_LOGOS.length]);
  }
  return list;
}

// px/second — kept constant across columns so every column scrolls at the
// same visual speed regardless of direction; only the starting offset and
// direction differ, which reads as organic rather than mechanical.
const PX_PER_SECOND = 26;
const CARD_HEIGHT_PX = 112; // approx card height + gap, used only to size duration
const TRACK_DURATION = Math.round((UNIQUE_PER_COLUMN * CARD_HEIGHT_PX) / PX_PER_SECOND);

const COLUMNS = [
  { logos: buildColumnLogos(0), direction: "up" },
  { logos: buildColumnLogos(3), direction: "down" },
  { logos: buildColumnLogos(6), direction: "up" },
  { logos: buildColumnLogos(2), direction: "down" },
  { logos: buildColumnLogos(5), direction: "up" },
  { logos: buildColumnLogos(8), direction: "down" },
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

const TAGLINE_LINES = [
  { prefix: "Your Practice Management Systems.", highlight: "Unchanged." },
  { prefix: "Your Operations.", highlight: "Transformed." },
  { prefix: "Integrated & Interoperable", highlight: "by Design." },
];

const taglineVariants = {
  enter: {
    x: "-100%",
    opacity: 0,
    filter: "blur(8px)",
  },
  center: {
    x: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: "100%",
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.45, ease: [0.55, 0, 0.78, 0] },
  },
};

function TaglineTicker({ active }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TAGLINE_LINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [active]);

  const { prefix, highlight } = TAGLINE_LINES[index];

  return (
    <div className="ls-tagline-wrap">
      <div className="ls-tagline-ticker">
        <div className="ls-tagline-inner">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              className="ls-tagline-line"
              variants={taglineVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <span className="ls-tagline-prefix">{prefix}</span>
              <span className="ls-tagline-highlight">{highlight}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="ls-tagline-dots" aria-hidden>
        {TAGLINE_LINES.map((_, i) => (
          <span key={i} className={`ls-tagline-dot${i === index ? " active" : ""}`} />
        ))}
      </div>
    </div>
  );
}

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
      <div className="pointer-events-none absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-white/[0.04] group-hover:ring-1 group-hover:ring-white/15" />
    </div>
  );
}

function LogoCard({ logo }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 w-full h-24 md:h-28 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
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
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <div
      id="stack"
      ref={sectionRef}
      className="ls-section relative w-full"
      style={{ background: "#07080D", scrollMarginTop: "var(--page-nav-h, 80px)" }}
    >
      {/* Edge fades, top & bottom, so columns appear to scroll into the void */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to bottom, #07080D, transparent)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to top, #07080D, transparent)" }} />

      <div className="ls-inner relative mx-auto max-w-6xl px-4 sm:px-6">
        <header className="ls-header">
          <div className="ls-heading">
            <motion.span
              className="ls-hl-bold"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              THE STACK
            </motion.span>

            <motion.div
              className="ls-tagline-motion"
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <TaglineTicker active={inView} />
            </motion.div>
          </div>
        </header>

        <div className="ls-columns flex gap-4 md:gap-5">
          {COLUMNS.map((col, i) => (
            <Column
              key={i}
              logos={col.logos}
              direction={col.direction}
              visibility={COLUMN_VISIBILITY[i]}
            />
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

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
        .ls-columns {
          flex: 1 1 auto;
          min-height: 280px;
          height: auto;
          max-height: none;
        }

        .ls-header {
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

        .ls-hl-bold {
          display: block;
          width: 100%;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
          white-space: nowrap;
        }

        .ls-tagline-motion {
          width: 100%;
          align-self: stretch;
        }

        .ls-tagline-wrap {
          width: 100%;
          max-width: min(960px, 100%);
          margin: clamp(4px, 0.8vh, 10px) auto 0;
        }
        .ls-tagline-ticker {
          position: relative;
          overflow: hidden;
          width: 100%;
          min-height: clamp(32px, 3.8vh, 44px);
          height: clamp(32px, 3.8vh, 44px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ls-tagline-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
        }
        .ls-tagline-line {
          position: absolute;
          left: 0;
          right: 0;
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 0.28em;
          white-space: nowrap;
          width: 100%;
          min-width: 100%;
          padding: 0 8px;
          box-sizing: border-box;
        }
        .ls-tagline-prefix {
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.48);
          line-height: 1.14;
        }
        .ls-tagline-highlight {
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #fff;
          line-height: 1.14;
        }
        .ls-tagline-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 12px;
        }
        .ls-tagline-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .ls-tagline-dot.active {
          background: rgba(255,255,255,0.55);
          transform: scale(1.25);
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
          .ls-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
          .ls-tagline-wrap { max-width: 100%; }
          .ls-tagline-ticker {
            min-height: clamp(28px, 5vw, 36px);
            height: clamp(28px, 5vw, 36px);
          }
          .ls-tagline-line { padding: 0 4px; }
          .ls-tagline-prefix,
          .ls-tagline-highlight {
            font-size: clamp(12px, 3.4vw, 16px);
          }
          .ls-tagline-dots { margin-top: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ls-tagline-line { position: relative; }
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