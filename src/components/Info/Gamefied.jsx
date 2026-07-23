import { useEffect, useRef } from "react";

const OPAL_GRADIENT =
  "linear-gradient(120deg, #FFFFFF 0%, #F8FAFC 30%, #F3F4F6 65%, #FFFFFF 100%)";

const gradientText = {
  backgroundImage: OPAL_GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

const CRAFTS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L9.5 6H15L10.5 9.5L12 14.5L8 11.5L4 14.5L5.5 9.5L1 6H6.5L8 1Z"
          fill="url(#cg1)" />
        <defs>
          <linearGradient id="cg1" x1="1" y1="14.5" x2="15" y2="1">
            <stop offset="0%" stopColor="#B8EEFF" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    pts: "+150 pts",
    label: "Patient invoice paid",
    sub: "Outreach converted to cash",
    accent: "#B8EEFF",
    delay: "0s",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M9 1L5 9H8L7 15L13 7H9.5L9 1Z" fill="url(#cg2)" />
        <defs>
          <linearGradient id="cg2" x1="5" y1="15" x2="13" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>
      </svg>
    ),
    pts: "+300 pts",
    label: "Revenue gap closed",
    sub: "A missed charge recovered",
    accent: "#38BDF8",
    delay: "0.4s",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="3"
          stroke="url(#cg3)" strokeWidth="1.5" fill="none" />
        <path d="M5 8.5L7 10.5L11 6" stroke="url(#cg3)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="cg3" x1="2" y1="14" x2="14" y2="2">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
    ),
    pts: "+500 pts",
    label: "Account fully recovered",
    sub: "Zero balance, max essence",
    accent: "#22D3EE",
    delay: "0.8s",
  },
];

