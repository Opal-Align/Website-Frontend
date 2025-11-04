import React from "react";
import { motion } from "framer-motion";
const FormHeader = () => {
  return (
    <div className="grid md:grid-cols-2 md:gap-32 mb-16">
      <div className="relative overflow-hidden mb-16">
        <motion.h1
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.9,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-4xl md:text-5xl font-bold leading-tight text-gray-900"
        >
          Fill the
          <br />
          Contact form:
        </motion.h1>
      </div>
      <div className="relative overflow-hidden">
        <motion.p
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.9,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="text-gray-500 text-base md:text-lg leading-relaxed"
        >
          Contact us now and we'll discuss any questions you have.
        </motion.p>
      </div>
    </div>
  );
};

export default FormHeader;
