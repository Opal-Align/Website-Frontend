// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";

export default function TitleBlock({ titleRef, right = 0 }) {
  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 right-4 md:right-10 top-[60%] sm:top-[50%] translate-y-[-50%] z-20 lg:transition-[right] lg:duration-300 lg:ease-out w-full sm:w-auto"
        style={{ 
          right: right !== undefined && right > 0 ? `${right}px` : undefined,
        }}
      >
        <div
          ref={titleRef}
          className="relative inline-block text-center sm:text-right"
          style={{ overflow: 'visible' }}
        >
          <motion.img
            src={opalLogo}
            alt="OPAL gOS"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              delay: 0.5,
              duration: 1.8,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative w-[70vw] md:w-[50vw] lg:w-[45vw] xl:w-[40vw] max-w-[800px] h-auto object-contain mb-3 md:mb-4"
            style={{ 
              filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
            }}
          />
          <motion.p
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "0%", opacity: 1 }}
            transition={{
              delay: 1.4,
              duration: 1.5,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="text-white font-['Montserrat'] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight tracking-wide font-light text-center sm:text-right px-4 sm:px-0"
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.05em',
            }}
          >
            The guided OS that maximizes provider margins<br className="hidden sm:block" /> with less overhead
          </motion.p>
        </div>
      </div>
    </>
  );
}