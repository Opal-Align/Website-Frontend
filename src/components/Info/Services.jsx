import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ScrollingWords from "./ScrollingWords";

const Services = () => {
  return (
    <div className="min-h-screen bg-black text-white py-16">
      <div className="max-w-7xl mx-8 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-x-8 md:gap-x-16 gap-y-10 md:gap-y-24">
          {/* Branding and Identity */}
          <div className="col-span-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold"
            >
              Branding and Identity
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 md:justify-start"
          >
            <span className="text-3xl md:text-5xl font-bold">12</span>
            <span className="text-gray-400">Projects</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="ml-6 md:ml-8 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"
            >
              +
            </motion.button>
          </motion.div>
          <div className="md:col-start-2 text-gray-400 max-w-md">
            We define your voice, visuals, and vision to help your brand connect
            and thrive.
          </div>

          {/* UI/UX and Product Design */}
          <div className="col-span-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold"
            >
              UI/UX and Product Design
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 md:justify-start"
          >
            <span className="text-3xl md:text-5xl font-bold">12</span>
            <span className="text-gray-400">Projects</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="ml-6 md:ml-8 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center"
            >
              +
            </motion.button>
          </motion.div>
          <div className="md:col-start-2 text-gray-400 max-w-md">
            Human-centered design that turns complex ideas into elegant user
            experiences.
          </div>
        </div>
      </div>
    </div>
  );
};

const services = [
  {
    id: 1,
    number: "/01",
    title: "Stop Managing Solutions &",
    secondaryTitle: "Start Gaining",
    description: "One Platform » One Workflow » Zero Complexity",
    scrollingComponent: (
      <>
        <ScrollingWords
          words={["Margins", "Control", "Advantage", "Accountability"]}
        />
      </>
    ),
    expandedDescription:
      "gOS is the first guided operating system that replaces your fragmented point solutions with a simple unified interface delivering measurable gains on day one.",

    hasImage: false,
    alignRight: true,
  },
  {
    id: 2,
    number: "/02",
    title: "From Zero to Results",
    description: "Day 1 Adoption » Day 1 Impact",
    expandedDescription:
      "With zero training and under 10 minutes using gOS, a practice recovered $1,500 in delinquent patient balances. gOS guided every action toward maximum margins. No complexity. Just results.",

    hasImage: false,
    alignRight: false,
  },
  {
    id: 3,
    number: "/03",
    title: "Social Media Marketing",
    description:
      "We turn followers into fans with standout content and strategy.",
    subservices: "Content Strategy, Social Campaigns, Community Management",
    projects: ["Lummi", "Sonoma", "LINX", "+ 11"],
    projectCount: 25,
    hasImage: true,
    alignRight: true,
  },
  {
    id: 4,
    number: "/04",
    title: "SEO Optimization",
    description:
      "Tailored SEO solutions that improve rankings, and increase clicks.",
    projectCount: 17,
    alignRight: false,
  },
];

