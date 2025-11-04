import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import TripleDots from "../TripleDots";
import RightNav from "./RightNav";
import logoImage from "../../assets/opal-gos.png";
export default function Navbar() {
  // State to track if navbar should be hidden
  const [hidden, setHidden] = useState(false);
  // State to track if initial animation has completed
  const [hasAnimated, setHasAnimated] = useState(false);
  const { scrollY } = useScroll();

  const [lastScrollY, setLastScrollY] = useState(0);

  // Check screen size and mark initial animation as complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Listen to scroll changes and determine navbar visibility
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;

    // Only start hiding navbar after initial animation completes
    if (hasAnimated) {
      // Hide navbar when scrolling down past 100px
      if (latest > previous && latest > 100) {
        setHidden(true);
      }
      // Show navbar when scrolling up
      else if (latest < previous && latest < 100) {
        setHidden(false);
      }
    }

    // Update last scroll position
    setLastScrollY(latest);
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
    // Hidden state (slides up and fades out)
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Animated Navbar */}
      <motion.nav
        variants={navbarVariants}
        initial="initial"
        animate={hidden ? "hidden" : "visible"}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Navbar container with glassmorphism effect */}
        <div className="px-8 py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* LEFT SIDE: Brand Logo */}
            <motion.div
              className="relative"
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src={logoImage}
                alt="gOS Logo"
                className="h-10 md:h-12 w-auto"
                variants={{
                  hover: {
                    rotate: 360,
                    transition: {
                      duration: 2,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  },
                }}
              />
              {/* Small orbiting dot on hover */}
              <motion.div
                className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full shadow-lg"
                variants={{
                  hover: {
                    x: [0, 8, 0, -8, 0],
                    y: [0, -8, 0, 8, 0],
                    scale: [1, 1.2, 1, 1.2, 1],
                    opacity: [0, 1, 1, 1, 0],
                    transition: {
                      duration: 1.5,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  },
                }}
                initial={{ opacity: 0 }}
              />
            </motion.div>

            {/* RIGHT SIDE: Profile + Contact Now + Menu Dots */}
            <RightNav />
          </div>
        </div>
      </motion.nav>

      {/* Demo Content for Scrolling */}
    </div>
  );
}
