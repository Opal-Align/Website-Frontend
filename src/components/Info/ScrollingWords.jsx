// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function ScrollingWords({ words = [], className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <span
      className={`relative inline-block ${className}`}
      style={{
        verticalAlign: "baseline",
        lineHeight: "1.2em",
        overflow: "visible",
      }}
    >
      <span
        className="relative inline-block"
        style={{
          height: "1.6em",
          lineHeight: "1.2em",
          verticalAlign: "baseline",
          display: "inline-block",
          overflow: "visible",
          position: "relative",
        }}
      >
        <span
          className="absolute left-0 top-0 w-full overflow-hidden"
          style={{
            height: "1.2em",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "00%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute left-0 whitespace-nowrap"
              style={{
                lineHeight: "1.2em",
                top: "0",
              }}
            >
              {words[index]}
            </motion.span>
          </AnimatePresence>
        </span>
        {/* Invisible placeholder to maintain width - use longest word */}
        <span
          className="invisible whitespace-nowrap inline-block"
          style={{ lineHeight: "1.2em" }}
        >
          {words.reduce((a, b) => (a.length > b.length ? a : b), "")}
        </span>
      </span>
    </span>
  );
}
