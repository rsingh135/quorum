"use client";

import * as React from "react";
import { RegionBanner } from "./RegionBanner";
import { SiteHeader } from "./SiteHeader";
import { AssetStrip } from "./AssetStrip";
import { SyntheticCandleChart } from "./SyntheticCandleChart";
import { OrderBookPanel } from "./OrderBookPanel";
import { ExecutionPanel } from "./ExecutionPanel";
import { BottomDock } from "./BottomDock";
import { AccountSummary } from "./AccountSummary";

export function TradeXyzShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-trade flex h-[100dvh] flex-col overflow-hidden bg-txyz-bg text-zinc-100">
      <RegionBanner />
      <SiteHeader />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <AssetStrip />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <SyntheticCandleChart />
              <div className="bg-txyz-bg">{children}</div>
            </div>
          </div>
          <div className="flex h-[280px] shrink-0 flex-col border-t border-txyz-border lg:h-auto lg:w-[272px] lg:border-l lg:border-t-0">
            <OrderBookPanel />
          </div>
          <div className="flex h-[min(380px,45vh)] shrink-0 flex-col border-t border-txyz-border lg:h-auto lg:w-[300px] lg:border-l lg:border-t-0">
            <ExecutionPanel />
          </div>
        </div>

        <div className="flex max-h-[42vh] min-h-[180px] shrink-0 flex-col border-t border-txyz-border sm:max-h-none md:h-[200px] md:flex-row">
          <BottomDock />
          <AccountSummary />
        </div>
      </div>
    </div>
  );
}
