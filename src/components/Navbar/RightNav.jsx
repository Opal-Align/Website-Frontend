import React from "react";
import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import TripleDots from "./TripleDots";
const RightNav = ({ onMenuClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  useEffect(() => {
    // Check screen size for responsive behavior
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1200);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);
  return (
    <div className="flex items-center gap-30">
      {/* Profile Image - Hidden on screens below 1200px, visible above */}
      {isLargeScreen && (
        <div className="flex gap-2 items-center">
          <motion.button
            onClick={() => {
              const footer = document.getElementById("footer-contact-form");
              footer?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="pl-8 pr-6 py-2.5 bg-white/10 flex items-center gap-8 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-full border border-white/20 transition-all duration-2000 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              initial="initial"
              animate={isHovered ? "hovered" : "initial"}
              className="relative h-6 overflow-hidden w-28" // Added fixed width
            >
              <motion.div
                className="absolute flex flex-col" // Made container absolute
                style={{ width: "100%" }} // Ensure full width
              >
                <motion.span
                  variants={{
                    initial: { y: 0 },
                    hovered: { y: "-100%" },
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute whitespace-nowrap" // Added block display
                >
                  Join Today
                </motion.span>
                <motion.span
                  variants={{
                    initial: { y: "100%" },
                    hovered: { y: 0 },
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute top-0 whitespace-nowrap" // Position second text at top
                >
                  Join Today
                </motion.span>
              </motion.div>
            </motion.div>
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="relative z-10"
              initial="rest"
              animate={isHovered ? "hovered" : "rest"}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* If hovered, render the white dot first (behind), else black dot first */}

              <>
                {/* BACK DOT (white) */}
                <motion.circle
                  cx="8"
                  cy="12"
                  r="3"
                  variants={{
                    rest: { r: 3, fill: "white", cx: 16, cy: 12 },
                    hovered: { r: 8, fill: "white", cx: 12, cy: 12 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{
                    filter: "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
                  }}
                />
                <motion.circle
                  cx="16"
                  cy="12"
                  r="3"
                  variants={{
                    rest: { r: 3, fill: "#919083", cx: 8 },
                    hovered: { r: 3, fill: "black", cx: 12 },
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {/* FRONT DOT (black) */}
              </>
            </motion.svg>
          </motion.button>
        </div>
      )}

      {/* Three Dots Menu Icon - Always visible */}
      <TripleDots onClick={onMenuClick} />
    </div>
  );
};

export default RightNav;
