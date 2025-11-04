// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
export default function TitleBlock({ titleRef, left = 0 }) {
  return (
    <>
      <div className="absolute right-6 md:right-10 xl:right-20 top-[18%] w-[36ch] max-w-[90vw] text-right z-20 pointer-events-none">
        <p className="text-white/80 text-lg md:text-xl leading-tight">
          Space of Creative
          <br />
          <span className="text-white">Solutions</span>
        </p>
      </div>
      <div
        className="absolute right-4 md:right-10 top-[50%] translate-y-[10px] text-right lg:right-auto z-10"
        style={{ left }}
      >
        <div
          ref={titleRef}
          className="relative overflow-hidden text-[18vw] md:text-[12vw] leading-[1.15] tracking-tight font-extrabold inline-block "
        >
          <motion.span
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.9,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-white/85 relative inline-block"
          >
            OPAL gOS
          </motion.span>
          <span
            className="absolute left-0 top-0 pointer-events-none hidden lg:block"
            style={{
              clipPath: "polygon(0 0, 17% 0, 17% 100%, 0 100%)",
              WebkitClipPath: "polygon(0 0, 17% 0, 17% 100%, 0 100%)",
              color: "#000",
            }}
          >
            OPAL gOS
          </span>
        </div>
        <div className="mt-6 text-sm md:text-base text-white/80">
          <div>Full‑service</div>
          <div>Creative Agency</div>
        </div>
      </div>
    </>
  );
}
