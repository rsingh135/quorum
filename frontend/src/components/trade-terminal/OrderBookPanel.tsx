"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const MID = 6325.4;
const SPREAD_PCT = 0.00012;

type Row = { price: number; size: string; total: string; depth: number };

function genAsks(): Row[] {
  return Array.from({ length: 9 }, (_, i) => {
    const price = MID + (9 - i) * 0.4 + i * 0.05;
    const depth = 20 + i * 12 + (i % 3) * 8;
    return {
      price,
      size: (4200 + i * 811).toLocaleString(),
      total: (2.1 + i * 0.31).toFixed(2),
      depth,
    };
  });
}

function genBids(): Row[] {
  return Array.from({ length: 9 }, (_, i) => {
    const price = MID - (i + 1) * 0.35 - i * 0.04;
    const depth = 25 + i * 10 + (i % 4) * 7;
    return {
      price,
      size: (5100 + i * 720).toLocaleString(),
      total: (2.4 + i * 0.28).toFixed(2),
      depth,
    };
  });
}

export function OrderBookPanel() {
  const [tab, setTab] = React.useState<"book" | "trades">("book");
  const asks = React.useMemo(() => genAsks(), []);
  const bids = React.useMemo(() => genBids(), []);
  const maxDepth = Math.max(
    ...asks.map((a) => a.depth),
    ...bids.map((b) => b.depth),
  );

  return (
    <div className="flex h-full min-h-[280px] flex-col bg-txyz-bg font-mono text-[11px]">
      <div className="flex border-b border-txyz-border">
        <button
          type="button"
          onClick={() => setTab("book")}
          className={cn(
            "flex-1 py-2 text-center text-[12px] font-medium",
            tab === "book"
              ? "border-b-2 border-txyz-up text-white"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Order Book
        </button>
        <button
          type="button"
          onClick={() => setTab("trades")}
          className={cn(
            "flex-1 py-2 text-center text-[12px] font-medium",
            tab === "trades"
              ? "border-b-2 border-txyz-up text-white"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          Trades
        </button>
      </div>

      {tab === "trades" ? (
        <div className="flex-1 overflow-y-auto p-2 text-zinc-500">
          <p className="py-8 text-center text-[11px]">Simulated tape — connect data feed</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-1 border-b border-txyz-border px-2 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
            <span>Price</span>
            <span className="text-right">Size (USDC)</span>
            <span className="text-right">Total</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {asks.map((r) => (
              <div
                key={`a-${r.price}`}
                className="relative grid grid-cols-[1fr_1fr_1fr] gap-1 px-2 py-0.5 text-txyz-down"
              >
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 bg-txyz-down/15"
                  style={{ width: `${(r.depth / maxDepth) * 100}%` }}
                />
                <span className="relative z-[1] tabular-nums">
                  {r.price.toFixed(1)}
                </span>
                <span className="relative z-[1] text-right tabular-nums text-zinc-400">
                  {r.size}
                </span>
                <span className="relative z-[1] text-right tabular-nums text-zinc-500">
                  {r.total}
                </span>
              </div>
            ))}
            <div className="border-y border-txyz-border bg-txyz-panel py-2 text-center">
              <div className="text-[13px] font-semibold tabular-nums text-white">
                {MID.toFixed(1)}
              </div>
              <div className="text-[10px] text-zinc-500">
                Spread {(SPREAD_PCT * 100).toFixed(4)}%
              </div>
            </div>
            {bids.map((r) => (
              <div
                key={`b-${r.price}`}
                className="relative grid grid-cols-[1fr_1fr_1fr] gap-1 px-2 py-0.5 text-txyz-up"
              >
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 bg-txyz-up/15"
                  style={{ width: `${(r.depth / maxDepth) * 100}%` }}
                />
                <span className="relative z-[1] tabular-nums">{r.price.toFixed(1)}</span>
                <span className="relative z-[1] text-right tabular-nums text-zinc-400">
                  {r.size}
                </span>
                <span className="relative z-[1] text-right tabular-nums text-zinc-500">
                  {r.total}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
