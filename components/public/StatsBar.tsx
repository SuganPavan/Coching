"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap, Trophy, Users, Clock } from "lucide-react";

const STATS = [
  { icon: GraduationCap, value: 1200, suffix: "+", label: "Students Enrolled" },
  { icon: Trophy, value: 95, suffix: "%+", label: "Success Rate" },
  { icon: Users, value: 15, suffix: "+", label: "Expert Faculty" },
  { icon: Clock, value: 10, suffix: "+", label: "Years of Excellence" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame: number;
    const duration = 1400;
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

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-navy-700 py-6">
      <div className="container-edge grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <StatItem key={i} stat={stat} active={active} />
        ))}
      </div>
    </section>
  );
}

function StatItem({ stat, active }: { stat: typeof STATS[number]; active: boolean }) {
  const value = useCountUp(stat.value, active);
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
        <stat.icon className="h-5 w-5 text-saffron-400" />
      </span>
      <div>
        <p className="text-xl font-bold text-white">
          {value}{stat.suffix}
        </p>
        <p className="text-xs text-white/65">{stat.label}</p>
      </div>
    </div>
  );
}
