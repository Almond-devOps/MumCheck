/* ═══════════════════════════════════════════════════
   Mumcheck — WHO Clinical Data
   Based on WHO IMCI (Integrated Management of
   Childhood Illness) Guidelines, 2024 Edition
   ═══════════════════════════════════════════════════ */

// ─── Respiratory Rate Thresholds (WHO IMCI) ────────
// "Fast breathing" cutoffs by age group
export function getRespiratoryThreshold(ageMonths) {
  if (ageMonths < 2)
    return { fast: 60, label: "0–2 months", ageGroup: "newborn" };
  if (ageMonths < 12)
    return { fast: 50, label: "2–11 months", ageGroup: "infant" };
  return { fast: 40, label: "1–5 years", ageGroup: "child" };
}

export function classifyRespiratoryRate(rate, ageMonths) {
  const t = getRespiratoryThreshold(ageMonths);
  if (rate >= t.fast)
    return {
      level: "high",
      label: "Fast Breathing",
      detail: `${rate}/min — fast for ${t.label}, seek care today`,
      threshold: t.fast,
    };
  if (rate < 20)
    return {
      level: "medium",
      label: "Unusually Slow",
      detail: `${rate}/min — below expected range, needs assessment`,
      threshold: t.fast,
    };
  return {
    level: "low",
    label: "Normal Breathing",
    detail: `${rate}/min — within healthy range for ${t.label}`,
    threshold: t.fast,
  };
}

// ─── MUAC Classification (WHO SAM/MAM) ────────────
// SAM: Severe Acute Malnutrition (<115mm = red)
// MAM: Moderate Acute Malnutrition (115-125mm = yellow)
// Normal: >125mm = green
export function classifyMUAC(color) {
  if (color === "red")
    return {
      level: "high",
      label: "Severe Malnutrition (SAM)",
      detail: "Below 115mm — urgent nutrition support & medical care needed",
    };
  if (color === "yellow")
    return {
      level: "medium",
      label: "Moderate Malnutrition (MAM)",
      detail: "115–125mm — monitor closely, supplementary feeding recommended",
    };
  return {
    level: "low",
    label: "Normal Nutrition",
    detail: "Above 125mm — within healthy range",
  };
}

// ─── IMCI Danger Signs ─────────────────────────────
// Based on WHO IMCI General Danger Signs
export const DANGER_SIGNS = [
  {
    id: "fits",
    icon: "⚡",
    question: "Has your child had fits or convulsions?",
    description: "Body shaking or jerking they cannot control",
    severe: true,
    // Multilingual
    question_hi: "क्या आपके बच्चे को दौरे पड़े हैं?",
    description_hi: "शरीर का अनियंत्रित हिलना या झटके",
  },
  {
    id: "awake",
    icon: "😴",
    question: "Is your child very hard to wake up?",
    description: "No response to their name or gentle touch",
    severe: true,
    question_hi: "क्या आपका बच्चा जगाने पर भी नहीं उठ रहा?",
    description_hi: "नाम पुकारने या छूने पर कोई प्रतिक्रिया नहीं",
  },
  {
    id: "vomit",
    icon: "🤢",
    question: "Does your child vomit everything they eat or drink?",
    description: "Every feeding comes back up within minutes",
    severe: false,
    question_hi: "क्या आपका बच्चा सब कुछ उल्टी कर देता है?",
    description_hi: "हर बार खाना या दूध तुरंत बाहर आ जाता है",
  },
  {
    id: "chest",
    icon: "🫁",
    question: "Does the skin pull in between the ribs when breathing?",
    description:
      "You can clearly see the ribs on every breath in — called chest indrawing",
    severe: false,
    question_hi: "क्या सांस लेते समय पसलियों के बीच की त्वचा अंदर खिंचती है?",
    description_hi: "हर सांस में पसलियां साफ दिखाई देती हैं",
  },
  {
    id: "drink",
    icon: "💧",
    question: "Is your child unable to drink or breastfeed?",
    description: "They refuse fluids or cannot swallow when offered",
    severe: false,
    question_hi: "क्या आपका बच्चा दूध पीने या पानी पीने में असमर्थ है?",
    description_hi: "पानी या दूध लेने से मना करना या निगल न पाना",
  },
  {
    id: "limp",
    icon: "😞",
    question: "Is your child unusually drowsy, limp, or weak?",
    description: "Much less active than normal, floppy, unusually quiet",
    severe: false,
    question_hi: "क्या आपका बच्चा असामान्य रूप से सुस्त या कमज़ोर है?",
    description_hi: "सामान्य से बहुत कम सक्रिय, असामान्य रूप से शांत",
  },
];

