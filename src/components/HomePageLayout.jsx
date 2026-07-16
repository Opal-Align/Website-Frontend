import { useEffect, useRef } from "react";
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
       A wheel/touch snap controller turns the *continuous* scroll into a
       *single-scroll-per-section* jump (fully reversible) — the visual is
       identical, only the scroll granularity changes.
       On mobile we fall back to normal block flow so content can breathe. ─── */
const SLIDE_BG = "#07080D";
const SECTION_COUNT = 6;

export default function HomePageLayout() {
  const stackRef = useRef(null);

  /* ── Single-scroll snap between sticky sections (desktop only) ──────────── */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    let attached = false;
    let animating = false;
    let animTimer = null;
    let touchStartY = 0;

    // Snap Y positions: one per section, computed from live layout.
    const snapPoints = () => {
      const container = stackRef.current;
      if (!container) return [];
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = window.innerHeight - NAV_HEIGHT;
      return Array.from({ length: SECTION_COUNT }, (_, i) =>
        Math.max(0, containerTop + i * sectionHeight - NAV_HEIGHT),
      );
    };

    const snapTo = (top) => {
      animating = true;
      window.scrollTo({ top, behavior: "smooth" });
      clearTimeout(animTimer);
      animTimer = setTimeout(() => { animating = false; }, 720);
    };

    // Returns index of the snap point nearest the current scroll position.
    const nearestIndex = (points, y) => {
      let idx = 0, best = Infinity;
      points.forEach((p, i) => {
        const d = Math.abs(p - y);
        if (d < best) { best = d; idx = i; }
      });
      return idx;
    };

    // direction: +1 (down) or -1 (up). Returns true if it consumed the gesture.
    const step = (direction) => {
      const points = snapPoints();
      if (!points.length) return false;
      const y = window.scrollY;
      const first = points[0];

      // Hero zone (above the first section) → let native scroll run so the
      // hero's scroll-driven animation plays normally.
      if (y < first - 6) return false;

      const index = nearestIndex(points, y);
      const target = index + direction;

      // Past the last section (down) or back into the hero (up) → native scroll
      // so the footer / hero remain reachable.
      if (target < 0 || target > points.length - 1) return false;

      snapTo(points[target]);
      return true;
    };

    const onWheel = (e) => {
      if (animating) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 4) return;
      const consumed = step(e.deltaY > 0 ? 1 : -1);
      if (consumed) e.preventDefault();
    };

    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (animating) { e.preventDefault(); return; }
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 50) return;
      const consumed = step(dy > 0 ? 1 : -1);
      if (consumed) {
        e.preventDefault();
        touchStartY = e.touches[0].clientY;
      }
    };

    // Arrow keys / Page keys / Space — same one-section-per-press snap.
    const DOWN_KEYS = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);
    const UP_KEYS   = new Set(["ArrowUp", "PageUp"]);
    const onKeyDown = (e) => {
      // Don't hijack keys while typing in a field.
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;

      const isDown = DOWN_KEYS.has(e.key);
      const isUp   = UP_KEYS.has(e.key);
      if (!isDown && !isUp) return;
      if (animating) { e.preventDefault(); return; }

      const consumed = step(isDown ? 1 : -1);
      if (consumed) e.preventDefault();
    };

    const attach = () => {
      if (attached) return;
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKeyDown);
      attached = true;
    };
    const detach = () => {
      if (!attached) return;
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      attached = false;
    };

    const sync = () => { mq.matches ? attach() : detach(); };
    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      detach();
      clearTimeout(animTimer);
    };
  }, []);

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
          ref={stackRef}
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
