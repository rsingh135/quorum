"use client";

import { cn } from "@/lib/cn";

export type MarketTickerRowProps = {
  ticker: string;
  direction: "UP" | "DOWN" | "FLAT";
  comparableMove: string; // e.g. "+6.2% / 30D"
  /** Flat row for table body with divide-y parent */
  variant?: "card" | "terminal";
  className?: string;
};

function arrow(direction: MarketTickerRowProps["direction"]) {
  if (direction === "UP") return "↑";
  if (direction === "DOWN") return "↓";
  return "→";
}

function dirClass(
  direction: MarketTickerRowProps["direction"],
  terminal: boolean,
) {
  if (direction === "UP") return terminal ? "text-terminal-up" : "text-affirm";
  if (direction === "DOWN") return terminal ? "text-terminal-down" : "text-reverse";
  return "text-ink-faint";
}

export function MarketTickerRow({
  ticker,
  direction,
  comparableMove,
  variant = "card",
  className,
}: MarketTickerRowProps) {
  const terminal = variant === "terminal";

  return (
    <div
      className={cn(
        terminal
          ? "grid grid-cols-[88px_1fr_1fr] items-center gap-2 px-3 py-2.5 max-sm:grid-cols-2"
          : "grid grid-cols-[120px_1fr_120px] items-center gap-3 rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.55)] px-3 py-2",
        className,
      )}
    >
      <div
        className={cn(
          "font-mono tracking-[0.16em] text-ink",
          terminal ? "text-[12px] text-terminal-up" : "text-[13px] tracking-[0.18em]",
        )}
      >
        {ticker.toUpperCase()}
      </div>

      <div
        className={cn(
          "font-mono text-[12px] tracking-[0.12em]",
          dirClass(direction, terminal),
        )}
      >
        {arrow(direction)} {direction}
      </div>

      <div
        className={cn(
          "font-mono text-[11px] tracking-[0.1em] text-ink-muted max-sm:col-span-2 max-sm:text-left",
          terminal ? "text-right" : "text-right tracking-[0.14em]",
        )}
      >
        {comparableMove}
      </div>
    </div>
  );
}

