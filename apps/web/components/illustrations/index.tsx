/**
 * Warm, organic SVG illustrations for MindPoint.
 *
 * Each illustration uses the lavender / terracotta palette and soft organic
 * shapes to create a hand-drawn, welcoming aesthetic. Gradient IDs are
 * prefixed per illustration to avoid collisions on the same page.
 *
 * Usage: <HeroIllustration className="w-full max-w-md" />
 *
 * To swap any illustration with a Pixabay (or other) raster image, simply
 * replace the component body with <Image src="/illustrations/hero.png" ... />.
 */

interface IllustrationProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  HeroIllustration – person seated in calm meditation, floating     */
/*  leaves and organic blob background.                               */
/* ------------------------------------------------------------------ */
export function HeroIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 500 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="h-g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4c8e8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#b8a5d4" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="h-g2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8cfc0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#c8916e" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id="h-glow" cx="0.5" cy="0.48" r="0.42">
          <stop offset="0%" stopColor="#e8e0f0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#e8e0f0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Large organic blob */}
      <path
        d="M95,85 C155,18 335,2 415,72 C495,142 485,248 445,328 C405,408 310,448 210,435 C110,422 45,358 28,268 C11,178 35,152 95,85Z"
        fill="url(#h-g1)"
      />

      {/* Warm secondary blob */}
      <path
        d="M295,115 C358,82 432,128 418,202 C404,276 338,308 278,285 C218,262 232,148 295,115Z"
        fill="url(#h-g2)"
      />

      {/* Soft glow behind the person */}
      <circle cx="260" cy="250" r="150" fill="url(#h-glow)" />

      {/* --- Seated person silhouette --- */}
      {/* Head */}
      <circle cx="255" cy="168" r="28" fill="#8b7db0" fillOpacity="0.65" />
      {/* Neck + torso */}
      <path
        d="M243,194 C232,208 225,240 228,268 C231,296 245,312 260,312 C275,312 289,296 292,268 C295,240 288,208 277,194 C270,188 250,188 243,194Z"
        fill="#8b7db0"
        fillOpacity="0.55"
      />
      {/* Crossed legs */}
      <path
        d="M228,308 C218,314 200,326 196,338 C192,350 208,354 222,346 C236,338 244,322 248,312Z"
        fill="#8b7db0"
        fillOpacity="0.48"
      />
      <path
        d="M292,308 C302,314 320,326 324,338 C328,350 312,354 298,346 C284,338 276,322 272,312Z"
        fill="#8b7db0"
        fillOpacity="0.48"
      />
      {/* Arms resting on knees */}
      <path
        d="M232,255 C222,268 218,282 228,286 C238,290 254,278 262,278 C270,278 282,290 292,286 C302,282 298,268 288,255"
        fill="none"
        stroke="#8b7db0"
        strokeWidth="4.5"
        strokeOpacity="0.42"
        strokeLinecap="round"
      />

      {/* --- Floating leaves --- */}
      <g>
        <path
          d="M385,98 C400,78 424,86 418,108 C412,130 387,122 385,98Z"
          fill="#c8916e"
          fillOpacity="0.42"
        />
        <line x1="390" y1="104" x2="405" y2="92" stroke="#c8916e" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" />
      </g>
      <g>
        <path
          d="M115,210 C130,188 154,196 148,218 C142,240 117,232 115,210Z"
          fill="#9d8ec0"
          fillOpacity="0.35"
        />
        <line x1="120" y1="215" x2="136" y2="200" stroke="#9d8ec0" strokeWidth="1.2" strokeOpacity="0.25" strokeLinecap="round" />
      </g>
      <g>
        <path
          d="M410,268 C422,252 442,258 437,275 C432,292 412,286 410,268Z"
          fill="#c8916e"
          fillOpacity="0.32"
        />
      </g>
      <g>
        <path
          d="M145,345 C156,330 172,335 168,348 C164,361 148,357 145,345Z"
          fill="#9d8ec0"
          fillOpacity="0.25"
        />
      </g>

      {/* Decorative dots */}
      <circle cx="165" cy="100" r="5" fill="#c8916e" fillOpacity="0.38" />
      <circle cx="395" cy="345" r="4.5" fill="#9d8ec0" fillOpacity="0.3" />
      <circle cx="340" cy="55" r="3.5" fill="#9d8ec0" fillOpacity="0.28" />
      <circle cx="85" cy="305" r="4" fill="#c8916e" fillOpacity="0.25" />
      <circle cx="455" cy="185" r="3" fill="#c8916e" fillOpacity="0.32" />

      {/* Sparkle accents */}
      <path
        d="M178,148 L181,139 L184,148 L193,151 L184,154 L181,163 L178,154 L169,151Z"
        fill="#c8916e"
        fillOpacity="0.3"
      />
      <path
        d="M358,188 L360,182 L362,188 L368,190 L362,192 L360,198 L358,192 L352,190Z"
        fill="#9d8ec0"
        fillOpacity="0.22"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SupportIllustration – heart cradled by gentle hands               */
