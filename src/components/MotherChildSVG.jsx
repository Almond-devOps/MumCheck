/* ═══════════════════════════════════════════════════
   MaaCheck — Mother & Child SVG Illustration
   Warm, culturally-sensitive illustration for the
   landing screen
   ═══════════════════════════════════════════════════ */

export default function MotherChildIllustration() {
  return (
    <svg viewBox="0 0 240 210" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 240, display: 'block', margin: '0 auto' }}>

      {/* Ground shadow */}
      <ellipse cx="120" cy="198" rx="72" ry="11" fill="#C05B38" fillOpacity="0.07"/>

      {/* Mother — sari/wrap */}
      <path d="M78 118 Q82 185 120 190 Q158 185 162 118 Q148 110 120 108 Q92 110 78 118Z"
        fill="#E8A640" fillOpacity="0.28"/>
      {/* Mother — torso */}
      <path d="M94 82 Q94 122 120 126 Q146 122 146 82 Q136 74 120 72 Q104 74 94 82Z"
        fill="#C05B38" fillOpacity="0.42"/>
      {/* Mother — head */}
      <circle cx="120" cy="56" r="23" fill="#EDD4C0"/>
      {/* Hair */}
      <path d="M97 49 Q97 27 120 25 Q143 27 143 49 Q141 36 120 34 Q99 36 97 49Z" fill="#2D1A0F"/>
      <path d="M97 49 Q94 61 97 74 Q95 64 97 49Z" fill="#2D1A0F"/>
      <path d="M143 49 Q146 61 143 74 Q145 64 143 49Z" fill="#2D1A0F"/>
      {/* Bindi */}
      <circle cx="120" cy="44" r="2.2" fill="#C05B38" fillOpacity="0.55"/>
      {/* Eyes */}
      <circle cx="112" cy="55" r="2"   fill="#3D2212"/>
      <circle cx="128" cy="55" r="2"   fill="#3D2212"/>
      <circle cx="112.8" cy="54.2" r="0.7" fill="white"/>
      <circle cx="128.8" cy="54.2" r="0.7" fill="white"/>
      {/* Smile */}
      <path d="M113 64 Q120 70 127 64" stroke="#C05B38" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Mother arms */}
      <path d="M94 90 Q70 102 64 128 Q73 122 78 116 Q84 104 94 98Z" fill="#EDD4C0"/>
      <path d="M146 90 Q170 102 176 128 Q167 122 162 116 Q156 104 146 98Z" fill="#EDD4C0"/>

      {/* Child held on left arm — body */}
      <rect x="42" y="100" width="28" height="36" rx="10" fill="#F5E8D8"/>
      {/* Child blanket/wrap */}
      <path d="M42 108 Q38 118 42 130 Q46 122 42 108Z" fill="#E8A640" fillOpacity="0.4"/>
      {/* Child head */}
      <circle cx="56" cy="92" r="14" fill="#EDD4C0"/>
      {/* Child hair */}
      <path d="M42 87 Q42 76 56 73 Q70 76 70 87 Q68 79 56 78 Q44 79 42 87Z" fill="#4A2D18"/>
      {/* Child eyes */}
      <circle cx="51" cy="91" r="1.5" fill="#3D2212"/>
      <circle cx="61" cy="91" r="1.5" fill="#3D2212"/>
      {/* Child smile */}
      <path d="M52 99 Q56 103 60 99" stroke="#C05B38" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      {/* Tiny hand reaching up */}
      <circle cx="70" cy="108" r="5"  fill="#EDD4C0"/>

      {/* Floating heart */}
      <path d="M120 18 C120 18 113 11 107 14 C101 17 101 24 107 29 L120 42 L133 29 C139 24 139 17 133 14 C127 11 120 18 120 18Z"
        fill="#C05B38" fillOpacity="0.2"/>

      {/* SDG leaf deco marks */}
      <circle cx="192" cy="54"  r="3.5" fill="#2C5A3C" fillOpacity="0.18"/>
      <circle cx="184" cy="68"  r="2.5" fill="#2C5A3C" fillOpacity="0.15"/>
      <circle cx="196" cy="74"  r="2"   fill="#2C5A3C" fillOpacity="0.13"/>
      <circle cx="188" cy="82"  r="1.5" fill="#E8A640"  fillOpacity="0.25"/>
    </svg>
  );
}
