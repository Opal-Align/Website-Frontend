import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import TripleDots from "./TripleDots";
import RightNav from "./RightNav";
import NavigationOverlay from "./NavigationOverlay";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";
export default function Navbar() {
  // State to track navigation overlay
  const [isNavOpen, setIsNavOpen] = useState(false);
  // State to track if user has scrolled
  const [hasScrolled, setHasScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Listen to scroll changes to show logo
  useMotionValueEvent(scrollY, "change", (latest) => {
    // Show logo after scrolling past hero section (80vh)
    if (latest > window.innerHeight * 0.8) {
      setHasScrolled(true);
    } else {
      setHasScrolled(false);
    }
  });

  // Animation variants for navbar
  const navbarVariants = {
    // Starting position (off-screen at top)
    initial: {
      y: -100,
      opacity: 0,
    },
    // Visible state (normal position)
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen relative bg-transparent">
      {/* Sticky Navbar - Always visible */}
      <motion.nav
        variants={navbarVariants}
        initial="initial"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Navbar container - fully transparent */}
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            {/* LEFT SIDE: Brand Logo - Always takes up space */}
            <motion.div
              className="relative cursor-pointer"
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              animate={{ 
                opacity: hasScrolled ? 1 : 0,
                x: hasScrolled ? 0 : -20
              }}
              transition={{ duration: 0.5 }}
              style={{ 
                visibility: hasScrolled ? 'visible' : 'hidden',
                pointerEvents: hasScrolled ? 'auto' : 'none'
              }}
            >
              <img
                src={opalLogo}
                alt="OPAL gOS"
                className="h-8 md:h-10 w-auto"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              />
            </motion.div>

            {/* RIGHT SIDE: Profile + Contact Now + Menu Dots */}
            <RightNav onMenuClick={() => setIsNavOpen(true)} />
          </div>
        </div>
      </motion.nav>

      {/* Navigation Overlay */}
      <NavigationOverlay
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
    </div>
  );
}