export function classifyDangerSigns(answers) {
  const severeYes = DANGER_SIGNS.filter((s) => s.severe && answers[s.id]);
  const allYes = DANGER_SIGNS.filter((s) => answers[s.id]);

  if (severeYes.length > 0)
    return {
      level: "urgent",
      label: "Severe Danger Signs",
      detail: `${severeYes.length} severe sign(s) — emergency care needed immediately`,
      count: allYes.length,
      severeCount: severeYes.length,
    };
  if (allYes.length > 0)
    return {
      level: "high",
      label: "Danger Signs Present",
      detail: `${allYes.length} warning sign(s) detected — see a health worker today`,
      count: allYes.length,
      severeCount: 0,
    };
  return {
    level: "low",
    label: "No Danger Signs",
    detail: "No warning signs detected — continue monitoring",
    count: 0,
    severeCount: 0,
  };
}

// ─── Combined Risk Engine ──────────────────────────
// Combines all three screening results into one actionable verdict
const SEVERITY_WEIGHT = { urgent: 4, high: 3, medium: 2, low: 1 };

export function getOverallRisk(dangerResult, rrResult, muacResult) {
  const d = SEVERITY_WEIGHT[dangerResult?.level] || 1;
  const r = SEVERITY_WEIGHT[rrResult?.level] || 1;
  const m = SEVERITY_WEIGHT[muacResult?.level] || 1;
  const max = Math.max(d, r, m);

  if (max === 4)
    return {
      severity: "critical",
      color: "#B5281F",
      bg: "#FEF0F0",
      icon: "🚨",
      action: "See a health worker IMMEDIATELY",
      sub: "Do not wait — emergency care needed",
      action_hi: "तुरंत स्वास्थ्य कर्मचारी से मिलें",
      sub_hi: "इंतज़ार न करें — आपातकालीन देखभाल ज़रूरी है",
    };
  if (max === 3)
    return {
      severity: "high",
      color: "#C05B38",
      bg: "#FDF3EE",
      icon: "⚠️",
      action: "See a health worker TODAY",
      sub: "Concerning signs detected — do not delay",
      action_hi: "आज ही स्वास्थ्य कर्मचारी से मिलें",
      sub_hi: "चिंताजनक लक्षण दिखे — देर न करें",
    };
  if (max === 2)
    return {
      severity: "moderate",
      color: "#C8900A",
      bg: "#FDF9EF",
      icon: "👁️",
      action: "Visit a clinic within 24 hours",
      sub: "Some signs need monitoring — watch closely",
      action_hi: "24 घंटे के अंदर क्लिनिक जाएं",
      sub_hi: "कुछ लक्षणों पर नज़र रखें",
    };
  return {
    severity: "healthy",
    color: "#2C5A3C",
    bg: "#EEF7F2",
    icon: "✅",
    action: "Your child appears healthy",
    sub: "Continue regular monitoring at home",
    action_hi: "आपका बच्चा स्वस्थ दिखता है",
    sub_hi: "घर पर नियमित निगरानी जारी रखें",
  };
}

