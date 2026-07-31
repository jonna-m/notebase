export function AudioIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="gradAudio" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D2C8FF" />
          <stop offset="1" stopColor="#9C87FF" />
        </linearGradient>
        <linearGradient id="sheenAudio" x1="12" y1="8" x2="40" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#gradAudio)" />
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#sheenAudio)" />
      <g stroke="#fff" strokeWidth="4" strokeLinecap="round">
        <line x1="20" y1="26" x2="20" y2="38" />
        <line x1="29" y1="20" x2="29" y2="44" />
        <line x1="38" y1="16" x2="38" y2="48" />
        <line x1="47" y1="24" x2="47" y2="40" />
      </g>
    </svg>
  );
}

export function DocIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="gradDoc" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C3DCFF" />
          <stop offset="1" stopColor="#7FA6FF" />
        </linearGradient>
        <linearGradient id="sheenDoc" x1="12" y1="8" x2="40" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="17" fill="url(#gradDoc)" />
      <rect x="4" y="4" width="56" height="56" rx="17" fill="url(#sheenDoc)" />
      <path d="M22 15h13l7 7v27a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V17a2 2 0 0 1 2-2z" fill="#fff" fillOpacity="0.95" />
      <path d="M35 15v7h7z" fill="#C3DCFF" />
      <line x1="24" y1="33" x2="38" y2="33" stroke="#7FA6FF" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="24" y1="39" x2="38" y2="39" stroke="#7FA6FF" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="24" y1="45" x2="33" y2="45" stroke="#7FA6FF" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function ImageIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="gradImg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#D4FFC7" />
          <stop offset="1" stopColor="#84E895" />
        </linearGradient>
        <linearGradient id="sheenImg" x1="12" y1="8" x2="40" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.65" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#gradImg)" />
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#sheenImg)" />
      <rect x="15" y="18" width="34" height="26" rx="4" fill="#fff" fillOpacity="0.95" />
      <circle cx="23" cy="26" r="3" fill="#84E895" />
      <path d="M15 40l9-9 6 6 8-9 11 12v3a1 1 0 0 1-1 1H16a1 1 0 0 1-1-1z" fill="#84E895" />
    </svg>
  );
}

export function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L15 9" />
      <path d="M15 9l1.5-1.5" />
      <path d="M19 4l.9 2.1L22 7l-2.1.9L19 10l-.9-2.1L16 7l2.1-.9z" />
      <path d="M6 3.5l.5 1.3L8 5.3l-1.5.5-.5 1.3-.5-1.3L4 5.3l1.5-.5z" />
      <path d="M19.5 14.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
