import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { MdCall, MdEmail } from "react-icons/md";
import instagramIcon from "../assets/instagram.svg";
import linkedinIcon from "../assets/linkedin.svg";
import opalLogo from "../assets/OPALgos GreyWhite Website.png";

/* ─── Typewriter component ─── */
function Typewriter({ text, started, delay = 0, speed = 30, className = "", style = {} }) {
  const [displayed, setDisplayed] = useState("");
  const [began, setBegan] = useState(false);

  useEffect(() => {
    if (!started) {
      setDisplayed("");
      setBegan(false);
      return;
    }
    const timer = setTimeout(() => setBegan(true), delay);
    return () => clearTimeout(timer);
  }, [started, delay]);

  useEffect(() => {
    if (!began) return;
    if (displayed.length >= text.length) return;
    const id = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(id);
  }, [began, displayed, text, speed]);

  return (
    <span className={className} style={style}>
      {displayed}
      {began && displayed.length < text.length && (
        <span className="inline-block w-[2px] h-[1em] bg-white/70 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

/* ─── Hook: is desktop (lg+) ─── */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function Footer() {
  const isDesktop = useIsDesktop();
  const [isRevealed, setIsRevealed] = useState(false);
  const hideTimerRef = useRef(null);
  const footerRef = useRef(null);

  const mobileRef = useRef(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-80px" });

  const handleEnter = () => {
    if (!isDesktop) return;
    clearTimeout(hideTimerRef.current);
    setIsRevealed(true);
    setTimeout(() => {
      footerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  const handleLeave = () => {
    if (!isDesktop) return;
    hideTimerRef.current = setTimeout(() => {
      setIsRevealed(false);
    }, 600);
  };

  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  const typewriterStarted = isDesktop ? isRevealed : mobileInView;

  const s = isDesktop
    ? { phone: { d: 600, sp: 35 }, email: { d: 900, sp: 35 }, follow: { d: 500, sp: 50 }, insta: { d: 800, sp: 40 }, linked: { d: 1000, sp: 40 }, cta1: { d: 600, sp: 25 }, cta2: { d: 1200, sp: 25 }, btn: 1.8 }
    : { phone: { d: 800, sp: 55 }, email: { d: 1600, sp: 55 }, follow: { d: 2400, sp: 70 }, insta: { d: 3200, sp: 60 }, linked: { d: 3800, sp: 60 }, cta1: { d: 4400, sp: 40 }, cta2: { d: 5800, sp: 40 }, btn: 7.0 };

  /* ─── Expandable content only (no bottom bar here) ─── */
  const footerContent = (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-20 items-start">

        {/* Left: Phone & Email */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4 text-white">
            <a
              href="tel:8779966725"
              className="flex items-center gap-3 text-base md:text-lg hover:text-white/80 transition-colors"
            >
              <MdCall className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <Typewriter
                text="877-996-6725 (OPAL)"
                started={typewriterStarted}
                delay={s.phone.d}
                speed={s.phone.sp}
              />
            </a>
            <a
              href="mailto:info@opalgos.com"
              className="flex items-center gap-3 text-base md:text-lg hover:text-white/80 transition-colors"
            >
              <MdEmail className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
              <Typewriter
                text="info@opalgos.com"
                started={typewriterStarted}
                delay={s.email.d}
                speed={s.email.sp}
              />
            </a>
          </div>
        </div>

        {/* Center: Social Media */}
        <div className="space-y-4">
          <Typewriter
            text="FOLLOW US"
            started={typewriterStarted}
            delay={s.follow.d}
            speed={s.follow.sp}
            className="text-white/40 text-xs tracking-[0.2em] uppercase block"
          />
          <div className="space-y-3">
            <a
              href="https://www.instagram.com/opal_gos/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-base md:text-lg text-white hover:text-white/80 transition-colors"
            >
              <img
                src={instagramIcon}
                alt="Instagram"
                className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <Typewriter
                text="Instagram"
                started={typewriterStarted}
                delay={s.insta.d}
                speed={s.insta.sp}
              />
            </a>
            <a
              href="https://www.linkedin.com/company/opal-gos/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-base md:text-lg text-white hover:text-white/80 transition-colors"
            >
              <img
                src={linkedinIcon}
                alt="LinkedIn"
                className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <Typewriter
                text="LinkedIn"
                started={typewriterStarted}
                delay={s.linked.d}
                speed={s.linked.sp}
              />
            </a>
          </div>
        </div>

        {/* Right: Contact CTA */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <h2 className="text-white text-base md:text-lg font-medium">
              <Typewriter
                text="Pilot assessment availability is limited."
                started={typewriterStarted}
                delay={s.cta1.d}
                speed={s.cta1.sp}
              />
            </h2>
            <p className="text-white/50 text-xs md:text-sm">
              <Typewriter
                text="We work with a select number of DSOs at a time. Request yours before the next cohort fills."
                started={typewriterStarted}
                delay={s.cta2.d}
                speed={s.cta2.sp}
              />
            </p>
          </div>

          <Link to="/contact-us">
            <motion.button
              className="w-full md:w-auto px-6 md:px-8 py-3 border border-white/30 rounded-full flex items-center justify-center md:justify-start gap-3 transition-all text-white hover:bg-white hover:text-black cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: typewriterStarted ? 1 : 0 }}
              transition={{ delay: typewriterStarted ? s.btn : 0, duration: 0.5 }}
            >
              <span>Request a Pilot Assessment</span>
              <span className="flex gap-1.5">
                <span className="w-2 h-2 bg-current rounded-full"></span>
                <span className="w-2 h-2 bg-current rounded-full"></span>
              </span>
            </motion.button>
          </Link>
        </div>

      </div>
    </div>
  );

  /* ─── Always-visible bottom bar ─── */
  const bottomBar = (
    <div className="w-full bg-black border-t border-white/10">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 text-white/60 text-xs md:text-sm">

          {/* Logo */}
          <div className="flex items-center">
            <img
              src={opalLogo}
              alt="OPAL gOS"
              className="h-6 md:h-8 w-auto object-contain"
            />
          </div>

          {/* Copyright */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            © 2026 OPAL gOS. All rights reserved
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a
              href="/sms-opt-in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              SMS Opt In
            </a>
            <span className="text-white/60">|</span>
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>

        </div>
      </div>
    </div>
  );

  /* ─── Mobile ─── */
  if (!isDesktop) {
    return (
      <div ref={mobileRef}>
        <footer className="relative w-full min-h-[50vh] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/65" />
          </div>
          <div className="relative z-10 flex flex-col justify-between min-h-[50vh]">
            {footerContent}
          </div>
        </footer>
        {bottomBar}
      </div>
    );
  }

  /* ─── Desktop ─── */
  return (
    <div ref={footerRef} className="relative w-full">

      {/* Expanding footer */}
      <div
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <motion.footer
          className="relative w-full overflow-hidden origin-center"
          animate={{ height: isRevealed ? "auto" : "80px" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ minHeight: isRevealed ? "50vh" : "80px" }}
        >
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4" type="video/mp4" />
            </video>
            <motion.div
              className="absolute inset-0 bg-black"
              animate={{ opacity: isRevealed ? 0.55 : 0.8 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          {/* Collapsed stripe — logo image instead of text */}
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            animate={{ opacity: isRevealed ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={opalLogo}
              alt="OPAL gOS"
              className="h-6 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.5 }}
            />
          </motion.div>

          {/* Expanded content */}
          <motion.div
            className="relative z-10 flex flex-col justify-between"
            animate={{ opacity: isRevealed ? 1 : 0 }}
            transition={{ duration: 0.5, delay: isRevealed ? 0.4 : 0 }}
            style={{ minHeight: "50vh" }}
          >
            {footerContent}
          </motion.div>
        </motion.footer>
      </div>

      {/* Always-visible bottom bar — outside the expanding area */}
      {bottomBar}

    </div>
  );
}