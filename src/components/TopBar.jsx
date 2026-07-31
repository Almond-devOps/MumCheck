/* ═══════════════════════════════════════════════════
   MaaCheck — TopBar Component
   Extracted from App to prevent re-mount on every
   state change (React rule: no components in render)
   ═══════════════════════════════════════════════════ */

import { stopSpeaking } from '../utils/voiceGuidance.js';

export default function TopBar({ lang, setLang, voiceOn, setVoiceOn }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        {[['en', 'EN'], ['hi', 'हिं']].map(([c, l]) => (
          <div
            key={c}
            className={`lang-pill ${lang === c ? 'on' : ''}`}
            onClick={() => { setLang(c); stopSpeaking(); }}
          >
            {l}
          </div>
        ))}
      </div>
      <div className="topbar-right">
        <div
          className={`voice-btn ${voiceOn ? 'on' : ''}`}
          onClick={() => setVoiceOn(v => !v)}
        >
          {voiceOn ? '🔊' : '🔇'}
        </div>
      </div>
    </div>
  );
}
