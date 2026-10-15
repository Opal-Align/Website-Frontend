// ScrollHero.jsx — Leo Burnett-style pinned hero with enamel particle background
// Drop-in ready. No external assets needed except your opalLogo import.
// Replace the opalLogo import path to match your project.

import { useRef, useEffect, useState } from "react";
import opalLogo from "../../assets/OPAL - LOGO.svg";
import heroPoster from "../../assets/hero-assets/poster.webp";
import hero720Mp4 from "../../assets/hero-assets/hero-720.mp4";
import hero720Webm from "../../assets/hero-assets/hero-720.webm";
import hero1080Mp4 from "../../assets/hero-assets/hero-1080.mp4";
import hero1080Webm from "../../assets/hero-assets/hero-1080.webm";
import useScrollContainer from "../../hooks/useScrollContainer";

const NAVY = "#08060C";

const HERO_SOURCES = {
  720: { mp4: hero720Mp4, webm: hero720Webm },
  1080: { mp4: hero1080Mp4, webm: hero1080Webm },
};

// 16:9 frame that leaves room for the logo above and the caption below.
const VIDEO_WIDTH = "min(90vw, 56rem, calc((var(--snap-h, 100vh) - 12.5rem) * 16 / 9))";

// ─── Starfield hook ──────────────────────────────────────────────────────────
function useEnamelParticles(canvasRef, containerRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, raf = null;
    let mouseX = 0, mouseY = 0;
    let smoothX = 0, smoothY = 0;
    // Loop only runs while the hero is on-screen and the tab is visible.
    let onScreen = true;
    let running = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX / window.innerWidth  - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Pre-render the soft glow once into an offscreen sprite instead of
    // calling createRadialGradient() for every near star every frame.
    const SPRITE_R = 32;
    const glow = document.createElement("canvas");
    glow.width = glow.height = SPRITE_R * 2;
    const gctx = glow.getContext("2d");
    const grad = gctx.createRadialGradient(
      SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R,
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);

    let stars = [];

    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
    }

    function makeStar(randomZ = true) {
      return {
        x: (Math.random() - 0.5),
        y: (Math.random() - 0.5),
        z: randomZ ? Math.random() : 1,
        speed: Math.random() * 0.00065 + 0.00022,
        twinkle: Math.random() > 0.55,
        twinklePeriod: Math.random() * 4 + 2,
        twinklePhase:  Math.random() * Math.PI * 2,
        twinkleDepth:  Math.random() * 0.4 + 0.15,
        px: null, py: null,
      };
    }

    function init() {
      // Scale count to viewport area (capped) instead of a flat 1000. On a
      // typical screen this is ~420 — roughly 2.5× fewer than before.
      const target = Math.min(460, Math.round((W * H) / 4200) || 420);
      stars = Array.from({ length: target }, () => makeStar(true));
    }

    function renderFrame(t) {
      const cx = W / 2;
      const cy = H / 2;

      for (const s of stars) {
        s.z -= s.speed;

        if (s.z <= 0) {
          Object.assign(s, makeStar(false));
          s.px = null; s.py = null;
          continue;
        }

        const perspective = 1 / s.z;
        const parallaxStrength = (1 - s.z) * 0.06;
        const sx = cx + (s.x + smoothX * parallaxStrength) * W * perspective;
        const sy = cy + (s.y + smoothY * parallaxStrength) * H * perspective;

        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) {
          s.px = null; s.py = null;
          continue;
        }

        const nearness = 1 - s.z;
        const r = Math.max(0.12, nearness * 2.4);
        let alpha = Math.min(1, nearness * 1.5);

        if (s.twinkle && s.z > 0.35) {
          const osc = Math.sin(t / s.twinklePeriod * Math.PI * 2 + s.twinklePhase);
          alpha *= 1 - s.twinkleDepth * 0.5 + s.twinkleDepth * 0.5 * osc;
        }
        alpha = Math.max(0, Math.min(1, alpha));

        if (s.px !== null && nearness > 0.5) {
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.30})`;
          ctx.lineWidth = r * 0.55;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();

        if (nearness > 0.75 && r > 1.2) {
          const R = r * 3.5;
          ctx.globalAlpha = alpha * 0.22;
          ctx.drawImage(glow, sx - R, sy - R, R * 2, R * 2);
          ctx.globalAlpha = 1;
        }

        s.px = sx;
        s.py = sy;
      }
    }

    function draw() {
      if (!running) return;
      if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) { resize(); init(); }

      smoothX += (mouseX - smoothX) * 0.055;
      smoothY += (mouseY - smoothY) * 0.055;

      ctx.fillStyle = "rgba(8,6,12,0.20)";
      ctx.fillRect(0, 0, W, H);

      renderFrame(performance.now() / 1000);
      raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running || !onScreen || document.hidden || reduced) return;
      running = true;
      raf = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    init();

    if (reduced) {
      // One static frame — no loop for reduced-motion users.
      ctx.fillStyle = "rgba(8,6,12,1)";
      ctx.fillRect(0, 0, W, H);
      renderFrame(0);
    } else {
      start();
    }

    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);

    // Pause the loop whenever the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start(); else stop();
      },
      {
        root: containerRef?.current ?? null,
        threshold: 0,
      },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [canvasRef, containerRef]);
}

// ─── Dish-style "channel change" static ─────────────────────────────────────
// Tiny 160×90 noise canvas, CSS-upscaled. Only runs while static is visible;
// once it fades to 0 the loop stops and the canvas is hidden (zero cost).
function useChannelStatic(canvasRef) {
  const api = useRef({ set() {}, rampTo() {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const NW = 160, NH = 90;
    canvas.width = NW;
    canvas.height = NH;
    const img = ctx.createImageData(NW, NH);
    const px = new Uint32Array(img.data.buffer);
    const host = canvas.parentElement;

    let level = 0, ramp = null, raf = null, last = 0, running = false;

    function frame(t) {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      if (ramp) {
        const k = Math.min(1, (t - ramp.t0) / ramp.dur);
        const e = k * k * (3 - 2 * k);
        level = ramp.from + (ramp.to - ramp.from) * e;
        if (k === 1) {
          const cb = ramp.cb;
          ramp = null;
          if (cb) cb();
        }
      }
      if (level <= 0.001 && !ramp) { stop(); return; }
      if (t - last < 40) return; // ~25fps looks more like analog noise
      last = t;

      const a = ((Math.min(1, level) * 255) | 0) << 24;
      for (let i = 0; i < px.length; i++) {
        const v = (Math.random() * 256) | 0;
        px[i] = a | (v << 16) | (v << 8) | v;
      }
      ctx.putImageData(img, 0, 0);
      // horizontal tear/jitter while the signal is "unstable"
      canvas.style.transform =
        level > 0.15 ? `translateX(${((Math.random() - 0.5) * level * 16) | 0}px)` : "";
    }

    function start() {
      if (running) return;
      running = true;
      host.dataset.static = "on";
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      host.dataset.static = "off";
      canvas.style.transform = "";
    }

    api.current = {
      set(v) {
        level = v;
        ramp = null;
        if (v > 0) start(); else stop();
      },
      rampTo(to, dur, cb) {
        start();
        ramp = { from: level, to, dur, t0: performance.now(), cb };
      },
    };

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [canvasRef]);

  return api;
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ScrollHero() {
  const grainRef   = useRef(null);
  const staticRef  = useRef(null);
  const videoRef   = useRef(null);
  const scrollContainerRef = useScrollContainer();

  useEnamelParticles(grainRef, scrollContainerRef);
  const fx = useChannelStatic(staticRef);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // ── Video: fetch immediately; static covers only the initial fetch ──
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const slow = conn && (conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || ""));
    if (reduced || slow) {
      fx.current.set(0); // poster only — no download, no noise
      return;
    }

    let inView = true;
    let staticVisible = true;
    fx.current.set(0.92);

    const revealVideo = () => {
      if (!staticVisible) return;
      staticVisible = false;
      fx.current.rampTo(0, 250);
    };

    const tryPlay = () => {
      if (!v.src || !inView || document.hidden) return;
      v.play().catch(revealVideo); // autoplay blocked → reveal the poster
    };

    const onPlaying = revealVideo;
    const onError = revealVideo;

    const ua = navigator.userAgent;
    const isSafari = /safari/i.test(ua) && !/chrome|chromium|android/i.test(ua);
    const webm = !isSafari && v.canPlayType('video/webm; codecs="vp9"');
    const quality = window.innerWidth > 900 ? "1080" : "720";
    v.src = HERO_SOURCES[quality][webm ? "webm" : "mp4"];
    v.load();
    tryPlay();

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) tryPlay(); else v.pause();
      },
      { root: scrollContainerRef?.current ?? null, threshold: 0.15 },
    );
    io.observe(v);

    const onVisibility = () => { if (document.hidden) v.pause(); else tryPlay(); };
    document.addEventListener("visibilitychange", onVisibility);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
      io.disconnect();
      v.pause();
      v.removeAttribute("src");
      v.load(); // release the network + decoder
    };
  }, [fx, scrollContainerRef]);

  return (
    <>
      <style>{`
        @keyframes logoIn {
          0%   { opacity: 0; transform: scale(0.72); filter: blur(20px); }
          55%  { opacity: 1; filter: blur(0px); }
          78%  { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes heroScrollHint {
          0%, 100% { transform: scaleY(0); }
          50% { transform: scaleY(1); }
        }
        .logo-mount  { animation: logoIn 1.15s cubic-bezier(0.16,1,0.3,1) forwards; }
        .logo-hidden { opacity: 0; }
        .hero-h1     { font-size: inherit; }
        .hero-copy > * { opacity: 0; }
        .hero-copy.is-in > * {
          animation: logoIn 1.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hero-copy {
          gap: clamp(16px, 2.4vh, 28px);
        }
        .hero-copy.is-in > :nth-child(1) { animation-delay: 0.08s; }
        .hero-copy.is-in > :nth-child(2) { animation-delay: 0.24s; }
        .hero-copy.is-in > :nth-child(3) { animation-delay: 0.42s; }
        .hero-logo {
          height: clamp(2.1rem, 4.8vh, 3.2rem);
          width: auto;
        }
        .hero-caption {
          margin: 0;
          max-width: 44rem;
          line-height: 1.45;
        }
        .hero-hint { opacity: 0; }
        .hero-hint.is-in { animation: hintIn 0.8s ease 0.95s both; }
        @keyframes hintIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-scroll-hint {
          animation: heroScrollHint 1.6s ease-in-out infinite;
          transform-origin: top;
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-mount, .logo-hidden { animation: none; opacity: 1; filter: none; transform: none; }
          .hero-copy > *,
          .hero-copy.is-in > * { animation: none; opacity: 1; filter: none; transform: none; }
          .hero-hint, .hero-hint.is-in { animation: none; opacity: 1; }
          .hero-scroll-hint { animation: none; transform: scaleY(1); }
        }
        .hero-copy > .hero-frame {
          opacity: 1;
        }
        .hero-copy.is-in > .hero-frame {
          animation: none;
        }
        .tv-scan { background: repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px); }
        .tv-roll {
          position: absolute; left: 0; right: 0; top: -25%; height: 22%;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          animation: tvRoll 1.4s linear infinite;
        }
        @keyframes tvRoll { to { transform: translateY(570%); } }
        .tv-frame[data-static="off"] .tv-noise,
        .tv-frame[data-static="off"] .tv-overlay { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .tv-noise, .tv-overlay { display: none; }
        }
        .logo-clickable:hover img {
          filter: brightness(0) invert(1) drop-shadow(0 8px 40px rgba(255,255,255,0.32)) !important;
        }
      `}</style>

      <section
        className="relative w-full"
        style={{ height: "100%", backgroundColor: NAVY }}
      >
        <div
          className="sticky top-0 w-full overflow-hidden"
          style={{ height: "var(--snap-h, 100vh)", backgroundColor: NAVY }}
        >
          <canvas
            ref={grainRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ opacity: 0.85, mixBlendMode: "screen", zIndex: 1 }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 2,
              background: `radial-gradient(ellipse at 50% 42%, transparent 28%, ${NAVY}bb 68%, ${NAVY}f0 100%)`,
            }}
          />

          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{ zIndex: 2, background: `linear-gradient(to bottom, transparent, ${NAVY})` }}
          />

          {/* Logo, video, and caption share one centered column */}
          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <div
              className={`hero-copy flex w-full flex-col items-center text-center text-white${mounted ? " is-in" : ""}`}
              style={{ maxWidth: VIDEO_WIDTH }}
            >
              <div className="flex shrink-0 items-center justify-center">
                <img
                  src={opalLogo}
                  alt="OPAL"
                  className="hero-logo object-contain select-none pointer-events-none"
                  style={{
                    filter: "brightness(0) invert(1) drop-shadow(0 8px 30px rgba(255,255,255,0.18))",
                  }}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                />
              </div>
              <div
                className="hero-frame tv-frame relative w-full overflow-hidden rounded-xl"
                data-static="on"
                style={{
                  aspectRatio: "16 / 9",
                  background: "#000",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,255,255,0.05)",
                  contain: "layout paint",
                }}
              >
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  poster={heroPoster}
                  preload="auto"
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  disableRemotePlayback
                  tabIndex={-1}
                  aria-hidden="true"
                />
                {/* static + scanlines sit above the video and vanish once it plays */}
                <canvas
                  ref={staticRef}
                  className="tv-noise absolute inset-0 h-full w-full pointer-events-none"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="tv-overlay tv-scan absolute inset-0 pointer-events-none" />
                <div className="tv-overlay tv-roll pointer-events-none" />
              </div>

              <p className="hero-caption font-['Montserrat'] font-light text-white/55 text-[clamp(0.9rem,1.4vw,1.15rem)] tracking-[0.06em]">
              Your Practices are leaking revenue. <br />OPAL can Recover Revenue & Maximize Margins <br/> with <strong className="font-bold text-white/90">No New Hires</strong>.
              </p>
            </div>
          </div>

          {/* Keep the headline for SEO / screen readers */}
          <h1 className="sr-only">Recover Revenue. Maximize Margins. Zero new hires.</h1>

        </div>
      </section>
    </>
  );
}