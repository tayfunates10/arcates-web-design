const nodes = [
  { label: "Analiz", x: 72, y: 72, anchorX: 142, anchorY: 103 },
  { label: "Otomasyon", x: 394, y: 64, anchorX: 394, anchorY: 97 },
  { label: "Veri", x: 474, y: 205, anchorX: 474, anchorY: 235 },
  { label: "Performans", x: 400, y: 356, anchorX: 400, anchorY: 356 },
  { label: "Entegrasyon", x: 214, y: 412, anchorX: 278, anchorY: 412 },
  { label: "SEO", x: 66, y: 350, anchorX: 142, anchorY: 350 },
  { label: "Tasarım", x: 24, y: 210, anchorX: 114, anchorY: 238 },
  { label: "Yazılım", x: 208, y: 38, anchorX: 278, anchorY: 88 },
] as const;

export function HeroSystem() {
  return (
    <div className="hero-system hero-system--premium" aria-label="Arcates yapay zekâ ve dijital çözüm ağı">
      <span className="hero-system__ambient hero-system__ambient--one" />
      <span className="hero-system__ambient hero-system__ambient--two" />
      <svg viewBox="0 0 560 500" role="img" aria-labelledby="hero-system-title">
        <title id="hero-system-title">Yapay zekâ merkezli analiz, tasarım, yazılım ve otomasyon sistemi</title>
        <defs>
          <linearGradient id="arcates-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1677FF" />
            <stop offset="1" stopColor="#27D4FF" />
          </linearGradient>
          <radialGradient id="arcates-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#27D4FF" stopOpacity="0.34" />
            <stop offset="0.52" stopColor="#1677FF" stopOpacity="0.12" />
            <stop offset="1" stopColor="#1677FF" stopOpacity="0" />
          </radialGradient>
          <filter id="arcates-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="hero-system__grid-lines" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <line key={`v-${index}`} x1={56 + index * 56} y1="30" x2={56 + index * 56} y2="470" />)}
          {Array.from({ length: 8 }, (_, index) => <line key={`h-${index}`} x1="30" y1={52 + index * 56} x2="530" y2={52 + index * 56} />)}
        </g>

        <circle cx="280" cy="250" r="190" className="hero-system__halo" />
        <circle cx="280" cy="250" r="154" className="hero-system__orbit hero-system__orbit--outer" />
        <circle cx="280" cy="250" r="112" className="hero-system__orbit hero-system__orbit--middle" />
        <circle cx="280" cy="250" r="78" className="hero-system__orbit hero-system__orbit--inner" />
        <circle cx="280" cy="250" r="166" fill="url(#arcates-core)" />

        <g className="hero-system__connections">
          {nodes.map((node, index) => (
            <g key={node.label}>
              <path
                pathLength="1"
                d={`M280 250 C${280 + (node.anchorX - 280) * 0.35} ${250 + (node.anchorY - 250) * 0.15}, ${280 + (node.anchorX - 280) * 0.72} ${250 + (node.anchorY - 250) * 0.74}, ${node.anchorX} ${node.anchorY}`}
                className="hero-system__line"
                style={{ animationDelay: `${index * 90}ms` }}
              />
              <circle r="2.5" className="hero-system__signal" filter="url(#arcates-glow)">
                <animateMotion
                  dur={`${4.2 + index * 0.18}s`}
                  begin={`${index * 0.32}s`}
                  repeatCount="indefinite"
                  path={`M280 250 C${280 + (node.anchorX - 280) * 0.35} ${250 + (node.anchorY - 250) * 0.15}, ${280 + (node.anchorX - 280) * 0.72} ${250 + (node.anchorY - 250) * 0.74}, ${node.anchorX} ${node.anchorY}`}
                />
              </circle>
            </g>
          ))}
        </g>

        <g className="hero-system__core">
          <path className="hero-system__core-glow" d="M280 182L339 216V284L280 318L221 284V216L280 182Z" />
          <path className="hero-system__core-shell" d="M280 192L330 221V279L280 308L230 279V221L280 192Z" />
          <path className="hero-system__core-inner" d="M280 209L315 229V270L280 290L245 270V229L280 209Z" />
          <text x="280" y="258" textAnchor="middle">AI</text>
          <circle cx="280" cy="192" r="3" />
          <circle cx="330" cy="221" r="3" />
          <circle cx="330" cy="279" r="3" />
          <circle cx="280" cy="308" r="3" />
          <circle cx="230" cy="279" r="3" />
          <circle cx="230" cy="221" r="3" />
        </g>

        {nodes.map((node, index) => (
          <g
            key={node.label}
            transform={`translate(${node.x} ${node.y})`}
            className="hero-system__node"
            style={{ animationDelay: `${700 + index * 80}ms` }}
          >
            <rect width="94" height="42" rx="10" />
            <circle cx="17" cy="21" r="4" />
            <path d="M17 15V27M11 21H23" />
            <text x="57" y="25" textAnchor="middle">{node.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
