import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar/Navbar";
import ScrollHero from "./HomeHero/ScrollHero";
import { LoopSessionProvider } from "./Info/LoopSession.jsx";
import FiveStepLoop, {
  FiveStepLoopOrbit,
  FiveStepLoopCards,
} from "./Info/FiveStepLoop.jsx";
import { NAV_HEIGHT } from "./Navbar/navigationConfig";

/* Below-fold sections — code-split so first paint only pays for hero + nav.
   FiveStepLoop stays eager: lazy chunks were blanking the page on iPhone. */
const Footer = lazy(() => import("./Footer"));
const LogoStream = lazy(() => import("./LogoStream/LogoStream"));
const Processes = lazy(() => import("./Info/Stats.jsx"));
const ImpactNarrative = lazy(() =>
  import("./Info/Stats.jsx").then((m) => ({ default: m.ImpactNarrative })),
);
const ImpactMetrics = lazy(() =>
  import("./Info/Stats.jsx").then((m) => ({ default: m.ImpactMetrics })),
);
const TestimonialSection = lazy(() => import("./Info/Testimonial"));
const ProblemWordMap = lazy(() => import("./Info/ProblemWordMap.jsx"));
const PlatformSection = lazy(() => import("./Info/PlatformSection.jsx"));

/* ─── Stacked-card scroll experience ───────────────────────────────────────
   Scroll controller unchanged from 2e84e8a.
   Desktop: full FiveStepLoop + Processes.
   Mobile:  Loop → orbit + cards; Impact → narrative + metrics. ─ */
const SLIDE_BG = "#07080D";
const OVERFLOW_EPS = 48;
const MOBILE_BP = 767;

