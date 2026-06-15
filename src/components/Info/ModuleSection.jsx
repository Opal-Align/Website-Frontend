import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

import relayIcon from "../../assets/relay.svg";
import collectIcon from "../../assets/collect.svg";
import productionIcon from "../../assets/production.svg";
import scheduleIcon from "../../assets/schedule.svg";

const OPAL_COLORS = ["#7B2FFF", "#00CFFF", "#FF6EFF", "#00FF9C", "#FFD97D", "#B24BF3"];

const OPAL_LIGHT_GRADIENT =
  "linear-gradient(120deg, #B8EEFF 0%, #D4AAFF 30%, #FFB8F5 60%, #AAFFD4 100%)";

// ─── Icon Drift (unchanged) ──────────────────────────────────────────────────
const DRIFT_ICONS = [scheduleIcon, productionIcon, collectIcon, relayIcon];
const DRIFT_TINTS = ["#B8EEFF", "#D4AAFF", "#FFB8F5", "#AAFFD4"];

const DRIFT_PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const col = i % 7;
  const row = Math.floor(i / 7);
  const left    = (col / 6) * 92 + Math.sin(i * 1.9) * 5;
  const top     = (row / 3) * 90 + Math.cos(i * 2.7) * 6;
  const size    = 28 + (i % 5) * 10;
  const opacity = 0.25 + (i % 4) * 0.09;
  const dur     = 9 + (i % 7) * 1.8;
  const delay   = -(i % 8) * 2.3;
  const rot     = (i % 5 - 2) * 12;
  return {
    icon:  DRIFT_ICONS[i % DRIFT_ICONS.length],
    tint:  DRIFT_TINTS[i % DRIFT_TINTS.length],
    left:  `${left}%`,
    top:   `${top}%`,
    size, opacity,
    dur:   `${dur}s`,
    delay: `${delay}s`,
    rot,
  };
});

