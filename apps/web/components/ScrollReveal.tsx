"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

export function ScrollReveal({
  children,
  className = "",
  transitionDelayMs,
}: {
  children: ReactNode;
  className?: string;
  /** Applied to the reveal wrapper so staggered `transition-delay` affects the same element as `transition-all`. */
  transitionDelayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
      style={
        transitionDelayMs != null
          ? { transitionDelay: `${transitionDelayMs}ms` }
          : undefined
      }
    >
      {children}
    </div>
  );
}
