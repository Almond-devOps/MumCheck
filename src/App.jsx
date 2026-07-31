import { useState, useRef, useEffect } from "react";
import {
  DANGER_SIGNS,
  classifyRespiratoryRate,
  classifyMUAC,
  classifyDangerSigns,
  getOverallRisk,
  getRespiratoryThreshold,
  STRINGS,
} from "./data/clinicalData.js";
import { speak, stopSpeaking } from "./utils/voiceGuidance.js";
import { saveScreening, getHistory } from "./utils/storage.js";
import BreathingWaveform from "./components/BreathingWaveform.jsx";
import LandingPage from "./components/LandingPage.jsx";
import TopBar from "./components/TopBar.jsx";
import heroImg from "./assets/hero.png";
import chestImg from "./assets/chest-guide.png";
import muacImg from "./assets/muac-guide.png";

export default function App() {
  const [scr, setScr] = useState("landing");
  const [lang, setLang] = useState("en");
  const [name, setName] = useState("");
  const [age, setAge] = useState(12);
  const [dIdx, setDIdx] = useState(0);
  const [dAns, setDAns] = useState({});
  const [taps, setTaps] = useState(0);
  const [sec, setSec] = useState(60);
  const [going, setGoing] = useState(false);
  const [done, setDone] = useState(false);
  const [rate, setRate] = useState(null);
  const [muac, setMuac] = useState(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [ripples, setRipples] = useState([]);
  const tapsRef = useRef(0),
    ivRef = useRef(null);
  const t = STRINGS[lang] || STRINGS.en;
  const history = getHistory();

  useEffect(() => {
    if (!going) return;
    ivRef.current = setInterval(() => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(ivRef.current);
          setRate(tapsRef.current);
          setDone(true);
          setGoing(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ivRef.current);
  }, [going]);

  // Reads each danger sign question aloud when it appears — core feature for low-literacy mothers
  useEffect(() => {
    if (scr !== "signs") return;
    const sign = DANGER_SIGNS[dIdx];
    const q =
      lang === "hi" && sign.question_hi ? sign.question_hi : sign.question;
    if (voiceOn) speak(q, lang);
    else stopSpeaking();
  }, [scr, dIdx, lang, voiceOn]);

  const vibrate = (ms) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };
  const tap = () => {
    if (!going) return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    vibrate(30);
    setRipples((r) => [...r, Date.now()]);
    setTimeout(() => setRipples((r) => r.slice(1)), 600);
  };
  const startRR = () => {
    tapsRef.current = 0;
    setTaps(0);
    setSec(60);
    setDone(false);
    setRate(null);
    setGoing(true);
    vibrate(100);
    if (voiceOn) speak(t.breathInstruction, lang);
  };
  const resetAll = () => {
    stopSpeaking();
    setName("");
    setAge(12);
    setDIdx(0);
    setDAns({});
    tapsRef.current = 0;
    setTaps(0);
    setSec(60);
    setGoing(false);
    setDone(false);
    setRate(null);
    setMuac(null);
    setRipples([]);
  };
  const answerDanger = (val) => {
    vibrate(30);
    const sign = DANGER_SIGNS[dIdx];
    const a = { ...dAns, [sign.id]: val };
    setDAns(a);
    if (dIdx < DANGER_SIGNS.length - 1) setDIdx((i) => i + 1);
    else {
      tapsRef.current = 0;
      setTaps(0);
      setSec(60);
      setGoing(false);
      setDone(false);
      setRate(null);
      setScr("rr");
    }
  };

  const dRisk = classifyDangerSigns(dAns);
  const rRisk =
    rate !== null
      ? classifyRespiratoryRate(rate, age)
      : { level: "low", label: "Skipped", detail: "Not measured" };
  const mRisk = muac
    ? classifyMUAC(muac)
    : { level: "low", label: "Skipped", detail: "Not measured" };
  const ov = getOverallRisk(dRisk, rRisk, mRisk);
  const slPct = ((age / 60) * 100).toFixed(1) + "%";
  const ageLabel =
    age === 0
      ? "Newborn"
      : age < 12
        ? `${age}`
        : age < 24
          ? "1"
          : `${Math.floor(age / 12)}`;
  const ageUnit =
    age === 0 ? "" : age < 12 ? "months" : age < 24 ? "year" : "years";
  const ageStr =
    age === 0
      ? "newborn"
      : age < 12
        ? `${age} months`
        : age < 24
          ? "1 year"
          : `${Math.floor(age / 12)} years`;

  const shareResults = () => {
    const txt = `🏥 MaaCheck Screening Result\n👶 ${name || "Child"}, ${ageStr}\n\n⚡ Danger Signs: ${dRisk.label}\n🫁 Breathing: ${rRisk.label}\n📏 Nutrition: ${mRisk.label}\n\n🔔 ${ov.action}\n\n— Screened via MaaCheck (WHO IMCI)`;
    if (navigator.share)
      navigator.share({ title: "MaaCheck Result", text: txt }).catch(() => {});
    else
      window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, "_blank");
  };

  // ═══ LANDING — Judge-facing Website ═══
  if (scr === "landing") return <LandingPage onLaunch={() => setScr("home")} />;

  // ═══ HOME — For Mothers, Not Judges ═══
  if (scr === "home")
    return (
      <div className="app">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          {/* Logo row — back button left, logo centered, spacer right */}
          <div
            style={{
              padding: "8px var(--px) 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              className="hdr-back"
              onClick={() => setScr("landing")}
              title={t.backToAbout}
              style={{ flexShrink: 0 }}
            >
              ←
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)" }}
              >
                Maa<span style={{ color: "var(--pri)" }}>Check</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink3)",
                  fontWeight: 500,
                  marginTop: 2,
                }}
              >
                {t.tagline}
              </div>
            </div>
            <div style={{ width: 38, flexShrink: 0 }} />
          </div>

          {/* Hero illustration */}
          <div style={{ padding: "12px var(--px)", textAlign: "center" }}>
            <img
              src={heroImg}
              alt="Mother and child"
              style={{
                width: "100%",
                maxWidth: 260,
                height: "auto",
                borderRadius: 20,
                margin: "0 auto",
                display: "block",
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              padding: "0 var(--px) 28px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Main CTA — big, obvious, first thing */}
            <button
              className="btn-primary"
              style={{ padding: 20, fontSize: 18 }}
              onClick={() => setScr("profile")}
            >
              🩺 {t.startBtn}
            </button>

            {/* What we check — compact */}
            <div className="card" style={{ padding: 14 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--ink2)",
                  marginBottom: 8,
                }}
              >
                {t.screeningIncludes}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["⚡", t.feat1Title, t.feat1Desc],
                  ["🫁", t.feat2Title, t.feat2Desc],
                  ["📏", t.feat3Title, t.feat3Desc],
                ].map(([ic, ti, su]) => (
                  <div
                    key={ti}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--pri-lt)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {ic}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {ti}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ink3)" }}>
                        {su}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past screenings */}
            {history.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--ink2)",
                    marginBottom: 6,
                  }}
                >
                  {t.recentScreenings}
                </div>
                {history.slice(0, 2).map((h, i) => (
                  <div
                    key={i}
                    className="hist-card"
                    style={{ marginBottom: 6 }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background:
                          h.overallRisk === "critical" ||
                          h.overallRisk === "high"
                            ? "var(--err)"
                            : h.overallRisk === "moderate"
                              ? "var(--warn)"
                              : "var(--ok)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--ink)",
                        }}
                      >
                        {h.name || t.childFallback}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink4)" }}>
                        {new Date(h.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trust badges */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              {["WHO IMCI", "Works Offline", "SDG 3.2"].map((b) => (
                <div
                  key={b}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 16,
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--ink3)",
                  }}
                >
                  ✓ {b}
                </div>
              ))}
            </div>

            <div className="note">{t.disclaimer}</div>
          </div>
        </div>
      </div>
    );

  // ═══ PROFILE ═══
  if (scr === "profile")
    return (
      <div className="app">
        <div className="screen">
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          <div className="hdr">
            <div className="hdr-back" onClick={() => setScr("home")}>
              ←
            </div>
            <div className="hdr-title">{t.profileTitle}</div>
          </div>
          <div className="prog">
            <div className="prog-track">
              <div className="prog-fill" style={{ width: "16%" }} />
            </div>
            <div className="prog-lbl">Step 1 of 5</div>
          </div>
          <div className="body">
            <div>
              <div className="form-label">{t.nameLabel}</div>
              <input
                className="form-input"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <div className="form-label">{t.ageLabel}</div>
              <div
                className="card"
                style={{ textAlign: "center", padding: 20 }}
              >
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "var(--pri)",
                    lineHeight: 1,
                  }}
                  key={age}
                >
                  {ageLabel}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--ink3)",
                    fontWeight: 600,
                  }}
                >
                  {ageUnit}
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={age}
                  className="age-slider"
                  style={{
                    background: `linear-gradient(to right,var(--pri) 0%,var(--pri) ${slPct},var(--line) ${slPct})`,
                  }}
                  onChange={(e) => setAge(+e.target.value)}
                />
              </div>
              <div className="chip-row" style={{ marginTop: 8 }}>
                {[
                  { l: "Newborn", v: 0 },
                  { l: "3 mo", v: 3 },
                  { l: "6 mo", v: 6 },
                  { l: "1 yr", v: 12 },
                  { l: "2 yr", v: 24 },
                  { l: "3 yr", v: 36 },
                  { l: "5 yr", v: 60 },
                ].map((p) => (
                  <div
                    key={p.v}
                    className={`chip ${age === p.v ? "on" : ""}`}
                    onClick={() => setAge(p.v)}
                  >
                    {p.l}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-warn">{t.ageInfo}</div>
            <button
              className="btn-primary"
              onClick={() => {
                setDIdx(0);
                setDAns({});
                setScr("signs");
              }}
            >
              {t.startCheck} →
            </button>
          </div>
        </div>
      </div>
    );

  // ═══ DANGER SIGNS ═══
  if (scr === "signs") {
    const sign = DANGER_SIGNS[dIdx];
    const pct = 16 + ((dIdx + 1) / DANGER_SIGNS.length) * 28;
    const q =
      lang === "hi" && sign.question_hi ? sign.question_hi : sign.question;
    const desc =
      lang === "hi" && sign.description_hi
        ? sign.description_hi
        : sign.description;
    return (
      <div className="app">
        <div className="screen">
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          <div className="hdr">
            <div
              className="hdr-back"
              onClick={() =>
                dIdx === 0 ? setScr("profile") : setDIdx((i) => i - 1)
              }
            >
              ←
            </div>
            <div className="hdr-title">{t.dangerTitle}</div>
          </div>
          <div className="prog">
            <div className="prog-track">
              <div className="prog-fill" style={{ width: pct + "%" }} />
            </div>
            <div className="prog-lbl">
              Sign {dIdx + 1} of {DANGER_SIGNS.length}
            </div>
          </div>
          <div
            className="body"
            style={{ flex: 1, justifyContent: "space-between" }}
          >
            <div className="dots">
              {DANGER_SIGNS.map((_, i) => (
                <div
                  key={i}
                  className={`dot ${i < dIdx ? "done" : ""} ${i === dIdx ? "on" : ""}`}
                />
              ))}
            </div>
            <div className="q-card" key={dIdx}>
              <div className="q-icon">{sign.icon}</div>
              <div className="q-text">{q}</div>
              <div className="q-desc">{desc}</div>
            </div>
            <div className="ans-grid">
              <button
                className="ans-btn ans-no"
                onClick={() => answerDanger(false)}
              >
                ✓ No
              </button>
              <button
                className="ans-btn ans-yes"
                onClick={() => answerDanger(true)}
              >
                ⚠ Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ RESPIRATORY RATE ═══
  if (scr === "rr") {
    const C = 2 * Math.PI * 96,
      off = C * (1 - sec / 60);
    const rr = rate !== null ? classifyRespiratoryRate(rate, age) : null;
    const col = done
      ? rr?.level === "low"
        ? "var(--ok)"
        : "var(--err)"
      : going
        ? "var(--pri)"
        : "var(--ok)";
    return (
      <div className="app">
        <div className="screen">
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          <div className="hdr">
            <div
              className="hdr-back"
              onClick={() => {
                clearInterval(ivRef.current);
                setGoing(false);
                setScr("signs");
              }}
            >
              ←
            </div>
            <div className="hdr-title">{t.breathTitle}</div>
          </div>
          <div className="prog">
            <div className="prog-track">
              <div className="prog-fill" style={{ width: "55%" }} />
            </div>
            <div className="prog-lbl">Step 3 of 5</div>
          </div>
          <div className="body">
            {!going && !done && (
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={chestImg}
                  alt="Chest rise guide"
                  className="guide-img"
                  style={{ maxWidth: 80, borderRadius: 10 }}
                />
                <div className="card-warn" style={{ flex: 1 }}>
                  {t.breathInstruction} {t.safeLimit}{" "}
                  <strong>{getRespiratoryThreshold(age).fast}/min</strong>.
                </div>
              </div>
            )}
            {voiceOn && going && (
              <div className="voice-ind">
                <div className="voice-dot" />
                Voice active
              </div>
            )}

            <div className="wave-box">
              <BreathingWaveform
                taps={taps}
                isRunning={going}
                seconds={sec}
                maxSeconds={60}
              />
            </div>

            {/* Big tap zone */}
            <div className="tap-zone">
              <svg
                className="tap-ring"
                viewBox="0 0 220 220"
                style={{ transform: "rotate(-90deg)", pointerEvents: "none" }}
              >
                <circle
                  cx="110"
                  cy="110"
                  r="96"
                  fill="none"
                  stroke="var(--line2)"
                  strokeWidth="7"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="96"
                  fill="none"
                  stroke={going ? "var(--pri)" : "var(--ok)"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={off}
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: going
                      ? "drop-shadow(0 0 8px var(--pri-glow))"
                      : "none",
                  }}
                />
              </svg>
              {ripples.map((id) => (
                <div key={id} className="tap-ripple" />
              ))}
              <button
                className="tap-btn"
                style={{
                  background: `linear-gradient(135deg,${col},${col})`,
                  boxShadow: going
                    ? `0 0 30px var(--pri-glow),0 6px 20px rgba(0,0,0,.15)`
                    : "var(--sh2)",
                  animation: going ? "breathe 2s ease infinite" : "none",
                }}
                onClick={going ? tap : !done ? startRR : undefined}
              >
                {done ? (
                  <>
                    <div
                      style={{
                        fontSize: 40,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      {rate}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(255,255,255,.7)",
                        textTransform: "uppercase",
                        letterSpacing: ".1em",
                        marginTop: 2,
                      }}
                    >
                      /min
                    </div>
                  </>
                ) : going ? (
                  <>
                    <div
                      style={{
                        fontSize: 44,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1,
                      }}
                      key={taps}
                    >
                      {taps}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "rgba(255,255,255,.7)",
                        textTransform: "uppercase",
                        marginTop: 2,
                      }}
                    >
                      {t.taps}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, color: "#fff" }}>▶</div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,.8)",
                        textTransform: "uppercase",
                        marginTop: 4,
                      }}
                    >
                      TAP TO START
                    </div>
                  </>
                )}
              </button>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--ink2)",
                textAlign: "center",
              }}
            >
              {done
                ? rr?.label
                : going
                  ? `${sec}s remaining`
                  : "Tap each time the chest rises"}
            </div>
            {done && rr && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink3)",
                  textAlign: "center",
                }}
              >
                {rr.detail}
              </div>
            )}
            {done && (
              <button
                className="btn-secondary"
                style={{ marginBottom: -4 }}
                onClick={startRR}
              >
                ↺ Redo measurement
              </button>
            )}
            {done ? (
              <button className="btn-primary" onClick={() => setScr("muac")}>
                {t.nextMuac} →
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => setScr("muac")}>
                {t.skip} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══ MUAC ═══
  if (scr === "muac")
    return (
      <div className="app">
        <div className="screen">
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          <div className="hdr">
            <div
              className="hdr-back"
              onClick={() => {
                clearInterval(ivRef.current);
                setScr("rr");
              }}
            >
              ←
            </div>
            <div className="hdr-title">{t.muacTitle}</div>
          </div>
          <div className="prog">
            <div className="prog-track">
              <div className="prog-fill" style={{ width: "75%" }} />
            </div>
            <div className="prog-lbl">Step 4 of 5</div>
          </div>
          <div className="body">
            {/* How-to with image */}
            <div
              className="card"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <img
                src={muacImg}
                alt="MUAC measurement guide"
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 12,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginBottom: 4,
                  }}
                >
                  {t.muacDesc}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink3)",
                    lineHeight: 1.5,
                  }}
                >
                  {t.muacInstruction}
                </div>
              </div>
            </div>

            {/* CHW tape note */}
            <div
              className="card-warn"
              style={{ fontSize: 12, lineHeight: 1.7 }}
            >
              <strong>{t.noTapeNoteLabel}</strong> {t.noTapeNote}
            </div>

            {/* Color strip */}
            <div
              style={{
                display: "flex",
                borderRadius: 10,
                overflow: "hidden",
                height: 40,
                boxShadow: "var(--sh)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg,#C0392B,#E74C3C)",
                }}
              />
              <div
                style={{
                  flex: 1.4,
                  background: "linear-gradient(135deg,#D4940A,#F0B429)",
                }}
              />
              <div
                style={{
                  flex: 2,
                  background: "linear-gradient(135deg,#1E8C5E,#27AE60)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 10,
                color: "var(--ink4)",
                fontWeight: 600,
              }}
            >
              <span style={{ flex: 1 }}>&lt;115mm</span>
              <span style={{ flex: 1.4 }}>115–125mm</span>
              <span style={{ flex: 2 }}>&gt;125mm ✓</span>
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)" }}>
              Which color matches?
            </div>

            {[
              {
                c: "red",
                bg: "var(--err-bg)",
                bc: "#F0A0A0",
                dot: "#D63031",
                label: t.redBand,
                sub: t.redDesc,
              },
              {
                c: "yellow",
                bg: "var(--warn-bg)",
                bc: "#F0D080",
                dot: "#D4940A",
                label: t.yellowBand,
                sub: t.yellowDesc,
              },
              {
                c: "green",
                bg: "var(--ok-bg)",
                bc: "#8DCAAC",
                dot: "#1E8C5E",
                label: t.greenBand,
                sub: t.greenDesc,
              },
            ].map(({ c, bg, bc, dot, label, sub }) => (
              <button
                key={c}
                className="muac-opt"
                onClick={() => {
                  setMuac(c);
                  vibrate(30);
                }}
                style={{
                  background: bg,
                  borderColor: muac === c ? dot : bc,
                  transform: muac === c ? "scale(1.02)" : "none",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: dot,
                    flexShrink: 0,
                    boxShadow: muac === c ? `0 0 12px ${dot}40` : "none",
                  }}
                />
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--ink)",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink3)", marginTop: 1 }}
                  >
                    {sub}
                  </div>
                </div>
              </button>
            ))}

            <button
              className="btn-primary"
              onClick={() => {
                saveScreening({
                  name,
                  age,
                  dangerSigns: dAns,
                  respiratoryRate: rate,
                  muac,
                  overallRisk: ov.severity,
                  timestamp: new Date().toISOString(),
                });
                setScr("results");
              }}
            >
              {muac ? t.seeResults : t.skipResults} →
            </button>
          </div>
        </div>
      </div>
    );

  // ═══ RESULTS ═══
  if (scr === "results") {
    const act = lang === "hi" && ov.action_hi ? ov.action_hi : ov.action;
    const sub = lang === "hi" && ov.sub_hi ? ov.sub_hi : ov.sub;
    const isCritical = ov.severity === "critical" || ov.severity === "high";
    return (
      <div className="app">
        <div className="screen">
          <TopBar
            lang={lang}
            setLang={setLang}
            voiceOn={voiceOn}
            setVoiceOn={setVoiceOn}
          />
          <div className="hdr">
            <div className="hdr-back" onClick={() => setScr("muac")}>
              ←
            </div>
            <div className="hdr-title">
              {name
                ? lang === "hi"
                  ? `${name} के परिणाम`
                  : `${name}'s Results`
                : t.resultsTitle}
            </div>
          </div>
          <div className="prog">
            <div className="prog-track">
              <div
                className="prog-fill"
                style={{ width: "100%", background: "var(--ok)" }}
              />
            </div>
            <div className="prog-lbl">{t.complete} ✓</div>
          </div>
          <div className="body">
            {/* Verdict */}
            <div
              className={`verdict ${isCritical ? "verdict-critical" : ""}`}
              style={{
                background: ov.bg,
                border: `2px solid ${ov.color}30`,
                boxShadow: isCritical ? undefined : `0 4px 20px ${ov.color}15`,
              }}
            >
              <div
                className="verdict-icon"
                style={{
                  animation: isCritical ? "none" : "float 3s ease infinite",
                }}
              >
                {ov.icon}
              </div>
              <div className="verdict-title" style={{ color: ov.color }}>
                {act}
              </div>
              <div className="verdict-sub" style={{ color: "var(--ink2)" }}>
                {sub}
              </div>
              {(name || ageStr) && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ink4)",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {name && `${name}, `}
                  {ageStr}
                </div>
              )}
            </div>

            {/* Emergency actions — only when critical */}
            {isCritical && (
              <div style={{ display: "flex", gap: 8 }}>
                <a href="tel:104" className="call-btn" style={{ flex: 1 }}>
                  📞 Call 104
                </a>
                <button
                  className="share-btn"
                  style={{ flex: 1 }}
                  onClick={shareResults}
                >
                  📲 Share
                </button>
              </div>
            )}

            {/* Breakdown */}
            <div
              style={{ fontSize: 14, fontWeight: 700, color: "var(--ink2)" }}
            >
              {t.screeningBreakdown}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { title: t.resDangerSigns, risk: dRisk },
                { title: t.resBreathing, risk: rRisk },
                { title: t.resMuac, risk: mRisk },
              ].map(({ title, risk }) => {
                const c =
                  risk.level === "urgent" || risk.level === "high"
                    ? "var(--err)"
                    : risk.level === "medium"
                      ? "var(--warn)"
                      : "var(--ok)";
                return (
                  <div key={title} className="res-row">
                    <div
                      className="res-dot"
                      style={{
                        background: c,
                        boxShadow: `0 0 8px ${c === "var(--err)" ? "var(--err-glow)" : c === "var(--warn)" ? "rgba(212,148,10,.2)" : "var(--ok-glow)"}`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--ink3)",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        {title}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "var(--ink)",
                          marginTop: 1,
                        }}
                      >
                        {risk.label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ink4)",
                          lineHeight: 1.4,
                          marginTop: 2,
                        }}
                      >
                        {risk.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Help card */}
            {ov.severity !== "healthy" && (
              <div className="card-dark">
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--gold)",
                    marginBottom: 6,
                  }}
                >
                  {t.helpNow}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,.55)",
                    lineHeight: 1.7,
                  }}
                >
                  {t.helpDesc}
                </div>
              </div>
            )}

            {/* Share — always available */}
            {!isCritical && (
              <button className="share-btn" onClick={shareResults}>
                📲 Share Results via WhatsApp
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => {
                resetAll();
                setScr("home");
              }}
            >
              {t.checkAnother}
            </button>
            <div className="note">{t.disclaimer}</div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
