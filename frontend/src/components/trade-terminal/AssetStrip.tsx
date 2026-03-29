"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

function hashNum(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % max;
}

export function AssetStrip() {
  const pathname = usePathname();
  const m = pathname.match(/^\/case\/([^/]+)/);
  const docket = m?.[1];
  const pair = docket ? `CASE-${docket}-USD` : "SP500-USDC";
  const base = docket ? 100 + (hashNum(docket, 40) as number) : 6325.7;
  const mark = base + (hashNum(docket || "x", 100) as number) / 10;
  const oracle = mark + 5.2;
  const chAbs = docket ? (hashNum(docket, 200) - 100) / 10 : -35.2;
  const chPct = docket
    ? ((hashNum(docket + "p", 200) - 100) / 500).toFixed(2)
    : "-0.55";
  const neg = chAbs < 0;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-txyz-border bg-txyz-panel px-3 py-2 text-[12px] md:px-4">
      <div className="flex items-center gap-2">
        <span className="font-trade text-[14px] font-semibold text-white">
          {pair}
        </span>
        <span className="rounded bg-txyz-panel2 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
          50x
        </span>
        {docket ? (
          <Link
            href="/"
            className="text-[11px] text-txyz-up hover:underline"
          >
            All markets
          </Link>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]">
        <div>
          <span className="text-zinc-500">Mark</span>{" "}
          <span className="tabular-nums text-white">
            {mark.toLocaleString("en-US", { maximumFractionDigits: 1 })}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">Oracle</span>{" "}
          <span className="tabular-nums text-zinc-300">
            {oracle.toLocaleString("en-US", { maximumFractionDigits: 1 })}
          </span>
        </div>
        <div>
          <span className="text-zinc-500">24h</span>{" "}
          <span
            className={cn(
              "tabular-nums",
              neg ? "text-txyz-down" : "text-txyz-up",
            )}
          >
            {chAbs > 0 ? "+" : ""}
            {chAbs.toFixed(1)} / {chPct}%
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="text-zinc-500">24h Vol</span>{" "}
          <span className="text-zinc-200">$45.91m</span>
        </div>
        <div className="hidden md:block">
          <span className="text-zinc-500">OI</span>{" "}
          <span className="text-zinc-200">$137.30m</span>
        </div>
        <div className="hidden lg:block">
          <span className="text-zinc-500">Funding</span>{" "}
          <span className="text-txyz-up">0.0013%</span>
          <span className="ml-2 text-zinc-500">00:42:18</span>
        </div>
      </div>
    </div>
  );
}
