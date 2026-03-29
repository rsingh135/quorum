"use client";

import { cn } from "@/lib/cn";

export type MarketTickerRowProps = {
  ticker: string;
  direction: "UP" | "DOWN" | "FLAT";
  comparableMove: string; // e.g. "+6.2% / 30D"
  className?: string;
};

function arrow(direction: MarketTickerRowProps["direction"]) {
  if (direction === "UP") return "↑";
  if (direction === "DOWN") return "↓";
  return "→";
}

function dirClass(direction: MarketTickerRowProps["direction"]) {
  if (direction === "UP") return "text-affirm";
  if (direction === "DOWN") return "text-reverse";
  return "text-ink-faint";
}

export function MarketTickerRow({
  ticker,
  direction,
  comparableMove,
  className,
}: MarketTickerRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[120px_1fr_120px] items-center gap-3",
        "rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.55)] px-3 py-2",
        className,
      )}
    >
      <div className="font-mono text-[13px] tracking-[0.18em] text-ink">
        {ticker.toUpperCase()}
      </div>

      <div className={cn("font-mono text-[12px] tracking-[0.14em]", dirClass(direction))}>
        {arrow(direction)} {direction}
      </div>

      <div className="text-right font-mono text-[12px] tracking-[0.14em] text-ink-muted">
        {comparableMove}
      </div>
    </div>
  );
}

