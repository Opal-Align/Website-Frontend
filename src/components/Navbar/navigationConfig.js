/**
 * Single source of truth for nav targets used by both the top bar
 * (large screens) and the full-screen overlay (small screens).
 *
 * Homepage section map (top → bottom):
 *   #problem      → Info/ProblemWordMap.jsx
 *   #platform     → Info/PlatformSection.jsx   (platform — four services)
 *   #loop         → Info/FiveStepLoop.jsx      (The Platform — gOS loop)
 *   #impact       → Info/Stats.jsx
 *   #stack        → LogoStream/LogoStream.jsx
 *   #testimonials → Info/Testimonial.tsx
 *
 *   home          → null  (scroll to top)
 *   contact       → "/contact-us"
 */

/** Visual height of the fixed navbar (py-4 + h-8 logo ≈ 64px).
 *  Used for: sticky top, section heights, scroll-margin-top. */
export const NAV_HEIGHT = 64;
/** Kept as alias — external code may import either name. */
export const NAV_SCROLL_OFFSET = NAV_HEIGHT;

export const NAV_TARGET = {
  home: null,
  problem: "#problem",
  platform: "#platform",
  loop: "#loop",
  impact: "#impact",
  stack: "#stack",
  testimonials: "#testimonials",
  contact: "/contact-us",
};

/** Full-screen overlay — page order */
export const OVERLAY_NAV_ITEMS = [
  { key: "home", label: "Home", target: NAV_TARGET.home },
  { key: "problem", label: "The Problem", target: NAV_TARGET.problem },
  { key: "platform", label: "The Platform", target: NAV_TARGET.platform },
  { key: "loop", label: "The gOS Loop", target: NAV_TARGET.loop },
  { key: "impact", label: "Impact", target: NAV_TARGET.impact },
  { key: "stack", label: "The Stack", target: NAV_TARGET.stack },
  { key: "testimonials", label: "Testimonials", target: NAV_TARGET.testimonials },
  { key: "contact", label: "Contact", target: NAV_TARGET.contact },
];

/** Desktop top bar — logo is home, links mirror page scroll order (1 → 6) */
export const NAVBAR_LINKS = {
  left: [
    { key: "problem", label: "The Problem", target: NAV_TARGET.problem },   // 1
    { key: "platform", label: "The Platform",     target: NAV_TARGET.platform },  // 2
    { key: "loop",    label: "The gOS Loop",target: NAV_TARGET.loop },      // 3
  ],
  right: [
    { key: "impact",        label: "Impact",       target: NAV_TARGET.impact },        // 4
    { key: "stack",         label: "The Stack",    target: NAV_TARGET.stack },         // 5
    { key: "testimonials",  label: "Testimonials", target: NAV_TARGET.testimonials },  // 6
    { key: "contact",       label: "Contact",      target: NAV_TARGET.contact, accent: true },
  ],
};

/**
 * Smoothly move to a nav target.
 * @param {string|null} target
 *   - `null`      → scroll to top of page
 *   - starts "/"  → react-router navigate
 *   - otherwise   → CSS selector (e.g. "#services") scrolled into view
 * @param {import("react-router-dom").NavigateFunction} navigate
 * @param {{ afterCloseMs?: number }} [options]
 */
export function goToTarget(target, navigate, options = {}) {
  const { afterCloseMs = 0 } = options;

  const run = () => {
    if (target == null) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (typeof target === "string" && target.startsWith("/")) {
      navigate(target);
      return;
    }

    const el = document.querySelector(target);
    if (!el) return;

    const slide = el.closest(".home-slide");

    if (slide) {
      // Sticky elements are always considered "in view" by the browser once
      // they've adhered — so getBoundingClientRect, offsetTop, and
      // scrollIntoView all fail for backward navigation.
      //
      // Fix: collect all .home-slide wrappers, find the target's index, then
      // compute the raw scroll position from the CONTAINER's document offset
      // (the container itself is not sticky, so getBoundingClientRect is
      // reliable) + index × section height.  This works in both directions.
      const slides = [...document.querySelectorAll(".home-slide")];
      const index = slides.indexOf(slide);
      if (index === -1) return;

      const container = slide.parentElement;
      // container is position:relative (not sticky) → rect is always accurate.
      // Round to match HomePageLayout.snapPoints() exactly — a fractional
      // anchor on high-DPI/zoomed monitors otherwise lands the nav jump a few
      // px off from where the scroll controller expects the snap point, which
      // can strand the view between two sticky cards.
      const containerDocTop = Math.round(
        container.getBoundingClientRect().top + window.scrollY,
      );

      // Sum the ACTUAL measured slide heights up to the target instead of
      // assuming every card is exactly innerHeight - NAV_HEIGHT. This mirrors
      // the layout's snapPoints() so nav clicks and wheel/touch snaps agree.
      const fallbackH = Math.max(1, Math.round(window.innerHeight - NAV_HEIGHT));
      let acc = 0;
      for (let i = 0; i < index; i += 1) {
        const el = slides[i];
        acc += el && el.offsetHeight > 0 ? el.offsetHeight : fallbackH;
      }

      const scrollTop = containerDocTop + acc - NAV_HEIGHT;
      window.scrollTo({ top: Math.max(0, scrollTop), behavior: "smooth" });
      return;
    }

    // Fallback for non-sticky targets (e.g. footer)
    const top =
      el.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  if (afterCloseMs > 0) {
    setTimeout(run, afterCloseMs);
  } else {
    run();
  }
}
