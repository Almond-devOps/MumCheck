/* ═══════════════════════════════════════════════════
   MaaCheck — Voice Guidance Engine
   Speaks instructions to mothers who may not read
   ═══════════════════════════════════════════════════ */

let synth = null;

function getSynth() {
  if (!synth && typeof window !== "undefined" && window.speechSynthesis) {
    synth = window.speechSynthesis;
  }
  return synth;
}

// Get the best available voice for a language
function getVoice(lang = "en") {
  const s = getSynth();
  if (!s) return null;

  const voices = s.getVoices();
  const langCode = lang === "hi" ? "hi" : "en";

  // Try to find a female voice (more appropriate for maternal health context)
  const female = voices.find(
    (v) =>
      v.lang.startsWith(langCode) && v.name.toLowerCase().includes("female"),
  );
  if (female) return female;

  // Fall back to any voice in the right language
  const anyLang = voices.find((v) => v.lang.startsWith(langCode));
  if (anyLang) return anyLang;

  // Last resort
  return voices[0] || null;
}

export function speak(text, lang = "en", onEnd = null) {
  const s = getSynth();
  if (!s) return;

  // Cancel any current speech
  s.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  const voice = getVoice(lang);
  if (voice) utterance.voice = voice;

  utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
  utterance.rate = 0.85; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  s.speak(utterance);
}

export function stopSpeaking() {
  const s = getSynth();
  if (s) s.cancel();
}

export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Pre-load voices (some browsers need this)
export function preloadVoices() {
  const s = getSynth();
  if (s) {
    s.getVoices(); // Triggers voice loading
    if (s.onvoiceschanged !== undefined) {
      s.onvoiceschanged = () => s.getVoices();
    }
  }
}
