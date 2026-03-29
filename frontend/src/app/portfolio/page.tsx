"use client";

import * as React from "react";
import { getApiBaseUrl } from "@/lib/api";

type Exposure = {
  docket: string;
  name: string;
  market_impact_level?: string;
  risk_score: number;
};

type Row = {
  ticker: string;
  cases: Exposure[];
  risk_score: number;
};

export default function PortfolioPage() {
  const [input, setInput] = React.useState("");
  const [rows, setRows] = React.useState<Row[]>([]);
  const [portfolioRisk, setPortfolioRisk] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const allCases = React.useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) =>
      r.cases.forEach((c) => m.set(c.docket, c.name)),
    );
    return Array.from(m.entries());
  }, [rows]);

  const scan = async () => {
    const tickers = input
      .split(/[,\n]+/)
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    if (!tickers.length) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolio/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(data.tickers || []);
      setPortfolioRisk(data.portfolio_scotus_risk ?? null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  function cellColor(risk: number): string {
    if (risk >= 0.7) return "bg-reverse/35";
    if (risk >= 0.35) return "bg-gold/25";
    return "bg-affirm/20";
  }

  return (
    <div className="px-4 py-6 shell:px-8">
      <h1 className="font-mono text-[11px] tracking-[0.26em] text-terminal-up">
        PORTFOLIO HEATMAP
      </h1>
      <p className="mt-2 max-w-[60ch] font-body text-[13px] text-ink-muted">
        Cross-ticker SCOTUS exposure matrix — same “eval all positions” idea as
        a risk dashboard (AI×Finance playbook).
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AAPL, PFE, XOM"
          className="min-w-[240px] flex-1 rounded-xs border border-terminal-line bg-terminal-panel px-3 py-2 font-mono text-[13px] text-ink"
        />
        <button
          type="button"
          disabled={loading}
          onClick={scan}
          className="rounded-xs border border-terminal-up/45 bg-terminal-up/12 px-4 py-2 font-mono text-[11px] tracking-[0.16em] text-terminal-up disabled:opacity-50"
        >
          SCAN
        </button>
      </div>
      {err ? (
        <p className="mt-4 font-mono text-[12px] text-reverse">{err}</p>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse font-mono text-[11px]">
              <thead>
                <tr className="border-b border-terminal-line text-left text-ink-faint">
                  <th className="py-2 pr-4">TICKER</th>
                  {allCases.map(([docket, name]) => (
                    <th key={docket} className="max-w-[120px] px-1 py-2 align-bottom">
                      <span className="line-clamp-2" title={name}>
                        {docket}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.ticker}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 pr-4 font-mono text-[12px] text-gold">
                      {r.ticker}
                    </td>
                    {allCases.map(([docket]) => {
                      const hit = r.cases.find((c) => c.docket === docket);
                      return (
                        <td key={docket} className="px-1 py-2">
                          <div
                            className={`h-8 w-full rounded-xs ${hit ? cellColor(hit.risk_score) : "bg-white/5"}`}
                            title={hit ? hit.name : ""}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10">
            <div className="font-mono text-[10px] tracking-[0.2em] text-ink-faint">
              SCOTUS RISK SCORE
            </div>
            <div
              className={`mt-2 font-mono text-[48px] leading-none tracking-tight ${
                (portfolioRisk ?? 0) > 55 ? "text-reverse" : "text-gold"
              }`}
            >
              {portfolioRisk ?? "—"}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
