"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export type MarketImpactLevel = "HIGH" | "MEDIUM" | "LOW";

export type CaseCardProps = {
  docket: string;
  name: string;
  probabilityAffirm: number; // 0..1
  marketImpactLevel: MarketImpactLevel;
  sector: string;
  swingJustice: string;
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
  className,
}: CaseCardProps) {
  const pct = Math.round(Math.max(0, Math.min(1, probabilityAffirm)) * 100);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.62)] p-4",
        "transition-transform duration-200 ease-out hover:-translate-y-[1px] hover:shadow-gold",
        className,
      )}
    >
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

          <h3 className="mt-3 font-heading text-[16px] tracking-[0.05em] text-ink">
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

        <div className="shrink-0 text-right">
          <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
            AFFIRM
          </div>
          <div className="mt-2 font-mono text-[22px] tracking-[0.06em] text-ink">
            {pct}
            <span className="text-ink-faint">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

