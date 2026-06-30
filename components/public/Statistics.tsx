"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 95, suffix: "%+", label: "Success rate" },
  { value: 15, suffix: "+", label: "Expert faculty" },
  { value: 10, suffix: "+", label: "Years of excellence" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target]);

  return value;
}

export default function Statistics() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-secondary/40">
      <div className="container-edge">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-y-7 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="relative flex flex-col items-center px-4 text-center">
              {/* Vertical divider between stats on tablet+, omitted before the first item */}
              {i > 0 && <span className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-border sm:block" />}
              <StatCard stat={stat} active={active} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, active }: { stat: (typeof STATS)[number]; active: boolean }) {
  const value = useCountUp(stat.value, active);
  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight text-navy-700 sm:text-4xl">
        {value}
        {stat.suffix}
      </p>
      <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}
