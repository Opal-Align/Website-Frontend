import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * OPAL – 2-Minute Revenue Diagnostic (overlay)
 *
 * Usage:
 *   <OpalRevenueDiagnostic
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     onContact={(result) => {}}                 // optional; otherwise links to /contact-us
 *     logoSrc="/opal-logo-white.png"             // optional (white logo on dark header)
 *     onComplete={(result) => track(result)}     // optional
 *   />
 *
 * Self-contained: styles are injected once, no CSS/Tailwind setup required.
 * Theme can be overridden with CSS variables on any parent (--opal-*).
 */

const SECTIONS = [
  {
    id: "visibility",
    title: "Operational Visibility",
    questions: [
      "We can see schedule utilization, A/R aging, and treatment acceptance rate in one place across our practice(s).",
      "We know the dollar value of diagnosed but unscheduled treatments across our practice(s).",
    ],
  },
  {
    id: "revenue-cycle",
    title: "Revenue Cycle & Collections",
    questions: [
      "Eligibility is verified for each patient before every visit.",
      "Every patient balance over 30 days receives consistent follow-ups.",
    ],
  },
  {
    id: "growth",
    title: "Patient Growth & Retention",
    questions: [
      "No-shows and late cancellations are reappointed within 24-48 hours.",
      "Patients who haven't been seen beyond 12 months are easily identified and quickly re-engaged.",
    ],
  },
  {
    id: "efficiency",
    title: "Staff Efficiency & Automation",
    questions: [
      "Our team can easily and consistently follow up with calls, messages, and revenue generating tasks.",
      "We can recover more revenue next month without adding staff or increasing overtime.",
    ],
  },
];

// Flat list with section info
const QUESTIONS = SECTIONS.flatMap((s) =>
  s.questions.map((text) => ({ sectionId: s.id, section: s.title, text }))
);
const TOTAL = QUESTIONS.length; // 8

const BANDS = [
  {
    id: "strong",
    min: 7,
    label: "Strong Control",
    tone: "good",
    body:
      "Your operation appears well controlled. Most core processes are working consistently, with only a few areas that may be worth a closer look.",
  },
  {
    id: "moderate",
    min: 4,
    label: "Moderate Leakage",
    tone: "warn",
    body:
      "Some gaps are starting to show. Inconsistent follow-through, limited visibility, or manual work may be creating avoidable revenue leakage across your operation.",
  },
  {
    id: "high",
    min: 0,
    label: "High Leakage",
    tone: "bad",
    body:
      "Your operation may be working harder than it needs to. Gaps in visibility, follow-through, and staff capacity may be compounding into lost revenue and making it harder to scale.",
  },
];

const bandFor = (score) => BANDS.find((b) => score >= b.min);

