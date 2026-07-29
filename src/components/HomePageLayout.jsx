import { createContext, lazy, Suspense, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar/Navbar";
import ScrollHero from "./HomeHero/ScrollHero";
import FiveStepLoop, {
  FiveStepLoopOrbit,
  FiveStepLoopCards,
} from "./Info/FiveStepLoop.jsx";
import { NAV_HEIGHT } from "./Navbar/navigationConfig";

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

// Context intentionally lives here so the scroll container and its consumers
// share the same exported source of truth.
// eslint-disable-next-line react-refresh/only-export-components
export const ScrollContainerContext = createContext(null);

const prefetchers = {
  mobile: {
    0: () => import("./Info/ProblemWordMap.jsx"),
    1: () => import("./Info/PlatformSection.jsx"),
    4: () => import("./Info/Stats.jsx"),
    5: () => import("./Info/Stats.jsx"),
    6: () => import("./LogoStream/LogoStream"),
    7: () => import("./Info/Testimonial"),
  },
  desktop: {
    0: () => import("./Info/ProblemWordMap.jsx"),
    1: () => import("./Info/PlatformSection.jsx"),
    3: () => import("./Info/Stats.jsx"),
    4: () => import("./LogoStream/LogoStream"),
    5: () => import("./Info/Testimonial"),
  },
};

const SLIDE_BG = "#0a0a0a";
const MOBILE_BP = 767;
/** Quiet gap that ends a wheel/trackpad gesture (same continuous spin = one section). */
const GESTURE_IDLE_MS = 140;
/** Fallback if scrollend never fires while a section is animating. */
const ANIMATE_FALLBACK_MS = 700;

function SlideFallback() {
  return (
    <div
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
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
  const isMobile = useIsMobile();
  const prefetchedRef = useRef(new Set());
  const scrollContainerRef = useRef(null);

  // Prefetch chunks as user scrolls through sections
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const prefetchAround = (index) => {
      const map = isMobile ? prefetchers.mobile : prefetchers.desktop;
      [index, index + 1].forEach((i) => {
        const key = `${isMobile ? "m" : "d"}-${i}`;
        if (prefetchedRef.current.has(key)) return;
        const loader = map[i];
        if (!loader) return;
        prefetchedRef.current.add(key);
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
        idle(() => loader().catch(() => {}));
      });
    };

    setTimeout(() => prefetchAround(0), 600);

    let scrollRaf = 0;
    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const slides = container.querySelectorAll(".home-slide");
        let current = 0;
        const mid =
          container.getBoundingClientRect().top + container.clientHeight * 0.5;
        slides.forEach((slide, i) => {
          if (slide.getBoundingClientRect().top <= mid) current = i;
        });
        prefetchAround(current);
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(scrollRaf);
    };
  }, [isMobile]);

  // One continuous wheel/trackpad gesture → exactly one snap stop.
  // Free-scroll flings never skip sections; a short pause starts a new gesture.
  // Hero still has two stops: logo → revealed words → first content slide.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animating = false;
    let usedThisGesture = false;
    let gestureIdleTimer = null;
    let animateFallbackTimer = null;
    let settleRaf = 0;

    const snapTargets = () =>
      [
        ...container.querySelectorAll(
          ".hero-snap, .hero-reveal-snap, .home-slide, .footer-snap",
        ),
      ];

    const nearestIndex = (targets) => {
      const origin = container.getBoundingClientRect().top;
      let idx = 0;
      let best = Infinity;
      for (let i = 0; i < targets.length; i += 1) {
        const d = Math.abs(targets[i].getBoundingClientRect().top - origin);
        if (d < best) {
          best = d;
          idx = i;
        }
      }
      return idx;
    };

    const scrollTopOf = (el) =>
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop;

    const restoreSnap = () => {
      container.style.scrollSnapType = "";
    };

    const finishAnimate = () => {
      if (!animating) return;
      animating = false;
      clearTimeout(animateFallbackTimer);
      cancelAnimationFrame(settleRaf);
      restoreSnap();
    };

    const watchSettle = (targetTop) => {
      clearTimeout(animateFallbackTimer);
      cancelAnimationFrame(settleRaf);

      const tick = () => {
        if (Math.abs(container.scrollTop - targetTop) <= 2) {
          finishAnimate();
          return;
        }
        settleRaf = requestAnimationFrame(tick);
      };
      settleRaf = requestAnimationFrame(tick);
      animateFallbackTimer = setTimeout(finishAnimate, ANIMATE_FALLBACK_MS);
    };

    const onScrollEnd = () => finishAnimate();

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 4) return;

      // Internal scroll cards (Stats) keep native scrolling until their edge.
      const nested = e.target.closest?.('[data-card-scroll="auto"]');
      if (nested instanceof HTMLElement) {
        const max = nested.scrollHeight - nested.clientHeight;
        if (max > 8) {
          const atTop = nested.scrollTop <= 2;
          const atBottom = nested.scrollTop >= max - 2;
          if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
            return;
          }
        }
      }

      // Always own the scroll so a free-scroll fling cannot skip sections.
      e.preventDefault();

      // Same continuous spin = one gesture. Only a quiet gap starts a new one.
      clearTimeout(gestureIdleTimer);
      gestureIdleTimer = setTimeout(() => {
        usedThisGesture = false;
      }, GESTURE_IDLE_MS);

      if (animating || usedThisGesture) return;

      const targets = snapTargets();
      if (!targets.length) return;

      const index = nearestIndex(targets);
      const direction = e.deltaY > 0 ? 1 : -1;
      const next = Math.max(0, Math.min(targets.length - 1, index + direction));
      if (next === index) return;

      usedThisGesture = true;
      animating = true;

      // Disable snap during the programmatic move so mandatory snap cannot
      // fight smooth scroll or overshoot into a later section.
      container.style.scrollSnapType = "none";

      const top = scrollTopOf(targets[next]);
      container.scrollTo({ top, behavior: "smooth" });
      watchSettle(top);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scrollend", onScrollEnd);
    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scrollend", onScrollEnd);
      clearTimeout(gestureIdleTimer);
      clearTimeout(animateFallbackTimer);
      cancelAnimationFrame(settleRaf);
      restoreSnap();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        ["--page-nav-h"]: `${NAV_HEIGHT}px`,
        ["--snap-h"]: `calc(100vh - ${NAV_HEIGHT}px)`,
      }}
    >
      <style>{`
        /* Snap viewport sits BELOW the fixed navbar so headers never tuck under it. */
        .snap-container {
          position: absolute;
          top: ${NAV_HEIGHT}px;
          left: 0;
          right: 0;
          bottom: 0;
          height: var(--snap-h);
          overflow-y: scroll;
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          overscroll-behavior-y: contain;
        }
        .snap-container::-webkit-scrollbar { display: none; }

        /* Two-stage hero: logo at the start, revealed words at the second stop. */
        .hero-snap {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          position: relative;
          flex-shrink: 0;
          height: calc(var(--snap-h) * 1.7);
        }
        .hero-reveal-snap {
          position: absolute;
          top: calc(var(--snap-h) * 0.7);
          left: 0;
          width: 1px;
          height: 1px;
          pointer-events: none;
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }

        .home-slide {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          height: var(--snap-h);
          min-height: var(--snap-h);
          max-height: var(--snap-h);
          flex-shrink: 0;
          overflow: hidden;
          background: ${SLIDE_BG};
          position: relative;
          clip-path: inset(0 0 0 0 round 14px 14px 0 0);
          box-shadow:
            0 -1px 0 0 rgba(255,255,255,0.12),
            0 -6px 28px 0 rgba(0,0,0,0.6);
        }

        .home-slide[data-card-scroll="auto"] {
          overflow-y: auto;
          scrollbar-width: none;
        }
        .home-slide[data-card-scroll="auto"]::-webkit-scrollbar { display: none; }

        /* Footer must be a snap target or mandatory snap keeps you on the last card. */
        .footer-snap {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          min-height: var(--snap-h);
          flex-shrink: 0;
          position: relative;
        }

        .home-glow {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: #0a0a0a;
        }
        .home-glow-inner {
          position: sticky;
          top: 0;
          height: var(--snap-h);
          background:
            radial-gradient(ellipse at 15% 20%, rgba(96,165,250,0.07) 0%, transparent 45%),
            radial-gradient(ellipse at 82% 70%, rgba(34,211,238,0.06) 0%, transparent 42%);
        }

        .navbar-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        @media (max-width: 767px) {
          .home-slide { clip-path: inset(0 0 0 0 round 10px 10px 0 0); }
        }
      `}</style>

      <div className="navbar-fixed">
        <Navbar />
      </div>

      <ScrollContainerContext.Provider value={scrollContainerRef}>
        <div ref={scrollContainerRef} className="snap-container">
          <div className="hero-snap">
            <ScrollHero />
            <div className="hero-reveal-snap" aria-hidden="true" />
          </div>

          <div style={{ position: "relative" }}>
            <div aria-hidden className="home-glow">
              <div className="home-glow-inner" />
            </div>

            <div
              key={isMobile ? "mobile" : "desktop"}
              style={{ position: "relative", zIndex: 1 }}
            >
              <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 1 }}>
                <Suspense fallback={<SlideFallback />}>
                  <ProblemWordMap />
                </Suspense>
              </div>

              <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 2 }}>
                <Suspense fallback={<SlideFallback />}>
                  <PlatformSection navbarHeight={NAV_HEIGHT} />
                </Suspense>
              </div>

              {isMobile ? (
                <>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 3 }}>
                    <FiveStepLoopOrbit />
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 4 }}>
                    <FiveStepLoopCards />
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 5 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <ImpactNarrative />
                    </Suspense>
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 6 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <ImpactMetrics />
                    </Suspense>
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 7 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <LogoStream />
                    </Suspense>
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 8 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <TestimonialSection />
                    </Suspense>
                  </div>
                </>
              ) : (
                <>
                  <div className="home-slide" style={{ ["--slide-z"]: 3 }}>
                    <FiveStepLoop />
                  </div>
                  <div className="home-slide" data-card-scroll="auto" style={{ ["--slide-z"]: 4 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <Processes />
                    </Suspense>
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 5 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <LogoStream />
                    </Suspense>
                  </div>
                  <div className="home-slide" data-card-scroll="none" style={{ ["--slide-z"]: 6 }}>
                    <Suspense fallback={<SlideFallback />}>
                      <TestimonialSection />
                    </Suspense>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="footer-snap">
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </div>
        </div>
      </ScrollContainerContext.Provider>
    </div>
  );
}
