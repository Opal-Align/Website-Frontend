"use client";

import React, { useRef, useState } from "react";
import {
  // eslint-disable-next-line no-unused-vars
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import FlowCard from "./FlowCard";
import relayIcon from "../../assets/relay.svg";
import collectIcon from "../../assets/collect.svg";
import productionIcon from "../../assets/production.svg";
import scheduleIcon from "../../assets/schedule.svg";

const cards = [
  {
    title: "Relay",
    text: "Centralizes all communications, follow-ups, and reminders through a single, unified dashboard. Every interaction stays organized so your team can respond faster and maintain stronger patient engagement.",
    icon: relayIcon,
  },
  {
    title: "Collect",
    text: "Streamlines how practices manage accounts receivable by identifying overdue balances and automating patient follow-ups. Your team spends less time chasing payments and more time focusing on patient care. ",
    icon: collectIcon,
  },
  {
    title: "Produce",
    text: "Identifies patients who missed visits or still have pending treatment and automatically follows up with them. Consistent outreach helps bring patients back into the schedule and ensures recommended care doesn't fall through the cracks. ",
    icon: productionIcon,
  },
  {
    title: "Schedule",
    text: "Optimizes your practice schedule by identifying open time slots and connecting them with the right patients. Automated reminders and outreach ensure appointments are scheduled efficiently and consistently. ",
    icon: scheduleIcon,
  },
];

export default function HeroFlow() {
  const ref = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);

  /* ---------------- SCROLL FUNNEL ---------------- */

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // width funnel
  const widthRaw = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["75vw", "100vw", "75vw"]
  );

  const width = useSpring(widthRaw, {
    stiffness: 70,
    damping: 20,
  });

  // scale funnel (depth illusion)
  const scaleRaw = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.92, 1, 0.92]
  );

  const scale = useSpring(scaleRaw, {
    stiffness: 90,
    damping: 18,
  });

  /* ---------------- UI ---------------- */

  return (
    <section
      id="services"
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center bg-black"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <p className="text-xs tracking-[0.3em] uppercase text-white/25 mb-3">
          Automated workflows
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">Services</h2>
      </motion.div>

      <motion.div
        style={{ width, scale }}
        className="relative mx-auto"
      >
        {/* CARDS */}
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-10">
          {cards.map((card, i) => (
            <FlowCard
              key={i}
              index={i}
              title={card.title}
              text={card.text}
              icon={card.icon}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
          
          {/* TEXT PANEL (desktop) - positioned between cards */}
          <motion.div
            animate={{
              opacity: activeIndex !== null ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex absolute items-center justify-center pointer-events-none"
            style={{
              // Card 1 (0): between card 2-3 (columns 1-2: 25% to 50%)
              // Card 2 (1): between card 3-4 (columns 2-3: 50% to 75%)
              // Card 3 (2): between card 1-2 (columns 0-1: 0% to 25%)
              // Card 4 (3): between card 2-3 (columns 1-2: 25% to 50%)
              left: activeIndex === 0 ? '25%' : activeIndex === 1 ? '50%' : activeIndex === 2 ? '0%' : '25%',
              right: activeIndex === 0 ? '25%' : activeIndex === 1 ? '0%' : activeIndex === 2 ? '50%' : '25%',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {activeIndex !== null && (
              <motion.p
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white/80 px-4"
              >
                {cards[activeIndex].text}
              </motion.p>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}