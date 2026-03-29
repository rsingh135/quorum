"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function RegionBanner() {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center gap-3 px-4 py-1.5",
        "bg-[#b91c1c] text-center text-[11px] font-medium text-white",
      )}
    >
      <span className="truncate">
        Regional restrictions may apply. This UI is a local demo — not affiliated
        with TradeXYZ.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/90 hover:bg-white/10"
      >
        Dismiss
      </button>
    </div>
  );
}
