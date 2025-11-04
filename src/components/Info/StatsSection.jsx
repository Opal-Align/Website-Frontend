import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Information from "./Information";

function AnimatedCounter({ from = 0, to, duration = 2, suffix = "" }) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          setCount(Math.round(latest));
        },
      });
      return controls.stop;
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-full mx-8 px-6 md:px-2 py-4 md:pt-20">
        <div className="flex justify-between">
          <div className="md:flex hidden">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z"
                fill="black"
                stroke="black"
                strokeWidth="1"
              />
            </svg>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z"
                fill="black"
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 justify-between mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="border-t border-gray-800 pt-6 md:pt-8"
            >
              <h3 className="text-xs align-center md:text-sm uppercase tracking-wider text-gray-400 mb-4 md:mb-6">
                Launched Projects
              </h3>
              <div className="flex gap-8">
                <div className="text-7xl font-bold">
                  <AnimatedCounter to={75} duration={2.5} />
                  <span className="text-5xl">+</span>
                </div>
                <p className="text-sm text-gray-400 mt-4 max-w-[200px]">
                  Projects were launched successfully since 2008.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="border-t border-gray-800 pt-6 md:pt-8"
            >
              <h3 className="text-xs md:text-sm uppercase tracking-wider text-gray-400 mb-4 md:mb-6">
                Client Satisfaction
              </h3>
              <div className="flex justify-between gap-8">
                <div className="text-7xl font-bold">
                  <AnimatedCounter to={98} duration={2.5} />
                  <span className="text-5xl">%</span>
                </div>
                <p className="text-sm text-gray-400 mt-4 max-w-[200px]">
                  Percentage of our fully satisfied clients.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Year of Establishment */}
        <div className="grid grid-cols-1.5 sm:grid-cols-2 col-start-2 justify-items-end gap-8 md:gap-16 mb-4 md:mb-12">
          <div></div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t border-gray-800 pt-6 md:pt-8 mb-12 md:mb-20"
          >
            <h3 className="text-xs md:text-sm uppercase tracking-wider text-gray-400 mb-4 md:mb-6">
              Year of Establishment
            </h3>
            <div className="flex items-end flex-row-reverse gap-8">
              <div className="text-8xl font-bold">
                <AnimatedCounter from={2000} to={2008} duration={2} />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-400 max-w-[300px] mb-4">
                  The year the two founders launched a first project: "Soncra"
                  website for IT startup.
                </p>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <Information />
      </div>
    </div>
  );
}
