// Maskot SiSAKTI — karakter buku pintar interaktif
export function Mascot({ size = 120, className }: { size?: number; className?: string }) {
  const S = size;
  return (
    <svg
      width={S}
      height={S}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Maskot SiSAKTI"
    >
      {/* mortarboard top diamond */}
      <rect x="31" y="8" width="38" height="38" rx="4" fill="#082f63" transform="rotate(45 50 27)" />
      {/* cap base */}
      <rect x="34" y="20" width="32" height="10" rx="3" fill="#082f63" />
      {/* tassel */}
      <circle cx="50" cy="22" r="3" fill="#ff9800" />
      <line x1="72" y1="22" x2="72" y2="36" stroke="#ff9800" strokeWidth="2" />
      <circle cx="72" cy="38" r="3.4" fill="#ff9800" />
      {/* book body */}
      <rect x="14" y="32" width="72" height="60" rx="12" fill="#1e88e5" />
      {/* page */}
      <rect x="22" y="40" width="56" height="44" rx="7" fill="#ffffff" />
      {/* spine */}
      <rect x="17" y="40" width="2.4" height="44" rx="1.2" fill="#90c6f5" />
      {/* eyes */}
      <ellipse cx="37" cy="57" rx="5" ry="6" fill="#0f172a" />
      <ellipse cx="63" cy="57" rx="5" ry="6" fill="#0f172a" />
      <circle cx="38.5" cy="55" r="1.7" fill="#fff" />
      <circle cx="64.5" cy="55" r="1.7" fill="#fff" />
      {/* cheeks */}
      <ellipse cx="29" cy="68" rx="4.5" ry="3" fill="#ffe0b2" />
      <ellipse cx="71" cy="68" rx="4.5" ry="3" fill="#ffe0b2" />
      {/* smile */}
      <path d="M42 66 Q50 74 58 66" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