/** Empty slide shell while a lazy section loads — keeps snap heights stable */
function SlideFallback() {
  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        background: SLIDE_BG,
      }}
    />
  );
}

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
  // Scroll effect stays on [] so desktop listeners never rebind; touch can
  // still read the latest breakpoint via this ref.
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;

  // Truncate ref slots when switching breakpoint so snapPoints doesn't
  // keep phantom entries. Does not rebind scroll listeners.
  useEffect(() => {
    const n = isMobile ? 8 : 6;
    sectionRefs.current = sectionRefs.current.slice(0, n);
  }, [isMobile]);

  /* Loop zone: mobile Orbit+Cards (2–3) count as one session; desktop Loop (2).
     Nearest snap index — sticky cards stay "in view", so useInView is unreliable. */
  const [loopZoneActive, setLoopZoneActive] = useState(false);
  const isMobileZoneRef = useRef(isMobile);
  isMobileZoneRef.current = isMobile;

  useEffect(() => {
    const nearestIndex = (points, y) => {
      let idx = 0, best = Infinity;
      points.forEach((p, i) => {
        const d = Math.abs(p - y);
        if (d < best) { best = d; idx = i; }
      });
      return idx;
    };

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

    const updateZone = () => {
      const points = snapPoints();
      if (!points.length) return;
      const idx = nearestIndex(points, window.scrollY);
      const inZone = isMobileZoneRef.current
        ? idx === 2 || idx === 3
        : idx === 2;
      setLoopZoneActive((prev) => (prev === inZone ? prev : inZone));
    };

    updateZone();
    window.addEventListener("scroll", updateZone, { passive: true });
    window.addEventListener("resize", updateZone);
    return () => {
      window.removeEventListener("scroll", updateZone);
      window.removeEventListener("resize", updateZone);
    };
  }, [isMobile]);

  useEffect(() => {
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

    // Card scrollability for the active .home-slide.
    // Platform / Problem are always one-viewport snaps (never "internal").
    // Stats (#impact) and other tall cards may scroll inside first.
    const ONE_SHOT_IDS = new Set(["platform", "problem"]);
    const cardScrollInfo = (el) => {
      if (!el) return { scrollable: false, atTop: true, atBottom: true };
      if (el.dataset.cardScroll === "none") {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      const idEl = el.querySelector("[id]");
      if (idEl && ONE_SHOT_IDS.has(idEl.id)) {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= OVERFLOW_EPS) {
        return { scrollable: false, atTop: true, atBottom: true };
      }
      // Phantom overflow: metrics say tall but scrollTop can't move
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
      // Mobile only: swallow synthetic wheel after a finger swipe so touch +
      // wheel can't each advance a section. Desktop/trackpad stays free.
      if (
        isMobileRef.current &&
        Date.now() - lastTouchAt < TOUCH_WHEEL_MUTE_MS
      ) {
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

    // ── Touch (one finger gesture = one action) ──────────────────────────
    // • Platform / one-viewport cards → one swipe = one section snap
    // • Stats (tall) → this swipe only scrolls inside the card; lift finger,
    //   swipe again at the edge → next section. Never multi-skip.
    //
    // Important: iOS often fires `touchcancel` when window.scrollTo runs.
    // We must NOT clear the snap lock on cancel/end — only on a NEW
    // touchstart — or a long swipe will chain into the next section.
    let touchStartY = 0;
    let touchLastY = 0;
    let touchMode = null;       // null | "internal" | "snap"
    let gestureId = 0;
    let snappedForGesture = -1; // gestureId that already snapped once
    let internalForGesture = -1; // gestureId locked to in-card scroll only

    const onTouchStart = (e) => {
      lastTouchAt = Date.now();
      // New finger-down = new gesture. Previous snap/internal locks end here.
      gestureId += 1;
      touchStartY = e.touches[0].clientY;
      touchLastY = touchStartY;
      touchMode = null;
      // Still inside post-snap cooldown → don't allow another advance yet
      if (Date.now() < snapLockUntil) {
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

      if (y < firstP - slideH - 4) return;
      if (y > lastP + 4) return;

      // Already snapped this finger-down — swallow everything until lift
      if (busy || snappedForGesture === gestureId || Date.now() < snapLockUntil) {
        e.preventDefault();
        return;
      }

      const yNow = e.touches[0].clientY;
      const dyTotal = touchStartY - yNow;
      const dyFrame = touchLastY - yNow;
      touchLastY = yNow;

      if (Math.abs(dyTotal) < 10) return;
      const direction = dyTotal > 0 ? 1 : -1;

      // Hero exit → snap onto first card (one shot)
      if (y < firstP - 4) {
        if (direction > 0 && y >= firstP - slideH - 4) {
          // Mobile: hold native scroll in the takeover zone (same as wheel).
          if (isMobileRef.current) e.preventDefault();
          if (Math.abs(dyTotal) >= 48) {
            e.preventDefault();
            const result = step(1);
            if (result === "snap" || result === "locked") {
              snappedForGesture = gestureId;
            }
          }
        }
        return;
      }

      const index = nearestIndex(points, y);
      const activeEl = sectionRefs.current[index];
      const info = cardScrollInfo(activeEl);

      // Lock gesture intent once — never flip from internal → snap mid-swipe
      // (reaching the end of Stats mid-gesture must NOT load the next section)
      if (!touchMode) {
        if (internalForGesture === gestureId) {
          touchMode = "internal";
        } else if (
          info.scrollable &&
          ((direction > 0 && !info.atBottom) || (direction < 0 && !info.atTop))
        ) {
          touchMode = "internal";
          internalForGesture = gestureId;
        } else if (!info.scrollable && isMobileRef.current) {
          // Mobile one-shot card: block window scroll immediately so sticky
          // snap points stay aligned, then advance once (matches desktop wheel).
          // Desktop touch / wheel paths are unchanged.
          e.preventDefault();
          if (Math.abs(dyTotal) >= 48) {
            touchMode = "snap";
          } else {
            return;
          }
        } else if (Math.abs(dyTotal) >= 48) {
          touchMode = "snap";
        } else {
          return;
        }
      }

      if (touchMode === "internal") {
        e.preventDefault();
        if (activeEl) activeEl.scrollTop += dyFrame;
        // Stay internal for the rest of this gesture, even at the edge.
        return;
      }

      // snap mode — fire step exactly once for this finger-down
      e.preventDefault();
      const result = step(direction);
      if (result === "snap" || result === "locked") {
        snappedForGesture = gestureId;
      }
    };

    // Do not clear snap/internal locks here — touchcancel fires on iOS
    // during scrollTo and would otherwise allow a second section advance.
    const onTouchEnd = () => {
      lastTouchAt = Date.now();
      touchMode = null;
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

        {/* ── Section stack: desktop full Loop/Impact; mobile split ── */}
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
            <Suspense fallback={<SlideFallback />}>
              <ProblemWordMap />
            </Suspense>
          </div>

          <div className="home-slide" ref={setSectionRef(1)} data-card-scroll="none" style={{ ["--slide-z"]: 2, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
            <Suspense fallback={<SlideFallback />}>
              <PlatformSection navbarHeight={NAV_HEIGHT} />
            </Suspense>
          </div>

          {isMobile ? (
            <>
              <LoopSessionProvider zoneActive={loopZoneActive}>
                <div className="home-slide" ref={setSectionRef(2)} data-card-scroll="none" style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                  <FiveStepLoopOrbit />
                </div>
                <div className="home-slide" ref={setSectionRef(3)} data-card-scroll="none" style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                  <FiveStepLoopCards />
                </div>
              </LoopSessionProvider>
              <div className="home-slide" ref={setSectionRef(4)} data-card-scroll="none" style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <ImpactNarrative />
                </Suspense>
              </div>
              <div className="home-slide" ref={setSectionRef(5)} data-card-scroll="none" style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <ImpactMetrics />
                </Suspense>
              </div>
              <div className="home-slide" ref={setSectionRef(6)} data-card-scroll="none" style={{ ["--slide-z"]: 7, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <LogoStream />
                </Suspense>
              </div>
              <div className="home-slide" ref={setSectionRef(7)} style={{ ["--slide-z"]: 8, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <TestimonialSection />
                </Suspense>
              </div>
            </>
          ) : (
            <>
              <LoopSessionProvider zoneActive={loopZoneActive}>
                <div className="home-slide" ref={setSectionRef(2)} style={{ ["--slide-z"]: 3, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                  <FiveStepLoop />
                </div>
              </LoopSessionProvider>
              <div className="home-slide" ref={setSectionRef(3)} data-card-scroll="auto" style={{ ["--slide-z"]: 4, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <Processes />
                </Suspense>
              </div>
              <div className="home-slide" ref={setSectionRef(4)} data-card-scroll="none" style={{ ["--slide-z"]: 5, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <LogoStream />
                </Suspense>
              </div>
              <div className="home-slide" ref={setSectionRef(5)} style={{ ["--slide-z"]: 6, ["--page-nav-h"]: `${NAV_HEIGHT}px` }}>
                <Suspense fallback={<SlideFallback />}>
                  <TestimonialSection />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
