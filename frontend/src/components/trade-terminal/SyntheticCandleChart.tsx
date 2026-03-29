"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Candle = { up: boolean; body: number; wickTop: number; wickBot: number };

function genCandles(seed: string, n: number): Candle[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const up = (h & 1) === 0;
    const body = 12 + (h % 28);
    const wickTop = 4 + ((h >>> 4) % 16);
    const wickBot = 4 + ((h >>> 8) % 16);
    out.push({ up, body, wickTop, wickBot });
  }
  return out;
}

export function SyntheticCandleChart() {
  const pathname = usePathname();
  const seed = pathname.match(/^\/case\/([^/]+)/)?.[1] ?? "SP500";
  const candles = React.useMemo(() => genCandles(seed, 56), [seed]);

  return (
    <div className="relative border-b border-txyz-border bg-[#09090b]">
      <div className="flex items-center justify-between border-b border-txyz-border/50 px-3 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-wider text-zinc-500">
            TradingView · Simulated
          </span>
          <div className="flex rounded-md border border-txyz-border bg-txyz-panel p-0.5 font-mono text-[11px]">
            {["1m", "5m", "1h", "1D"].map((t) => (
              <button
                key={t}
                type="button"
                className={cn(
                  "rounded px-2 py-0.5",
                  t === "1h" ? "bg-txyz-panel2 text-white" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-md border border-txyz-border bg-txyz-panel px-2 py-1 text-[11px] text-zinc-400 hover:text-white"
          >
            Indicators
          </button>
        </div>
        <div className="hidden font-mono text-[10px] text-zinc-500 sm:block">
          O{" "}
          <span className="text-zinc-300">
            {(6320 + (seed.length * 3) % 20).toFixed(1)}
          </span>{" "}
          H{" "}
          <span className="text-txyz-up">
            {(6335 + (seed.length * 5) % 15).toFixed(1)}
          </span>{" "}
          L{" "}
          <span className="text-txyz-down">
            {(6310 + (seed.length * 2) % 12).toFixed(1)}
          </span>{" "}
          C{" "}
          <span className="text-white">
            {(6325 + (seed.length * 7) % 18).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="relative h-[220px] overflow-hidden md:h-[280px]">
        <div className="absolute left-0 top-0 flex h-full w-8 flex-col border-r border-txyz-border/50 bg-txyz-panel/30 py-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="my-auto h-6 w-6 rounded text-zinc-600 hover:bg-txyz-panel2 hover:text-zinc-400"
              title="Tool"
            />
          ))}
        </div>
        <div className="flex h-full items-end justify-center gap-[3px] overflow-x-auto px-3 pb-6 pl-10 pr-4 pt-8">
          {candles.map((c, i) => (
            <div
              key={i}
              className="flex h-[85%] w-2 shrink-0 flex-col items-center justify-end"
            >
              <div
                className="w-px shrink-0 bg-zinc-600"
                style={{ height: `${c.wickTop}px` }}
              />
              <div
                className={cn(
                  "w-full min-h-[6px] shrink-0 rounded-[1px]",
                  c.up ? "bg-txyz-up" : "bg-txyz-down",
                )}
                style={{ height: `${c.body}px` }}
              />
              <div
                className="w-px shrink-0 bg-zinc-600"
                style={{ height: `${c.wickBot}px` }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-10 right-0 h-10 border-t border-txyz-border/40 bg-gradient-to-t from-txyz-up/5 to-transparent">
          <div className="flex h-full items-end gap-px px-1 pt-1">
            {candles.slice(-40).map((c, i) => (
              <div
                key={i}
                className={cn(
                  "w-full max-w-[4px] flex-1 rounded-t-[1px]",
                  c.up ? "bg-txyz-up/35" : "bg-txyz-down/35",
                )}
                style={{ height: `${8 + (i % 5) * 4}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
