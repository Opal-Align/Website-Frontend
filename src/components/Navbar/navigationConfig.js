/**
 * Single source of truth for nav targets used by both the top bar
 * (large screens) and the full-screen overlay (small screens).
 *
 * Each target maps to a section actually rendered in HomePageLayout.jsx:
 *   #system       → Info/Mechanism.jsx          (the operating-system explainer)
 *   #modules      → Info/ModuleSection.jsx      (Relay / Collect / Produce / Schedule)
 *   #impact       → Info/Stats.jsx              (numbers / proof)
 *   #services     → Info/HeroFlow.jsx           (services + flow)
 *   #testimonials → Info/Testimonial.tsx        (voices from the field)
 *
 *   home          → null  (scrolls to top)
 *   contact       → "/contact-us"  (route)
 */

export const NAV_TARGET = {
  home: null,
  system: "#system",
  modules: "#modules",
  impact: "#impact",
  services: "#services",
  testimonials: "#testimonials",
  contact: "/contact-us",
};

/** Items used inside the full-screen overlay (mobile / hamburger menu). */
export const OVERLAY_NAV_ITEMS = [
  { key: "home", label: "Home", target: NAV_TARGET.home },
  { key: "system", label: "Platform", target: NAV_TARGET.system },
  { key: "modules", label: "Modules", target: NAV_TARGET.modules },
  { key: "impact", label: "Impact", target: NAV_TARGET.impact },
  { key: "testimonials", label: "Testimonials", target: NAV_TARGET.testimonials },
  { key: "contact", label: "Contact", target: NAV_TARGET.contact },
];

/**
 * Items used by the desktop top bar.
 * The logo handles "home", so we don't repeat it here.
 * The last item on the right (`accent: true`) is rendered as a gradient
 * call-to-action.
 */
export const NAVBAR_LINKS = {
  left: [
    { key: "system", label: "Platform", target: NAV_TARGET.system },
    { key: "modules", label: "Modules", target: NAV_TARGET.modules },
  ],
  right: [
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
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (afterCloseMs > 0) {
    setTimeout(run, afterCloseMs);
  } else {
    run();
  }
}
