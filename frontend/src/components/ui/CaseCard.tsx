"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type MarketImpactLevel = "HIGH" | "MEDIUM" | "LOW";

export type CaseCardProps = {
  docket: string;
  name: string;
  probabilityAffirm: number; // 0..1
  marketImpactLevel: MarketImpactLevel;
  sector: string;
  swingJustice: string;
  /** Tickers shown in hover tooltip */
  tickersAtRisk?: string[];
  className?: string;
};

function impactStyles(level: MarketImpactLevel) {
  if (level === "HIGH") return "text-reverse border-reverse/30 bg-reverse/10";
  if (level === "MEDIUM") return "text-gold border-gold/30 bg-gold/10";
  return "text-affirm border-affirm/30 bg-affirm/10";
}

export function CaseCard({
  docket,
  name,
  probabilityAffirm,
  marketImpactLevel,
  sector,
  swingJustice,
  tickersAtRisk,
  className,
}: CaseCardProps) {
  const pct = Math.round(Math.max(0, Math.min(1, probabilityAffirm)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className={cn(
        "group relative overflow-visible rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.62)] p-4",
        "transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:shadow-ink",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute -right-28 -bottom-24 h-64 w-64 rounded-full bg-bg-panel/20 blur-2xl" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent opacity-60" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {docket}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-xs border px-2 py-1 font-mono text-[10px] tracking-[0.14em]",
                impactStyles(marketImpactLevel),
              )}
            >
              {marketImpactLevel}
            </span>
          </div>

          <h3 className="mt-3 font-heading text-[16px] tracking-[0.06em] text-ink">
            {name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-xs border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-muted">
              SECTOR · {sector.toUpperCase()}
            </span>
            <span className="rounded-xs border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-ink-muted">
              SWING · {swingJustice.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="relative shrink-0 text-right">
          <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
            AFFIRM
          </div>
          <div className="mt-2 font-mono text-[22px] tracking-[0.06em] text-ink">
            {pct}
            <span className="text-ink-faint">%</span>
          </div>
          {tickersAtRisk?.length ? (
            <div className="pointer-events-none absolute right-0 top-0 z-10 w-[140px] translate-x-full pl-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100">
              <div className="rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.95)] p-2 shadow-ink">
                <div className="font-mono text-[9px] tracking-[0.16em] text-gold/90">
                  AT RISK
                </div>
                <ul className="mt-1 space-y-1 text-left">
                  {tickersAtRisk.slice(0, 8).map((t) => (
                    <li
                      key={t}
                      className="font-mono text-[11px] tracking-[0.14em] text-ink-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

