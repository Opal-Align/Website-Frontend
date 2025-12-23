import { motion } from "framer-motion";

export default function ServicesList({ items = [] }) {
  const animationDuration = 1.2;
const totalCycleTime = items.length * animationDuration;
  return (
    <div className="absolute left-6 md:left-8 top-[56%] space-y-5 w-80 text-black/90 hidden lg:block">
      {items.map((label, idx) => (
        <div
          key={label}
          className="grid grid-cols-[1fr_56px] items-center gap-5"
        >
          <span className="text-lg md:text-2xl lg:text-3xl whitespace-nowrap font-medium">{label}</span>
          <motion.div
            className="h-1.5 w-14"
            initial={{
              backgroundColor: "rgba(60,60,60,0.85)",
              boxShadow: "0 0 0 rgba(255,255,255,0)",
            }}
            animate={{
              backgroundColor: [
                "rgba(60,60,60,0.85)",
                "rgba(255,255,255,1)",
                "rgba(60,60,60,0.85)",
              ],
              boxShadow: [
                "0 0 0 rgba(255,255,255,0)",
                "0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.5)",
                "0 0 0 rgba(255,255,255,0)",
              ],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: idx * animationDuration,
              ease: "easeInOut",
              repeatDelay: totalCycleTime - animationDuration,
            }}
          />
        </div>
      ))}
    </div>
  );
}
