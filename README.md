# MaaCheck — Every Mother, A First Responder

> **GNEC Hackathon 2026 Spring · SDG 3 (Health & Well-being) · Target 3.2**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-MaaCheck-D4603A?style=for-the-badge)](https://maacheck.vercel.app)
[![SDG 3](https://img.shields.io/badge/SDG-3%20Good%20Health-4C9F38?style=for-the-badge)](https://sdgs.un.org/goals/goal3)
[![WHO IMCI](https://img.shields.io/badge/Guidelines-WHO%20IMCI-0078D4?style=for-the-badge)](https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/child-health/integrated-management-of-childhood-illness)

---

## The Problem

**800,000 children die from pneumonia every year.** Most deaths happen not because treatment doesn't exist — but because mothers don't know when to seek it.

Every existing diagnostic tool — MUAC tape, respiratory timers, IMCI checklists — is built for **trained health workers**. Community health workers (CHWs) visit every 14 days. Between visits, mothers are flying blind.

When a mother notices her child breathing fast or getting thinner, she has **no tool, no guidance, no way to know** if this is a normal virus or a medical emergency.

---

## The Solution

**MaaCheck** is the first offline child health screening tool built for **mothers** — not health workers.

Three WHO-validated checks. Three minutes. One clear answer.

| Screen | What It Does |
|---|---|
| **⚡ Danger Signs** | 6 WHO IMCI questions, read aloud by voice. Giant Yes/No buttons — no literacy required. |
| **🫁 Breathing Rate** | Tap-based 60-second respiratory counter with live waveform. WHO age-specific thresholds classify the result instantly. |
| **📏 Nutrition (MUAC)** | Mother wraps the MUAC tape (provided by her ASHA worker during home visits) around her child's arm and selects the colour zone. |

**Result:** A single clear action — *"See a health worker TODAY"* or *"Your child appears healthy — monitor at home."*

---

## Why This Hasn't Been Done Before

| Existing Tool | Gap |
|---|---|
| Child Growth Monitor (Welthungerhilfe) | CHW-only, requires training, MUAC only |
| WHO IMCI app | For trained health workers, not mothers |
| ARI Timer | Hardware device, no integration |
| All others | Built for clinics, not for the last mile |

**No existing app combines MUAC + respiratory rate + danger signs in one mother-facing, offline, free tool.** That is the gap MaaCheck closes.

---

## Features

- ✅ **Works on any Android phone** — no app store, installs from a WhatsApp link
- ✅ **Fully offline** — all WHO thresholds hardcoded, no server required
- ✅ **Bilingual** — English and हिंदी (Hindi) with full translation
- ✅ **Voice guidance** — reads every question aloud for low-literacy mothers
- ✅ **WHO IMCI compliant** — respiratory thresholds, MUAC classification, danger signs all match 2024 guidelines
- ✅ **Screening history** — saved locally, coloured by overall risk level
- ✅ **WhatsApp share** — results can be sent directly to a CHW or family member
- ✅ **CHW integration** — designed to work alongside (not replace) community health workers

---

## SDG Alignment

**SDG 3.2** — End preventable deaths of newborns and children under 5.

MaaCheck directly targets the *diagnostic gap* between CHW visits by empowering mothers with the same screening capability that used to require a clinic. Each screening takes 3 minutes and uses WHO IMCI clinical guidelines.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Pure CSS (no framework) |
| Clinical Logic | WHO IMCI 2024 guidelines (hardcoded) |
| Storage | localStorage (offline-first) |
| Voice | Web Speech API |
| Waveform | HTML5 Canvas + ResizeObserver |
| Share | Web Share API + WhatsApp fallback |

**Bundle size:** 236 KB JS · 19 KB CSS · gzip: 73 KB

---

## Clinical Accuracy

All thresholds are sourced directly from **WHO IMCI 2024**:

### Respiratory Rate (Fast Breathing Cutoffs)
| Age | Threshold |
|---|---|
| 0 – 2 months | ≥ 60 breaths/min |
| 2 – 11 months | ≥ 50 breaths/min |
| 1 – 5 years | ≥ 40 breaths/min |

### MUAC (Mid-Upper Arm Circumference)
| Colour | Measurement | Classification |
|---|---|---|
| 🔴 Red | < 115 mm | Severe Acute Malnutrition (SAM) |
| 🟡 Yellow | 115 – 125 mm | Moderate Acute Malnutrition (MAM) |
| 🟢 Green | > 125 mm | Normal |

### Danger Signs
All 6 WHO IMCI general danger signs: convulsions, inability to wake, vomiting everything, chest indrawing, inability to drink/breastfeed, abnormal drowsiness.

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/MaaCheck.git
cd MaaCheck

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
MaaCheck/
├── src/
│   ├── assets/              # hero.png, chest-guide.png, muac-guide.png
│   ├── components/
│   │   ├── LandingPage.jsx  # Judge-facing website with Amara's story
│   │   ├── TopBar.jsx       # Language toggle + voice button
│   │   └── BreathingWaveform.jsx  # Real-time canvas waveform
│   ├── data/
│   │   └── clinicalData.js  # All WHO IMCI thresholds + bilingual strings
│   ├── utils/
│   │   ├── voiceGuidance.js # Web Speech API wrapper
│   │   └── storage.js       # localStorage screening history
│   ├── App.jsx              # All screen flows (home → profile → signs → rr → muac → results)
│   └── index.css            # All styles
├── public/
│   ├── manifest.json        # PWA manifest
│   └── favicon.svg
└── index.html
```

---

## Disclaimer

MaaCheck uses WHO IMCI guidelines. This is a **screening tool — not a medical diagnosis**. Always consult a qualified health worker. MaaCheck is designed to support, not replace, community health workers.

---

## Built For

**GNEC Hackathon 2026 Spring**
Global NGO Executive Committee · UN-affiliated
Theme: SDG 3 — Good Health and Well-being

---

*Every mother deserves to know.*
