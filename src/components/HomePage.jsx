import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import TitleBlock from "./HomeHero/TitleBlock";

const HomePage = () => {
  return (
    <div className="h-screen overflow-hidden relative w-full">
      {/* Video Background - Fixed to viewport height */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Container - Constrained to viewport height */}
      <div className="relative h-full z-10 text-white">
        <TitleBlock />
      </div>
    </div>
  );
};

export default HomePage;
