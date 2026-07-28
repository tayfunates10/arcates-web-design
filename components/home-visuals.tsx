type ProjectVisualProps = {
  variant: "cyan" | "blue" | "violet";
};

export function ProjectVisual({ variant }: ProjectVisualProps) {
  return (
    <div className={`project-visual project-visual--${variant}`} aria-hidden="true">
      <div className="project-visual__browser">
        <div className="project-visual__bar"><i /><i /><i /><span /></div>
        <div className="project-visual__body">
          <div className="project-visual__sidebar"><span /><span /><span /><span /></div>
          <div className="project-visual__canvas">
            <span className="project-visual__eyebrow" />
            <span className="project-visual__title" />
            <div className="project-visual__chart"><i /><i /><i /><i /><i /></div>
            <div className="project-visual__cards"><span /><span /><span /></div>
          </div>
        </div>
      </div>
      <span className="project-visual__glow" />
    </div>
  );
}

export function ProcessIcon({ name }: { name: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {name === "analysis" ? <><circle cx="14" cy="14" r="8" {...common} /><path d="m20 20 7 7M10 14h8M14 10v8" {...common} /></> : null}
      {name === "design" ? <><path d="M7 6h18v20H7zM7 12h18M13 12v14" {...common} /><path d="M17 17h4M17 21h3" {...common} /></> : null}
      {name === "code" ? <><path d="m11 9-7 7 7 7M21 9l7 7-7 7M18 6l-4 20" {...common} /></> : null}
      {name === "launch" ? <><path d="M16 27V15M10 21l6 6 6-6" {...common} /><path d="M7 13V6h18v7" {...common} /></> : null}
    </svg>
  );
}

export function ArticleVisual({ variant }: { variant: string }) {
  return (
    <div className={`article-visual article-visual--${variant}`} aria-hidden="true">
      {variant === "network" ? (
        <svg viewBox="0 0 420 220">
          <defs><radialGradient id="article-network-glow"><stop offset="0" stopColor="#27D4FF" stopOpacity=".5" /><stop offset="1" stopColor="#1677FF" stopOpacity="0" /></radialGradient></defs>
          <circle cx="210" cy="110" r="100" fill="url(#article-network-glow)" />
          {[0,1,2,3,4,5,6,7].map((item) => {
            const angle = (item / 8) * Math.PI * 2;
            const x = 210 + Math.cos(angle) * 78;
            const y = 110 + Math.sin(angle) * 68;
            return <g key={item}><line x1="210" y1="110" x2={x} y2={y} /><circle cx={x} cy={y} r="5" /></g>;
          })}
          <path d="M210 79l27 16v31l-27 16-27-16V95z" />
        </svg>
      ) : null}
      {variant === "speed" ? (
        <svg viewBox="0 0 420 220">
          <path className="article-visual__arc" d="M85 165a125 125 0 0 1 250 0" />
          <path d="M210 157l63-72" />
          <circle cx="210" cy="157" r="12" />
          <rect x="70" y="34" width="280" height="154" rx="14" />
          <path d="M92 60h84M92 82h54M276 60h48" opacity=".5" />
        </svg>
      ) : null}
      {variant === "interface" ? (
        <svg viewBox="0 0 420 220">
          <rect x="50" y="28" width="320" height="164" rx="16" />
          <path d="M50 64h320M142 64v128" />
          <rect x="166" y="88" width="82" height="18" rx="5" />
          <rect x="166" y="120" width="170" height="46" rx="8" />
          <circle cx="91" cy="102" r="18" />
          <path d="M75 142h34M75 158h50" />
        </svg>
      ) : null}
    </div>
  );
}

export function MessageBubbleVisual() {
  return (
    <div className="message-visual" aria-hidden="true">
      <span className="message-visual__ring message-visual__ring--one" />
      <span className="message-visual__ring message-visual__ring--two" />
      <svg viewBox="0 0 240 190">
        <defs>
          <linearGradient id="message-fill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1677FF" /><stop offset="1" stopColor="#27D4FF" /></linearGradient>
        </defs>
        <path d="M50 35h140c15 0 27 12 27 27v67c0 15-12 27-27 27h-71l-39 25 8-25H50c-15 0-27-12-27-27V62c0-15 12-27 27-27Z" fill="url(#message-fill)" />
        <path d="M66 83h108M66 109h74" />
        <circle cx="186" cy="109" r="6" />
      </svg>
    </div>
  );
}

export function CtaSystemVisual() {
  return (
    <div className="cta-system" aria-hidden="true">
      <svg viewBox="0 0 340 250">
        <defs>
          <linearGradient id="cta-platform" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1677FF" stopOpacity=".7" /><stop offset="1" stopColor="#27D4FF" stopOpacity=".12" /></linearGradient>
        </defs>
        <path className="cta-system__platform" d="m58 165 112-62 112 62-112 62z" fill="url(#cta-platform)" />
        <path className="cta-system__cube" d="m126 80 44-25 44 25v51l-44 25-44-25z" />
        <path className="cta-system__cube-lines" d="m126 80 44 25 44-25M170 105v51M151 91l-13 14 13 14M189 91l13 14-13 14" />
        <g className="cta-system__satellite cta-system__satellite--one"><rect x="42" y="79" width="42" height="42" rx="11" /><path d="M54 100h18M63 91v18" /></g>
        <g className="cta-system__satellite cta-system__satellite--two"><rect x="250" y="66" width="42" height="42" rx="11" /><circle cx="271" cy="87" r="8" /><path d="M271 75v4M271 95v4M259 87h4M279 87h4" /></g>
        <g className="cta-system__satellite cta-system__satellite--three"><rect x="257" y="166" width="42" height="42" rx="11" /><path d="m269 187 7 7 12-14" /></g>
        <path className="cta-system__connector" d="M84 100h41M214 87h36M215 171h42" />
      </svg>
    </div>
  );
}
