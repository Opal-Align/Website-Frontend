// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
export default function TitleBlock({ titleRef, left = 0 }) {
  return (
    <>
      <div
        className="absolute right-4 md:right-10 top-[50%] translate-y-[10px] text-right lg:right-auto z-10"
        style={{ left: left - 10 }}
      >
        <div
          ref={titleRef}
          className="relative overflow-hidden text-[18vw] md:text-[12vw] leading-[1.15] tracking-tight inline-block font-['Montserrat']"
        >
          <motion.span
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative inline-block font-['Montserrat']"
          >
            <span className="text-white font-bold">OPAL</span>
            <span className="text-white font-light"> gOS</span>
          </motion.span>
          <motion.span
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute left-0 top-0 pointer-events-none hidden lg:block font-['Montserrat']"
            style={{
              clipPath: "polygon(0 0, 17% 0, 17% 100%, 0 100%)",
              WebkitClipPath: "polygon(0 0, 17% 0, 17% 100%, 0 100%)",
              color: "#000",
            }}
          >
            <span className="font-bold">OPAL</span>
            <span className="font-light"> gOS</span>
          </motion.span>
        </div>
      </div>
    </>
  );
}
