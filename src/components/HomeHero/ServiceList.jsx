import { motion } from "framer-motion";

export default function ServicesList({ items = [] }) {
  return (
    <div className="absolute left-6 md:left-8 top-[56%] space-y-4 w-64 text-black/90 hidden lg:block">
      {items.map((label, idx) => (
        <div
          key={label}
          className="grid grid-cols-[1fr_48px] items-center gap-4"
        >
          <span className="text-sm md:text-xl whitespace-nowrap">{label}</span>
          <motion.div
            className="h-1 w-12"
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
              duration: 1,
              repeat: Infinity,
              delay: idx * 0.8,
              ease: "easeInOut",
              repeatDelay: 2,
            }}
          />
        </div>
      ))}
    </div>
  );
}
