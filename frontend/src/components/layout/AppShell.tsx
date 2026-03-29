"use client";

import { TradeXyzShell } from "@/components/trade-terminal/TradeXyzShell";

/** Routes all pages inside the trade.xyz–style perpetual terminal chrome. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return <TradeXyzShell>{children}</TradeXyzShell>;
}
