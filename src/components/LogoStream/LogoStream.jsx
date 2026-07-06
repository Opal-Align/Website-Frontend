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
  return (
    <div
      className="relative w-full py-10 md:py-16"
      style={{ background: "#07080D" }}
    >
      {/* Edge fades, top & bottom, so columns appear to scroll into the void */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to bottom, #07080D, transparent)" }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 md:h-24 z-10" style={{ background: "linear-gradient(to top, #07080D, transparent)" }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex gap-4 md:gap-5 h-[420px] md:h-[520px]">
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