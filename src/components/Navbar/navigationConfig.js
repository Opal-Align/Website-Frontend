/**
 * Single source of truth for nav targets used by both the top bar
 * (large screens) and the full-screen overlay (small screens).
 *
 * Homepage section map (top → bottom):
 *   #problem      → Info/ProblemWordMap.jsx
 *   #platform     → Info/PlatformSection.jsx   (Modules — four services)
 *   #loop         → Info/FiveStepLoop.jsx      (The Platform — gOS loop)
 *   #impact       → Info/Stats.jsx
 *   #stack        → LogoStream/LogoStream.jsx
 *   #testimonials → Info/Testimonial.tsx
 *
 *   home          → null  (scroll to top)
 *   contact       → "/contact-us"
 */

/** Fixed navbar clearance — keep section tops visible below the bar */
export const NAV_SCROLL_OFFSET = 80;

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
  { key: "modules", label: "Modules", target: NAV_TARGET.platform },
  { key: "loop", label: "The Platform", target: NAV_TARGET.loop },
  { key: "impact", label: "Impact", target: NAV_TARGET.impact },
  { key: "stack", label: "The Stack", target: NAV_TARGET.stack },
  { key: "testimonials", label: "Testimonials", target: NAV_TARGET.testimonials },
  { key: "contact", label: "Contact", target: NAV_TARGET.contact },
];

/** Desktop top bar — logo is home */
export const NAVBAR_LINKS = {
  left: [
    { key: "problem", label: "The Problem", target: NAV_TARGET.problem },
    { key: "modules", label: "Modules", target: NAV_TARGET.platform },
    { key: "loop", label: "The Platform", target: NAV_TARGET.loop },
  ],
  right: [
    { key: "stack", label: "The Stack", target: NAV_TARGET.stack },
    { key: "impact", label: "Impact", target: NAV_TARGET.impact },
    { key: "testimonials", label: "Testimonials", target: NAV_TARGET.testimonials },
    { key: "contact", label: "Contact", target: NAV_TARGET.contact, accent: true },
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
    if (el) {
      const top =
        el.getBoundingClientRect().top +
        window.scrollY -
        NAV_SCROLL_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  };

  if (afterCloseMs > 0) {
    setTimeout(run, afterCloseMs);
  } else {
    run();
  }
}
