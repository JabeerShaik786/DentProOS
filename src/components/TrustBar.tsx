"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Users, Smile, ShieldAlert } from "lucide-react";

interface StatItem {
  id: number;
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  {
    id: 1,
    icon: Award,
    value: 25,
    suffix: "+",
    label: "Years Experience",
  },
  {
    id: 2,
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Patients Treated",
  },
  {
    id: 3,
    icon: Smile,
    value: 99,
    suffix: "%",
    label: "Smile Satisfaction",
  },
  {
    id: 4,
    icon: ShieldAlert,
    value: 24,
    suffix: "×7",
    label: "Emergency Support",
  },
];

function CountUp({ to, duration = 2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * to));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function TrustBar() {
  return (
    <section className="w-full relative z-20 px-3.5 sm:px-6 md:px-12 -mt-10 max-w-[1440px] mx-auto overflow-hidden">
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 p-3.5 sm:p-6 md:p-8 rounded-3xl bg-white shadow-xl shadow-primary/5 border border-borders/60">
        {STATS.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className={`flex flex-col sm:flex-row items-center text-center sm:text-left gap-2 sm:gap-4 p-3 sm:p-5 md:p-6 rounded-2xl transition-all duration-300 hover:bg-slate-50/50 min-w-0 ${
                idx !== STATS.length - 1 ? "lg:border-r border-borders/60" : ""
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col items-center sm:items-start min-w-0 w-full">
                <div className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl text-dark-text tracking-tight flex items-baseline whitespace-nowrap">
                  {stat.id === 4 ? (
                    <span>
                      24<span className="text-secondary text-base sm:text-lg font-semibold mx-0.5">×</span>7
                    </span>
                  ) : (
                    <>
                      <CountUp to={stat.value} />
                      <span className="text-secondary ml-0.5">{stat.suffix}</span>
                    </>
                  )}
                </div>
                <span className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-text mt-0.5 leading-tight text-center sm:text-left">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
