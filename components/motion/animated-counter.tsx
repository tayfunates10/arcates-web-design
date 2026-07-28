"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
};

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1250,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || started) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplayValue(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStarted(true);
        observer.disconnect();

        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(value * eased);
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },
      { threshold: 0.45 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [duration, started, value]);

  return (
    <span ref={ref} className="animated-counter" aria-label={`${prefix}${value.toFixed(decimals)}${suffix}`}>
      <span aria-hidden="true">
        {prefix}
        {displayValue.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}