function IconDrift() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}
    >
      <style>{`
        @keyframes iconDrift {
          0%   { transform: translateY(0px)   rotate(var(--irot)); }
          50%  { transform: translateY(-20px) rotate(calc(var(--irot) + 9deg)); }
          100% { transform: translateY(0px)   rotate(var(--irot)); }
        }
      `}</style>
      {DRIFT_PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.left, top: p.top,
            width: `${p.size}px`, height: `${p.size}px`,
            background: p.tint,
            WebkitMaskImage: `url("${p.icon}")`, maskImage: `url("${p.icon}")`,
            WebkitMaskSize: "contain", maskSize: "contain",
            WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
            WebkitMaskPosition: "center", maskPosition: "center",
            opacity: p.opacity,
            "--irot": `${p.rot}deg`,
            animation: `iconDrift ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── CardSequence ─────────────────────────────────────────────────────────────
// `seqKey` is incremented by the parent each time this face becomes active.
// Changing the key remounts this component, which resets all CSS animations.
//
// Strikethrough: each word is wrapped in a <span> that has text-decoration-line:
// line-through. The color transitions from transparent → red via a CSS animation
// on text-decoration-color. This guarantees the line sits exactly on each word
// regardless of font size, line-height, or wrapping.

function CardSequence({ problem, solution, seqKey }) {
  // Split problem into words so we can wrap each in a span for true per-word strikethrough
  const words = problem.split(" ");

  return (
    <div key={seqKey} style={{ display: "contents" }}>
      <style>{`
        @keyframes cardProblemIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Animates text-decoration-color from transparent to red — 
           this is the only reliable cross-browser way to animate a strikethrough
           that sits correctly on the text itself (not a floating bar). */
        @keyframes wordStrike {
          0%   { text-decoration-color: transparent; }
          100% { text-decoration-color: rgba(255, 80, 80, 0.9); }
        }
        @keyframes cardSolutionIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Problem — fades in, then each word gets strikethrough */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "270px", marginBottom: "1rem", textAlign: "center" }}>
        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.72,
            color: "rgba(220, 230, 255, 0.72)",
            fontWeight: 300,
            margin: 0,
            opacity: 0,
            animation: "cardProblemIn 0.7s ease-out 0s forwards",
          }}
        >
          {words.map((word, wi) => (
            <span
              key={wi}
              style={{
                textDecoration: "line-through",
                textDecorationColor: "transparent",
                textDecorationThickness: "1.5px",
                // Each word's strike starts slightly after the previous,
                // creating a left-to-right sweep across the whole sentence.
                // Strike phase starts at 0.9s, spreads over 0.8s total.
                animation: `wordStrike 0.12s ease-in ${(0.9 + wi * (0.8 / Math.max(words.length - 1, 1))).toFixed(2)}s forwards`,
              }}
            >
              {word}
              {wi < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>

      {/* Solution */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: "270px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.72,
            fontWeight: 400,
            margin: 0,
            color: "#ffffff",
            textShadow: "0 0 18px rgba(212,170,255,0.55), 0 0 36px rgba(184,238,255,0.25)",
            opacity: 0,
            animation: "cardSolutionIn 0.7s ease-out 1.8s forwards",
          }}
        >
          {solution}
        </p>
      </div>
    </div>
  );
}

// ─── AnimatedCard ─────────────────────────────────────────────────────────────
// Instead of IntersectionObserver (unreliable inside preserve-3d / backface-hidden),
// the parent passes `isActive` derived from scrollYProgress. Each time this prop
// flips to true, we bump `seqKey` which remounts CardSequence and replays the
// animation sequence from scratch.

function AnimatedCard({ mod, isActive }) {
  const [seqKey, setSeqKey] = useState(0);
  const prevActive = useRef(false);

  useEffect(() => {
    if (isActive && !prevActive.current) {
      setSeqKey(k => k + 1);
    }
    prevActive.current = isActive;
  }, [isActive]);

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        borderRadius: "28px",
        transform: `rotateY(${mod.angle}deg) translateZ(240px)`,
        backfaceVisibility: "hidden",
      }}
    >
      {/* Gradient border ring */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          borderRadius: "28px",
          padding: "3px",
          background: mod.border,
          pointerEvents: "none",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />

      {/* Inner face */}
      <div
        style={{
          width: "100%", height: "100%",
          borderRadius: "26px",
          background: "transparent",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center",
          padding: "2rem", boxSizing: "border-box",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Icon */}
        <span
          aria-hidden
          style={{
            display: "block",
            width: "56px", height: "56px",
            marginBottom: "0.85rem",
            background: "#ffffff",
            backgroundSize: "180% 180%",
            WebkitMaskImage: `url("${mod.icon}")`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            maskImage: `url("${mod.icon}")`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
            filter: "drop-shadow(0 0 14px rgba(255,255,255,0.45))",
            position: "relative", zIndex: 2,
          }}
        />

        {/* Title */}
        <h3
          style={{
            fontSize: "22px", fontWeight: 600,
            letterSpacing: "0.05em", marginBottom: "0.75rem",
            color: "#ffffff",
            textShadow: "0 0 20px rgba(255,255,255,0.35)",
            position: "relative", zIndex: 2,
          }}
        >
          {mod.title}
        </h3>

        {/* Only mount once the face has been activated — prevents CSS
            animations from running before the face is ever in view */}
        {seqKey > 0 && (
          <CardSequence
            key={seqKey}
            problem={mod.problem}
            solution={mod.solution}
          />
        )}
      </div>
    </div>
  );
}

