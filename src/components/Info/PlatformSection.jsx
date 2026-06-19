"use client";

/**
 * PlatformSection.jsx
 * -------------------
 * Requires: npm install framer-motion
 * Fonts:    Inter via Google Fonts (or next/font)
 *
 * Interactive strategy — keeps all content without bulk:
 *  • Toggle pill switches between "The Problem" and "gOS in Action"
 *  • Cards animate out (stagger fade-up) then new content staggers in
 *  • Hovering a card in Problem mode reveals a subtle "gOS solves this" hint
 *  • Feature tags animate in with a spring on the Solution view
 *  • Entire section entrance driven by useInView (fires once)
 *  • Responsive: 4-col → 2-col → 1-col
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── Data ────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "schedule",
    label: "Schedule",
    problem: {
      title: "Empty chairs cost you before anyone notices.",
      body:  "Open slots, no-shows, and cancellations happen faster than any front desk can respond. By the time staff react, the revenue is already gone.",
    },
    solution: {
      title: "gOS protects the schedule before a chair goes cold.",
      body:  "Gaps are identified the moment they open. The right patients are contacted automatically. Eligibility verified. No-shows rerouted. Recall running every day.",
      tags:  ["Gap fill", "Eligibility check", "Recall"],
    },
  },
  {
    id: "produce",
    label: "Produce",
    problem: {
      title: "Accepted treatment walks out unscheduled every day.",
      body:  "Patients say yes and leave without booking. Follow-up never comes. The production those cases represented quietly disappears into a list no one has time to work.",
    },
    solution: {
      title: "gOS follows up on every unscheduled case automatically.",
      body:  "Every accepted treatment plan that left without booking gets worked. The right message, the right channel, the right time — until it converts or your team steps in.",
      tags:  ["Treatment follow-up", "Care gaps", "Production recovery"],
    },
  },
  {
    id: "collect",
    label: "Collect",
    problem: {
      title: "Aging A/R gets harder to collect with every passing day.",
      body:  "Your billing team is outnumbered. Balances go untouched. Accounts age past 90 days. Revenue that was collectible becomes revenue that's written off.",
    },
    solution: {
      title: "gOS runs A/R outreach at a volume your team never could.",
      body:  "Every outstanding balance worked automatically. Multi-channel. Audit-ready. Insurance gaps flagged before they become denials. Your team handles conversations — gOS handles the rest.",
      tags:  ["A/R outreach", "Balance recovery", "Audit log"],
    },
  },
  {
    id: "relay",
    label: "Relay",
    problem: {
      title: "Communication in five tools means things fall through every time.",
      body:  "Reminders here. Follow-ups there. Patient responses somewhere else. No single person has the full picture — and patients slip through every gap.",
    },
    solution: {
      title: "gOS centralizes every communication into one place.",
      body:  "Every channel. Every touchpoint. Every response — in one dashboard with a full audit trail. Your team sees everything. Nothing drops. No channel-switching required.",
      tags:  ["Unified dashboard", "Audit trail", "Multi-channel"],
    },
  },
];

const EASE = [0.16, 1, 0.3, 1];

/* ─── Feature tag pill ────────────────────────────────────────────── */
function Tag({ label, delay = 0 }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: EASE }}
      className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full
                 text-[11px] font-medium tracking-wide text-white/50
                 border border-white/9 bg-white/4
                 hover:border-[#22D3EE]/30 hover:text-white/70
                 transition-colors duration-200 cursor-default"
    >
      {label}
    </motion.span>
  );
}

