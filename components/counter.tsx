"use client";

import { useEffect, useRef, useState } from "react";

interface CounterProps {
  target: number;
  suffix?: string;
}

export default function Counter({ target, suffix = "" }: CounterProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            let current = 0;
            const step = Math.ceil(target / 50);
            const interval = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              setValue(current);
            }, 25);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="stat-value">
      {value.toLocaleString()}
      {suffix}
    </div>
  );
}