// ─── Multilingual Strings ──────────────────────────
export const STRINGS = {
  en: {
    tagline: "Every mother deserves to know",
    storyTitle: "The gap that kills 800,000 children a year",
    story:
      "This is Amara. She is 3. She has had a fever for two days. Her mother lives 8km from the nearest clinic. She doesn't know if her daughter is just fighting a virus — or if her lungs are filling with fluid right now.",
    backToAbout: "← About",
    startBtn: "Check My Child Now",
    profileTitle: "About your child",
    nameLabel: "Child's name (optional)",
    namePlaceholder: "e.g. Priya",
    ageLabel: "How old is your child?",
    ageInfo:
      "Age determines safe breathing thresholds. A 2-month-old breathes up to 60 times/min — a 2-year-old only 40.  adjusts WHO limits automatically.",
    startCheck: "Start Health Check",
    dangerTitle: "Danger Signs",
    breathTitle: "Breathing Rate",
    breathInstruction:
      "Watch your child's chest. Each time it rises, tap the circle once. The timer runs 60 seconds.",
    safeLimit: "Safe limit for this age:",
    tapToStart: "Tap to start",
    taps: "taps",
    secRemaining: "seconds remaining",
    nextMuac: "Next: Arm Band Check",
    skip: "Skip this step",
    muacTitle: "Arm Band Check",
    muacDesc: "MUAC — Mid-Upper Arm Circumference",
    muacInstruction:
      "Use the MUAC tape your ASHA worker or health visitor gave you. Wrap it around your child's left arm, halfway between the shoulder and elbow. Note which colour zone it shows.",
    noTapeNote:
      "No MUAC tape? Your ASHA worker / health visitor carries them on every home visit. Ask them to bring one — it only takes a moment.",
    noTapeNoteLabel: "Need a tape?",
    redBand: "Red Band",
    redDesc: "Below 115mm — Severe Acute Malnutrition",
    yellowBand: "Yellow Band",
    yellowDesc: "115–125mm — Moderate Acute Malnutrition",
    greenBand: "Green Band",
    greenDesc: "Above 125mm — Healthy range",
    seeResults: "See Results",
    skipResults: "Skip & See Results",
    resultsTitle: "Check Results",
    helpNow: "If you need help now",
    helpDesc:
      "Contact your nearest ASHA worker, ANM, or Primary Health Centre. Show them these results.",
    helpline: "National health helpline:",
    checkAnother: "Check Another Child",
    disclaimer:
      " uses WHO IMCI guidelines. This is a screening tool — not a medical diagnosis. Always consult a qualified health worker.",
    complete: "Complete",
    screeningIncludes: "3-minute screening includes:",
    feat1Title: "Danger Signs",
    feat1Desc: "6 WHO warning sign checks",
    feat2Title: "Breathing Rate",
    feat2Desc: "Tap-based respiratory counter",
    feat3Title: "Nutrition (MUAC)",
    feat3Desc: "Arm measurement color check",
    recentScreenings: "Recent screenings",
    childFallback: "Child",
    screeningBreakdown: "Screening Breakdown",
    resDangerSigns: "Danger Signs",
    resBreathing: "Breathing Rate",
    resMuac: "MUAC \u00b7 Nutrition",
    gapTitle: "The gap we close",
    gapDesc:
      "Every existing tool — MUAC tape, respiratory timers, IMCI checklists — is built for trained health workers. Between CHW visits, mothers have nothing.  gives every mother the diagnostic capability that used to require a clinic.",
    sdgFooter:
      "SDG 3 · Good Health & Well-Being · WHO IMCI Guidelines · Works Offline",
  },
  hi: {
    tagline: "हर माँ को जानने का हक है",
    storyTitle: "वो कमी जो हर साल 8 लाख बच्चों की जान लेती है",
    story:
      "यह अमारा है। वह 3 साल की है। दो दिनों से बुखार है। उसकी माँ निकटतम क्लिनिक से 8 किमी दूर रहती है। उसे नहीं पता कि बेटी को सिर्फ वायरस है — या उसके फेफड़ों में पानी भर रहा है।",
    backToAbout: "← परिचय",
    startBtn: "अभी जाँच करें",
    profileTitle: "बच्चे के बारे में",
    nameLabel: "बच्चे का नाम (वैकल्पिक)",
    namePlaceholder: "जैसे प्रिया",
    ageLabel: "बच्चे की उम्र कितनी है?",
    ageInfo:
      "उम्र से सांस की सुरक्षित सीमा तय होती है। 2 महीने का बच्चा 60 बार/मिनट सांस लेता है — 2 साल का सिर्फ 40। Mumcheck WHO सीमाएं स्वचालित रूप से समायोजित करता है।",
    startCheck: "स्वास्थ्य जाँच शुरू करें",
    dangerTitle: "खतरे के संकेत",
    breathTitle: "सांस की दर",
    breathInstruction:
      "अपने बच्चे की छाती देखें। हर बार जब यह ऊपर उठे, गोले को एक बार टैप करें। टाइमर 60 सेकंड चलता है।",
    safeLimit: "इस उम्र की सुरक्षित सीमा:",
    tapToStart: "शुरू करने के लिए टैप करें",
    taps: "टैप",
    secRemaining: "सेकंड शेष",
    nextMuac: "अगला: बाँह की पट्टी जाँच",
    skip: "यह चरण छोड़ें",
    muacTitle: "बाँह की पट्टी जाँच",
    muacDesc: "MUAC — ऊपरी बाँह की माप",
    muacInstruction:
      "अपनी आशा कार्यकर्ता या स्वास्थ्य कार्यकर्ता द्वारा दी गई MUAC पट्टी का उपयोग करें। इसे अपने बच्चे की बाईं बाँह में कंधे और कोहनी के बीच लपेटें और देखें किस रंग क्षेत्र पर है।",
    noTapeNote:
      "MUAC पट्टी नहीं है? आपकी आशा कार्यकर्ता हर घर भ्रमण में पट्टी लाती हैं — उनसे माँगें।",
    noTapeNoteLabel: "पट्टी चाहिए?",
    redBand: "लाल पट्टी",
    redDesc: "115mm से कम — गंभीर कुपोषण",
    yellowBand: "पीली पट्टी",
    yellowDesc: "115–125mm — मध्यम कुपोषण",
    greenBand: "हरी पट्टी",
    greenDesc: "125mm से अधिक — स्वस्थ",
    seeResults: "परिणाम देखें",
    skipResults: "छोड़ें और परिणाम देखें",
    resultsTitle: "जाँच के परिणाम",
    helpNow: "अगर अभी मदद चाहिए",
    helpDesc:
      "अपनी निकटतम आशा कार्यकर्ता, ANM, या प्राथमिक स्वास्थ्य केंद्र से संपर्क करें। ये परिणाम दिखाएं।",
    helpline: "राष्ट्रीय स्वास्थ्य हेल्पलाइन:",
    checkAnother: "दूसरे बच्चे की जाँच करें",
    disclaimer:
      "Mumcheck WHO IMCI दिशानिर्देशों का उपयोग करता है। यह एक स्क्रीनिंग टूल है — चिकित्सा निदान नहीं।",
    complete: "पूर्ण",
    screeningIncludes: "3 मिनट की जाँच में:",
    feat1Title: "खतरे के संकेत",
    feat1Desc: "6 WHO चेतावनी संकेत",
    feat2Title: "सांस की दर",
    feat2Desc: "टैप-आधारित काउंटर",
    feat3Title: "पोषण (MUAC)",
    feat3Desc: "बाँह का रंग माप",
    recentScreenings: "हाल की जाँच",
    childFallback: "बच्चा",
    screeningBreakdown: "जाँच का विवरण",
    resDangerSigns: "खतरे के संकेत",
    resBreathing: "सांस की दर",
    resMuac: "MUAC \u00b7 पोषण",
    gapTitle: "हम कौन सी कमी पूरी करते हैं",
    gapDesc:
      "हर मौजूदा उपकरण — MUAC टेप, श्वसन टाइमर, IMCI चेकलिस्ट — प्रशिक्षित स्वास्थ्य कर्मचारियों के लिए बना है। CHW विज़िट के बीच, माँओं के पास कुछ नहीं है। Mumcheck हर माँ को वो जाँच क्षमता देता है जो पहले सिर्फ क्लिनिक में मिलती थी।",
    sdgFooter:
      "SDG 3 · स्वास्थ्य और कल्याण · WHO IMCI दिशानिर्देश · ऑफ़लाइन काम करता है",
  },
};
