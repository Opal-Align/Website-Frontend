"use client";

/**
 * PlatformSection.jsx — Hover-to-flip card variant
 * --------------------------------------------------
 * Requires: npm install framer-motion
 *
 * Each card shows the Problem on the front face.
 * Hovering (desktop) or tapping (mobile) flips it to reveal the Solution.
 * Text is strictly white / grey only — no brand colour on text.
 */

import { useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";

/* ─── Data ────────────────────────────────────────────────────────── */
const MODULES = [
  {
    id: "schedule", label: "Schedule", num: "01",
    problem: {
      title: "Empty chairs cost you before anyone notices.",
      body: "Open slots, no-shows, and cancellations happen faster than any front desk can respond. By the time staff react, the revenue is already gone.",
    },
    solution: {
      title: "gOS protects the schedule before a chair goes cold.",
      body: "Gaps are identified the moment they open. The right patients are contacted automatically. No-shows rerouted. Recall running every day.",
      tags: ["Gap fill", "Eligibility check", "Recall"],
    },
  },
  {
    id: "produce", label: "Produce", num: "02",
    problem: {
      title: "Accepted treatment walks out unscheduled every day.",
      body: "Patients say yes and leave without booking. Follow-up never comes. That production quietly disappears into a list no one has time to work.",
    },
    solution: {
      title: "gOS follows up on every unscheduled case automatically.",
      body: "Every accepted plan that left without booking gets worked. Right message, right channel, right time — until it converts or your team steps in.",
      tags: ["Treatment follow-up", "Care gaps", "Production recovery"],
    },
  },
  {
    id: "collect", label: "Collect", num: "03",
    problem: {
      title: "Aging A/R gets harder to collect with every passing day.",
      body: "Your billing team is outnumbered. Balances go untouched. Accounts age past 90 days. Revenue that was collectible becomes revenue that's written off.",
    },
    solution: {
      title: "gOS runs A/R outreach at a volume your team never could.",
      body: "Every outstanding balance worked automatically. Multi-channel. Audit-ready. Insurance gaps flagged before they become denials.",
      tags: ["A/R outreach", "Balance recovery", "Audit log"],
    },
  },
  {
    id: "relay", label: "Relay", num: "04",
    problem: {
      title: "Communication in five tools means things fall through every time.",
      body: "Reminders here. Follow-ups there. Patient responses somewhere else. No single person has the full picture — and patients slip through every gap.",
    },
    solution: {
      title: "gOS centralizes every communication into one place.",
      body: "Every channel, every touchpoint, every response — in one dashboard with a full audit trail. Your team sees everything. Nothing drops.",
      tags: ["Unified dashboard", "Audit trail", "Multi-channel"],
    },
  },
];

const EASE = [0.16, 1, 0.3, 1];

/* ─── Shared card surface styles ─────────────────────────────────── */
const FACE_BASE = {
  borderRadius: 16,
  padding: "clamp(20px, 2vw, 28px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const FRONT_STYLE = {
  ...FACE_BASE,
  background: "linear-gradient(150deg, #0c0b13 0%, #0f0d18 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  // both faces share the same grid cell so the card grows to fit the taller face
  gridArea: "1 / 1",
  // webkit prefix needed for Safari
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
};

const BACK_STYLE = {
  ...FACE_BASE,
  background: "linear-gradient(150deg, #0f0e1a 0%, #131220 100%)",
  border: "1px solid rgba(255,255,255,0.13)",
  gridArea: "1 / 1",
  transform: "rotateY(180deg)",
  WebkitBackfaceVisibility: "hidden",
  backfaceVisibility: "hidden",
};

/* ─── Small badge ────────────────────────────────────────────────── */
function Badge({ children, bright = false }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 self-start mb-4"
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: bright ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${bright ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <span
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: bright ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.22)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: bright ? "rgba(255,255,255,0.62)" : "rgba(255,255,255,0.30)",
        }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─── Single flip card ───────────────────────────────────────────── */
function FlipCard({ mod, index, inView }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.08 + index * 0.09, ease: EASE }}
      /* perspective must sit on the wrapper, not the rotating element.
         height:100% lets the card fill its grid cell so every card in a
         row is the same height. */
      style={{ perspective: "1100px", cursor: "pointer", height: "100%" }}
      onHoverStart={() => setFlipped(true)}
      onHoverEnd={() => setFlipped(false)}
      /* tap-to-flip for touch devices */
      onClick={() => setFlipped(f => !f)}
    >
      {/* Rotating layer — grid stacks both faces in one cell so the card
          height is driven by the taller face (tags always fit). */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.72, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: "grid", transformStyle: "preserve-3d", height: "100%" }}
      >

        {/* ══ FRONT — Problem ══ */}
        <div style={FRONT_STYLE}>
          {/* Top shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: 16, right: 16, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
          }} />

          {/* Label row */}
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
              {mod.label}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.16)", fontVariantNumeric: "tabular-nums" }}>
              {mod.num} / 04
            </span>
          </div>

          <Badge>The Problem</Badge>

          {/* Headline */}
          <h3 style={{
            color: "#ffffff", fontWeight: 700, lineHeight: 1.3, marginBottom: 10,
            fontSize: "clamp(14.5px, 1.2vw, 16.5px)",
          }}>
            {mod.problem.title}
          </h3>

          {/* Body */}
          <p style={{
            color: "rgba(255,255,255,0.42)", lineHeight: 1.72, flex: 1,
            fontSize: "clamp(12.5px, 0.95vw, 13.5px)",
          }}>
            {mod.problem.body}
          </p>

          {/* Flip hint */}
          <div className="flex items-center gap-1.5 mt-5" style={{ opacity: 0.3 }}>
            <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.06em" }}>
              hover to reveal
            </span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1.5A4 4 0 1 1 1.5 5.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M5.5 1.5 3.5 3.5M5.5 1.5 7.5 3.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* ══ BACK — Solution ══ */}
        <div style={BACK_STYLE}>
          {/* Top shimmer — brighter than front */}
          <div style={{
            position: "absolute", top: 0, left: 16, right: 16, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
          }} />

          {/* Label row */}
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
              {mod.label}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.20)", fontVariantNumeric: "tabular-nums" }}>
              {mod.num} / 04
            </span>
          </div>

          <Badge bright>gOS in Action</Badge>

          {/* Headline */}
          <h3 style={{
            color: "#ffffff", fontWeight: 700, lineHeight: 1.3, marginBottom: 10,
            fontSize: "clamp(14.5px, 1.2vw, 16.5px)",
          }}>
            {mod.solution.title}
          </h3>

          {/* Body */}
          <p style={{
            color: "rgba(255,255,255,0.45)", lineHeight: 1.72, flex: 1,
            fontSize: "clamp(12.5px, 0.95vw, 13.5px)",
          }}>
            {mod.solution.body}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {mod.solution.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11, fontWeight: 500,
                  color: "rgba(255,255,255,0.48)",
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

/* ─── Main section ────────────────────────────────────────────────── */
export default function PlatformSection() {
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
          padding: "clamp(48px, 7vh, 96px) 0",
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
          <div className="mb-8 md:mb-10">
            <motion.p
              {...fadeUp(0.05)}
              style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
                marginBottom: 14,
              }}
            >
              The Platform
            </motion.p>

            <motion.div {...fadeUp(0.12)} style={{ marginBottom: 12 }}>
              <h2 style={{
                fontWeight: 700, color: "#fff", lineHeight: 1.08,
                fontSize: "clamp(26px, 3.6vw, 48px)", margin: 0,
              }}>
                Four levers.
              </h2>
              <h2 style={{
                fontWeight: 700, lineHeight: 1.08, margin: 0,
                fontSize: "clamp(26px, 3.6vw, 48px)",
                color: "rgba(255,255,255,0.30)",
              }}>
                One operating layer.
              </h2>
            </motion.div>

            <motion.p
              {...fadeUp(0.22)}
              style={{
                color: "rgba(255,255,255,0.42)", lineHeight: 1.65,
                maxWidth: 520, fontWeight: 300,
                fontSize: "clamp(13.5px, 1vw, 15.5px)",
              }}
            >
              Every module targets a specific place revenue leaks. Together they run as a
              single system — automatically, continuously, without adding headcount.
            </motion.p>

            {/* Hover instruction */}
            <motion.p
              {...fadeUp(0.3)}
              style={{
                marginTop: 14, fontSize: 11.5,
                color: "rgba(255,255,255,0.20)",
                fontStyle: "italic",
              }}
            >
              Hover any card to see how gOS solves it.
            </motion.p>
          </div>

          {/* ── Flip card grid ── */}
          <div
            className="grid gap-3 md:gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}
          >
            {MODULES.map((mod, i) => (
              <FlipCard key={mod.id} mod={mod} index={i} inView={inView} />
            ))}
          </div>

          {/* ── Footer bar ── */}
          <motion.div
            {...fadeUp(0.55)}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.28)", fontStyle: "italic",
                fontWeight: 300, lineHeight: 1.5,
                fontSize: "clamp(12.5px, 1vw, 14px)", maxWidth: 480,
              }}
            >
              Every module runs automatically. Every action logged. Every gap worked.
            </p>

            <button
              className="shrink-0 inline-flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.97] transition-transform duration-200"
              style={{
                padding: "12px 26px", borderRadius: 8,
                background: "#ffffff",
                color: "#08060C",
                fontSize: 12.5, fontWeight: 700,
                letterSpacing: "0.06em",
                border: "none", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255,255,255,0.08)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0f0f0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; }}
            >
              BOOK A DEMO
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 11L10 2M10 2H4.5M10 2V7.5" stroke="#08060C" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </motion.div>

        </div>
      </section>
    </>
  );
}