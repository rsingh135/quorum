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
  /** Compact watchlist row vs marketing card */
  layout?: "card" | "row";
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
  layout = "card",
  className,
}: CaseCardProps) {
  const pct = Math.round(Math.max(0, Math.min(1, probabilityAffirm)) * 100);

  if (layout === "row") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={cn(
          "group relative overflow-visible border-b border-terminal-line bg-black/20 px-3 py-3",
          "transition-colors hover:bg-terminal-up/[0.04]",
          className,
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="shrink-0 font-mono text-[12px] tracking-[0.16em] text-terminal-up">
              {docket}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-mono text-[12px] font-medium tracking-[0.06em] text-ink">
                {name}
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-xs border border-terminal-line bg-black/30 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em] text-ink-faint">
                  {sector.toUpperCase()}
                </span>
                <span
                  className={cn(
                    "rounded-xs border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.14em]",
                    impactStyles(marketImpactLevel),
                  )}
                >
                  {marketImpactLevel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-6 sm:justify-end">
            {tickersAtRisk?.length ? (
              <div className="hidden font-mono text-[10px] text-ink-faint md:block">
                {tickersAtRisk.slice(0, 4).join(" · ")}
                {tickersAtRisk.length > 4 ? "…" : ""}
              </div>
            ) : null}
            <div className="text-right">
              <div className="font-mono text-[9px] tracking-[0.16em] text-ink-faint">
                AFFIRM
              </div>
              <div
                className={cn(
                  "font-mono text-[18px] leading-none tracking-tight tabular-nums",
                  pct >= 50 ? "text-terminal-up" : "text-terminal-down",
                )}
              >
                {pct}
                <span className="text-sm text-ink-faint">%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className={cn(
        "group relative overflow-visible rounded-xs border border-terminal-line bg-terminal-panel/80 p-4",
        "transition-transform duration-200 ease-out hover:-translate-y-[1px] hover:border-terminal-up/25",
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

