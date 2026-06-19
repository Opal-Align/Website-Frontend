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
  Carestack,
  Cloud9,
  Curve,
  Denticon,
  Dentimax,
  Dentrix,
  DentrixAscend,
  Dolphin,
  Eaglesoft,
  OpenDental,
];

const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";

export default function LogoStream() {
  return (
    <div
      className="relative overflow-hidden w-full py-8 md:py-12 flex items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse at 15% 20%, rgba(155,109,255,0.07) 0%, transparent 45%),
          radial-gradient(ellipse at 82% 70%, rgba(34,211,238,0.06) 0%, transparent 42%),
          #07080D
        `,
      }}
    >
      {/* Fade at edges — matched to the shared backdrop */}
      <div className="absolute top-0 left-0 w-12 md:w-32 h-full z-10" style={{ background: "linear-gradient(to right, #07080D, transparent)" }} />
      <div className="absolute top-0 right-0 w-12 md:w-32 h-full z-10" style={{ background: "linear-gradient(to left, #07080D, transparent)" }} />

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
                  <span
                    role="img"
                    aria-label={`Logo ${logoIndex + 1}`}
                    className="block h-12 md:h-16 w-[150px] md:w-[200px] opacity-70 hover:opacity-100 transition-opacity"
                    style={{
                      backgroundImage: OPAL_LIGHT_GRADIENT,
                      backgroundSize: "180% 180%",
                      WebkitMaskImage: `url("${logo}")`,
                      WebkitMaskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskImage: `url("${logo}")`,
                      maskRepeat: "no-repeat",
                      maskPosition: "center",
                      maskSize: "contain",
                    }}
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
