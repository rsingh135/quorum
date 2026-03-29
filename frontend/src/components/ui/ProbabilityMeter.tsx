"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type ProbabilityMeterProps = {
  probabilityAffirm: number; // 0..1
  className?: string;
  labelLeft?: string;
  labelRight?: string;
};

export function ProbabilityMeter({
  probabilityAffirm,
  className,
  labelLeft = "REVERSE",
  labelRight = "AFFIRM",
}: ProbabilityMeterProps) {
  const p = Math.max(0, Math.min(1, probabilityAffirm));
  const pct = Math.round(p * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
          PROBABILITY
        </div>
        <div className="font-mono text-[22px] tracking-[0.06em] text-ink">
          {pct}
          <span className="text-ink-faint">%</span>
        </div>
      </div>

      <div className="mt-3 rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.6)] p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.18em] text-reverse/80">
            {labelLeft}
          </span>
          <span className="font-mono text-[11px] tracking-[0.18em] text-affirm/80">
            {labelRight}
          </span>
        </div>

        <div className="relative mt-3 h-[10px] overflow-hidden rounded-[2px] border border-white/10 bg-white/5">
          <div className="absolute inset-0 grid grid-cols-2">
            <div className="bg-gradient-to-r from-reverse/28 to-reverse/0" />
            <div className="bg-gradient-to-l from-affirm/28 to-affirm/0" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>

          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ marginLeft: "-6px" }}
          >
            <div className="h-[14px] w-[14px] rounded-full border border-gold/50 bg-[rgba(10,10,15,0.9)] shadow-gold" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

