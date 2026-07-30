import { useCallback, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavigationOverlay from "./NavigationOverlay";
import { NAVBAR_LINKS, goToTarget } from "./navigationConfig";
import opalGosLogo from "../../assets/opal-gos-mark.webp";

const SECTION_IDS = ["problem", "platform", "loop", "impact", "stack", "testimonials"];

/**
 * Watches window scroll and returns the key of the section currently snapped
 * into view. Reads the DOM directly — no props or context needed.
 * Uses the same snap-point math as the scroll controller so the active state
 * always matches the visible card, even on the FiveStepLoopCards slide which
 * has no id of its own (we walk backwards to find the nearest keyed slide).
 */
function useActiveSection() {
  const [active, setActive] = useState(null);

  useEffect(() => {
    const update = () => {
      const slides = [...document.querySelectorAll(".home-slide")];
      if (!slides.length) {
        setActive(null);
        return;
      }

      const snap =
        document.querySelector(".snap-container") || slides[0].parentElement;
      if (!snap) {
        setActive(null);
        return;
      }

      const origin = snap.getBoundingClientRect().top;
      const mid = origin + snap.clientHeight * 0.45;

      // Hero zone — nothing highlighted
      const hero = snap.querySelector(".hero-snap");
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom > mid) {
          setActive((prev) => (prev === null ? prev : null));
          return;
        }
      }

      let idx = 0;
      slides.forEach((slide, i) => {
        if (slide.getBoundingClientRect().top <= mid) idx = i;
      });

      // Walk backwards from current slide to find the nearest one with a known id
      let found = null;
      for (let i = idx; i >= 0; i--) {
        found = SECTION_IDS.find((id) => slides[i].querySelector(`#${id}`)) ?? null;
        if (found) break;
      }

      setActive((prev) => (prev === found ? prev : found));
    };

    update();
    const snap = document.querySelector(".snap-container");
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    if (snap) {
      snap.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        snap.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(raf);
      };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}

const NAVY = "#08060C";
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 100%)";

const gradientText = {
  color: "#FFFFFF",
};

/**
 * Keep brand "gOS" casing when a parent uses CSS `uppercase`.
 * Other characters still uppercase via inheritance.
 */
function BrandAwareLabel({ children }) {
  const text = String(children ?? "");
  const parts = text.split(/(gOS)/g);
  if (parts.length === 1) return children;
  return parts.map((part, i) =>
    part === "gOS" ? (
      <span key={i} className="normal-case">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Pill button used on the large-screen nav bar.
 *  - default: subtle white border, white text, lilac border on hover
 *  - accent  (last CTA, e.g. "Contact"): gradient ring + gradient text
 */
function NavButton({ label, target, accent = false, isActive = false, onClick }) {
  if (accent) {
    return (
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onClick(target)}
        className="px-5 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase whitespace-nowrap cursor-pointer transition-shadow"
        style={{
          background: `
            linear-gradient(${NAVY}, ${NAVY}) padding-box,
            ${OPAL_LIGHT_GRADIENT} border-box
          `,
          border: "1px solid transparent",
          boxShadow: "0 0 0 rgba(255,255,255,0)",
        }}
      >
        <span style={gradientText}>
          <BrandAwareLabel>{label}</BrandAwareLabel>
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04, color: "#fff", borderColor: "rgba(255,255,255,0.55)" }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(target)}
      className="px-5 py-2 rounded-full border text-[11px] tracking-[0.18em] uppercase whitespace-nowrap cursor-pointer transition-colors"
      style={
        isActive
          ? {
              background: "rgba(255,255,255,0.09)",
              borderColor: "rgba(255,255,255,0.48)",
              color: "#fff",
            }
          : {
              borderColor: "rgba(255,255,255,0.18)",
              color: "#fff",
            }
      }
    >
      <BrandAwareLabel>{label}</BrandAwareLabel>
    </motion.button>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const activeKey = useActiveSection();

  const handleNav = useCallback(
    (target) => goToTarget(target, navigate),
    [navigate],
  );
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <style>{`
        .nav-logo-glow {
          filter: brightness(0) invert(1)
                  drop-shadow(0 0 8px rgba(255,255,255,0.85))
                  drop-shadow(0 0 20px rgba(255,255,255,0.45))
                  drop-shadow(0 0 40px rgba(255,255,255,0.22));
        }
      `}</style>
      <div
        className="fixed top-0 left-0 w-full z-90 px-6 md:px-10 py-3 md:py-4 backdrop-blur-md"
        style={{
          backgroundColor: "black",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* ───────── LARGE SCREENS (lg+) ───────── */}
        <div className="hidden lg:flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => handleNav(null)}
              className="cursor-pointer"
              aria-label="Home"
            >
              <img
                src={opalGosLogo}
                alt="OPAL gOS"
                className="nav-logo-glow h-7 w-auto select-none"
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </button>
            {NAVBAR_LINKS.left.map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                target={item.target}
                isActive={activeKey === item.key}
                onClick={handleNav}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {NAVBAR_LINKS.right.map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                target={item.target}
                accent={Boolean(item.accent)}
                isActive={!item.accent && activeKey === item.key}
                onClick={handleNav}
              />
            ))}
          </div>
        </div>

        {/* ───────── SMALL / MEDIUM SCREENS ───────── */}
        <div className="flex lg:hidden items-center justify-between">
          <button
            onClick={() => handleNav(null)}
            className="cursor-pointer"
            aria-label="Home"
          >
            <img
              src={opalGosLogo}
              alt="OPAL gOS"
              className="nav-logo-glow h-7 w-auto select-none"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </button>

          <motion.button
            onClick={() => setMenuOpen(true)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ borderColor: "rgba(255,255,255,0.6)" }}
            aria-label="Open navigation"
            className="w-10 h-10 flex items-center justify-center rounded-full border cursor-pointer transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.18)" }}
          >
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="1" y1="2" x2="17" y2="2" />
              <line x1="1" y1="7" x2="17" y2="7" />
              <line x1="1" y1="12" x2="17" y2="12" />
            </svg>
          </motion.button>
        </div>
      </div>

      <NavigationOverlay
        isOpen={menuOpen}
        onClose={closeMenu}
        activeKey={activeKey}
      />
    </>
  );
}