function ServiceItem({ service, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: service.alignRight ? 100 : -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative flex justify-${
        service.alignRight ? "end" : "start"
      }`}
    >
      <motion.div
        className={`relative flex justify-${
          service.alignRight ? "end" : "start"
        }`}
        initial={false}
        animate={{
          backgroundColor: isOpen ? "#f9f9f9" : "#ffffff",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            x: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: isOpen ? 0.35 : 0, // 👈 delay only when opening
          }}
          className={`absolute top-1/2 -translate-y-1/2 text-lg font-light text-gray-400 pointer-events-none hidden md:block ${
            service.alignRight ? "left-8" : "right-8"
          }`}
        >
          <span>{service.number}</span>
        </motion.div>
        <button
          onClick={onToggle}
          className={`py-8 md:py-12 px-4 sm:px-6 md:px-8 text-left transition-all duration-500 border-grey border-t w-full max-w-[1100px] cursor-pointer
        }`}
        >
          <AnimatePresence mode="wait">
            {!isOpen ? (
              // CLOSED STATE
              <motion.div
                key="closed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`grid grid-cols-1 md:grid-cols-[2fr_1.5fr_auto_auto] items-start gap-y-6 md:gap-y-0 gap-x-6 md:gap-x-12 ${
                  service.alignRight ? "direction-rtl text-right" : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <h4
                    className={`text-2xl font-semibold tracking-tight leading-none ${
                      service.alignRight
                        ? "text-right [direction:ltr]"
                        : "text-left"
                    }`}
                  >
                    <span className="inline">{service.title}</span>
                  </h4>
                  {service.secondaryTitle && (
                    <div
                      className={`text-2xl font-semibold tracking-tight leading-tight flex items-baseline gap-2 ${
                        service.alignRight
                          ? "text-right [direction:ltr] justify-end"
                          : "text-left"
                      }`}
                    >
                      <span>{service.secondaryTitle}</span>
                      {service.scrollingComponent && (
                        <span className="inline">
                          {service.scrollingComponent}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="max-w-prose">
                  <p className="text-lg text-gray-600 mb-0">
                    {service.description}
                  </p>
                </div>

                {service.projectCount && (
                  <div className="flex items-baseline gap-3 justify-start md:justify-center">
                    <span className="text-4xl md:text-6xl font-bold">
                      {service.projectCount}
                    </span>
                    <span className="text-sm text-gray-600">Projects</span>
                  </div>
                )}

                <div className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-light">+</span>
                </div>
              </motion.div>
            ) : (
              // OPEN STATE
              <motion.div
                key="open"
                initial={{
                  opacity: 0,
                  x: service.alignRight ? 100 : -100,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  x: service.alignRight ? 100 : -100,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12 ${
                  service.alignRight
                    ? "md:flex-row-reverse text-right"
                    : "text-left"
                }`}
              >
                {/* MAIN CONTENT DIV */}
                <div
                  className={`flex-1 flex flex-col md:flex-row flex-wrap items-start justify-between gap-8 md:gap-12 ${
                    service.alignRight ? "md:flex-row-reverse text-right" : ""
                  }`}
                >
                  {/* TITLE + DESC */}
                  <div className="flex-1 min-w-[240px] space-y-4">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-2xl md:text-3xl font-bold leading-tight">
                        {service.title}
                      </h4>
                      {service.secondaryTitle && (
                        <div
                          className={`text-2xl md:text-3xl font-bold leading-tight flex items-baseline gap-2 ${
                            service.alignRight
                              ? "text-right [direction:ltr] justify-end"
                              : "text-left"
                          }`}
                        >
                          <span>{service.secondaryTitle}</span>
                          {service.scrollingComponent && (
                            <span className="inline">
                              {service.scrollingComponent}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {service.description}
                    </p>
                    {service.expandedDescription && (
                      <p className="text-lg text-gray-700 leading-relaxed mt-2">
                        {service.expandedDescription}
                      </p>
                    )}
                    {service.subservices && (
                      <p className="text-sm text-gray-500">
                        {service.subservices}
                      </p>
                    )}
                  </div>

                  {/* IMAGE */}
                  {service.hasImage && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-32 h-32 md:w-40 md:h-40 shrink-0"
                    >
                      <div className="absolute inset-0 rounded-full bg-linear-to-br from-gray-900 via-orange-500 to-gray-900" />
                      <div
                        className="absolute inset-x-0 bg-linear-to-b from-transparent via-orange-400 to-transparent"
                        style={{ top: "40%", height: "20%" }}
                      />
                    </motion.div>
                  )}

                  {/* PROJECTS */}
                  {service.projects && (
                    <div className="flex flex-col gap-2 min-w-[100px]">
                      {service.projects.map((project, idx) => (
                        <span
                          key={idx}
                          className={`text-base ${
                            project.startsWith("+")
                              ? "text-gray-400"
                              : "font-medium"
                          }`}
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* BUTTON */}
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                    <span className="text-2xl font-light">⋯</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function ServicesAccordion() {
  const [openIds, setOpenIds] = useState([1]);

  const toggleService = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
    );
  };

  return (
    <div id="gos-in-action" className="min-h-screen bg-white py-8">
      <div className="max-w-9/10 mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-8 md:mb-12 text-center">
          <h3 className="text-3xl md:text-4xl lg:text-8xl font-bold">
            OPAL gOS in Action
          </h3>
        </div>

        <div>
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              isOpen={openIds.includes(service.id)}
              onToggle={() => toggleService(service.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