/* ------------------------------------------------------------------ */
export function SupportIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="s-bg" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%" stopColor="#ede7f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ede7f6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="s-heart" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#d4a080" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#c08060" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Background glow */}
      <circle cx="160" cy="140" r="135" fill="url(#s-bg)" />

      {/* Organic blob behind heart */}
      <path
        d="M80,70 C120,30 210,25 250,70 C290,115 280,200 240,240 C200,280 130,275 90,240 C50,205 40,110 80,70Z"
        fill="#d4c8e8"
        fillOpacity="0.25"
      />

      {/* Heart */}
      <path
        d="M160,115 C160,85 125,65 125,95 C125,125 160,160 160,160 C160,160 195,125 195,95 C195,65 160,85 160,115Z"
        fill="url(#s-heart)"
      />

      {/* Cupped hands */}
      <path
        d="M95,170 C85,155 70,165 75,180 C80,200 110,218 135,225 C150,228 155,220 155,215"
        fill="none"
        stroke="#8b7db0"
        strokeWidth="5"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <path
        d="M225,170 C235,155 250,165 245,180 C240,200 210,218 185,225 C170,228 165,220 165,215"
        fill="none"
        stroke="#8b7db0"
        strokeWidth="5"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />

      {/* Small leaves */}
      <path d="M70,100 C80,85 95,90 90,105 C85,120 72,114 70,100Z" fill="#9d8ec0" fillOpacity="0.3" />
      <path d="M245,85 C255,72 268,78 264,90 C260,102 247,98 245,85Z" fill="#c8916e" fillOpacity="0.35" />

      {/* Dots */}
      <circle cx="55" cy="145" r="3.5" fill="#c8916e" fillOpacity="0.3" />
      <circle cx="270" cy="135" r="3" fill="#9d8ec0" fillOpacity="0.28" />
      <circle cx="160" cy="55" r="3" fill="#c8916e" fillOpacity="0.25" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  GrowthIllustration – plant growing upward with butterfly          */
