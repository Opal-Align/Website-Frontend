// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";
import ScrollingWords from "../Info/ScrollingWords";

export default function TitleBlock({ titleRef, right = 0 }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const segments = [
    "Maximum Margins",
    "Minimal Overhead",
    "Guided Intelligence"
  ];

  const flipCardText = "The guided OS that reduces revenue leakage automatically.";

  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 md:right-10 top-[60%] sm:top-[50%] translate-y-[-50%] z-20 lg:transition-[right] lg:duration-300 lg:ease-out w-full sm:w-auto flex justify-center sm:block"
        style={{ 
          right: right !== undefined && right > 0 ? `${right}px` : undefined,
        }}
      >
        <div
          ref={titleRef}
          className="relative inline-block text-center sm:text-right"
          style={{ overflow: 'visible' }}
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Flip Card Container */}
          <div
            className="relative w-[80vw] sm:w-[70vw] md:w-[50vw] lg:w-[45vw] xl:w-[40vw] max-w-[800px] mb-3 md:mb-4 mx-auto sm:mx-0"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="relative w-full"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Front: Logo */}
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
                className="relative w-full h-auto object-contain cursor-pointer"
                style={{ 
                  filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
              
              {/* Back: Flip Card Text */}
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4 md:p-6"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="text-white font-['Montserrat'] text-base md:text-lg lg:text-xl xl:text-2xl leading-tight tracking-wide font-light text-center px-4"
                  style={{
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {flipCardText}
                </p>
              </div>
            </motion.div>
          </div>
          {/* Flip Indicator Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="absolute left-2 md:left-4 z-30 w-6 h-6 md:w-8 md:h-8 border-2 border-white/40 rounded-full flex items-center justify-center cursor-pointer"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1]
            }}
          >
            <motion.svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: isFlipped ? 45 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </motion.svg>

          </motion.button>
          {/* Scrolling Words */}
          <div className="relative flex items-center justify-center sm:justify-end px-4 sm:px-0">
            
            
            <motion.div
              initial={{ x: "50%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 1.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="text-white font-['Montserrat'] text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl leading-tight tracking-wide font-light"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.05em',
              }}
            >
              <ScrollingWords words={segments} />
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}