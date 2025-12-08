import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, px } from "framer-motion";
import Divider from "./HomeHero/Divider";
import PlanetOrbit from "./HomeHero/PlanetOrbit";
import ServicesList from "./HomeHero/ServiceList";
import TitleBlock from "./HomeHero/TitleBlock";

const HomePage = () => {
  const archRef = useRef(null);
  const titleRef = useRef(null);
  const containerRef = useRef(null);
  const [titleLeftPx, setTitleLeftPx] = useState(undefined);
  const [lineWidthPx, setLineWidthPx] = useState(undefined);
  const [archSize, setArchSize] = useState(1400);

  const O_OVERLAP_EM = 0.09;
  const ARCH_CENTER = "88% 50%";

  // Update arch size reactively
  useEffect(() => {
    const updateArchSize = () => {
      const width = window.innerWidth;
      if (width > 2560) {
        setArchSize(3400);
      } else if (width > 1920) {
        setArchSize(2200);
      } else if (width > 1400) {
        setArchSize(1800);
      } else {
        setArchSize(1400);
      }
    };

    updateArchSize();
    window.addEventListener("resize", updateArchSize, { passive: true });
    return () => window.removeEventListener("resize", updateArchSize);
  }, []);

  // Calculate position - wait for arch to finish resizing
  useLayoutEffect(() => {
    const update = () => {
      const arch = archRef.current;
      const container = containerRef.current;
      if (!arch || !container) return;

      // Wait for arch to finish resizing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Force reflow
          void arch.offsetHeight;
          
          // Additional delay to ensure arch is completely done
          setTimeout(() => {
            const rect = arch.getBoundingClientRect();
            const containerLeft = container.getBoundingClientRect().left;

            const titleEl = titleRef.current;
            const fs = titleEl
              ? parseFloat(getComputedStyle(titleEl).fontSize || "0")
              : 0;
            const overlapPx = isNaN(fs) ? 0 : fs * O_OVERLAP_EM;

            setTitleLeftPx(rect.right - containerLeft - overlapPx);
            setLineWidthPx(rect.right - containerLeft + 130);
          }, 300); // Wait 300ms for arch to fully resize
        });
      });
    };

    update();
    
    // Debounce resize events
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(update, 350);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [archSize, O_OVERLAP_EM]); // Recalculate when archSize changes

  return (
    <div className="h-screen overflow-hidden relative w-full">
      {/* Video Background - Fixed to viewport height */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Container - Constrained to viewport height */}
      <div ref={containerRef} className="relative h-full z-10 text-white">
        {/* ARCH kept here */}
        <motion.div
          ref={archRef}
          className="absolute -left-[38%] top-1/2 -translate-y-1/2 rounded-full overflow-hidden hidden lg:block"
          initial={{ scale: 0.8, opacity: 0, y: -12 }}
          animate={{ scale: 1, opacity: 1, y: [0, 6, 0] }}
          transition={{
            scale: { duration: 1.2, ease: "easeOut" },
            opacity: { duration: 1.2, ease: "easeOut" },
            y: { duration: 2.5, ease: "easeInOut", repeat: Infinity },
          }}
          style={{
            width: `min(85vw, ${archSize}px)`,
            height: `min(85vw, ${archSize}px)`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              // inline CSS to avoid Tailwind purge on dynamic gradient
              backgroundImage: `radial-gradient(circle at ${ARCH_CENTER},
                rgba(255,255,255,0.96) 0%,
                rgba(255,255,255,0.92) 36%,
                rgba(255,255,255,0.8) 48%,
                rgba(255,255,255,0.35) 56%,
                rgba(255,255,255,0.12) 62%,
                transparent 68%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              mixBlendMode: "overlay",
              backgroundImage:
                "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 2px)",
            }}
          />
        </motion.div>

        {/* divider uses computed width */}
        <Divider width={lineWidthPx} heightClass="h-6" />

        {/* rest split as components */}
        <PlanetOrbit />
        <ServicesList
          items={[
            "gUIDED Workflows",
            "gAMIFIED Experience",
            "gALVANIZED Practice",
            "gURANTEED Results",
          ]}
        />
        <TitleBlock titleRef={titleRef} left={titleLeftPx} />
      </div>
    </div>
  );
};

export default HomePage;
