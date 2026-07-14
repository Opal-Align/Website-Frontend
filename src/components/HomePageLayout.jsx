import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
import Processes from "./Info/Stats.jsx";
import TestimonialSection from "./Info/Testimonial";
import ScrollHero from "./HomeHero/ScrollHero";
import ProblemWordMap from "./Info/ProblemWordMap.jsx";
import PlatformSection from "./Info/PlatformSection.jsx";
import FiveStepLoop from "./Info/FiveStepLoop.jsx";
import { NAV_HEIGHT } from "./Navbar/navigationConfig";

/* ─── Each section slides over the previous one, like the footer overlay.
       Position: sticky + ascending z-index creates the stacked-card effect.
       On mobile we fall back to normal block flow so content can breathe. ─── */
const SLIDE_BG = "#07080D";

export default function HomePageLayout() {
  return (
    <div
      className="w-full"
      style={{ overflowX: "clip", overflowY: "visible", position: "relative" }}
    >
      <style>{`
        /* ── Shared ambient glow layer behind all sections ── */
        .home-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: #07080D;
        }
        .home-glow-inner {
          position: sticky;
          top: 0;
          height: 100vh;
          background:
            radial-gradient(ellipse at 15% 20%, rgba(96,165,250,0.07) 0%, transparent 45%),
            radial-gradient(ellipse at 82% 70%, rgba(34,211,238,0.06) 0%, transparent 42%);
        }

        /* ── Overlay stacking — each slide sticks to just below the navbar
              and the next one slides on top like a new card. ── */
        .home-slide {
          position: sticky;
          top: ${NAV_HEIGHT}px;
          z-index: var(--slide-z, 1);
          background: ${SLIDE_BG};
          /* scrollIntoView() respects this margin, so nav links always land
             flush with the navbar bottom for both forward and backward jumps. */
          scroll-margin-top: ${NAV_HEIGHT}px;
          /* clip-path rounds the top corners visually WITHOUT creating any
             overflow/scroll context.  This keeps IntersectionObserver firing
             against the full viewport, so useInView (Stats, LogoStream,
             Testimonials) is completely unaffected by the overlap. */
          clip-path: inset(0 0 0 0 round 14px 14px 0 0);
          /* thin glowing top seam so the edge reads as a page boundary */
          box-shadow: 0 -1px 0 0 rgba(255,255,255,0.12),
                      0 -6px 28px 0 rgba(0,0,0,0.6);
        }

        /* On mobile: no sticky / no overlap — straight block flow */
        @media (max-width: 767px) {
          .home-slide {
            position: relative;
            top: auto;
            clip-path: none;
            background: transparent;
            box-shadow: none;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .home-slide:first-child {
            border-top: none;
          }
        }
      `}</style>

      <Navbar />
      <ScrollHero />

      <div style={{ position: "relative" }}>
        <div aria-hidden className="home-glow">
          <div className="home-glow-inner" />
        </div>

        {/* ── Section stack ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            ["--page-nav-h"]: `${NAV_HEIGHT}px`,
          }}
        >
          {/* 1 — The Problem */}
          <div className="home-slide" style={{ ["--slide-z"]: 1, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <ProblemWordMap />
          </div>

          {/* 2 — Modules */}
          <div className="home-slide" style={{ ["--slide-z"]: 2, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <PlatformSection navbarHeight={NAV_HEIGHT} />
          </div>

          {/* 3 — The Platform Loop */}
          <div className="home-slide" style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <FiveStepLoop />
          </div>

          {/* 4 — Impact / Stats */}
          <div className="home-slide" style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <Processes />
          </div>

          {/* 5 — The Stack */}
          <div className="home-slide" style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <LogoStream />
          </div>

          {/* 6 — Testimonials */}
          <div className="home-slide" style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <TestimonialSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