export default function SpaceRacer() {
  const canvasRef = useRef(null);
  const cardElemsRef = useRef([]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");

    const measure = () => {
      const rect = cv.getBoundingClientRect();
      return { w: Math.max(1, Math.floor(rect.width)), h: Math.max(1, Math.floor(rect.height)) };
    };

    let { w: W, h: H } = measure();
    cv.width = W;
    cv.height = H;

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      v: Math.random() * 0.7 + 0.1,
      a: Math.random(),
    }));

    const nebula = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      rx: 100 + Math.random() * 160,
      ry: 60 + Math.random() * 100,
      hue: [220, 210, 200, 195, 240, 210, 250][i],
      a: 0.03 + Math.random() * 0.04,
    }));

    // Ship sits at ~65% down — much closer to the cards
    const ship = { x: W / 2, y: H * 0.65 };
    const manualLasers = [];
    const autoShots   = [];
    const bursts      = [];
    const sparks      = [];

    let mx   = W / 2;
    let tick = 0;
    let animId;

    // Auto-fire scheduling
    let autoFireTick    = 90;   // first shot at tick 90
    let autoFireCardIdx = 0;
    let shotTypeIdx     = 0;
    const SHOT_TYPES    = ["laser", "bomb", "cracker"];

    // Approximate horizontal centers of the 3 cards.
    // Cards are centered in W with equal spacing — this matches the flex layout.
    const getCardCenters = () => {
      const slotW = Math.min(W / 3.2, 270);
      const totalW = 3 * slotW;
      const sx = (W - totalW) / 2 + slotW / 2;
      return [sx, sx + slotW, sx + slotW * 2];
    };

    // Approximate Y where card centres sit (eyebrow + headline + gap ≈ 30% down)
    const CARD_Y = () => H * 0.31;

    // ── Event handlers ────────────────────────────────────────────────────────
    const handleMouseMove = (e) => {
      const rect = cv.getBoundingClientRect();
      mx = (e.clientX - rect.left) * (W / rect.width);
    };

    const handleClick = (e) => {
      const rect = cv.getBoundingClientRect();
      const tx = (e.clientX - rect.left) * (W / rect.width);
      manualLasers.push({ x: ship.x - 6, y: ship.y - 10, vy: -16, life: 1 });
      manualLasers.push({ x: ship.x + 6, y: ship.y - 10, vy: -16, life: 1 });
      bursts.push({ x: tx, y: CARD_Y(), age: 0, max: 28, hue: 45, size: 40 });
    };

    const handleResize = () => {
      const next = measure();
      W = next.w; H = next.h;
      cv.width = W; cv.height = H;
      ship.y = H * 0.65;
      mx = Math.min(mx, W);
      stars.forEach(s => {
        if (s.x > W) s.x = Math.random() * W;
        if (s.y > H) s.y = Math.random() * H;
      });
    };

    cv.addEventListener("mousemove", handleMouseMove);
    cv.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    const ro = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(handleResize) : null;
    if (ro) ro.observe(cv);

    // ── Draw helpers ──────────────────────────────────────────────────────────
    function drawNebula() {
      nebula.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(n.rx, n.ry));
        g.addColorStop(0, `hsla(${n.hue},70%,60%,${n.a * 2})`);
        g.addColorStop(1, `hsla(${n.hue},70%,40%,0)`);
        ctx.save();
        ctx.scale(1, n.ry / n.rx);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    function drawStars() {
      stars.forEach(s => {
        const tw = Math.sin(tick * 0.02 + s.a * 10) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(255,255,255,${tw * 0.85})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.v;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      });
    }

    function drawShip(x, y) {
      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = "#c8e8ff";
      ctx.beginPath();
      ctx.moveTo(0, -20); ctx.lineTo(13, 15); ctx.lineTo(5, 9);
      ctx.lineTo(0, 13); ctx.lineTo(-5, 9); ctx.lineTo(-13, 15);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#3399ee";
      ctx.beginPath();
      ctx.moveTo(0, -15); ctx.lineTo(5, 5); ctx.lineTo(0, 2); ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#aaddff";
      ctx.fillRect(-2, -6, 4, 6);

      const flicker = 0.7 + Math.random() * 0.3;
      ctx.fillStyle = `rgba(255,160,60,${flicker})`;
      ctx.beginPath(); ctx.ellipse(-6, 19, 3, 8 * flicker, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6,  19, 3, 8 * flicker, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(255,220,120,${flicker * 0.6})`;
      ctx.beginPath(); ctx.ellipse(-6, 17, 1.5, 4 * flicker, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(6,  17, 1.5, 4 * flicker, 0, 0, Math.PI * 2); ctx.fill();

      ctx.restore();
    }

    function drawManualLasers() {
      for (let i = manualLasers.length - 1; i >= 0; i--) {
        const l = manualLasers[i];
        ctx.save();
        ctx.globalAlpha = l.life;
        ctx.fillStyle = "#00ffcc";
        ctx.shadowColor = "#00ffcc";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(l.x, l.y, 2, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        l.y  += l.vy;
        l.life -= 0.012;
        if (l.y < -20 || l.life <= 0) manualLasers.splice(i, 1);
      }
    }

    // Trigger a CSS hit-flash on a card element
    function triggerCardHit(cardIdx) {
      const el = cardElemsRef.current[cardIdx];
      if (!el) return;
      el.classList.remove("card-hit");
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add("card-hit");
    }

    // Fire one auto-shot toward the current card
    function fireAutoShot() {
      const centers = getCardCenters();
      const ci = autoFireCardIdx % 3;
      const tx = centers[ci];
      const ty = CARD_Y();
      const dx = tx - ship.x;
      const dy = ty - (ship.y - 15);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const type  = SHOT_TYPES[shotTypeIdx % 3];
      const speed = type === "laser" ? 22 : type === "bomb" ? 9 : 14;

      autoShots.push({
        x: ship.x, y: ship.y - 15,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        type, cardIdx: ci, tx, ty, life: 1,
      });
      autoFireCardIdx++;
      shotTypeIdx++;
    }

    function drawAutoShots() {
      for (let i = autoShots.length - 1; i >= 0; i--) {
        const s = autoShots[i];
        const d2t = Math.sqrt((s.x - s.tx) ** 2 + (s.y - s.ty) ** 2);

        // Hit detection
        if (d2t < 32 || s.y < -20 || s.life <= 0) {
          if (d2t < 90) {
            if (s.type === "laser") {
              bursts.push({ x: s.tx, y: s.ty, age: 0, max: 24, hue: 165, size: 42 });
            } else if (s.type === "bomb") {
              bursts.push({ x: s.tx, y: s.ty, age: 0,  max: 38, hue: 28,  size: 70 });
              bursts.push({ x: s.tx, y: s.ty, age: 5,  max: 30, hue: 45,  size: 52 });
              bursts.push({ x: s.tx, y: s.ty, age: 10, max: 24, hue: 55,  size: 36 });
            } else {
              // cracker — firecracker shower
              for (let k = 0; k < 18; k++) {
                const ang = (k / 18) * Math.PI * 2;
                const spd = 2 + Math.random() * 4;
                sparks.push({
                  x: s.tx, y: s.ty,
                  vx: Math.cos(ang) * spd,
                  vy: Math.sin(ang) * spd - 1,
                  life: 1,
                  hue: 185 + Math.random() * 25,
                  r: 2 + Math.random() * 2.5,
                });
              }
              bursts.push({ x: s.tx, y: s.ty, age: 0, max: 20, hue: 195, size: 38 });
            }
            triggerCardHit(s.cardIdx);
          }
          autoShots.splice(i, 1);
          continue;
        }

        // Draw the shot
        ctx.save();
        if (s.type === "laser") {
          const angle = Math.atan2(s.vy, s.vx);
          ctx.translate(s.x, s.y);
          ctx.rotate(angle);
          ctx.globalAlpha = s.life;
          ctx.fillStyle = "#00ffcc";
          ctx.shadowColor = "#00ffcc";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.type === "bomb") {
          ctx.globalAlpha = s.life;
          ctx.shadowColor = "#ff5500";
          ctx.shadowBlur = 22;
          ctx.fillStyle = "#ff8833";
          ctx.beginPath();
          ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 4;
          ctx.fillStyle = "#ffeecc";
          ctx.beginPath();
          ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // cracker
          ctx.globalAlpha = s.life;
          ctx.shadowColor = "#cc44ff";
          ctx.shadowBlur = 18;
          ctx.fillStyle = "#ee88ff";
          ctx.beginPath();
          ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
          ctx.fill();
          // sparkle tail
          ctx.globalAlpha = s.life * 0.55;
          ctx.strokeStyle = "#ffaaff";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 3.5, s.y - s.vy * 3.5);
          ctx.stroke();
        }
        ctx.restore();

        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.005;
      }
    }

    function drawBursts() {
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        if (b.age < 0) { b.age++; continue; }
        const prog  = b.age / b.max;
        const alpha = 1 - prog;
        const r     = prog * (b.size || 40);

        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = `hsl(${b.hue},100%,65%)`;
        ctx.lineWidth   = 2.5 * (1 - prog);
        ctx.shadowColor = `hsl(${b.hue},100%,55%)`;
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        for (let j = 0; j < 7; j++) {
          const ang = (j / 7) * Math.PI * 2 + prog * 2;
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillStyle = `hsl(${b.hue + 20},100%,80%)`;
          ctx.beginPath();
          ctx.arc(
            b.x + Math.cos(ang) * r * 1.2,
            b.y + Math.sin(ang) * r * 1.2,
            2.5 * (1 - prog), 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();

        b.age++;
        if (b.age >= b.max) bursts.splice(i, 1);
      }
    }

    function drawSparks() {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        ctx.save();
        ctx.globalAlpha = s.life;
        ctx.fillStyle = `hsl(${s.hue},100%,78%)`;
        ctx.shadowColor = `hsl(${s.hue},100%,65%)`;
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        s.x    += s.vx;
        s.y    += s.vy;
        s.vy   += 0.1;  // gentle gravity
        s.life -= 0.024;
        if (s.life <= 0) sparks.splice(i, 1);
      }
    }

    // ── Main loop ─────────────────────────────────────────────────────────────
    function loop() {
      tick++;
      ctx.fillStyle = "#05071a";
      ctx.fillRect(0, 0, W, H);

      drawNebula();
      drawStars();

      ship.x += (mx - ship.x) * 0.07;
      ship.x  = Math.max(30, Math.min(W - 30, ship.x));

      // Auto-fire
      if (tick >= autoFireTick) {
        fireAutoShot();
        autoFireTick = tick + 50 + Math.floor(Math.random() * 35);
      }

      drawBursts();
      drawSparks();
      drawAutoShots();
      drawManualLasers();
      drawShip(ship.x, ship.y);

      animId = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      cancelAnimationFrame(animId);
      cv.removeEventListener("mousemove", handleMouseMove);
      cv.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`

        @keyframes craftFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }

        @keyframes essencePulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }

        @keyframes cardHitFlash {
          0%   { box-shadow: 0 0 0   0   rgba(34,211,238,0);   border-color: rgba(255,255,255,0.12); transform: scale(1); }
          18%  { box-shadow: 0 0 36px 10px rgba(34,211,238,0.75); border-color: rgba(34,211,238,0.9); transform: scale(1.06); }
          55%  { box-shadow: 0 0 18px 4px  rgba(34,211,238,0.3);  border-color: rgba(34,211,238,0.4); transform: scale(1.02); }
          100% { box-shadow: 0 0 0   0   rgba(34,211,238,0);   border-color: rgba(255,255,255,0.12); transform: scale(1); }
        }

        .craft-card {
          animation: craftFloat 3.6s ease-in-out infinite;
          transition: border-color 0.25s, background-color 0.25s;
        }
        .craft-card:hover {
          border-color: rgba(34,211,238,0.55) !important;
          background: rgba(34,211,238,0.06) !important;
        }
        .card-hit {
          animation: cardHitFlash 0.7s ease-out forwards !important;
        }

        @media (max-width: 640px) {
          .gamified-headline { font-size: clamp(26px, 8vw, 38px) !important; }
          .gamified-sub      { font-size: 12px !important; }
          .crafts-row        { gap: 8px !important; padding: 0 12px !important; }
          .craft-card        { padding: 10px 12px !important; min-width: 0 !important; flex: 1 1 0 !important; }
          .craft-pts         { font-size: 13px !important; }
          .craft-label       { font-size: 11px !important; }
          .craft-sub-label   { display: none !important; }
        }
      `}</style>

      {/* ── Canvas — game runs here ── */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }}
      />

      {/* ── HUD overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "clamp(28px, 4.5vh, 48px)",
          gap: "clamp(12px, 1.8vh, 20px)",
        }}
      >
        {/* Eyebrow pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 16px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(8,6,12,0.65)",
            backdropFilter: "blur(12px)",
            animation: "essencePulse 2.8s ease-in-out infinite",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: OPAL_GRADIENT, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>
            Gamified Performance Layer
          </span>
        </div>

        {/* Main heading */}
        <div style={{ textAlign: "center" }}>
          <div
            className="gamified-headline"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(34px, 4.8vw, 60px)",
              letterSpacing: "0.04em",
              lineHeight: 1,
              ...gradientText,
            }}
          >
            Earn OPAL Essence
          </div>
          <p
            className="gamified-sub"
            style={{
              marginTop: 7,
              fontSize: "clamp(12px, 0.95vw, 14px)",
              color: "rgba(235,242,255,0.48)",
              fontWeight: 300,
              letterSpacing: "0.05em",
              maxWidth: 480,
              margin: "7px auto 0",
            }}
          >
            Every patient payment secured earns your practice Essence Points — the score of a healthy revenue cycle.
          </p>
        </div>

        {/* Craft cards row — pointer events re-enabled */}
        <div
          className="crafts-row"
          style={{
            display: "flex",
            gap: "clamp(10px, 1.4vw, 18px)",
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "0 clamp(16px, 4vw, 52px)",
            pointerEvents: "auto",
          }}
        >
          {CRAFTS.map((c, i) => (
            <div
              key={c.label}
              ref={el => { cardElemsRef.current[i] = el; }}
              className="craft-card"
              style={{
                animationDelay: c.delay,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "clamp(13px, 1.8vh, 18px) clamp(16px, 1.8vw, 24px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(8,6,12,0.58)",
                backdropFilter: "blur(16px)",
                cursor: "default",
                minWidth: 210,
              }}
            >
              {/* Icon badge */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: `1px solid ${c.accent}44`,
                  background: `${c.accent}12`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {c.icon}
              </div>

              {/* Text */}
              <div>
                <div
                  className="craft-pts"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(16px, 1.5vw, 20px)",
                    letterSpacing: "0.07em",
                    color: c.accent,
                    lineHeight: 1,
                  }}
                >
                  {c.pts}
                </div>
                <div
                  className="craft-label"
                  style={{
                    fontSize: "clamp(11.5px, 0.95vw, 13.5px)",
                    color: "rgba(235,242,255,0.78)",
                    fontWeight: 400,
                    marginTop: 3,
                    lineHeight: 1.2,
                  }}
                >
                  {c.label}
                </div>
                <div
                  className="craft-sub-label"
                  style={{
                    fontSize: "clamp(10px, 0.78vw, 11.5px)",
                    color: "rgba(235,242,255,0.3)",
                    fontWeight: 300,
                    marginTop: 2,
                  }}
                >
                  {c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
