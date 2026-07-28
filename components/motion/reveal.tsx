"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type RevealVariant = "up" | "left" | "right" | "fade" | "scale";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  amount?: number;
};

function useInViewOnce(amount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: amount },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount]);

  return { ref, visible };
}

export function Reveal({ children, className = "", variant = "up", delay = 0, amount = 0.18 }: RevealProps) {
  const { ref, visible } = useInViewOnce(amount);
  const style: CSSProperties = { transitionDelay: `${delay}ms` };

  return (
    <div
      ref={ref}
      className={`reveal reveal--${variant}${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  amount?: number;
};

export function StaggerContainer({ children, className = "", amount = 0.12 }: StaggerContainerProps) {
  const { ref, visible } = useInViewOnce(amount);

  return (
    <div ref={ref} className={`stagger-container${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
