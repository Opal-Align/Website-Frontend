import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MdCall, MdEmail } from "react-icons/md";
import instagramIcon from "../assets/instagram.svg";
import linkedinIcon from "../assets/linkedin.svg";
import opalLogo from "../assets/OPALgos GreyWhite Website.png";

const OPAL_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";

const gradientText = {
  backgroundImage: OPAL_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

/* Gradient fill for CSS-mask SVG images (instagram, linkedin) */
const gradientMaskIcon = (src, size = "1.25rem") => ({
  display: "inline-block",
  width: size,
  height: size,
  flexShrink: 0,
  backgroundImage: OPAL_GRADIENT,
  backgroundSize: "100% 100%",
  WebkitMaskImage: `url("${src}")`,
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  WebkitMaskSize: "contain",
  maskImage: `url("${src}")`,
  maskRepeat: "no-repeat",
  maskPosition: "center",
  maskSize: "contain",
});

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
  const touchStartY = useRef(0);
  const dismissedAtBottomRef = useRef(false);

  const closeOverlay = () => {
    dismissedAtBottomRef.current = true;
    setIsRevealed(false);
  };

  const mobileRef = useRef(null);
  const mobileInView = useInView(mobileRef, { once: true, margin: "-80px" });

  /* ── Open overlay only at the absolute bottom of the page ── */
  useEffect(() => {
    if (!isDesktop || isRevealed) return;

    const atPageEnd = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportBottom = scrollTop + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      return viewportBottom >= pageHeight;
    };

    const onScroll = () => {
      if (atPageEnd()) {
        if (!dismissedAtBottomRef.current) setIsRevealed(true);
      } else {
        dismissedAtBottomRef.current = false;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop, isRevealed]);

  /* ── Lock body scroll while overlay is open ── */
  useEffect(() => {
    if (!isDesktop) return;
    if (isRevealed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isRevealed, isDesktop]);

  /* ── Dismiss handlers exposed to the overlay div ── */
  const onOverlayWheel = (e) => {
    // Scroll up (negative deltaY) = user wants to go back → close overlay
    if (e.deltaY < 0) closeOverlay();
  };

  const onOverlayTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const onOverlayTouchMove = (e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    // Swipe down (positive dy) = close
    if (dy > 60) closeOverlay();
  };

  const typewriterStarted = isDesktop ? isRevealed : mobileInView;
  const headerVisible = typewriterStarted;

  const s = isDesktop
    ? { phone: { d: 600, sp: 35 }, email: { d: 900, sp: 35 }, follow: { d: 500, sp: 50 }, insta: { d: 800, sp: 40 }, linked: { d: 1000, sp: 40 }, cta1: { d: 600, sp: 25 }, cta2: { d: 1200, sp: 25 }, btn: 1.8 }
    : { phone: { d: 800, sp: 55 }, email: { d: 1600, sp: 55 }, follow: { d: 2400, sp: 70 }, insta: { d: 3200, sp: 60 }, linked: { d: 3800, sp: 60 }, cta1: { d: 4400, sp: 40 }, cta2: { d: 5800, sp: 40 }, btn: 7.0 };

  /* ─── Expandable content only (no bottom bar here) ─── */
  const footerContent = (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
      {/* Hidden SVG gradient defs — makes fill="url(#opalIconGrad)" work for react-icons */}
      <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden>
        <defs>
          <linearGradient id="opalIconGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#B8EEFF" />
            <stop offset="30%"  stopColor="#7DD3FC" />
            <stop offset="60%"  stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      <div className="ft-header">
        <div className="ft-heading">
          <motion.span
            className="ft-hl-bold"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={headerVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            THE NEXT STEP
          </motion.span>
          <motion.span
            className="ft-hl-muted"
            initial={{ opacity: 0, y: 8 }}
            animate={headerVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            See what your queue looks like
          </motion.span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 lg:gap-20 items-start">

        {/* Left: Phone & Email */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <a
              href="tel:8779966725"
              className="flex items-center gap-3 text-base md:text-lg transition-opacity hover:opacity-75"
            >
              <MdCall
                className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                style={{ fill: "url(#opalIconGrad)" }}
              />
              <Typewriter
                text="877-996-6725 (OPAL)"
                started={typewriterStarted}
                delay={s.phone.d}
                speed={s.phone.sp}
                style={gradientText}
              />
            </a>
            <a
              href="mailto:info@opalgos.com"
              className="flex items-center gap-3 text-base md:text-lg transition-opacity hover:opacity-75"
            >
              <MdEmail
                className="w-5 h-5 md:w-6 md:h-6 shrink-0"
                style={{ fill: "url(#opalIconGrad)" }}
              />
              <Typewriter
                text="info@opalgos.com"
                started={typewriterStarted}
                delay={s.email.d}
                speed={s.email.sp}
                style={gradientText}
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
            className="text-xs tracking-[0.2em] uppercase block"
            style={{ ...gradientText, opacity: 0.55 }}
          />
          <div className="space-y-3">
            <a
              href="https://www.instagram.com/opal_gos/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-base md:text-lg transition-opacity hover:opacity-75"
            >
              <span style={gradientMaskIcon(instagramIcon, "1.25rem")} className="md:w-6 md:h-6" />
              <Typewriter
                text="Instagram"
                started={typewriterStarted}
                delay={s.insta.d}
                speed={s.insta.sp}
                style={gradientText}
              />
            </a>
            <a
              href="https://www.linkedin.com/company/opal-gos/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-base md:text-lg transition-opacity hover:opacity-75"
            >
              <span style={gradientMaskIcon(linkedinIcon, "1.25rem")} className="md:w-6 md:h-6" />
              <Typewriter
                text="LinkedIn"
                started={typewriterStarted}
                delay={s.linked.d}
                speed={s.linked.sp}
                style={gradientText}
              />
            </a>
          </div>
        </div>

        {/* Right: Contact CTA */}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2">
            <h2 className="text-base md:text-lg font-medium">
              <Typewriter
                text="Due to high demand, DEMO availability is limited."
                started={typewriterStarted}
                delay={s.cta1.d}
                speed={s.cta1.sp}
                style={gradientText}
              />
            </h2>
            <p className="text-xs md:text-sm">
              <Typewriter
                text="Request your invitation now before slots fill up."
                started={typewriterStarted}
                delay={s.cta2.d}
                speed={s.cta2.sp}
                style={{ ...gradientText, opacity: 0.6 }}
              />
            </p>
          </div>

          <Link to="/contact-us">
            <motion.button
              className="w-full md:w-auto px-6 md:px-8 py-3 rounded-full flex items-center justify-center md:justify-start gap-3 transition-all cursor-pointer"
              style={{
                border: "1px solid transparent",
                background: `linear-gradient(#000, #000) padding-box, ${OPAL_GRADIENT} border-box`,
              }}
              whileHover={{ opacity: 0.8 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: typewriterStarted ? 1 : 0 }}
              transition={{ delay: typewriterStarted ? s.btn : 0, duration: 0.5 }}
            >
              <span style={gradientText}>Join Today</span>
              <span className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: OPAL_GRADIENT }} />
                <span className="w-2 h-2 rounded-full" style={{ background: OPAL_GRADIENT }} />
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 text-xs md:text-sm">

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
            <span style={{ ...gradientText, opacity: 0.55 }}>
              © 2026 OPAL gOS. All rights reserved
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a
              href="/sms-opt-in"
              target="_blank"
              rel="noopener noreferrer"
              style={gradientText}
              className="hover:opacity-80 transition-opacity"
            >
              SMS Opt In
            </a>
            <span style={{ ...gradientText, opacity: 0.35 }}>|</span>
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={gradientText}
              className="hover:opacity-80 transition-opacity"
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
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

          .ft-header {
            text-align: center;
            flex-shrink: 0;
            margin-bottom: clamp(24px, 3.5vh, 40px);
            width: 100%;
            padding: 0 clamp(16px, 3vw, 52px);
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 300;
          }
          .ft-heading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: clamp(8px, 1.2vh, 14px);
            width: 100%;
          }
          .ft-hl-bold {
            display: block;
            font-size: clamp(26px, 4.2vw, 44px);
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #fff;
            line-height: 1.06;
          }
          .ft-hl-muted {
            display: block;
            font-size: clamp(17px, 2.6vw, 26px);
            font-weight: 600;
            letter-spacing: -0.02em;
            color: rgba(255,255,255,0.48);
            line-height: 1.14;
          }
          @media (max-width: 600px) {
            .ft-header { margin-bottom: 20px; padding: 0 14px; }
            .ft-heading { gap: 8px; }
            .ft-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
            .ft-hl-muted { font-size: clamp(14px, 4.2vw, 18px); color: rgba(255,255,255,0.52); }
          }
        `}</style>
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
      </>
    );
  }

  /* ─── Desktop ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .ft-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(24px, 3.5vh, 40px);
          width: 100%;
          padding: 0 clamp(16px, 3vw, 52px);
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }
        .ft-heading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.2vh, 14px);
          width: 100%;
        }
        .ft-hl-bold {
          display: block;
          font-size: clamp(26px, 4.2vw, 44px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #fff;
          line-height: 1.06;
        }
        .ft-hl-muted {
          display: block;
          font-size: clamp(17px, 2.6vw, 26px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.48);
          line-height: 1.14;
        }
        @media (max-width: 600px) {
          .ft-header { margin-bottom: 20px; padding: 0 14px; }
          .ft-heading { gap: 8px; }
          .ft-hl-bold { font-size: clamp(22px, 6.8vw, 30px); }
          .ft-hl-muted { font-size: clamp(14px, 4.2vw, 18px); color: rgba(255,255,255,0.52); }
        }
      `}</style>
      <div className="relative w-full">

      {/* Full-page overlay — fixed so it covers the whole viewport */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            key="footer-overlay"
            className="fixed inset-0 z-200 flex flex-col overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.72, ease: [0.23, 1, 0.32, 1] }}
            onWheel={onOverlayWheel}
            onTouchStart={onOverlayTouchStart}
            onTouchMove={onOverlayTouchMove}
          >
            {/* Video background */}
            <div className="absolute inset-0">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Close control */}
            <div className="relative z-10 flex justify-end px-8 pt-6">
              <button
                onClick={closeOverlay}
                aria-label="Close footer"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  width: 40, height: 40,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.65)",
                  fontSize: 18, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
              >
                ✕
              </button>
            </div>

            {/* Footer content — centred vertically in remaining space */}
            <motion.div
              className="relative z-10 flex flex-col flex-1 justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {footerContent}
            </motion.div>

            {/* Bottom bar inside overlay */}
            <div className="relative z-10">
              {bottomBar}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible bottom bar in document flow (behind the overlay) */}
      {bottomBar}

      </div>
    </>
  );
}