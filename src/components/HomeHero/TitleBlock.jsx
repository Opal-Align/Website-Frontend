// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import opalLogo from "../../assets/OPALgos GreyWhite Website.png";
import ScrollingWords from "../Info/ScrollingWords";

export default function TitleBlock() {
  const [isFlipped, setIsFlipped] = useState(false);

  const segments = [
    
    "Identify Leakage",
    "Generate Strategy",
    "Throttle Outreach",
    "Track Impact",
  ];

  const leftQuestions = [
    "Your practice is leaking revenue. You just can't see where.",
    "Your practice billed it. Your A/R aged it into oblivion."
  ];
  
    

  const rightQuestions = [
    "Your practice isn't losing patients. It's losing touch with them",
    "Your Practice has capacity. Your demand says otherwise."
  ];

  return (
    <>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full flex flex-col lg:flex-row justify-center items-center px-4 md:px-8 gap-10 lg:gap-16"
      >
        {/* Left Questions — above logo on mobile, left on desktop */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 1.5,
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="flex flex-col items-center lg:items-end gap-2 lg:flex-1"
        >
          {leftQuestions.map((question, idx) => (
            <p
              key={idx}
              className="text-white/80 font-['Montserrat'] text-[10px] sm:text-xs lg:text-sm leading-snug font-light text-center lg:text-left whitespace-nowrap lg:pr-10"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.03em',
              }}
            >
              {question}
            </p>
          ))}
        </motion.div>

        <div
          className="relative inline-block text-center shrink-0"
          style={{ overflow: 'visible' }}
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Flip Card Container */}
          <div
            className="relative w-[40vw] sm:w-[35vw] md:w-[25vw] lg:w-[22vw] xl:w-[20vw] max-w-[400px] mb-3 md:mb-4 mx-auto"
            style={{ perspective: '1000px' }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }}
              className="absolute -left-8 md:-left-10 top-1/2 -translate-y-1/2 z-30 
              w-5 h-5 md:w-6 md:h-6 
              border-2 border-white/40 rounded-full 
              flex items-center justify-center cursor-pointer"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              <motion.svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3"
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
              
              {/* Back: Scrolling Words */}
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center p-4 md:p-6"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="text-white font-['Montserrat'] text-sm sm:text-base md:text-lg lg:text-xl leading-tight tracking-wide font-light text-center"
                  style={{
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <ScrollingWords words={segments} />
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>

        {/* Right Questions — below logo on mobile, right on desktop */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 1.5,
            duration: 1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="flex flex-col items-center lg:items-start gap-2 lg:flex-1"
        >
          {rightQuestions.map((question, idx) => (
            <p
              key={idx}
              className="text-white/80 font-['Montserrat'] text-[10px] sm:text-xs lg:text-sm leading-snug font-light text-center lg:text-left whitespace-nowrap"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                letterSpacing: '0.03em',
              }}
            >
              {question}
            </p>
          ))}
        </motion.div>
      </div>
    </>
  );
}