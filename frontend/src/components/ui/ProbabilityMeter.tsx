"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type ProbabilityMeterProps = {
  probabilityAffirm: number; // 0..1
  className?: string;
  labelLeft?: string;
  labelRight?: string;
  variant?: "court" | "terminal";
};

export function ProbabilityMeter({
  probabilityAffirm,
  className,
  labelLeft = "REVERSE",
  labelRight = "AFFIRM",
  variant = "court",
}: ProbabilityMeterProps) {
  const p = Math.max(0, Math.min(1, probabilityAffirm));
  const pct = Math.round(p * 100);
  const terminal = variant === "terminal";

  return (
    <div className={cn("group w-full", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
          PROBABILITY
        </div>
        <div
          className={cn(
            "font-mono text-[22px] tracking-[0.06em] tabular-nums",
            terminal && pct >= 50 ? "text-terminal-up" : terminal ? "text-terminal-down" : "text-ink",
          )}
        >
          {pct}
          <span className="text-ink-faint">%</span>
        </div>
      </div>

      <div
        className={cn(
          "relative mt-3 rounded-xs border p-3",
          terminal
            ? "border-terminal-line bg-[length:12px_12px] [background-image:linear-gradient(to_right,rgba(61,255,156,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(61,255,156,0.06)_1px,transparent_1px)]"
            : "border-[var(--divider)] bg-[rgba(10,10,15,0.6)]",
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "font-mono text-[11px] tracking-[0.18em]",
              terminal ? "text-terminal-down/90" : "text-reverse/80",
            )}
          >
            {labelLeft}
          </span>
          <span
            className={cn(
              "font-mono text-[11px] tracking-[0.18em]",
              terminal ? "text-terminal-up/90" : "text-affirm/80",
            )}
          >
            {labelRight}
          </span>
        </div>

        <div
          className={cn(
            "relative mt-3 h-[10px] overflow-hidden rounded-[2px] border bg-white/5",
            terminal ? "border-terminal-line" : "border-white/10",
          )}
        >
          <div className="absolute inset-0 grid grid-cols-2">
            <div
              className={cn(
                "bg-gradient-to-r to-transparent",
                terminal ? "from-terminal-down/35" : "from-reverse/28",
              )}
            />
            <div
              className={cn(
                "bg-gradient-to-l to-transparent",
                terminal ? "from-terminal-up/35" : "from-affirm/28",
              )}
            />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                terminal
                  ? "bg-gradient-to-r from-transparent via-terminal-up/15 to-transparent"
                  : "bg-gradient-to-r from-transparent via-gold/10 to-transparent",
              )}
            />
          </motion.div>

          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 -translate-y-1/2"
            style={{ marginLeft: "-6px" }}
          >
            <div
              className={cn(
                "h-[14px] w-[14px] rounded-full border bg-[rgba(10,10,15,0.9)]",
                terminal
                  ? "border-terminal-up/60 shadow-[0_0_12px_rgba(61,255,156,0.35)]"
                  : "border-gold/50 shadow-gold",
              )}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