/* ------------------------------------------------------------------ */
export function GrowthIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 300 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g-stem" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stopColor="#8b7db0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#9d8ec0" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Background blob */}
      <path
        d="M60,80 C100,25 220,20 250,75 C280,130 270,220 240,275 C210,330 120,335 80,285 C40,235 20,135 60,80Z"
        fill="#ede7f6"
        fillOpacity="0.32"
      />

      {/* Stem */}
      <path
        d="M150,310 C148,280 146,240 148,200 C150,160 155,130 152,95"
        fill="none"
        stroke="url(#g-stem)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Leaves unfurling at different heights */}
      {/* Bottom leaf – left */}
      <path
        d="M148,265 C125,250 105,260 115,280 C125,295 145,290 148,275"
        fill="#8b7db0"
        fillOpacity="0.35"
      />
      {/* Bottom leaf – right */}
      <path
        d="M150,245 C175,232 195,242 185,258 C175,274 153,268 150,255"
        fill="#c8916e"
        fillOpacity="0.35"
      />
      {/* Middle leaf – left */}
      <path
        d="M148,195 C118,178 100,192 112,212 C124,230 146,222 148,208"
        fill="#9d8ec0"
        fillOpacity="0.38"
      />
      {/* Middle leaf – right */}
      <path
        d="M152,170 C182,156 200,168 190,185 C180,202 155,196 152,182"
        fill="#d4a080"
        fillOpacity="0.32"
      />
      {/* Top leaf – left */}
      <path
        d="M150,135 C128,118 112,128 122,146 C132,162 148,155 150,144"
        fill="#8b7db0"
        fillOpacity="0.3"
      />

      {/* Small flower/bud at top */}
      <circle cx="152" cy="88" r="8" fill="#c8916e" fillOpacity="0.45" />
      <circle cx="152" cy="88" r="4" fill="#e8cfc0" fillOpacity="0.6" />

      {/* Butterfly */}
      <g transform="translate(195,75) rotate(-15)">
        <path
          d="M0,0 C-12,-18 -25,-14 -18,0 C-25,14 -12,18 0,0Z"
          fill="#c8916e"
          fillOpacity="0.45"
        />
        <path
          d="M0,0 C12,-15 22,-10 16,0 C22,10 12,15 0,0Z"
          fill="#d4a080"
          fillOpacity="0.4"
        />
        <line x1="0" y1="0" x2="-4" y2="-12" stroke="#c8916e" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="0" y1="0" x2="2" y2="-11" stroke="#c8916e" strokeWidth="0.8" strokeOpacity="0.3" />
      </g>

      {/* Root lines at bottom */}
      <path d="M150,310 C140,325 125,330 120,335" fill="none" stroke="#8b7db0" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
      <path d="M150,310 C155,322 165,328 172,332" fill="none" stroke="#8b7db0" strokeWidth="1.5" strokeOpacity="0.15" strokeLinecap="round" />
      <path d="M150,310 C148,320 142,332 140,338" fill="none" stroke="#8b7db0" strokeWidth="1.5" strokeOpacity="0.15" strokeLinecap="round" />

      {/* Dots */}
      <circle cx="75" cy="145" r="3.5" fill="#c8916e" fillOpacity="0.3" />
      <circle cx="240" cy="115" r="3" fill="#9d8ec0" fillOpacity="0.25" />
      <circle cx="215" cy="260" r="4" fill="#c8916e" fillOpacity="0.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  CommunityIllustration – overlapping people-shapes, togetherness   */
/* ------------------------------------------------------------------ */
export function CommunityIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="c-bg" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0%" stopColor="#ede7f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ede7f6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="200" cy="150" r="155" fill="url(#c-bg)" />

      {/* Person 1 – left */}
      <circle cx="135" cy="115" r="22" fill="#8b7db0" fillOpacity="0.4" />
      <path
        d="M110,145 C105,155 100,175 105,195 C110,215 125,225 140,225 C155,225 165,215 168,195 C171,175 168,155 162,145 C155,138 118,138 110,145Z"
        fill="#8b7db0"
        fillOpacity="0.3"
      />

      {/* Person 2 – center-left */}
      <circle cx="185" cy="105" r="24" fill="#c8916e" fillOpacity="0.42" />
      <path
        d="M158,138 C152,148 148,170 152,192 C156,214 172,225 190,225 C208,225 220,214 222,192 C224,170 218,148 212,138 C205,130 165,130 158,138Z"
        fill="#c8916e"
        fillOpacity="0.28"
      />

      {/* Person 3 – center-right */}
      <circle cx="240" cy="110" r="22" fill="#9d8ec0" fillOpacity="0.45" />
      <path
        d="M215,140 C210,150 206,170 210,190 C214,210 228,222 245,222 C262,222 272,210 274,190 C276,170 270,150 264,140 C258,133 222,133 215,140Z"
        fill="#9d8ec0"
        fillOpacity="0.3"
      />

      {/* Person 4 – right */}
      <circle cx="290" cy="118" r="20" fill="#d4a080" fillOpacity="0.4" />
      <path
        d="M268,148 C264,156 260,172 264,190 C268,208 280,218 295,218 C310,218 318,208 320,190 C322,172 316,156 312,148 C306,142 274,142 268,148Z"
        fill="#d4a080"
        fillOpacity="0.28"
      />

      {/* Connecting arcs – togetherness */}
      <path
        d="M155,180 C170,168 185,168 200,178"
        fill="none"
        stroke="#b8a5d4"
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
      <path
        d="M205,175 C220,165 240,165 255,175"
        fill="none"
        stroke="#d4a080"
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />

      {/* Small heart in the overlap */}
      <path
        d="M210,190 C210,182 202,176 202,184 C202,192 210,200 210,200 C210,200 218,192 218,184 C218,176 210,182 210,190Z"
        fill="#c8916e"
        fillOpacity="0.45"
      />

      {/* Decorative dots */}
      <circle cx="90" cy="175" r="3.5" fill="#c8916e" fillOpacity="0.28" />
      <circle cx="340" cy="160" r="3" fill="#9d8ec0" fillOpacity="0.25" />
      <circle cx="200" cy="65" r="3" fill="#c8916e" fillOpacity="0.22" />
      <circle cx="120" cy="250" r="4" fill="#9d8ec0" fillOpacity="0.2" />
      <circle cx="320" cy="240" r="3.5" fill="#c8916e" fillOpacity="0.22" />

      {/* Sparkle */}
      <path
        d="M310,90 L312,83 L314,90 L321,92 L314,94 L312,101 L310,94 L303,92Z"
        fill="#c8916e"
        fillOpacity="0.28"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  TherapyIllustration – two people in calm conversation             */