const CSS = `
.opal-dx, .opal-dx * { box-sizing: border-box; }
.opal-dx {
  --opal-ink: #ffffff;        /* primary text + primary button fill */
  --opal-on-ink: #0a0a0a;     /* text on primary button */
  --opal-ink-2: #e8eaee;
  --opal-muted: #a3aab6;
  --opal-faint: #6f7886;
  --opal-line: #24272e;
  --opal-bg: #0a0a0a;
  --opal-head: #000000;
  --opal-soft: #14161a;
  --opal-good: #3ecf8e;  --opal-good-bg: rgba(62,207,142,.14);
  --opal-warn: #f5a623;  --opal-warn-bg: rgba(245,166,35,.14);
  --opal-bad:  #ff5d4d;  --opal-bad-bg:  rgba(255,93,77,.14);
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  font-family: "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
  color: var(--opal-ink-2);
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: opal-fade .25s ease both;
}
@keyframes opal-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes opal-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes opal-step { from { opacity: 0; transform: translateX(18px) } to { opacity: 1; transform: none } }

.opal-dx__card {
  width: 100%; max-width: 640px; max-height: calc(100vh - 48px);
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--opal-bg); border-radius: 18px;
  border: 1px solid #1f2227; box-shadow: 0 30px 90px rgba(0,0,0,.7);
  animation: opal-rise .35s cubic-bezier(.2,.8,.2,1) both;
}
.opal-dx__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px; background: var(--opal-head); color: #fff; flex: none; border-bottom: 1px solid var(--opal-line);
}
.opal-dx__brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.opal-dx__logo { height: 24px; width: auto; display: block; }
.opal-dx__wordmark { font-weight: 700; letter-spacing: .22em; font-size: 17px; }
.opal-dx__tag { font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase; color: #aab1bd; }
.opal-dx__close {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,.22);
  background: transparent; color: #fff; cursor: pointer; font-size: 18px; line-height: 1;
  display: grid; place-items: center; transition: background .15s;
}
.opal-dx__close:hover { background: rgba(255,255,255,.14); }

.opal-dx__progress { height: 4px; background: var(--opal-line); flex: none; }
.opal-dx__progress > i { display: block; height: 100%; background: var(--opal-ink); transition: width .35s ease; }

.opal-dx__body { padding: 32px 32px 28px; overflow-y: auto; flex: 1 1 auto; }
.opal-dx__eyebrow {
  font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--opal-muted);
}
.opal-dx__h1 { font-size: 30px; line-height: 1.12; letter-spacing: -.02em; font-weight: 700; margin: 12px 0 10px; color: var(--opal-ink); }
.opal-dx__lead { font-size: 16px; line-height: 1.55; color: var(--opal-muted); margin: 0 0 8px; }
.opal-dx__q { font-size: 22px; line-height: 1.35; letter-spacing: -.01em; font-weight: 600; margin: 14px 0 28px; color: var(--opal-ink); }
.opal-dx__step { animation: opal-step .3s ease both; }

.opal-dx__meta { display: flex; justify-content: space-between; align-items: center; }
.opal-dx__count { font-size: 12.5px; color: var(--opal-faint); font-variant-numeric: tabular-nums; }

.opal-dx__answers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.opal-dx__ans {
  appearance: none; cursor: pointer; text-align: left;
  padding: 18px 20px; border-radius: 12px; border: 1.5px solid var(--opal-line);
  background: transparent; font: inherit; font-size: 17px; font-weight: 700; letter-spacing: .06em; color: var(--opal-ink);
  display: flex; align-items: center; gap: 12px;
  transition: border-color .15s, background .15s, transform .1s;
}
.opal-dx__ans:hover { border-color: var(--opal-ink); background: var(--opal-soft); }
.opal-dx__ans:active { transform: scale(.985); }
.opal-dx__ans[aria-pressed="true"] { border-color: var(--opal-ink); background: var(--opal-ink); color: var(--opal-on-ink); }
.opal-dx__radio {
  width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid currentColor; opacity: .55; flex: none; position: relative;
}
.opal-dx__ans[aria-pressed="true"] .opal-dx__radio { opacity: 1; }
.opal-dx__ans[aria-pressed="true"] .opal-dx__radio::after {
  content: ""; position: absolute; inset: 4px; border-radius: 50%; background: var(--opal-on-ink);
}

.opal-dx__foot { display: flex; align-items: center; justify-content: space-between; margin-top: 26px; gap: 12px; }

.opal-btn {
  appearance: none; font: inherit; cursor: pointer; border-radius: 999px;
  padding: 13px 24px; font-size: 14.5px; font-weight: 600; letter-spacing: .01em;
  border: 1.5px solid var(--opal-ink); transition: background .15s, color .15s, transform .1s, opacity .15s;
  text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
}
.opal-btn:active { transform: scale(.98); }
.opal-btn--primary { background: var(--opal-ink); color: var(--opal-on-ink); }
.opal-btn--primary:hover { background: #d9dce2; border-color: #d9dce2; }
.opal-btn--ghost { background: transparent; color: var(--opal-ink); }
.opal-btn--ghost { border-color: #3a3f48; }
.opal-btn--ghost:hover { background: var(--opal-soft); border-color: var(--opal-ink); }
.opal-btn--text { border-color: transparent; background: transparent; color: var(--opal-muted); padding-left: 4px; padding-right: 4px; }
.opal-btn--text:hover { color: var(--opal-ink); }
.opal-btn[disabled] { opacity: .35; cursor: default; pointer-events: none; }

.opal-dx__sections { list-style: none; padding: 0; margin: 26px 0 0; display: grid; gap: 10px; }
.opal-dx__sections li {
  background: var(--opal-soft);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; border: 1px solid var(--opal-line); border-radius: 12px; font-size: 14.5px;
}
.opal-dx__sections b { font-weight: 600; color: var(--opal-ink); }
.opal-dx__pips { display: flex; gap: 6px; align-items: center; }
.opal-dx__pip { width: 10px; height: 10px; border-radius: 50%; background: var(--opal-line); }
.opal-dx__pip { background: #343842; }
.opal-dx__pip[data-yes="true"] { background: var(--opal-ink); }
.opal-dx__sec-score { font-size: 12.5px; color: var(--opal-muted); font-variant-numeric: tabular-nums; min-width: 28px; text-align: right; }

.opal-dx__result { display: flex; gap: 26px; align-items: center; margin-top: 8px; }
.opal-dx__ring { position: relative; width: 132px; height: 132px; flex: none; }
.opal-dx__ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.opal-dx__ring circle { fill: none; stroke-width: 10; }
.opal-dx__ring .trk { stroke: var(--opal-line); }
.opal-dx__ring .val { stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1); }
.opal-dx__ring-n { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
.opal-dx__ring-n strong { font-size: 38px; line-height: 1; color: var(--opal-ink); letter-spacing: -.03em; }
.opal-dx__ring-n span { font-size: 12px; color: var(--opal-faint); margin-top: 4px; letter-spacing: .08em; text-transform: uppercase; }

.opal-dx__badge {
  display: inline-block; padding: 5px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
}
.opal-dx[data-tone="good"] .opal-dx__badge { color: var(--opal-good); background: var(--opal-good-bg); }
.opal-dx[data-tone="warn"] .opal-dx__badge { color: var(--opal-warn); background: var(--opal-warn-bg); }
.opal-dx[data-tone="bad"]  .opal-dx__badge { color: var(--opal-bad);  background: var(--opal-bad-bg); }
.opal-dx__result p { margin: 10px 0 0; font-size: 15.5px; line-height: 1.55; color: var(--opal-muted); }

.opal-dx__cta {
  margin-top: 26px; padding: 18px 20px; border-radius: 14px; background: var(--opal-soft); border: 1px solid var(--opal-line);
  font-size: 15px; line-height: 1.45; color: var(--opal-ink);
}
.opal-dx__cta b { font-weight: 700; }
.opal-dx__actions { display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
.opal-dx__actions .opal-btn { flex: 1 1 200px; padding: 15px 24px; }
.opal-dx__legal { margin-top: 22px; font-size: 11px; letter-spacing: .06em; color: var(--opal-faint); text-transform: uppercase; }

.opal-dx button:focus-visible, .opal-dx a:focus-visible { outline: 2px solid #7aa7ff; outline-offset: 2px; }

@media (max-width: 560px) {
  .opal-dx { padding: 0; align-items: flex-end; }
  .opal-dx__card { max-height: 100vh; max-height: 100dvh; border-radius: 18px 18px 0 0; }
  .opal-dx__body { padding: 24px 20px 22px; }
  .opal-dx__h1 { font-size: 26px; }
  .opal-dx__q { font-size: 19px; }
  .opal-dx__result { flex-direction: column; align-items: flex-start; }
  .opal-dx__answers { grid-template-columns: 1fr 1fr; }
  .opal-dx__tag { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .opal-dx, .opal-dx * { animation: none !important; transition: none !important; }
}
`;

