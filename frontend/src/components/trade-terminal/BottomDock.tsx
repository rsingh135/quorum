"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const TABS = [
  "Balances",
  "Positions",
  "Open Orders",
  "TWAP",
  "Trade History",
  "Funding History",
  "Order History",
  "Account Activity",
] as const;

export function BottomDock() {
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("Balances");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-txyz-border bg-txyz-bg">
      <div className="scrollbar-thin flex shrink-0 gap-0 overflow-x-auto border-b border-txyz-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 px-3 py-2 text-left text-[11px] font-medium whitespace-nowrap transition-colors",
              tab === t
                ? "border-b-2 border-txyz-up text-white"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        {tab === "Balances" ? (
          <div className="w-full max-w-4xl">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b border-txyz-border pb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 max-md:hidden">
              <span>Asset</span>
              <span className="text-right">Total</span>
              <span className="text-right">Available</span>
              <span className="text-right">Value (USD)</span>
              <span className="text-right">PNL (ROE %)</span>
              <span />
            </div>
            <p className="py-12 text-center text-[13px] text-zinc-500">
              Connect wallet to view balances
            </p>
          </div>
        ) : (
          <p className="text-center text-[13px] text-zinc-500">
            {tab} — no rows (demo)
          </p>
        )}
      </div>
    </div>
  );
}
