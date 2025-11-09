import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const whoWeServeData = [
  {
    id: 1,
    title: "Clinician-led Practices",
    description:
      "gOS helps independent, provider-led practices bring order and clarity to their operations. By unifying financial, clinical, and administrative data into one intuitive system, practices can effortlessly understand performance, uncover opportunities, and act with confidence. What once required manual reports or outside analysis is now simplified, giving providers the control and insight to focus more on care and less on coordination.",
  },
  {
    id: 2,
    title: "Multi-location Groups",
    description:
      "For growing organizations managing multiple offices, gOS creates a single source of truth that connects every location in real time. Leaders gain visibility into financial, clinical, and operational performance across the network, eliminating silos and ensuring consistent standards of excellence. With everything aligned—teams, data, and workflows—multi-site practices can scale efficiently while maintaining cohesion and quality.",
  },
  {
    id: 3,
    title: "Emerging DSOs & MSOs",
    description:
      "gOS equips emerging DSOs and MSOs with the infrastructure to grow intelligently. It transforms scattered systems into one harmonized ecosystem, providing clarity across financial and clinical dimensions while standardizing operations network-wide. As new locations come online, leaders can measure performance, ensure consistency, and scale with confidence—building a foundation for sustainable growth rooted in alignment.",
  },
  {
    id: 4,
    title: "Established Practices",
    description:
      "For mature practices poised for expansion, gOS brings the clarity and structure needed to scale without losing precision. The platform centralizes insight across departments and teams, turning operational complexity into coordinated action. By connecting data, people, and processes through one unified lens, established practices gain the agility and confidence to grow strategically while preserving the quality and integrity that define their success.",
  },
];

function WhoWeServeItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 md:py-8 flex items-start justify-between gap-6 text-left transition-colors cursor-pointer"
      >
        <h3 className="text-lg md:text-xl font-medium text-gray-900 flex-1 text-left">
          {item.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="shrink-0 w-6 h-6 flex items-center justify-center"
        >
          <span className="text-2xl font-light text-gray-600">+</span>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-6 md:pb-8"
            >
              <p className="text-base md:text-lg text-gray-600 leading-relaxed text-left">
                {item.description}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggleItem = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="faq" className="min-h-9/10 bg-white py-16 md:py-24 mb-8">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            Who We Serve
          </h2>
        </motion.div>

        {/* Who We Serve Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white"
        >
          {whoWeServeData.map((item) => (
            <WhoWeServeItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