function useInjectedStyles() {
  useEffect(() => {
    if (document.getElementById("opal-dx-styles")) return;
    const el = document.createElement("style");
    el.id = "opal-dx-styles";
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
}

function ScoreRing({ score, color }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(t);
  }, [score]);
  return (
    <div className="opal-dx__ring" role="img" aria-label={`Score: ${score} out of ${TOTAL}`}>
      <svg viewBox="0 0 132 132">
        <circle className="trk" cx="66" cy="66" r={r} />
        <circle
          className="val"
          cx="66"
          cy="66"
          r={r}
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / TOTAL)}
        />
      </svg>
      <div className="opal-dx__ring-n">
        <strong>
          {score}/{TOTAL}
        </strong>
        <span>Score</span>
      </div>
    </div>
  );
}

export default function OpalRevenueDiagnostic({
  open = true,
  onClose,
  onContact,
  onComplete,
  logoSrc,
  closeOnBackdrop = true,
}) {
  useInjectedStyles();

  // answers[i] = true | false | undefined
  const [answers, setAnswers] = useState(() => Array(TOTAL).fill(undefined));
  const [index, setIndex] = useState(-1); // -1 = intro, 0..TOTAL-1 = questions, TOTAL = results
  const advanceTimer = useRef(null);
  const cardRef = useRef(null);

  const reset = useCallback(() => {
    clearTimeout(advanceTimer.current);
    setAnswers(Array(TOTAL).fill(undefined));
    setIndex(-1);
  }, []);

  // Reset whenever the overlay is re-opened
  useEffect(() => {
    if (open) reset();
    return () => clearTimeout(advanceTimer.current);
  }, [open, reset]);

  // Lock page scroll + Esc to close + focus the dialog
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    cardRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const score = useMemo(() => answers.filter((a) => a === true).length, [answers]);
  const band = bandFor(score);
  const isResult = index === TOTAL;
  const isIntro = index === -1;

  const result = useMemo(
    () => ({
      score,
      total: TOTAL,
      band: band.id,
      label: band.label,
      answers: QUESTIONS.map((q, i) => ({ section: q.section, question: q.text, answer: answers[i] ? "YES" : "NO" })),
    }),
    [score, band, answers]
  );

  useEffect(() => {
    if (isResult && onComplete) onComplete(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResult]);

  const answer = (value) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
    advanceTimer.current = setTimeout(() => setIndex((i) => i + 1), 220);
  };

  const handleContact = (e) => {
    if (onContact) {
      e.preventDefault();
      onContact(result);
      return;
    }
    onClose?.();
  };

  if (!open) return null;

  const q = QUESTIONS[index];
  const pct = isIntro ? 0 : (Math.min(index, TOTAL) / TOTAL) * 100;
  const ringColor =
    band.tone === "good" ? "var(--opal-good)" : band.tone === "warn" ? "var(--opal-warn)" : "var(--opal-bad)";

  return (
    <div
      className="opal-dx"
      data-tone={isResult ? band.tone : undefined}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="opal-dx__card"
        role="dialog"
        aria-modal="true"
        aria-label="Revenue leakage assessment"
        tabIndex={-1}
        ref={cardRef}
        style={{ outline: "none" }}
      >
        <header className="opal-dx__head">
          <div className="opal-dx__brand">
            {logoSrc ? (
              <img className="opal-dx__logo" src={logoSrc} alt="OPAL" />
            ) : (
              <span className="opal-dx__wordmark">OPAL</span>
            )}
            <span className="opal-dx__tag">Revenue assessment</span>
          </div>
          {onClose && (
            <button className="opal-dx__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </header>

        <div
          className="opal-dx__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL}
          aria-valuenow={Math.min(Math.max(index, 0), TOTAL)}
        >
          <i style={{ width: `${isResult ? 100 : pct}%` }} />
        </div>

        <div className="opal-dx__body">
          {isIntro && (
            <div className="opal-dx__step" key="intro">
              <div className="opal-dx__eyebrow">The revenue assessment for practice owners &amp; executives</div>
              <h2 className="opal-dx__h1">Is your practice leaking revenue?</h2>
              <p className="opal-dx__lead">
                Revenue leakage doesn't announce itself as a crisis. It shows up as small, quiet misses. Individually
                they're easy to overlook. Across a growing practice, the leakage becomes systemic.
              </p>
              <div className="opal-dx__foot" style={{ marginTop: 28 }}>
                <span className="opal-dx__count">{TOTAL} questions .</span>
                <button className="opal-btn opal-btn--primary" onClick={() => setIndex(0)}>
                  Start assessment →
                </button>
              </div>
            </div>
          )}

          {!isIntro && !isResult && (
            <div className="opal-dx__step" key={index}>
              <div className="opal-dx__meta">
                <span className="opal-dx__eyebrow">{q.section}</span>
                <span className="opal-dx__count">
                  {index + 1} / {TOTAL}
                </span>
              </div>
              <h2 className="opal-dx__q">{q.text}</h2>
              <div className="opal-dx__answers">
                <button className="opal-dx__ans" aria-pressed={answers[index] === true} onClick={() => answer(true)}>
                  <span className="opal-dx__radio" /> YES
                </button>
                <button className="opal-dx__ans" aria-pressed={answers[index] === false} onClick={() => answer(false)}>
                  <span className="opal-dx__radio" /> NO
                </button>
              </div>
              <div className="opal-dx__foot">
                <button
                  className="opal-btn opal-btn--text"
                  onClick={() => {
                    clearTimeout(advanceTimer.current);
                    setIndex((i) => i - 1);
                  }}
                >
                  ← Back
                </button>
                <button
                  className="opal-btn opal-btn--text"
                  disabled={answers[index] === undefined}
                  onClick={() => {
                    clearTimeout(advanceTimer.current);
                    setIndex((i) => i + 1);
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {isResult && (
            <div className="opal-dx__step" key="result">
              <div className="opal-dx__eyebrow">How strong is your operating structure?</div>
              <div className="opal-dx__result">
                <ScoreRing score={score} color={ringColor} />
                <div>
                  <span className="opal-dx__badge">{band.label}</span>
                  <p>{band.body}</p>
                </div>
              </div>

              <ul className="opal-dx__sections">
                {SECTIONS.map((s) => {
                  const idxs = QUESTIONS.map((qq, i) => (qq.sectionId === s.id ? i : -1)).filter((i) => i >= 0);
                  const yes = idxs.filter((i) => answers[i]).length;
                  return (
                    <li key={s.id}>
                      <b>{s.title}</b>
                      <span className="opal-dx__pips" aria-hidden="true">
                        {idxs.map((i) => (
                          <span className="opal-dx__pip" key={i} data-yes={!!answers[i]} />
                        ))}
                      </span>
                      <span className="opal-dx__sec-score">
                        {yes}/{idxs.length}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="opal-dx__cta">
                <b>Curious to see how OPAL can accelerate your revenue recovery?</b> Schedule your 15-minute
                consultation with our team.
              </div>

              <div className="opal-dx__actions">
                <button className="opal-btn opal-btn--ghost" onClick={reset}>
                  ↺ Retake assessment
                </button>
                <Link
                  className="opal-btn opal-btn--primary"
                  to="/contact-us"
                  onClick={handleContact}
                >
                  Get in touch with us
                </Link>
              </div>
              <div className="opal-dx__legal">© 2026 OPAL Align, Inc. Confidential &amp; Proprietary</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}