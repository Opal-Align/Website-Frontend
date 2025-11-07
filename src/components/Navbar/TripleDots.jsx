import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
const TripleDots = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div>
      <motion.button
        className="w-10 h-10 flex items-center justify-center rounded-full relative overflow-hidden cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
      >
        {/* White background that scales from center */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          initial={{ scale: 0 }}
          animate={{ scale: isHovered ? 0.8 : 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />

        {/* SVG dots */}
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="relative z-10"
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 0.8 : 1 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        >
          <motion.g
            initial={{ fill: "white" }}
            animate={{ fill: isHovered ? "black" : "white" }}
            transition={{ duration: 0.2 }}
          >
            <circle cx="4" cy="12" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="20" cy="12" r="3" />
          </motion.g>
        </motion.svg>
      </motion.button>
    </div>
  );
};

export default TripleDots;
