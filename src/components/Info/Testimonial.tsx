import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  company?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Honestly, the biggest difference is we're not digging through ledgers anymore. Opal just shows us who needs attention, and the automation takes care of most of the follow-ups.",
    name: "Dentist (Practice Owner)",
  },
  {
    quote:
      "Collections used to feel like a guessing game. Now it's very clear who we need to contact and when, and the system handles a lot of it automatically.",
    name: "Office Manager",
  },
  {
    quote:
      "I like that it takes the pressure off the front desk. Patients are getting reminders and follow-ups without the team having to constantly call.",
    name: "Clinical Assistant",
  },
  {
    quote:
      "We're seeing more patients come back in just from the automated messages. It's consistent, which we were never able to do manually.",
    name: "Treatment Coordinator",
  },
];

function Process() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let id: number;
    let stars: Array<{
      x: number;
      y: number;
      r: number;
      base: number;
      tw: boolean;
      ph: number;
      sp: number;
    }> = [];

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 2800) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() < 0.04 ? Math.random() * 1.5 + 0.8 : Math.random() * 0.6 + 0.1,
        base: Math.random() * 0.6 + 0.1,
        tw: Math.random() > 0.6,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = (t: number) => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        let a = s.base;
        if (s.tw) a = s.base * (0.35 + 0.65 * Math.sin(t * 0.001 * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fill();
        if (s.r > 1.2) {
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
      }
      id = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    id = requestAnimationFrame(draw);
    return () => { 
      cancelAnimationFrame(id); 
      window.removeEventListener("resize", resize); 
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const TestimonialSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div id="testimonials" className="relative bg-black overflow-hidden py-16">
      <Process />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.8) 100%)" }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-white/25 mb-3">
            Voices from the field
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">Testimonials</h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} item={item} index={index} inView={inView} />
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex items-center gap-4 mt-8 border-t border-white/5 pt-6"
        >
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20">
            ∞ · trusted · validated · proven
          </span>
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
};

function TestimonialCard({ item, index, inView }: { item: Testimonial, index: number, inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden border-t border-white/5 transition-colors duration-500 cursor-default"
      style={{ backgroundColor: hovered ? "#111" : "#000" }}
    >
      <div className="relative z-10 p-6 md:p-8 flex flex-col gap-4">
        {/* Star dot */}
        <div className="absolute top-4 right-4">
          <div className="w-[5px] h-[5px] rounded-full bg-purple-200 shadow-[0_0_8px_3px_rgba(210,195,255,0.5)]" />
          {hovered && (
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 5, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-white/20"
            />
          )}
        </div>

        {/* Quote */}
        <p className="text-white/80 leading-relaxed text-base md:text-lg">
          "{item.quote}"
        </p>

        <div className="h-px bg-white/5" />

        {/* Author */}
        <div>
          <p className="text-white font-semibold tracking-tight text-lg leading-tight">
            {item.name}
          </p>
          {(item.role || item.company) && (
            <p className="text-sm text-gray-400 leading-relaxed mt-1">
              {[item.role, item.company].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TestimonialSection;