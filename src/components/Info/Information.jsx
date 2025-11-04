import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
const Information = () => {
  return (
    <div className="min-h-[30vh] bg-white px-4 sm:px-6 md:px-16 pb-6 md:pb-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Team, Agency and Description Section - All in one flex row */}
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-24 mb-10 md:mb-8">
          {/* Team of Pilots */}
          <div className="shrink-0">
            <div className="mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold mb-2">
                Team of Pilots
              </h3>
              <div className="w-8 h-0.5 bg-gray-300"></div>
            </div>

            <div className="flex items-start gap-4 md:gap-6">
              <div className="text-3xl md:text-4xl font-light">
                32<sup className="text-xl">+</sup>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full "></div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full "></div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full "></div>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full "></div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full  col-span-2 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Astra Creative Agency */}
          <div className="shrink-0">
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-bold">Astra</h3>
              <p className="text-gray-400 text-base md:text-lg">
                Creative Agency
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full "></div>

              <div className="text-center">
                <p className="text-xs md:text-sm font-semibold text-black">
                  Michael Rosenberg
                </p>
                <p className="text-[10px] md:text-xs text-gray-400">Founder</p>
              </div>
            </div>
          </div>

          {/* Description Text */}
          <div className="flex-1">
            <p className="text-base md:text-lg leading-relaxed">
              <span className="text-gray-500">We're a full-service agency</span>{" "}
              <span className="font-bold text-black">
                driven by strategy, design, and technology.
              </span>{" "}
              <span className="text-gray-500">
                From brand foundations to fully developed digital products, we
                create work that doesn't just look good:
              </span>{" "}
              <span className="text-gray-400 italic">
                it performs, connects, and endures.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;
