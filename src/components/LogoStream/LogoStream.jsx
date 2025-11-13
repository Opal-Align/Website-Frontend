// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Carestack from "../../assets/Carestack.svg";
import Cloud9 from "../../assets/Cloud 9.svg";
import Curve from "../../assets/Curve.svg";
import Denticon from "../../assets/Denticon.svg";
import Dentimax from "../../assets/Dentimax.svg";
import Dentrix from "../../assets/dentrix.svg";
import DentrixAscend from "../../assets/DentrixAscend.svg";
import Dolphin from "../../assets/dolphin.svg";
import Eaglesoft from "../../assets/Eaglesoft.svg";
import OpenDental from "../../assets/Open Dental.svg";

const logos = [
  { src: Carestack, name: "Carestack" },
  { src: Cloud9, name: "Cloud 9" },
  { src: Curve, name: "Curve Dental" },
  { src: Denticon, name: "Denticon" },
  { src: Dentimax, name: "Dentimax" },
  { src: Dentrix, name: "Dentrix" },
  { src: DentrixAscend, name: "Dentrix Ascend" },
  { src: Dolphin, name: "Dolphin" },
  { src: Eaglesoft, name: "Eaglesoft" },
  { src: OpenDental, name: "Open Dental" },
];

export default function LogoStream() {
  return (
    <div className="relative overflow-hidden w-full border-t border-gray-200 py-12 md:py-16 mb-4 bg-white flex items-center justify-center">
      {/* Fade at edges */}
      <div className="absolute top-0 left-0 w-12 md:w-32 h-full bg-linear-to-r from-white to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-12 md:w-32 h-full bg-linear-to-l from-white to-transparent z-10"></div>

      {/* Looping Row */}
      <div className="flex overflow-hidden w-full">
        <motion.div
          className="flex items-center gap-12 md:gap-16 whitespace-nowrap"
          animate={{ x: ["0%", "-20%"] }}
          transition={{
            ease: "linear",
            duration: 20,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            willChange: "transform",
          }}
        >
          {/* Duplicate content 4 times for seamless loop */}
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-12 md:gap-16 px-6 md:px-12 shrink-0"
            >
              {logos.map((logo, logoIndex) => (
                <div
                  key={`${index}-${logoIndex}`}
                  className="flex items-center justify-center min-w-[120px] md:min-w-[180px] shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={`${logo.name} - Practice management integration partner`}
                    className="h-12 md:h-16 w-auto max-w-[150px] md:max-w-[200px] object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