// ─── Module data ──────────────────────────────────────────────────────────────
const modules = [
  {
    title: "Schedule",
    problem: "Empty slots. Cancellations not reappointed. Patients who can come sooner.",
    solution: "Patients Identified and Verified; Appointments filled automatically.",
    icon: scheduleIcon,
    border: OPAL_LIGHT_GRADIENT,
    titleGrad: OPAL_LIGHT_GRADIENT,
    glow: "#B24BF3",
  },
  {
    title: "Produce",
    problem: "Unscheduled & Declined treatments. Overdue appointments.",
    solution: "Reengaged, reactivated, recovered — automatically.",
    icon: productionIcon,
    border: OPAL_LIGHT_GRADIENT,
    titleGrad: OPAL_LIGHT_GRADIENT,
    glow: "#00CFFF",
  },
  {
    title: "Collect",
    problem: "A/R aging to delinquency, unjustified write-offs, collections without case files.",
    solution: "Surfaced, relentlessly pursued, collected, adjustments documented and queued — automatically.",
    icon: collectIcon,
    border: OPAL_LIGHT_GRADIENT,
    titleGrad: OPAL_LIGHT_GRADIENT,
    glow: "#FF6EFF",
  },
  {
    title: "Relay",
    problem: "Every Patient, every channel, every interaction is centralized.",
    solution: "Provided in real-time. Prioritized and interactive.",
    icon: relayIcon,
    border: OPAL_LIGHT_GRADIENT,
    titleGrad: OPAL_LIGHT_GRADIENT,
    glow: "#7B2FFF",
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ModuleDiamond() {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);

  // -1 = no face active yet. activeFace is set only when the user actually
  // scrolls into the section, which changes rotateY and fires the listener below.
  // This prevents face 0 from animating on page load when the section is
  // partially visible but the user hasn't interacted with it yet.
  const [activeFace, setActiveFace] = useState(-1);

  useEffect(() => {
    const unsub = rotateY.on("change", (deg) => {
      const norm = ((deg % 360) + 360) % 360;
      // Face i sits at angle i*90 on the cube. It faces the viewer when the
      // cube's own rotation is the *negative* of that angle (mod 360).
      const slot = Math.floor((norm + 45) / 90) % 4;
      setActiveFace((4 - slot) % 4);
    });
    return unsub;
  }, [rotateY]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600&family=Space+Mono&display=swap');
      `}</style>

      <section
        id="modules"
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          height: "240vh",
          background: "#04030A",
          fontFamily: "'Bebas Neue', sans-serif",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <IconDrift />

          {/* Nebula blobs */}
          {[
            { color: "#7B2FFF", top: "10%", left: "-8%", w: 420, h: 300 },
            { color: "#00CFFF", top: "50%", right: "-5%", w: 360, h: 360 },
            { color: "#FF6EFF", bottom: "10%", left: "20%", w: 300, h: 200 },
            { color: "#00FF9C", top: "20%", right: "15%", w: 260, h: 260 },
          ].map((n, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: n.w, height: n.h,
                borderRadius: "50%",
                background: n.color,
                filter: "blur(90px)",
                opacity: 0.15,
                top: n.top, left: n.left, right: n.right, bottom: n.bottom,
                zIndex: 1, pointerEvents: "none",
              }}
            />
          ))}

          {/* Title */}
          <h2
            style={{
              position: "relative",
              zIndex: 10,
              fontSize: "clamp(22px, 3.5vw, 42px)",
              fontWeight: 300,
              letterSpacing: "0.06em",
              marginBottom: "8rem",
              background: "linear-gradient(120deg, #B8EEFF 0%, #D4AAFF 30%, #FFB8F5 60%, #AAFFD4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            System in Action
          </h2>

          {/* 3D cube */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ width: "480px", height: "480px", perspective: "1400px" }}>
              <motion.div
                style={{
                  rotateY,
                  width: "100%", height: "100%",
                  position: "relative",
                  transformStyle: "preserve-3d",
                }}
              >
                {modules.map((mod, i) => (
                  <AnimatedCard
                    key={mod.title}
                    mod={{ ...mod, angle: i * 90 }}
                    isActive={activeFace === i}
                  />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll hint */}
          <div
            style={{
              position: "absolute", bottom: "3.5rem", zIndex: 10,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "10px", letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(160, 150, 210, 0.35)",
            }}
          >
            Scroll to explore
          </div>
        </div>
      </section>
    </>
  );
}