/* ─── Single module card ──────────────────────────────────────────── */
function ModuleCard({ module, mode, index }) {
  const [hovered, setHovered] = useState(false);
  const isSolution = mode === "solution";
  const content = isSolution ? module.solution : module.problem;

  return (
    <motion.div
      key={`${module.id}-${mode}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.42, delay: index * 0.06, ease: EASE }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col rounded-2xl border overflow-hidden"
      style={{
        borderColor: isSolution
          ? hovered ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.10)"
          : hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
        background: isSolution
          ? "linear-gradient(145deg, #090e14 0%, #0b0d16 100%)"
          : "linear-gradient(145deg, #0c0b12 0%, #0e0d15 100%)",
        transition: "border-color 0.3s",
        padding: "clamp(15px, 1.5vw, 22px)",
        minHeight: 200,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] transition-opacity duration-300"
        style={{
          background: isSolution
            ? "linear-gradient(90deg, transparent, rgba(34,211,238,0.35), transparent)"
            : "linear-gradient(90deg, transparent, rgba(155,109,255,0.22), transparent)",
          opacity: hovered ? 1 : 0.6,
        }}
      />

      {/* Module label */}
      <span
        className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2 block"
        style={{ color: isSolution ? "#22D3EE" : "#9B6DFF" }}
      >
        {module.label}
      </span>

      {/* Title */}
      <h3
        className="font-bold text-white leading-[1.28] mb-2"
        style={{ fontSize: "clamp(14px, 1.1vw, 16px)" }}
      >
        {content.title}
      </h3>

      {/* Body */}
      <p
        className="text-white/45 leading-[1.72] flex-1"
        style={{ fontSize: "clamp(12.5px, 0.95vw, 13.5px)" }}
      >
        {content.body}
      </p>

      {/* Problem hover hint */}
      {!isSolution && (
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] opacity-80" />
          <span className="text-[11px] text-[#22D3EE]/70 font-medium">gOS solves this</span>
        </motion.div>
      )}

      {/* Solution tags */}
      {isSolution && content.tags && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {content.tags.map((tag, i) => (
            <Tag key={tag} label={tag} delay={0.18 + i * 0.06} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Toggle pill ─────────────────────────────────────────────────── */
function TogglePill({ mode, setMode }) {
  const items = [
    { id: "problem",  dot: "#ef4444", label: "Practices Major Issues" },
    { id: "solution", dot: "#22D3EE", label: "gOS in Action"         },
  ];

  return (
    <div
      className="inline-flex rounded-full p-[3px] gap-0.5"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {items.map(item => {
        const active = mode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            style={{ color: active ? "#fff" : "rgba(255,255,255,0.42)", cursor: "pointer", border: "none", background: "transparent" }}
          >
            {active && (
              <motion.div
                layoutId="toggle-bg"
                className="absolute inset-0 rounded-full"
                style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.11)" }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            )}
            <span
              className="relative z-10 w-[7px] h-[7px] rounded-full shrink-0"
              style={{ background: active ? item.dot : "rgba(255,255,255,0.2)", transition: "background 0.3s" }}
            />
            <span className="relative z-10 whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main section ────────────────────────────────────────────────── */
export default function PlatformSection() {
  const [mode, setMode] = useState("problem");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      `}</style>

      <section
        ref={ref}
        id="platform"
        className="relative overflow-hidden"
        style={{
          background: "transparent",
          fontFamily: "'Inter', sans-serif",
          padding: "clamp(36px, 5vh, 72px) 0",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          className="relative z-10 mx-auto w-full"
          style={{ maxWidth: 1280, padding: "0 clamp(20px, 4vw, 56px)" }}
        >

          {/* ── Header ── */}
          <div className="mb-6 md:mb-7">
            <motion.p
              {...fadeUp(0.05)}
              className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-3"
            >
              The Platform
            </motion.p>

            <motion.div {...fadeUp(0.12)} className="mb-3">
              <h2
                className="font-bold text-white leading-[1.08]"
                style={{ fontSize: "clamp(26px, 3.6vw, 42px)" }}
              >
                Four levers.
              </h2>
              <h2
                className="font-bold leading-[1.08]"
                style={{
                  fontSize: "clamp(26px, 3.6vw, 42px)",
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                One operating layer.
              </h2>
            </motion.div>

            <motion.p
              {...fadeUp(0.22)}
              className="text-white/48 leading-[1.6] max-w-[540px]"
              style={{ fontSize: "clamp(13px, 1vw, 15px)", fontWeight: 300 }}
            >
              Every module targets a specific place revenue leaks. Together they run as a
              single system — automatically, continuously, without adding headcount.
            </motion.p>
          </div>

          {/* ── Toggle ── */}
          <motion.div {...fadeUp(0.32)} className="mb-5 md:mb-6">
            <TogglePill mode={mode} setMode={setMode} />
          </motion.div>

          {/* ── Cards grid ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="grid gap-3 md:gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              }}
            >
              {MODULES.map((module, i) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  mode={mode}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ── Footer bar ── */}
          <motion.div
            {...fadeUp(0.5)}
            className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p
              className="text-white/35 font-light italic leading-snug"
              style={{ fontSize: "clamp(12.5px, 1vw, 14px)", maxWidth: 480 }}
            >
              Every module runs automatically. Every action logged. Every gap worked.
            </p>

            <button
              className="shrink-0 inline-flex items-center gap-2.5 font-semibold text-[#07080D] rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(34,211,238,0.25)] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #c8f5f0 0%, #22D3EE 60%, #a78bfa 100%)",
                padding: "12px 24px",
                fontSize: 13,
                letterSpacing: "0.04em",
              }}
            >
              BOOK A DEMO
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 12L11 2M11 2H4.5M11 2V8.5" stroke="#07080D" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>

        </div>
      </section>
    </>
  );
}