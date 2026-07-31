import { useEffect, useRef, useState } from "react";
import heroImg from "../assets/hero.png";

/* ── Elegant Reveal Component ── */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("vis");
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Smooth Animated Counter ── */
function Counter({ end, suffix = "", duration = 2500 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(end);
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            // Very smooth easeOutQuart curve
            const eased = 1 - Math.pow(1 - p, 4);
            setVal(Math.floor(eased * num));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

export default function LandingPage({ onLaunch }) {
  return (
    <div className="lp">
      {/* ── NAV — Clean Editorial ── */}
      <nav className="lp-nav">
        <div className="lp-nav-in">
          <div className="lp-logo">
            Maa<span>Check</span>
          </div>
          <button className="lp-nav-cta" onClick={onLaunch}>
            Try it live →
          </button>
        </div>
      </nav>

      {/* ── SCENE 1 — THE HERO (Split Screen with Arch Mask) ── */}
      <section className="sc-hero">
        <div className="sc-hero-content">
          <Reveal>
            <div className="sc-hero-badge"></div>
            <h1 className="sc-h1">
              Every Mother,
              <br />
              <em>A First Responder.</em>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="sc-hero-sub">
              The first offline health screening tool built for mothers — not
              health workers.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="sc-hero-btns">
              <button className="sc-btn sc-btn-primary" onClick={onLaunch}>
                Launch MumCheck
              </button>
              <a href="#story" className="sc-btn sc-btn-outline">
                Read the report ↓
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <div className="sc-arch-mask">
            <img
              className="sc-hero-img-inner"
              src={heroImg}
              alt="Mother and child"
            />
          </div>
        </Reveal>
      </section>

      {/* ── SCENE 2 — THE NUMBERS (Elegant Counters) ── */}
      <section className="sc-numbers">
        <div className="sc-numbers-grid">
          <Reveal delay={0}>
            <div className="sc-num-item">
              <div className="sc-num-val">
                <Counter end="800" suffix="K+" />
              </div>
              <div className="sc-num-label">
                children die from
                <br />
                pneumonia each year
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="sc-num-item">
              <div className="sc-num-val">
                <Counter end="48" suffix="h" />
              </div>
              <div className="sc-num-label">
                from first symptom
                <br />
                to death without care
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="sc-num-item">
              <div className="sc-num-val">
                <Counter end="14" suffix=" days" />
              </div>
              <div className="sc-num-label">
                gap between health
                <br />
                worker visits
              </div>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="sc-num-item sc-num-zero">
              <div className="sc-num-val">
                <Counter end="0" />
              </div>
              <div className="sc-num-label">
                screening tools built
                <br />
                for mothers
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SCENE 3 — AMARA'S STORY (Drop-cap Blockquote) ── */}
      <section className="sc-story" id="story">
        <div className="sc-story-inner">
          <Reveal>
            <span className="sc-kicker">The Reality</span>
          </Reveal>
          <Reveal delay={150}>
            <h2 className="sc-story-quote">
              She is 3. Her mother is 8 km from help. She has had a fever for
              two days. Her mother doesn't know if she is fighting a virus — or
              if her lungs are filling with fluid <em>right now</em>, and she
              needs to start walking <em>immediately</em>.
            </h2>
          </Reveal>
          <Reveal delay={300}>
            <p className="sc-lead" style={{ margin: "0 auto" }}>
              Without diagnostic tools, waiting is a gamble. Sometimes that wait
              is fine. Sometimes that wait kills a child.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── SCENE 4 — THE GAP (Comparison) ── */}
      <section className="sc-gap">
        <div className="sc-gap-inner">
          <Reveal>
            <span className="sc-kicker">The Gap</span>
            <h2 className="sc-h2">
              The health system is broken
              <br />
              at the last mile.
            </h2>
          </Reveal>

          <div className="sc-gap-grid">
            <Reveal delay={100}>
              <div className="sc-gap-col bad">
                <h4>What Exists Today</h4>
                <p>
                  Every tool — MUAC tape, respiratory timers, IMCI checklists —
                  is designed for trained health workers. Between clinic visits,
                  mothers are flying blind.
                </p>
              </div>
            </Reveal>
            <Reveal delay={250}>
              <div className="sc-gap-col good">
                <h4>The MumCheck Paradigm</h4>
                <p>
                  A clinic on every mother's phone. Three WHO-validated
                  screenings in three minutes — completely offline, guided by
                  voice, requiring zero literacy.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── SCENE 5 — HOW IT WORKS (Bento Grid) ── */}
      <section className="sc-demo">
        <div className="sc-demo-inner">
          <Reveal>
            <div className="sc-demo-header">
              <span className="sc-kicker">The Solution</span>
              <h2 className="sc-h2">
                Three checks. Three minutes. One answer.
              </h2>
            </div>
          </Reveal>

          <div className="sc-demo-grid">
            <Reveal delay={100}>
              <div className="sc-bento-card">
                <div
                  className="sc-bento-icon"
                  style={{
                    background: "rgba(214,48,49,0.1)",
                    color: "#D63031",
                  }}
                >
                  ⚡
                </div>
                <h3>Danger Signs</h3>
                <p>
                  6 WHO IMCI questions. Voice reads each one aloud. Giant Red
                  Cross and Green Tick buttons eliminate the need to read text.
                </p>
                <div className="sc-bento-art" style={{ background: "#FFF5F5" }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div
                      className="sc-btn-mock"
                      style={{ background: "#D63031" }}
                    >
                      ✕
                    </div>
                    <div
                      className="sc-btn-mock"
                      style={{ background: "#1E8C5E" }}
                    >
                      ✓
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="sc-bento-card">
                <div
                  className="sc-bento-icon"
                  style={{
                    background: "rgba(30,140,94,0.1)",
                    color: "#1E8C5E",
                  }}
                >
                  🫁
                </div>
                <h3>Breathing Rate</h3>
                <p>
                  Tap each time the child's chest rises. Real-time tap counting
                  replaces camera analysis. WHO thresholds instantly detect fast
                  breathing.
                </p>
                <div className="sc-bento-art" style={{ background: "#F0FBF5" }}>
                  <div className="sc-tap-mock">TAP</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="sc-bento-card">
                <div
                  className="sc-bento-icon"
                  style={{
                    background: "rgba(212,148,10,0.1)",
                    color: "#D4940A",
                  }}
                >
                  📏
                </div>
                <h3>Nutrition (MUAC)</h3>
                <p>
                  Match the MUAC strip color — red, yellow, green. Pure color
                  block selection removes cognitive load and the need to read
                  jargon.
                </p>
                <div className="sc-bento-art" style={{ background: "#FFFBF0" }}>
                  <div className="sc-bar-mock">
                    <div style={{ flex: 1, background: "#D63031" }}></div>
                    <div style={{ flex: 1.4, background: "#D4940A" }}></div>
                    <div style={{ flex: 2, background: "#1E8C5E" }}></div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="sc-cta">
        <Reveal>
          <h2 className="sc-h2">Every mother deserves to know.</h2>
          <p className="sc-lead" style={{ margin: "0 auto 32px" }}>
            Free. Offline. Open source. Built with WHO IMCI guidelines for the
            mothers who need it most.
          </p>
          <button className="sc-btn sc-btn-primary" onClick={onLaunch}>
            Launch MumCheck
          </button>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="sc-footer">
        <div className="sc-footer-inner">
          <div>
            <div className="sc-footer-logo">
              Mum<span>Check</span>
            </div>
            <div className="sc-footer-text" style={{ marginTop: 8 }}>
              Every mother, a first responder.
            </div>
          </div>
          <div className="sc-footer-text" style={{ textAlign: "right" }}>
          
          </div>
        </div>
      </footer>
    </div>
  );
}
