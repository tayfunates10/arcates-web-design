const nodes = [
  { label: "Analiz", x: 105, y: 80 },
  { label: "Tasarım", x: 425, y: 78 },
  { label: "Geliştirme", x: 500, y: 260 },
  { label: "Performans", x: 390, y: 390 },
  { label: "Destek", x: 135, y: 390 },
  { label: "Otomasyon", x: 40, y: 245 },
];

export function HeroSystem() {
  return (
    <div className="hero-system" aria-label="Arcates dijital çözüm sistemi">
      <svg viewBox="0 0 560 470" role="img" aria-labelledby="hero-system-title">
        <title id="hero-system-title">Analizden desteğe Arcates proje akışı</title>
        <defs>
          <linearGradient id="arcates-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1D8CFF" />
            <stop offset="1" stopColor="#20E7FF" />
          </linearGradient>
          <radialGradient id="arcates-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#1D8CFF" stopOpacity="0.28" />
            <stop offset="1" stopColor="#1D8CFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="280" cy="235" r="118" fill="url(#arcates-core)" />
        <circle cx="280" cy="235" r="82" className="hero-system__orbit" />
        <circle cx="280" cy="235" r="132" className="hero-system__orbit hero-system__orbit--outer" />

        {nodes.map((node) => (
          <g key={node.label}>
            <line x1="280" y1="235" x2={node.x + 42} y2={node.y + 28} className="hero-system__line" />
            <circle r="3" fill="#20E7FF" className="hero-system__signal">
              <animateMotion dur="5s" repeatCount="indefinite" path={`M280 235 L${node.x + 42} ${node.y + 28}`} />
            </circle>
          </g>
        ))}

        <g className="hero-system__core">
          <path d="M280 176L331 205V264L280 294L229 264V205L280 176Z" />
          <path d="M259 259L280 211L301 259M265 246H295" />
          <circle cx="280" cy="211" r="4" />
          <circle cx="259" cy="259" r="4" />
          <circle cx="301" cy="259" r="4" />
          <text x="280" y="321" textAnchor="middle">ARCATES CORE</text>
        </g>

        {nodes.map((node, index) => (
          <g key={node.label} transform={`translate(${node.x} ${node.y})`} className="hero-system__node">
            <rect width="84" height="56" rx="14" />
            <circle cx="18" cy="18" r="5" />
            <path d="M18 25V37M12 31H24" />
            <text x="42" y="34" textAnchor="middle">{node.label}</text>
            <text x="70" y="17" textAnchor="middle">0{index + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
