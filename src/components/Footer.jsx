import { useState, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MdCall, MdEmail } from "react-icons/md";
import instagramIcon from "../assets/instagram.svg";
import linkedinIcon from "../assets/linkedin.svg";
import opalLogo from "../assets/OPAL.svg";
import { goToTarget, NAV_TARGET } from "./Navbar/navigationConfig";

const OPAL_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";

const gradientText = {
  backgroundImage: OPAL_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

/* White fill for CSS-mask SVG images (instagram, linkedin) */
const whiteMaskIcon = (src, size = "1.25rem") => ({
  display: "inline-block",
  width: size,
  height: size,
  flexShrink: 0,
  backgroundColor: "#fff",
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
        <span className="inline-block w-0.5 h-[1em] bg-white/70 ml-0.5 animate-pulse align-middle" />
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
  const overlayRef = useRef(null);
  // Keep a stable ref to closeOverlay so the non-passive listeners can call
  // the latest version without being re-registered on every render.
  const closeOverlayRef = useRef(null);

  const closeOverlay = () => {
    dismissedAtBottomRef.current = true;
    setIsRevealed(false);
    // Footer can only open from Testimonials — always snap back there on close
    requestAnimationFrame(() => {
      goToTarget(NAV_TARGET.testimonials, () => {});
    });
  };
  closeOverlayRef.current = closeOverlay;

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

  /* ── Non-passive wheel + touch listeners on the overlay element.
     React's synthetic onWheel/onTouchMove are passive — calling
     preventDefault() inside them is silently ignored, so the events would
     still bubble up and trigger the snap controller behind the overlay.
     Native listeners with { passive: false } fix this. ── */
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    let t0 = 0;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) closeOverlayRef.current?.();
    };

    const onTouchStart = (e) => {
      t0 = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.touches[0].clientY - t0 > 60) closeOverlayRef.current?.();
    };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
    };
  }, [isRevealed]); // re-attach when overlay mounts/unmounts

  const typewriterStarted = isDesktop ? isRevealed : mobileInView;
  const headerVisible = typewriterStarted;

  /* Timings follow the visual, top-to-bottom reveal order of the new
     "end-credits" layout: heading → CTA copy → button → contact row. */
  const s = isDesktop
    ? { cta1: { d: 500, sp: 25 }, cta2: { d: 900, sp: 25 }, btn: 1.3, phone: { d: 1600, sp: 30 }, email: { d: 1900, sp: 30 }, follow: { d: 2300, sp: 45 }, insta: { d: 2600, sp: 35 }, linked: { d: 2800, sp: 35 } }
    : { cta1: { d: 800, sp: 35 }, cta2: { d: 1500, sp: 35 }, btn: 2.3, phone: { d: 2900, sp: 45 }, email: { d: 3300, sp: 45 }, follow: { d: 3900, sp: 60 }, insta: { d: 4300, sp: 50 }, linked: { d: 4600, sp: 50 } };

  /* ─── Expandable content only (no bottom bar here) ───
     "End of the movie" credits layout: everything centred in a single
     column, revealed top to bottom — title, message, action, then the
     ways to reach us. */
  const footerContent = (
    <div className="ft-credits w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 pt-10 md:pt-14 pb-0 flex flex-col items-center text-center">
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

      <div className="ft-main">
        <div className="ft-header">
          <div className="ft-heading">
            <motion.span
              className="ft-hl-bold"
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={headerVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              YOUR NEXT STEP
            </motion.span>
            
          </div>
        </div>

        {/* CTA copy */}
        <div className="ft-cta-copy space-y-2">
          
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

        {/* Join button */}
        <Link to="/contact-us" className="ft-join">
          <motion.button
            className="px-7 md:px-9 py-3 rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer"
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

      {/* Contact row — pinned to the lower edge of the footer */}
      <div className="ft-contact-row">
        <a
          href="tel:8779966725"
          className="flex items-center gap-2.5 text-sm md:text-base transition-opacity hover:opacity-75"
        >
          <MdCall className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: "#fff" }} />
          <Typewriter
            text="877-996-6725 (OPAL)"
            started={typewriterStarted}
            delay={s.phone.d}
            speed={s.phone.sp}
            style={gradientText}
          />
        </a>

        <span className="ft-dot" aria-hidden />

        <a
          href="mailto:info@opalgos.com"
          className="flex items-center gap-2.5 text-sm md:text-base transition-opacity hover:opacity-75"
        >
          <MdEmail className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: "#fff" }} />
          <Typewriter
            text="info@opalgos.com"
            started={typewriterStarted}
            delay={s.email.d}
            speed={s.email.sp}
            style={gradientText}
          />
        </a>

        <span className="ft-dot" aria-hidden />

        <a
          href="https://www.instagram.com/opal_gos/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm md:text-base transition-opacity hover:opacity-75"
        >
          <span style={whiteMaskIcon(instagramIcon, "1.05rem")} />
          <Typewriter
            text="Instagram"
            started={typewriterStarted}
            delay={s.insta.d}
            speed={s.insta.sp}
            style={gradientText}
          />
        </a>

        <span className="ft-dot" aria-hidden />

        <a
          href="https://www.linkedin.com/company/opal-gos/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 text-sm md:text-base transition-opacity hover:opacity-75"
        >
          <span style={whiteMaskIcon(linkedinIcon, "1.05rem")} />
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
              className="h-6 md:h-8 w-auto object-contain ft-logo-glow"
            />
          </div>

          {/* Copyright */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <span style={{ ...gradientText, opacity: 0.55 }}>
              © 2026 OPAL gOS, Inc. All rights reserved
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <a
              href="/sms-opt-in"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...gradientText, opacity: 0.55 }}
              className="hover:opacity-80 transition-opacity"
            >
              SMS Opt In
            </a>
            <span style={{ ...gradientText, opacity: 0.35 }}>|</span>
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...gradientText, opacity: 0.55 }}
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

          .ft-credits {
            flex: 1;
            min-height: 0;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
          }
          .ft-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
          }
          .ft-header {
            text-align: center;
            flex-shrink: 0;
            margin-bottom: clamp(20px, 3vh, 32px);
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
            font-size: var(--page-hl-bold-size);
            font-weight: var(--page-hl-bold-weight);
            letter-spacing: var(--page-hl-bold-tracking);
            color: var(--page-hl-bold-color);
            line-height: var(--page-hl-bold-lh);
          }
          .ft-hl-muted {
            display: block;
            font-size: var(--page-hl-muted-size);
            font-weight: var(--page-hl-muted-weight);
            letter-spacing: var(--page-hl-muted-tracking);
            color: var(--page-hl-muted-color);
            line-height: var(--page-hl-muted-lh);
          }
          .ft-cta-copy { margin-bottom: clamp(20px, 3vh, 32px); max-width: 34rem; }
          .ft-join { margin-bottom: 0; }
          .ft-contact-row {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: clamp(14px, 2vh, 18px);
            flex-shrink: 0;
            margin-top: auto;
            padding-top: clamp(20px, 3vh, 32px);
            padding-bottom: 10px;
          }
          .ft-dot { display: none; }
          @media (max-width: 600px) {
            .ft-header { margin-bottom: 20px; padding: 0 14px; }
            .ft-heading { gap: 8px; }
            .ft-cta-copy { margin-bottom: 22px; }
          }

          .ft-logo-glow {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.55))
                    drop-shadow(0 0 22px rgba(255,255,255,0.22))
                    drop-shadow(0 0 44px rgba(255,255,255,0.10));
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
          <div className="relative z-10 flex flex-col flex-1 min-h-[50vh]">
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

        .ft-credits {
          flex: 1;
          min-height: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
        }
        .ft-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .ft-header {
          text-align: center;
          flex-shrink: 0;
          margin-bottom: clamp(20px, 3vh, 32px);
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
          font-size: var(--page-hl-bold-size);
          font-weight: var(--page-hl-bold-weight);
          letter-spacing: var(--page-hl-bold-tracking);
          color: var(--page-hl-bold-color);
          line-height: var(--page-hl-bold-lh);
        }
        .ft-hl-muted {
          display: block;
          font-size: var(--page-hl-muted-size);
          font-weight: var(--page-hl-muted-weight);
          letter-spacing: var(--page-hl-muted-tracking);
          color: var(--page-hl-muted-color);
          line-height: var(--page-hl-muted-lh);
        }
        .ft-cta-copy { margin-bottom: clamp(24px, 3.5vh, 36px); max-width: 34rem; }
        .ft-join { margin-bottom: 0; }
        .ft-contact-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: clamp(18px, 2.4vw, 40px);
          flex-shrink: 0;
          margin-top: auto;
          padding-top: clamp(24px, 4vh, 40px);
          padding-bottom: 10px;
        }
        .ft-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          display: inline-block;
        }
        @media (max-width: 600px) {
          .ft-header { margin-bottom: 20px; padding: 0 14px; }
          .ft-heading { gap: 8px; }
        }

        .ft-logo-glow {
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.55))
                  drop-shadow(0 0 22px rgba(255,255,255,0.22))
                  drop-shadow(0 0 44px rgba(255,255,255,0.10));
        }
      `}</style>
      <div className="relative w-full">

      {/* Full-page overlay — fixed so it covers the whole viewport */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            ref={overlayRef}
            key="footer-overlay"
            className="fixed inset-0 z-200 flex flex-col overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.72, ease: [0.23, 1, 0.32, 1] }}
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

            {/* Footer content — headline/CTA centered; contact row pinned low */}
            <motion.div
              className="relative z-10 flex flex-col flex-1 min-h-0"
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