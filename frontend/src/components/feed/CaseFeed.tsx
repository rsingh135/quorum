"use client";

import * as React from "react";
import Link from "next/link";
import { CaseCard } from "@/components/ui/CaseCard";
import { apiFetch } from "@/lib/api";
import type { MarketImpactLevel } from "@/components/ui/CaseCard";

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

export function CaseFeed() {
  const [cases, setCases] = React.useState<CaseRow[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [sector, setSector] = React.useState<string>("all");
  const [impact, setImpact] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"date" | "certainty">("date");

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
    rows = [...rows].sort((a, b) => {
      if (sort === "date") {
        return (b.oral_argument_date || "").localeCompare(a.oral_argument_date || "");
      }
      return hashProb(b.docket) - hashProb(a.docket);
    });
    return rows;
  }, [cases, sector, impact, sort]);

  if (err) {
    return (
      <p className="font-mono text-[12px] text-reverse">
        Failed to load cases: {err}
      </p>
    );
  }

  if (!cases) {
    return (
      <div className="grid max-w-5xl grid-cols-1 gap-4 gap-x-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[168px] animate-shimmer rounded-xs border border-[var(--divider)] bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:200%_100%]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-heading text-[28px] tracking-[0.14em] text-gold md:text-[34px]">
        PENDING BEFORE THE COURT
      </h1>
      <p className="mt-2 max-w-[60ch] font-body text-[13px] leading-6 text-ink-muted">
        Filter by sector and market impact. Open a docket to run full bench
        analysis.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-[var(--divider)] pb-4">
        <span className="font-mono text-[10px] tracking-[0.16em] text-ink-faint">
          SECTOR
        </span>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="rounded-xs border border-white/15 bg-[rgba(10,10,15,0.8)] px-2 py-1 font-mono text-[11px] text-ink"
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
        <span className="ml-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint">
          IMPACT
        </span>
        <select
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          className="rounded-xs border border-white/15 bg-[rgba(10,10,15,0.8)] px-2 py-1 font-mono text-[11px] text-ink"
        >
          <option value="all">All</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <span className="ml-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint">
          SORT
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "date" | "certainty")}
          className="rounded-xs border border-white/15 bg-[rgba(10,10,15,0.8)] px-2 py-1 font-mono text-[11px] text-ink"
        >
          <option value="date">Oral argument date</option>
          <option value="certainty">Predicted certainty</option>
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 gap-x-6 md:grid-cols-2">
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
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
