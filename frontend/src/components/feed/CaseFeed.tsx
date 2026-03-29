"use client";

import * as React from "react";
import Link from "next/link";
import { CaseCard } from "@/components/ui/CaseCard";
import { apiFetch } from "@/lib/api";
import type { MarketImpactLevel } from "@/components/ui/CaseCard";
import { cn } from "@/lib/cn";

type CaseRow = {
  docket: string;
  name: string;
  oral_argument_date?: string;
  market_impact_level?: MarketImpactLevel;
  sectors_affected?: string[];
  tickers_at_risk?: string[];
};

function hashProb(docket: string): number {
  let h = 0;
  for (let i = 0; i < docket.length; i++) h = (h * 31 + docket.charCodeAt(i)) >>> 0;
  return 0.35 + (h % 45) / 100;
}

const SP500_TICKER_RE = /SPY|VOO|IVV|QQQ|XLK|XLF|XLE|DIA|IWM|VIX/i;

export function CaseFeed({ marketLens }: { marketLens?: string }) {
  const [cases, setCases] = React.useState<CaseRow[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [sector, setSector] = React.useState<string>("all");
  const [impact, setImpact] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"date" | "certainty">("date");

  const sp500View = (marketLens || "").toUpperCase() === "SP500";

  React.useEffect(() => {
    apiFetch<CaseRow[]>("/api/cases")
      .then(setCases)
      .catch((e: Error) => setErr(e.message));
  }, []);

  const filtered = React.useMemo(() => {
    if (!cases) return [];
    let rows = cases.filter((c) => {
      const sev = (c.market_impact_level || "LOW").toUpperCase();
      if (impact !== "all" && sev !== impact) return false;
      if (sector === "all") return true;
      const secs = (c.sectors_affected || []).map((s) => s.toLowerCase());
      return secs.includes(sector.toLowerCase());
    });

    if (sp500View) {
      const indexLinked = rows.filter((c) =>
        (c.tickers_at_risk || []).some((t) => SP500_TICKER_RE.test(t)),
      );
      if (indexLinked.length) rows = indexLinked;
    }

    rows = [...rows].sort((a, b) => {
      if (sort === "date") {
        return (b.oral_argument_date || "").localeCompare(a.oral_argument_date || "");
      }
      return hashProb(b.docket) - hashProb(a.docket);
    });
    return rows;
  }, [cases, sector, impact, sort, sp500View]);

  if (err) {
    return (
      <p className="font-mono text-[12px] text-reverse">
        Failed to load cases: {err}
      </p>
    );
  }

  if (!cases) {
    return (
      <div className="overflow-hidden rounded-xs border border-terminal-line bg-terminal-panel/50">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-14 animate-shimmer border-b border-terminal-line bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] bg-[length:200%_100%]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-[11px] tracking-[0.28em] text-terminal-up">
            {sp500View ? "SP500 LENS" : "SCOTUS WATCHLIST"}
          </h1>
          <p className="mt-2 max-w-[56ch] font-body text-[13px] leading-6 text-ink-muted">
            {sp500View
              ? "Prioritize dockets with index or sector ETF overlap — same idea as screening a perpetual before you size risk (see trade.xyz SP500)."
              : "Filter by sector and mark impact. Open a symbol to stream nine-chamber analysis, coalition detection, and implied tape moves."}
          </p>
        </div>
        <div className="rounded-xs border border-terminal-line bg-black/35 px-3 py-2 font-mono text-[9px] tracking-[0.14em] text-ink-faint">
          <span className="text-ink-muted">DATA</span> · Court feed · API{" "}
          <span className="text-terminal-up/90">/api/cases</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-terminal-line pb-3">
        <span className="font-mono text-[9px] tracking-[0.18em] text-ink-faint">
          SECTOR
        </span>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-xs border border-terminal-line bg-terminal-panel px-2 py-1 font-mono text-[10px] text-ink"
        >
          <option value="all">All</option>
          <option value="travel">travel</option>
          <option value="cruise">cruise</option>
          <option value="energy">energy</option>
          <option value="oil-gas">oil-gas</option>
          <option value="midstream">midstream</option>
          <option value="defense">defense</option>
          <option value="consumer">consumer</option>
        </select>
        <span className="ml-2 font-mono text-[9px] tracking-[0.18em] text-ink-faint">
          IMPACT
        </span>
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          className="rounded-xs border border-terminal-line bg-terminal-panel px-2 py-1 font-mono text-[10px] text-ink"
        >
          <option value="all">All</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <span className="ml-2 font-mono text-[9px] tracking-[0.18em] text-ink-faint">
          SORT
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "date" | "certainty")}
          className="rounded-xs border border-terminal-line bg-terminal-panel px-2 py-1 font-mono text-[10px] text-ink"
        >
          <option value="date">Oral argument date</option>
          <option value="certainty">Predicted certainty</option>
        </select>
      </div>

      <div
        className={cn(
          "mt-0 overflow-hidden rounded-xs border border-terminal-line bg-terminal-panel/60",
        )}
      >
        <div className="grid grid-cols-[100px_1fr_120px_90px] gap-2 border-b border-terminal-line bg-black/40 px-3 py-2 font-mono text-[9px] tracking-[0.16em] text-ink-faint max-md:hidden">
          <span>SYMBOL</span>
          <span>INSTRUMENT</span>
          <span className="text-right md:text-left">MARKERS</span>
          <span className="text-right">AFFIRM</span>
        </div>
        {filtered.map((c) => (
          <Link key={c.docket} href={`/case/${c.docket}`} className="block">
            <CaseCard
              docket={c.docket}
              name={c.name}
              probabilityAffirm={hashProb(c.docket)}
              marketImpactLevel={(c.market_impact_level || "LOW") as MarketImpactLevel}
              sector={(c.sectors_affected && c.sectors_affected[0]) || "—"}
              swingJustice="TBD"
              tickersAtRisk={c.tickers_at_risk}
              layout="row"
            />
          </Link>
        ))}
      </div>

      {!filtered.length ? (
        <p className="mt-6 font-mono text-[12px] text-ink-muted">
          No rows match filters. Relax sector / impact or switch back to SCOTUS.
        </p>
      ) : null}
    </div>
  );
}