/* ------------------------------------------------------------------ */
export function TherapyIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 360 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="t-glow" cx="0.5" cy="0.55" r="0.35">
          <stop offset="0%" stopColor="#f5e6da" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f5e6da" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background blob */}
      <path
        d="M55,60 C110,15 270,10 315,65 C360,120 345,210 300,260 C255,310 130,315 75,265 C20,215 0,105 55,60Z"
        fill="#ede7f6"
        fillOpacity="0.28"
      />

      {/* Warm glow between them */}
      <circle cx="180" cy="175" r="75" fill="url(#t-glow)" />

      {/* Person 1 – left, seated */}
      <circle cx="115" cy="125" r="22" fill="#8b7db0" fillOpacity="0.55" />
      <path
        d="M95,152 C88,162 84,185 88,205 C92,225 105,235 120,235 C135,235 145,225 147,205 C149,185 143,162 136,152 C128,145 102,145 95,152Z"
        fill="#8b7db0"
        fillOpacity="0.42"
      />
      {/* Arm reaching toward center */}
      <path
        d="M140,185 C148,180 155,178 162,180"
        fill="none"
        stroke="#8b7db0"
        strokeWidth="3.5"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Person 2 – right, seated */}
      <circle cx="248" cy="128" r="22" fill="#c8916e" fillOpacity="0.55" />
      <path
        d="M228,155 C222,165 218,185 222,205 C226,225 238,235 253,235 C268,235 278,225 280,205 C282,185 276,165 270,155 C262,148 235,148 228,155Z"
        fill="#c8916e"
        fillOpacity="0.4"
      />
      {/* Arm reaching toward center */}
      <path
        d="M225,188 C216,182 208,180 200,182"
        fill="none"
        stroke="#c8916e"
        strokeWidth="3.5"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Small connecting element between hands */}
      <circle cx="180" cy="180" r="6" fill="#d4a080" fillOpacity="0.35" />

      {/* Leaves */}
      <path d="M58,100 C68,85 82,90 78,105 C74,118 60,112 58,100Z" fill="#9d8ec0" fillOpacity="0.28" />
      <path d="M300,95 C310,82 322,88 318,100 C314,112 302,108 300,95Z" fill="#c8916e" fillOpacity="0.3" />

      {/* Dots */}
      <circle cx="42" cy="165" r="3" fill="#c8916e" fillOpacity="0.25" />
      <circle cx="325" cy="170" r="3.5" fill="#9d8ec0" fillOpacity="0.25" />
      <circle cx="180" cy="85" r="2.5" fill="#c8916e" fillOpacity="0.2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  HopeIllustration – sunrise over gentle hills with birds           */
