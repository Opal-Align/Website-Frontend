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

/* ─── Stacked-card scroll experience (mobile + desktop, identical) ───────────
   Every section is a full-viewport sticky card; the next one slides up over
   the previous. One gesture = one section, fully reversible.

   Robustness rules that fix the earlier glitches:
   • Snap targets are read from each card's REAL layout offset (no drift).
   • Native scrolling is blocked ONLY while inside the stack, so the hero's
     scroll-driven animation and the footer stay free.
   • The "busy" lock is released on the real `scrollend` event (not a guessed
     timer), so trackpad momentum can't skip multiple sections and a snap can't
     re-fire mid-animation.
   • Tall cards (FiveStepLoop, Stats) scroll INSIDE themselves first; only at
     their top/bottom edge does the next gesture advance to the neighbour. ─── */
const SLIDE_BG = "#07080D";
const SECTION_COUNT = 6;
const OVERFLOW_EPS = 48; // a card counts as "scrollable" only past this many px

export default function HomePageLayout() {
  const stackRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    let busy = false;            // true while a programmatic snap is in flight
    let releaseTimer = null;
    let fallbackTimer = null;

    // Absolute document Y for each card's top, flush under the navbar.
    // Sticky siblings often report identical/unstable offsetTop (your logs
    // showed points[0] === points[1]), which collapses the next snap into a
    // no-op. Every .home-slide is fixed to one viewport slot, so build
    // targets from index × slide height instead.
    const snapPoints = () => {
      const container = stackRef.current;
      if (!container) return [];
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);
      return sectionRefs.current.map((_, i) =>
        Math.max(0, containerTop + i * slideH - NAV_HEIGHT),
      );
    };

    const nearestIndex = (points, y) => {
      let idx = 0, best = Infinity;
      points.forEach((p, i) => {
        const d = Math.abs(p - y);
        if (d < best) { best = d; idx = i; }
      });
      return idx;
    };

    const clearTimers = () => {
      clearTimeout(releaseTimer);
      clearTimeout(fallbackTimer);
    };

    const snapTo = (top) => {
      // No-op guard: if we're already at (or within 1px of) the target, the
      // browser won't move and will never fire `scrollend`, leaving `busy`
      // stuck true for the full fallback window. Release immediately instead.
      if (Math.abs(top - window.scrollY) < 1) {
        busy = false;
        return;
      }
      busy = true;
      clearTimers();
      window.scrollTo({ top, behavior: "smooth" });
      // Safety net if `scrollend` never arrives (older engines / no movement).
      fallbackTimer = setTimeout(() => { busy = false; }, 400);
    };

    // Released shortly AFTER the smooth scroll truly settles, so trailing
    // momentum from a trackpad fling is swallowed instead of skipping ahead.
    const onScrollEnd = () => {
      if (!busy) return;
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => { busy = false; }, 140);
    };

    // Decide + perform a step. Returns:
    //   "snap"     → we scrolled to a neighbour / boundary (block native)
    //   "internal" → let the card scroll its own overflow (allow native)
    //   "outside"  → we're in the hero/footer zone (allow native)
    const step = (direction) => {
      const points = snapPoints();
      if (!points.length) return "outside";
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      if (y > lastP + 4) return "outside";   // footer zone

      // Hero → first card: same controlled snap as every other section change.
      // Free native scroll here used to land the cursor on a half-mounted
      // ProblemWordMap sticky card, which ate wheel events and jammed.
      // Only take over in the last viewport of the hero so ScrollHero's
      // scroll-driven animation still runs for the rest of its 200vh.
      if (y < firstP - 4) {
        if (direction > 0 && y >= firstP - slideH - 4) {
          const incoming = sectionRefs.current[0];
          if (incoming) incoming.scrollTop = 0;
          snapTo(firstP);
          return "snap";
        }
        return "outside";
      }

      const index = nearestIndex(points, y);
      const activeEl = sectionRefs.current[index];

      // Tall card → scroll through its own content before advancing.
      // Guard against phantom overflow: some sections report scrollHeight >
      // clientHeight (absolute children, rounding) while scrollTop cannot
      // actually move — that used to jam the controller in "internal" forever.
      if (activeEl) {
        const { scrollTop, scrollHeight, clientHeight } = activeEl;
        const maxScroll = scrollHeight - clientHeight;
        if (maxScroll > OVERFLOW_EPS) {
          const EDGE_EPS = 4;
          const atBottom = scrollTop >= maxScroll - EDGE_EPS;
          const atTop = scrollTop <= EDGE_EPS;
          if (direction > 0 && !atBottom) {
            const before = activeEl.scrollTop;
            activeEl.scrollTop = before + 1;
            const canScroll = activeEl.scrollTop > before;
            activeEl.scrollTop = before;
            if (canScroll) return "internal";
          } else if (direction < 0 && !atTop) {
            const before = activeEl.scrollTop;
            activeEl.scrollTop = before - 1;
            const canScroll = activeEl.scrollTop < before;
            activeEl.scrollTop = before;
            if (canScroll) return "internal";
          }
        }
      }

      const target = index + direction;

      if (target < 0) {                         // up → back into the hero
        snapTo(Math.max(0, firstP - slideH));
        return "snap";
      }
      if (target > points.length - 1) {         // down → to the footer
        snapTo(document.documentElement.scrollHeight);
        return "snap";
      }

      // Prime the incoming card so re-entry feels natural.
      const incoming = sectionRefs.current[target];
      if (incoming) {
        const incomingMax = incoming.scrollHeight - incoming.clientHeight;
        incoming.scrollTop = direction > 0 ? 0 : Math.max(0, incomingMax);
      }

      snapTo(points[target]);
      return "snap";
    };

    // ── Wheel ──
    const onWheel = (e) => {
      const points = snapPoints();
      if (!points.length) return;
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      // Deep hero: leave ScrollHero's native scroll-driven animation alone.
      // Hero-exit + stack: take control so the handoff snaps cleanly.
      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      if (busy) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 4) return;

      const result = step(e.deltaY > 0 ? 1 : -1);
      // Only block native scroll when we actually snap; allow hero-up /
      // internal card scroll to use the browser's native path.
      if (result === "snap") e.preventDefault();
    };

    // ── Touch ──
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      const points = snapPoints();
      if (!points.length) return;
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      if (busy) { e.preventDefault(); return; }
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 40) return;

      const result = step(dy > 0 ? 1 : -1);
      if (result === "snap") {
        e.preventDefault();
        touchStartY = e.touches[0].clientY;
      }
    };

    // ── Keyboard ──
    const DOWN_KEYS = new Set(["ArrowDown", "PageDown", " ", "Spacebar"]);
    const UP_KEYS   = new Set(["ArrowUp", "PageUp"]);
    const onKeyDown = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      const isDown = DOWN_KEYS.has(e.key);
      const isUp = UP_KEYS.has(e.key);
      if (!isDown && !isUp) return;

      const points = snapPoints();
      if (!points.length) return;
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      if (busy) { e.preventDefault(); return; }
      const result = step(isDown ? 1 : -1);
      if (result === "snap") e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scrollend", onScrollEnd);
      clearTimers();
    };
  }, []);

  const setSectionRef = (i) => (el) => { sectionRefs.current[i] = el; };

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

        /* ── Sticky overlay cards (identical on mobile + desktop) ──
              Fixed to one viewport below the navbar. Content taller than the
              card scrolls INSIDE it; the controller advances to the next card
              only once you reach the edge. ── */
        .home-slide {
          position: sticky;
          top: ${NAV_HEIGHT}px;
          z-index: var(--slide-z, 1);
          background: ${SLIDE_BG};
          height: calc(100svh - ${NAV_HEIGHT}px);
          min-height: calc(100svh - ${NAV_HEIGHT}px);
          flex-shrink: 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          scroll-margin-top: ${NAV_HEIGHT}px;
          clip-path: inset(0 0 0 0 round 14px 14px 0 0);
          box-shadow: 0 -1px 0 0 rgba(255,255,255,0.12),
                      0 -6px 28px 0 rgba(0,0,0,0.6);
        }
        .home-slide::-webkit-scrollbar { display: none; }

        @media (max-width: 767px) {
          .home-slide { clip-path: inset(0 0 0 0 round 10px 10px 0 0); }
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
          <div className="home-slide" ref={setSectionRef(0)} style={{ ["--slide-z"]: 1, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <ProblemWordMap />
          </div>

          {/* 2 — Modules */}
          <div className="home-slide" ref={setSectionRef(1)} style={{ ["--slide-z"]: 2, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <PlatformSection navbarHeight={NAV_HEIGHT} />
          </div>

          {/* 3 — The Platform Loop */}
          <div className="home-slide" ref={setSectionRef(2)} style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <FiveStepLoop />
          </div>

          {/* 4 — Impact / Stats */}
          <div className="home-slide" ref={setSectionRef(3)} style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <Processes />
          </div>

          {/* 5 — The Stack */}
          <div className="home-slide" ref={setSectionRef(4)} style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <LogoStream />
          </div>

          {/* 6 — Testimonials */}
          <div className="home-slide" ref={setSectionRef(5)} style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <TestimonialSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
