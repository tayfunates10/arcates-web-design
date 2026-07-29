const nodes = [
  { label: "Analiz", x: 76, y: 84, anchorX: 150, anchorY: 106 },
  { label: "Otomasyon", x: 394, y: 72, anchorX: 394, anchorY: 94 },
  { label: "Veri", x: 468, y: 218, anchorX: 468, anchorY: 236 },
  { label: "Performans", x: 392, y: 366, anchorX: 392, anchorY: 366 },
  { label: "Entegrasyon", x: 220, y: 418, anchorX: 276, anchorY: 418 },
  { label: "SEO", x: 66, y: 356, anchorX: 146, anchorY: 356 },
  { label: "Tasarım", x: 28, y: 222, anchorX: 116, anchorY: 240 },
  { label: "Yazılım", x: 214, y: 44, anchorX: 278, anchorY: 92 },
] as const;

const meshPoints = [
  { x: 122, y: 148 }, { x: 170, y: 108 }, { x: 224, y: 136 }, { x: 278, y: 104 },
  { x: 334, y: 132 }, { x: 390, y: 112 }, { x: 432, y: 160 }, { x: 458, y: 214 },
  { x: 430, y: 272 }, { x: 452, y: 326 }, { x: 400, y: 364 }, { x: 348, y: 390 },
  { x: 286, y: 372 }, { x: 232, y: 404 }, { x: 180, y: 370 }, { x: 126, y: 346 },
  { x: 108, y: 292 }, { x: 88, y: 240 }, { x: 112, y: 190 }, { x: 178, y: 214 },
  { x: 212, y: 174 }, { x: 260, y: 194 }, { x: 316, y: 174 }, { x: 358, y: 214 },
  { x: 378, y: 258 }, { x: 348, y: 306 }, { x: 306, y: 334 }, { x: 256, y: 320 },
  { x: 210, y: 338 }, { x: 174, y: 298 }, { x: 156, y: 252 }, { x: 194, y: 248 },
] as const;

const meshLinks = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16],
  [16, 17], [17, 18], [18, 0], [19, 20], [20, 21], [21, 22], [22, 23], [23, 24],
  [24, 25], [25, 26], [26, 27], [27, 28], [28, 29], [29, 30], [30, 31], [31, 19],
  [0, 19], [2, 20], [4, 22], [6, 23], [8, 24], [10, 25], [12, 27], [14, 28], [16, 29], [18, 30],
  [20, 30], [22, 24], [25, 27], [19, 29], [1, 20], [5, 23], [9, 25], [13, 28], [17, 30],
] as const;

const radialDots = Array.from({ length: 32 }, (_, index) => {
  const angle = (index / 32) * Math.PI * 2;
  const radius = index % 2 === 0 ? 178 : 204;
  return {
    x: 280 + Math.cos(angle) * radius,
    y: 250 + Math.sin(angle) * radius,
    r: index % 4 === 0 ? 1.8 : 1.15,
  };
});

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
            <stop offset="0" stopColor="#27D4FF" stopOpacity="0.38" />
            <stop offset="0.48" stopColor="#1677FF" stopOpacity="0.16" />
            <stop offset="1" stopColor="#1677FF" stopOpacity="0" />
          </radialGradient>
          <filter id="arcates-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g className="hero-system__grid-lines" aria-hidden="true">
          {Array.from({ length: 11 }, (_, index) => <line key={`v-${index}`} x1={28 + index * 50} y1="24" x2={28 + index * 50} y2="476" />)}
          {Array.from({ length: 9 }, (_, index) => <line key={`h-${index}`} x1="20" y1={38 + index * 52} x2="540" y2={38 + index * 52} />)}
        </g>

        <g className="hero-system__mesh" aria-hidden="true">
          {meshLinks.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={meshPoints[from].x}
              y1={meshPoints[from].y}
              x2={meshPoints[to].x}
              y2={meshPoints[to].y}
            />
          ))}
          {meshPoints.map((point, index) => <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={index % 5 === 0 ? 2 : 1.25} />)}
        </g>

        <g aria-hidden="true">
          {radialDots.map((dot, index) => <circle key={index} cx={dot.x} cy={dot.y} r={dot.r} className="hero-system__radial-dot" />)}
        </g>

        <circle cx="280" cy="250" r="206" className="hero-system__halo" />
        <circle cx="280" cy="250" r="174" className="hero-system__orbit hero-system__orbit--outer" />
        <circle cx="280" cy="250" r="132" className="hero-system__orbit hero-system__orbit--middle" />
        <circle cx="280" cy="250" r="88" className="hero-system__orbit hero-system__orbit--inner" />
        <circle cx="280" cy="250" r="184" fill="url(#arcates-core)" />

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
          <path className="hero-system__core-glow" d="M280 176L344 213V287L280 324L216 287V213L280 176Z" />
          <path className="hero-system__core-shell" d="M280 187L335 219V281L280 313L225 281V219L280 187Z" />
          <path className="hero-system__core-inner" d="M280 205L318 227V273L280 295L242 273V227L280 205Z" />
          <text x="280" y="259" textAnchor="middle">AI</text>
          <circle cx="280" cy="187" r="3" />
          <circle cx="335" cy="219" r="3" />
          <circle cx="335" cy="281" r="3" />
          <circle cx="280" cy="313" r="3" />
          <circle cx="225" cy="281" r="3" />
          <circle cx="225" cy="219" r="3" />
        </g>

        {nodes.map((node, index) => (
          <g
            key={node.label}
            transform={`translate(${node.x} ${node.y})`}
            className="hero-system__node"
            style={{ animationDelay: `${700 + index * 80}ms` }}
          >
            <rect width="88" height="36" rx="8" />
            <circle cx="15" cy="18" r="3.5" />
            <path d="M15 13V23M10 18H20" />
            <text x="54" y="22" textAnchor="middle">{node.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