/* ------------------------------------------------------------------ */
export function HopeIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ho-sky" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#e8cfc0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ede7f6" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="ho-sun" cx="0.5" cy="1" r="0.5">
          <stop offset="0%" stopColor="#d4a080" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#e8cfc0" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e8cfc0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect width="420" height="260" fill="url(#ho-sky)" rx="24" />

      {/* Sun glow */}
      <circle cx="210" cy="175" r="95" fill="url(#ho-sun)" />

      {/* Sun disc */}
      <circle cx="210" cy="178" r="28" fill="#d4a080" fillOpacity="0.5" />

      {/* Radiating lines */}
      {[0, 25, 50, 75, 105, 130, 155, 180].map((angle) => (
        <line
          key={angle}
          x1="210"
          y1="178"
          x2={210 + Math.cos((angle * Math.PI) / 180) * 62}
          y2={178 - Math.sin((angle * Math.PI) / 180) * 62}
          stroke="#d4a080"
          strokeWidth="1.5"
          strokeOpacity="0.2"
          strokeLinecap="round"
        />
      ))}

      {/* Rolling hills – back layer */}
      <path
        d="M0,210 C60,170 120,185 180,175 C240,165 310,180 360,170 C390,165 410,172 420,178 L420,260 L0,260Z"
        fill="#d4c8e8"
        fillOpacity="0.35"
      />

      {/* Rolling hills – front layer */}
      <path
        d="M0,230 C50,200 110,215 170,208 C230,201 290,218 350,210 C380,206 405,215 420,220 L420,260 L0,260Z"
        fill="#b8a5d4"
        fillOpacity="0.3"
      />

      {/* Birds */}
      <path d="M145,85 C150,78 155,82 160,85" fill="none" stroke="#8b7db0" strokeWidth="1.8" strokeOpacity="0.35" strokeLinecap="round" />
      <path d="M180,68 C184,62 188,65 192,68" fill="none" stroke="#8b7db0" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
      <path d="M240,78 C244,72 248,75 252,78" fill="none" stroke="#8b7db0" strokeWidth="1.5" strokeOpacity="0.28" strokeLinecap="round" />

      {/* Dots */}
      <circle cx="85" cy="105" r="3" fill="#c8916e" fillOpacity="0.28" />
      <circle cx="340" cy="95" r="2.5" fill="#9d8ec0" fillOpacity="0.25" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  LeafAccent – small decorative leaf for inline use                 */
/* ------------------------------------------------------------------ */
export function LeafAccent({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M32,8 C44,4 58,16 54,32 C50,48 36,56 28,52 C20,48 8,36 12,22 C16,8 24,6 32,8Z"
        fill="#9d8ec0"
        fillOpacity="0.3"
      />
      <path
        d="M32,12 C32,24 30,38 28,50"
        fill="none"
        stroke="#8b7db0"
        strokeWidth="1.5"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
      {/* Veins */}
      <path d="M32,20 C26,22 22,26 20,30" fill="none" stroke="#8b7db0" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
      <path d="M31,28 C38,30 42,34 44,38" fill="none" stroke="#8b7db0" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
      <path d="M30,36 C25,38 22,42 21,46" fill="none" stroke="#8b7db0" strokeWidth="1" strokeOpacity="0.18" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  WaveDivider – gentle organic wave for section separation          */
/* ------------------------------------------------------------------ */
export function WaveDivider({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 1200 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,45 C200,20 350,65 600,40 C850,15 1000,55 1200,35"
        fill="none"
        stroke="#d4c8e8"
        strokeWidth="2"
        strokeOpacity="0.4"
      />
      <path
        d="M0,55 C250,35 400,70 650,48 C900,26 1050,60 1200,45"
        fill="none"
        stroke="#e8cfc0"
        strokeWidth="1.5"
        strokeOpacity="0.3"
      />
    </svg>
  );
}
