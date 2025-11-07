import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NavigationOverlay = ({ isOpen, onClose }) => {
  const navItems = ["Home", "gOS in Action", "FAQ", "Contact Us"];
  const scrollPositionRef = useRef(0);

  // Map navigation items to their target selectors
  const getNavigationTarget = (item) => {
    switch (item) {
      case "Home":
        return null; // Scroll to top
      case "gOS in Action":
        return "#gos-in-action";
      case "FAQ":
        return "#faq";
      case "Contact Us":
        return "#footer-contact-form";
      default:
        return null;
    }
  };

  // Lock body scroll and save/restore scroll position
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      scrollPositionRef.current =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;

      // Lock scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = "100%";

      // Prevent scroll events
      const preventScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      window.addEventListener("scroll", preventScroll, { passive: false });
      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        window.removeEventListener("scroll", preventScroll);
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
      };
    } else {
      // Restore scroll position
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restore scroll position after a brief delay to ensure styles are reset
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-100"
            onClick={onClose}
          />

          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-101 flex flex-col"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-6">
              {/* Star Icon - Top Left */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-white"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-6 h-6"
                >
                  <path
                    d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>

              {/* Close Button - Top Right (Triple Dots) */}
              <motion.button
                onClick={onClose}
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-10 h-10 flex items-center justify-center cursor-pointer"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  {/* L-shaped triple dots pattern */}
                  <circle cx="4" cy="4" r="2" fill="currentColor" />
                  <circle cx="12" cy="4" r="2" fill="currentColor" />
                  <circle cx="4" cy="12" r="2" fill="currentColor" />
                </svg>
              </motion.button>
            </div>

            {/* Center Navigation Links */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12">
              {navItems.map((item, index) => (
                <motion.button
                  key={item}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    // Navigate after overlay closes
                    setTimeout(() => {
                      const target = getNavigationTarget(item);
                      if (target === null) {
                        // Scroll to top for Home
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        const element = document.querySelector(target);
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }
                    }, 300);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.1,
                    ease: "easeOut",
                  }}
                  className={`text-4xl md:text-6xl lg:text-7xl font-bold transition-colors cursor-pointer bg-transparent border-none ${
                    item === "Agency"
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between px-8 py-6">
              {/* Email - Bottom Center */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex-1 flex justify-center"
              >
                <a
                  href="mailto:hello@astragency.com"
                  className="text-white/60 hover:text-white text-base md:text-lg transition-colors"
                >
                  hello@astragency.com
                </a>
              </motion.div>

              {/* BUY 'ASTRA' Button - Bottom Right */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-md text-white flex items-center gap-2 transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm md:text-base font-medium">
                  BUY "ASTRA"
                </span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavigationOverlay;
