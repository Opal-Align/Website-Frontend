import { motion } from "framer-motion";

const lines = [
  "Your schedule has gaps your front desk doesn't have time to fill.",
  "Your collections are stalling in A/R your team doesn't have bandwidth to chase.",
  "Your patients need follow-up your staff can't get to.",
  "Your practice has capacity. You're just not capturing it.",
];

export default function ProblemSection() {
  return (
    <section className="min-h-screen bg-[#08060C] text-white px-6 md:px-20 py-32">
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-6xl font-light mb-16"
      >
        Your practice is running below its potential.
      </motion.h2>

      <div className="space-y-8 max-w-4xl">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-lg md:text-xl text-white/70 leading-relaxed"
          >
            {line}
          </motion.p>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-16 text-white/80 text-xl"
      >
        This isn’t a people problem. It’s a systems problem.
      </motion.p>
    </section>
  );
}