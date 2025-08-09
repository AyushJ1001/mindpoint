"use client";

import { useState, useEffect } from "react";

export default function AnimatedCounter({
  target,
  decimals = 0,
  suffix = "",
  delay = 500,
  duration = 2000,
}: {
  target: number;
  decimals?: number;
  suffix?: string;
  delay?: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = target;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue =
          startValue + (endValue - startValue) * easeOutQuart;

        setCount(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, delay, duration]);

  return (
    <div>
      {count.toFixed(decimals)}
      {suffix}
    </div>
  );
}
