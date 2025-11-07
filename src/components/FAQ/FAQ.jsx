import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const faqData = [
  {
    id: 1,
    question: "How long does a typical project take?",
    answer:
      "Project timelines vary depending on scope and complexity. A branding project typically takes 4-6 weeks, while a full website design and development can take 8-12 weeks. We'll provide a detailed timeline during our initial consultation.",
  },
  {
    id: 2,
    question: "Do you offer branding packages?",
    answer:
      "Yes, we offer comprehensive branding packages that include logo design, brand guidelines, color palettes, typography selection, and visual identity systems. Each package is customized to meet your specific business needs.",
  },
  {
    id: 3,
    question: "Can you work with my existing brand style?",
    answer:
      "Definitely. We can adapt to your existing brand identity, help you evolve it, or completely refresh it — depending on what your business needs most.",
  },
  {
    id: 4,
    question: "What industries do you specialize in?",
    answer:
      "We work with a wide range of industries, but we specialize in creative businesses, tech startups, lifestyle brands, and modern service companies who value design-driven growth.",
  },
  {
    id: 5,
    question: "Do you provide ongoing website support?",
    answer:
      "Yes, we offer ongoing support and maintenance packages after launch. Whether it's updates, performance checks, or small design tweaks — we're here to keep your website fresh and functional.",
  },
];

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 md:py-8 flex items-start justify-between gap-6 text-left transition-colors cursor-pointer"
      >
        <h3 className="text-lg md:text-xl font-medium text-gray-900 flex-1 text-left">
          {faq.question}
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
                {faq.answer}
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

  const toggleFAQ = (id) => {
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
          <div className="flex items-center justify-center gap-4 mb-8"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Behind every project, the thinking that fuels Astra's creative
            process.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white"
        >
          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggleFAQ(faq.id)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
