import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const FlowCard = ({
  title,
  text,
  icon,
  index,
  activeIndex,
  setActiveIndex,
}) => {
  const isActive = activeIndex === index;
  const isDimmed =
    activeIndex !== null && activeIndex !== index;

  return (
    <motion.div
      onHoverStart={() => setActiveIndex(index)}
      onHoverEnd={() => setActiveIndex(null)}
      onClick={() => setActiveIndex(isActive ? null : index)}
      animate={{
        opacity: isDimmed ? 0 : 1,
        scale: isActive ? 1.05 : 1,
      }}
      transition={{ duration: 0.35 }}
      className="relative flex flex-col items-center cursor-pointer"
    >
      {/* CULT STYLE BOX */}
      <div
        className="
          w-full
          aspect-square
          sm:w-[260px]
          sm:h-[260px]
          border border-white/30
          bg-black
          flex items-center justify-center
          transition-all duration-500
        "
      >
        {/* Icon */}
        <img
          src={icon}
          alt={title}
          className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Caption */}
      <p className="mt-4 text-xs tracking-[0.25em] text-white/70 uppercase">
        {title}
      </p>

      {/* Text on active - Mobile only */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden mt-4 px-4 text-center"
        >
          <p className="text-sm text-white/80 leading-relaxed">
            {text}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FlowCard;