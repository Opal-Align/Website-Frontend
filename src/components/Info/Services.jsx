import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import ScrollingWords from "./ScrollingWords";

function ServiceItem({ service, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: service.alignRight ? 100 : -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative flex justify-${
        service.alignRight ? "end" : "start"
      } w-full overflow-hidden`}
    >
      <motion.div
        className={`relative flex justify-${
          service.alignRight ? "end" : "start"
        } w-full max-w-full overflow-hidden`}
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
          className={`py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 text-left transition-all duration-500 border-grey border-t w-full md:max-w-[1100px] cursor-pointer overflow-visible
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
                className={`grid grid-cols-1 md:grid-cols-[2fr_2fr_auto_auto] items-start gap-y-6 md:gap-y-0 gap-x-4 sm:gap-x-6 md:gap-x-8 lg:gap-x-12 ${
                  service.alignRight ? "direction-rtl text-right" : ""
                }`}
              >
                <div className="flex flex-col gap-1 min-w-0 w-full">
                  <h4
                    className={`text-lg sm:text-xl md:text-2xl font-semibold tracking-tight leading-none m-0 wrap-break-word ${
                      service.alignRight
                        ? "text-right [direction:ltr]"
                        : "text-left"
                    }`}
                  >
                    {service.title}
                  </h4>
                  {service.secondaryTitle && (
                    <h4
                      className={`text-lg sm:text-xl md:text-2xl font-semibold tracking-tight leading-tight m-0 ${
                        service.alignRight
                          ? "text-right [direction:ltr]"
                          : "text-left"
                      }`}
                    >
                      <span className="inline-flex items-baseline gap-1 sm:gap-2 whitespace-nowrap">
                        <span>{service.secondaryTitle}</span>
                        {service.scrollingComponent && (
                          <>
                            <span className="inline">
                              {service.scrollingComponent}
                            </span>
                            <span className="inline-block md:w-2"></span>
                          </>
                        )}
                      </span>
                    </h4>
                  )}
                </div>

                <div className="min-w-0 w-full overflow-visible">
                  <p className="text-[13px] sm:text-sm md:text-base lg:text-lg text-gray-600 mb-0">
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
                      <h4 className="text-2xl md:text-3xl font-bold leading-tight m-0">
                        {service.title}
                      </h4>
                      {service.secondaryTitle && (
                        <h4
                          className={`text-2xl md:text-3xl font-bold leading-tight m-0 ${
                            service.alignRight
                              ? "text-right [direction:ltr]"
                              : "text-left"
                          }`}
                        >
                          <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
                            <span>{service.secondaryTitle}</span>
                            {service.scrollingComponent && (
                              <span className="inline">
                                {service.scrollingComponent}
                              </span>
                            )}
                          </span>
                        </h4>
                      )}
                    </div>
                    <p className="text-[13px] sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed overflow-hidden min-w-0">
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

export default function ServicesAccordion({
  services = [],
  title = "Services",
  sectionId = "services",
}) {
  const [openId, setOpenId] = useState(null);

  const toggleService = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      id={sectionId}
      className="min-h-screen bg-white py-8 overflow-x-hidden"
    >
      <div className="max-w-9/10 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        <div className="mb-8 md:mb-12 text-center">
          <h3 className="text-3xl md:text-4xl lg:text-8xl font-bold">
            {title}
          </h3>
        </div>

        <div>
          {services.map((service) => (
            <ServiceItem
              key={service.id}
              service={service}
              isOpen={openId === service.id}
              onToggle={() => toggleService(service.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
