"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function ExecutionPanel() {
  const [side, setSide] = React.useState<"long" | "short">("long");
  const [orderType, setOrderType] = React.useState<"Market" | "Limit" | "Pro">(
    "Market",
  );
  const [pct, setPct] = React.useState(0);

  return (
    <div className="flex h-full min-h-[320px] flex-col border-l border-txyz-border bg-txyz-panel font-trade text-[12px]">
      <div className="grid grid-cols-2 gap-1 p-2">
        <button
          type="button"
          onClick={() => setSide("long")}
          className={cn(
            "rounded-md py-2.5 text-[13px] font-semibold transition-colors",
            side === "long"
              ? "bg-txyz-up text-black"
              : "bg-txyz-panel2 text-zinc-500 hover:text-zinc-300",
          )}
        >
          Long
        </button>
        <button
          type="button"
          onClick={() => setSide("short")}
          className={cn(
            "rounded-md py-2.5 text-[13px] font-semibold transition-colors",
            side === "short"
              ? "bg-txyz-down text-white"
              : "bg-txyz-panel2 text-zinc-500 hover:text-zinc-300",
          )}
        >
          Short
        </button>
      </div>

      <div className="flex gap-0.5 border-b border-txyz-border px-2 pb-2">
        {(["Market", "Limit", "Pro"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setOrderType(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-[11px] font-medium",
              orderType === t
                ? "bg-txyz-bg text-white"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center justify-between rounded-md border border-txyz-border bg-txyz-bg px-2 py-1.5">
            <span className="text-zinc-500">Leverage</span>
            <span className="font-mono text-white">50x ▾</span>
          </div>
          <div className="flex flex-1 items-center justify-between rounded-md border border-txyz-border bg-txyz-bg px-2 py-1.5">
            <span className="text-zinc-500">Margin</span>
            <span className="text-white">Isolated ▾</span>
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-zinc-500">
            <span>Amount</span>
            <span className="font-mono text-[10px] text-zinc-600">USDC · SP500</span>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              placeholder="0.00"
              className="min-w-0 flex-1 rounded-md border border-txyz-border bg-txyz-bg px-3 py-2 font-mono text-white outline-none focus:border-zinc-600"
            />
            <button
              type="button"
              className="rounded-md bg-txyz-panel2 px-3 text-[11px] text-txyz-up"
            >
              MAX
            </button>
          </div>
        </div>

        <div>
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-txyz-up"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-zinc-600">
            <span>0%</span>
            <span className="text-zinc-400">{pct}%</span>
            <span>100%</span>
          </div>
        </div>

        <label className="flex items-center gap-2 text-zinc-400">
          <input type="checkbox" className="rounded border-txyz-border bg-txyz-bg" />
          Reduce Only
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          <input type="checkbox" className="rounded border-txyz-border bg-txyz-bg" />
          Take Profit / Stop Loss
        </label>

        <button
          type="button"
          className="mt-auto w-full rounded-md bg-txyz-up py-3 text-[14px] font-semibold text-black"
        >
          Connect Wallet
        </button>

        <div className="space-y-2 border-t border-txyz-border pt-3 font-mono text-[10px] text-zinc-500">
          <div className="flex justify-between">
            <span>Liquidation</span>
            <span className="text-zinc-400">—</span>
          </div>
          <div className="flex justify-between">
            <span>Order Value</span>
            <span className="text-zinc-400">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Margin Required</span>
            <span className="text-zinc-400">$0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage</span>
            <span className="text-zinc-400">Est. 0.03%</span>
          </div>
          <div className="flex justify-between">
            <span>Fees</span>
            <span className="text-zinc-400">0.035% / 0.010%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
