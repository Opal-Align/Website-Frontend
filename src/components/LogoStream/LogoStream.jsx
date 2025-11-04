// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function LogoStream() {
  return (
    <div className="relative overflow-hidden w-full border-t border-gray-200 py-8 md:py-12 mb-4 bg-white">
      {/* Fade at edges */}
      <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

      {/* Looping Row */}
      <motion.div
        className="flex items-center justify-between gap-8 md:gap-12 whitespace-nowrap px-4 md:px-0"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          ease: "linear",
          duration: 20,
          repeat: Infinity,
        }}
      >
        {/* Duplicate content twice for seamless loop */}
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-8 md:gap-12 px-6 md:px-12"
          >
            <div className="w-16 md:w-20 h-10 md:h-12 bg-gray-100 rounded flex items-center justify-center">
              <div className="w-10 md:w-12 h-5 md:h-6 bg-gray-300 rounded"></div>
            </div>

            <div className="text-gray-400 text-xs md:text-sm flex items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-400"></div>
              <span>Logoipsum Foundation</span>
            </div>

            <div className="text-gray-400 text-lg md:text-xl font-bold italic tracking-wider">
              LOGO
            </div>

            <div className="text-gray-400 text-xs md:text-sm flex items-center gap-2">
              <span className="text-2xl">+</span>
              <span>Logo Ipsum Plus</span>
            </div>

            <div className="text-gray-400 text-2xl md:text-3xl font-bold">
              G
            </div>

            <div className="text-gray-400 text-lg md:text-xl font-light tracking-widest">
              LOGO
            </div>

            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded"></div>

            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full border-2 border-gray-300"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
