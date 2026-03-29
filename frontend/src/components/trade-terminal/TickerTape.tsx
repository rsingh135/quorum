"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { s: "CL", p: "71.42", ch: 0.32 },
  { s: "BRENTOIL", p: "75.18", ch: 0.28 },
  { s: "SP500", p: "6,325.7", ch: -0.55 },
  { s: "XY2100", p: "4,892.1", ch: 0.12 },
  { s: "SILVER", p: "32.4", ch: -0.21 },
  { s: "GOLD", p: "3,045", ch: 0.44 },
  { s: "NATGAS", p: "3.42", ch: -1.2 },
  { s: "EUR", p: "1.084", ch: 0.08 },
  { s: "JPY", p: "149.2", ch: -0.15 },
];

function Row() {
  return (
    <>
      {ITEMS.map((x) => {
        const up = x.ch >= 0;
        return (
          <span
            key={x.s}
            className="inline-flex shrink-0 items-baseline gap-2 px-4"
          >
            <span className="text-zinc-400">{x.s}</span>
            <span className="tabular-nums text-zinc-100">{x.p}</span>
            <span
              className={cn(
                "tabular-nums",
                up ? "text-txyz-up" : "text-txyz-down",
              )}
            >
              {up ? "+" : ""}
              {x.ch}%
            </span>
          </span>
        );
      })}
    </>
  );
}

export function TickerTape() {
  return (
    <div className="relative min-w-0 flex-1 overflow-hidden border-x border-txyz-border/80 bg-txyz-panel py-1.5">
      <div className="flex w-max animate-txyz-ticker whitespace-nowrap font-mono text-[11px]">
        <span className="inline-flex shrink-0">
          <Row />
        </span>
        <span className="inline-flex shrink-0">
          <Row />
        </span>
      </div>
    </div>
  );
}
