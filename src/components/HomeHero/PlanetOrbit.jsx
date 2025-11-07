// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function PlanetOrbit() {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ x: -600, y: -80, opacity: 0 }}
      animate={{ x: [-600, -200], y: -80, opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.6, ease: "linear" }}
      style={{ willChange: "transform" }}
    >
      {/* Planet */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden">
          <img
            src="https://framerusercontent.com/images/R4jSZWFR126PbJhYKSjiZxWz9k.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center center" }}
          />
        </div>
      </div>

      {/* Satellite with smooth tilted orbital motion (matches HomePage) */}
      <motion.div
        className="absolute"
        initial={{ x: 40, y: 0 }}
        animate={{
          x: Array.from(
            { length: 360 },
            (_, i) => 40 * Math.cos((i * Math.PI) / 180)
          ),
          y: Array.from(
            { length: 360 },
            (_, i) => 25 * Math.sin((i * Math.PI) / 180)
          ),
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
          delay: 3.1,
        }}
        style={{
          left: "50%",
          top: "50%",
          willChange: "transform",
          transformStyle: "preserve-3d",
          transform: "rotateX(45deg) rotateZ(50deg)",
        }}
      >
        <div
          className="w-[43px] h-[42px] rounded-full -translate-x-1/2 -translate-y-1/2 relative overflow-hidden"
          style={{
            background: `
      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.9) 0%, rgba(220,220,220,0.8) 30%, rgba(180,180,180,0.7) 70%, rgba(120,120,120,0.9) 100%),
      radial-gradient(circle at 60% 40%, rgba(160,160,160,0.4) 0%, transparent 25%),
      radial-gradient(circle at 30% 70%, rgba(140,140,140,0.3) 0%, transparent 20%),
      radial-gradient(circle at 80% 80%, rgba(100,100,100,0.5) 0%, transparent 15%)
    `,
            boxShadow: `
      0 0 20px rgba(255,255,255,0.4),
      inset -8px -8px 16px rgba(0,0,0,0.2),
      inset 4px 4px 8px rgba(255,255,255,0.3)
    `,
          }}
        >
          {/* Optional: Add some crater dots */}
          <div className="absolute top-[30%] left-[45%] w-1 h-1 rounded-full bg-gray-400/60" />
          <div className="absolute top-[60%] left-[25%] w-0.5 h-0.5 rounded-full bg-gray-500/40" />
          <div className="absolute top-[45%] right-[20%] w-0.5 h-0.5 rounded-full bg-gray-400/50" />
        </div>
      </motion.div>
    </motion.div>
  );
}
