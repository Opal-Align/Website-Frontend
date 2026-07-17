import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import LogoStream from "./LogoStream/LogoStream";
import Processes, { ImpactNarrative, ImpactMetrics } from "./Info/Stats.jsx";
import TestimonialSection from "./Info/Testimonial";
import ScrollHero from "./HomeHero/ScrollHero";
import ProblemWordMap from "./Info/ProblemWordMap.jsx";
import PlatformSection from "./Info/PlatformSection.jsx";
import FiveStepLoop, {
  FiveStepLoopOrbit,
  FiveStepLoopCards,
} from "./Info/FiveStepLoop.jsx";
import { NAV_HEIGHT } from "./Navbar/navigationConfig";

/* ─── Stacked-card scroll experience ───────────────────────────────────────
   Desktop: Loop + Impact stay as single full-viewport cards.
   Mobile:  those two are split into two cards each so one swipe = one card. ─ */
const SLIDE_BG = "#07080D";
const OVERFLOW_EPS = 48;
const MOBILE_BP = 767;

function useIsMobile(breakpoint = MOBILE_BP) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

export default function HomePageLayout() {
  const stackRef = useRef(null);
  const sectionRefs = useRef([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    sectionRefs.current = [];

    let busy = false;            // true while a programmatic snap is in flight
    let releaseTimer = null;
    let fallbackTimer = null;

    // Absolute document Y for each card's top, flush under the navbar.
    // Prefer measured card heights (mobile URL-bar / svh vs innerHeight can
    // diverge). Fall back to index × viewport slot when a card isn't ready.
    const snapPoints = () => {
      const container = stackRef.current;
      if (!container) return [];
      const containerTop =
        container.getBoundingClientRect().top + window.scrollY;
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);
      let acc = 0;
      return sectionRefs.current.map((el) => {
        const point = Math.max(0, containerTop + acc - NAV_HEIGHT);
        const h = el && el.offsetHeight > 0 ? el.offsetHeight : slideH;
        acc += h;
        return point;
      });
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

    // After any section change, block further snaps so a long swipe / fling
    // cannot chain Stats → LogoStream → Testimonials in one go.
    let snapLockUntil = 0;
    let pendingSnapTop = null;
    // Wheel mute window (also used by snapTo to kill iOS synthetic wheels)
    let wheelIgnoreUntil = 0;
    let wheelQuietTimer = null;
    // Finger activity — phones synthesize `wheel` from touch; while a finger
    // session is recent, only the touch handler may advance sections.
    let lastTouchAt = 0;
    const TOUCH_WHEEL_MUTE_MS = 1500;

    const snapTo = (top) => {
      // No-op guard: if we're already at (or within 1px of) the target, the
      // browser won't move and will never fire `scrollend`, leaving `busy`
      // stuck true for the full fallback window. Release immediately instead.
      if (Math.abs(top - window.scrollY) < 1) {
        busy = false;
        pendingSnapTop = null;
        return;
      }
      busy = true;
      pendingSnapTop = top;
      // Block a second section change while this animation runs + a short beat
      // after it settles (stops Stats → LogoStream → Testimonials chaining).
      const lockMs = 1000;
      snapLockUntil = Date.now() + lockMs;
      // Phones also emit synthetic `wheel` events from the same finger fling —
      // swallow those so touch + wheel can't each advance one section.
      wheelIgnoreUntil = Date.now() + lockMs;
      clearTimeout(wheelQuietTimer);
      wheelQuietTimer = setTimeout(() => { wheelIgnoreUntil = 0; }, lockMs);
      clearTimers();
      window.scrollTo({ top, behavior: "smooth" });

      // Safety net + hard clamp to the exact target if the engine overshoots.
      fallbackTimer = setTimeout(() => {
        if (pendingSnapTop != null) {
          if (Math.abs(window.scrollY - pendingSnapTop) > 1) {
            window.scrollTo({ top: pendingSnapTop, behavior: "auto" });
          }
          pendingSnapTop = null;
        }
        busy = false;
      }, lockMs);
    };

    // Released shortly AFTER the smooth scroll truly settles, so trailing
    // momentum from a trackpad fling is swallowed instead of skipping ahead.
    const onScrollEnd = () => {
      if (pendingSnapTop != null) {
        if (Math.abs(window.scrollY - pendingSnapTop) > 2) {
          window.scrollTo({ top: pendingSnapTop, behavior: "auto" });
        }
        pendingSnapTop = null;
      }
      if (!busy) return;
      clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => { busy = false; }, 160);
    };

    // Card scrollability. When every slide is one-viewport (data-card-scroll
    // = "none"), every gesture advances exactly one section — same as desktop.
    const cardScrollInfo = (el) => {
      if (!el) return { scrollable: false, atTop: true, atBottom: true };
      if (el.dataset.cardScroll === "none") {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      // Mobile stack is entirely one-shot now
      if (isMobile) {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= OVERFLOW_EPS) {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      const before = el.scrollTop;
      el.scrollTop = before + 1;
      const canDown = el.scrollTop > before;
      el.scrollTop = before > 0 ? before - 1 : before;
      const canUp = before > 0 && el.scrollTop < before;
      el.scrollTop = before;
      if (!canDown && !canUp) {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      const EDGE = 8;
      return {
        scrollable: true,
        atTop: el.scrollTop <= EDGE,
        atBottom: el.scrollTop >= maxScroll - EDGE,
      };
    };

    // Decide + perform a step. Returns:
    //   "snap"     → we scrolled to a neighbour / boundary (block native)
    //   "internal" → let the card scroll its own overflow (allow native)
    //   "outside"  → we're in the hero/footer zone (allow native)
    const step = (direction) => {
      // Hard lock after a snap — one section change max until cooldown ends
      if (busy || Date.now() < snapLockUntil) return "locked";

      const points = snapPoints();
      if (!points.length) return "outside";
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      if (y > lastP + 4) return "outside";   // footer zone

      // Hero → first card: same controlled snap as every other section change.
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
      const info = cardScrollInfo(activeEl);

      // Tall card (e.g. Stats) → scroll inside before advancing.
      if (info.scrollable) {
        if (direction > 0 && !info.atBottom) return "internal";
        if (direction < 0 && !info.atTop) return "internal";
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
    // Desktop/trackpad only for advancing. On phones, the same finger swipe
    // also synthesizes wheel events — if we handle both, one gesture advances
    // two sections (Stats → LogoStream → Testimonials).
    const onWheel = (e) => {
      // Mute all wheel while a finger gesture is in play / just finished
      if (Date.now() - lastTouchAt < TOUCH_WHEEL_MUTE_MS) {
        e.preventDefault();
        return;
      }

      const points = snapPoints();
      if (!points.length) return;
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      if (busy || Date.now() < wheelIgnoreUntil || Date.now() < snapLockUntil) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;

      const result = step(e.deltaY > 0 ? 1 : -1);
      if (result === "snap" || result === "locked") {
        e.preventDefault();
        if (result === "snap") {
          wheelIgnoreUntil = Date.now() + 1000;
          clearTimeout(wheelQuietTimer);
          wheelQuietTimer = setTimeout(() => { wheelIgnoreUntil = 0; }, 1000);
        }
      }
    };

    // ── Touch: one finger gesture = one section (same as desktop wheel) ──
    // Snap on finger-up so a long fling cannot chain multiple sections.
    // Native page scroll is blocked inside the stack while a gesture is active.
    let touchStartY = 0;
    let touchLastY = 0;
    let gestureId = 0;
    let snappedForGesture = -1;
    let touchArmed = false; // true once we're inside the stack zone

    const TOUCH_SNAP_PX = 36;

    const onTouchStart = (e) => {
      lastTouchAt = Date.now();
      gestureId += 1;
      touchStartY = e.touches[0].clientY;
      touchLastY = touchStartY;
      touchArmed = false;
      if (Date.now() < snapLockUntil || busy) {
        snappedForGesture = gestureId;
      }
    };

    const onTouchMove = (e) => {
      lastTouchAt = Date.now();
      const points = snapPoints();
      if (!points.length) return;
      const y = window.scrollY;
      const firstP = points[0];
      const lastP = points[points.length - 1];
      const slideH = Math.max(1, window.innerHeight - NAV_HEIGHT);

      // Outside stack (deep hero / footer) → allow native scroll
      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      touchArmed = true;
      touchLastY = e.touches[0].clientY;
      // Hold the page still in the stack; snap happens once on finger-up.
      e.preventDefault();
    };

    const onTouchEnd = () => {
      lastTouchAt = Date.now();
      if (!touchArmed) return;
      if (busy || snappedForGesture === gestureId || Date.now() < snapLockUntil) return;

      const dy = touchStartY - touchLastY;
      if (Math.abs(dy) < TOUCH_SNAP_PX) return;

      const result = step(dy > 0 ? 1 : -1);
      if (result === "snap" || result === "locked") {
        snappedForGesture = gestureId;
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

      if (busy || Date.now() < snapLockUntil) { e.preventDefault(); return; }
      const result = step(isDown ? 1 : -1);
      if (result === "snap" || result === "locked") e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scrollend", onScrollEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scrollend", onScrollEnd);
      clearTimers();
      clearTimeout(wheelQuietTimer);
    };
  }, [isMobile]);

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

        /* ── Sticky overlay cards ──
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
          touch-action: pan-y;
          scrollbar-width: none;
          scroll-margin-top: ${NAV_HEIGHT}px;
          clip-path: inset(0 0 0 0 round 14px 14px 0 0);
          box-shadow: 0 -1px 0 0 rgba(255,255,255,0.12),
                      0 -6px 28px 0 rgba(0,0,0,0.6);
        }
        .home-slide::-webkit-scrollbar { display: none; }

        /* One-viewport cards (Platform, Problem): never nest-scroll on mobile */
        .home-slide[data-card-scroll="none"] {
          overflow-y: hidden;
        }

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

        {/* ── Section stack: desktop = full Loop/Impact; mobile = split ── */}
        <div
          key={isMobile ? "mobile" : "desktop"}
          ref={stackRef}
          style={{
            position: "relative",
            zIndex: 1,
            ["--page-nav-h"]: `${NAV_HEIGHT}px`,
          }}
        >
          <div className="home-slide" ref={setSectionRef(0)} data-card-scroll="none" style={{ ["--slide-z"]: 1, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <ProblemWordMap />
          </div>

          <div className="home-slide" ref={setSectionRef(1)} data-card-scroll="none" style={{ ["--slide-z"]: 2, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <PlatformSection navbarHeight={NAV_HEIGHT} />
          </div>

          {isMobile ? (
            <>
              <div className="home-slide" ref={setSectionRef(2)} data-card-scroll="none" style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <FiveStepLoopOrbit />
              </div>
              <div className="home-slide" ref={setSectionRef(3)} data-card-scroll="none" style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <FiveStepLoopCards />
              </div>
              <div className="home-slide" ref={setSectionRef(4)} data-card-scroll="none" style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <ImpactNarrative />
              </div>
              <div className="home-slide" ref={setSectionRef(5)} data-card-scroll="none" style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <ImpactMetrics />
              </div>
              <div className="home-slide" ref={setSectionRef(6)} data-card-scroll="none" style={{ ["--slide-z"]: 7, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <LogoStream />
              </div>
              <div className="home-slide" ref={setSectionRef(7)} data-card-scroll="none" style={{ ["--slide-z"]: 8, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <TestimonialSection />
              </div>
            </>
          ) : (
            <>
              <div className="home-slide" ref={setSectionRef(2)} data-card-scroll="none" style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <FiveStepLoop />
              </div>
              <div className="home-slide" ref={setSectionRef(3)} data-card-scroll="none" style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Processes />
              </div>
              <div className="home-slide" ref={setSectionRef(4)} data-card-scroll="none" style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <LogoStream />
              </div>
              <div className="home-slide" ref={setSectionRef(5)} data-card-scroll="none" style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <TestimonialSection />
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
