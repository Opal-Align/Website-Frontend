import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavigationOverlay from "./NavigationOverlay";
import { NAVBAR_LINKS, goToTarget } from "./navigationConfig";
import opalGosLogo from "../../assets/opal-gos.svg";

const NAVY = "#08060C";
const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #B8EEFF 0%, #D4AAFF 30%, #FFB8F5 60%, #AAFFD4 100%)";

const gradientText = {
  backgroundImage: OPAL_LIGHT_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

/**
 * Pill button used on the large-screen nav bar.
 *  - default: subtle white border, white text, lilac border on hover
 *  - accent  (last CTA, e.g. "Contact"): gradient ring + gradient text
 */
function NavButton({ label, target, accent = false, onClick }) {
  if (accent) {
    return (
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => onClick(target)}
        className="px-5 py-2 rounded-full text-[11px] tracking-[0.18em] uppercase whitespace-nowrap cursor-pointer transition-shadow"
        style={{
          // gradient ring via padding-box / border-box trick
          background: `
            linear-gradient(${NAVY}, ${NAVY}) padding-box,
            ${OPAL_LIGHT_GRADIENT} border-box
          `,
          border: "1px solid transparent",
          boxShadow: "0 0 0 rgba(212,170,255,0)",
        }}
      >
        <span style={gradientText}>{label}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04, color: "#fff", borderColor: "rgba(212,170,255,0.55)" }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick(target)}
      className="px-5 py-2 rounded-full border text-[11px] tracking-[0.18em] uppercase whitespace-nowrap cursor-pointer transition-colors"
      style={{
        borderColor: "rgba(255,255,255,0.18)",
        color: "rgba(255,255,255,0.78)",
      }}
    >
      {label}
    </motion.button>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const handleNav = (target) => goToTarget(target, navigate);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full z-90 px-6 md:px-10 py-3 md:py-4 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(8,6,12,0.55)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* ───────── Scroll progress (page-wide) ───────── */}
        <motion.div
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-[2px] origin-left"
          style={{
            scaleX,
            transformOrigin: "0% 50%",
            backgroundImage: OPAL_LIGHT_GRADIENT,
            boxShadow: "0 0 12px rgba(212,170,255,0.35)",
          }}
        />

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
                className="h-7 w-auto select-none"
                style={{ filter: "brightness(0) invert(1)" }}
                draggable={false}
              />
            </button>
            {NAVBAR_LINKS.left.map((item) => (
              <NavButton
                key={item.key}
                label={item.label}
                target={item.target}
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
              className="h-7 w-auto select-none"
              style={{ filter: "brightness(0) invert(1)" }}
              draggable={false}
            />
          </button>

          <motion.button
            onClick={() => setMenuOpen(true)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ borderColor: "rgba(212,170,255,0.6)" }}
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
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
