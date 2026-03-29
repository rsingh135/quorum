"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { JusticeCard } from "@/components/ui/JusticeCard";
import { ProbabilityMeter } from "@/components/ui/ProbabilityMeter";
import { MarketTickerRow } from "@/components/ui/MarketTickerRow";
import { LoadingDeliberation } from "@/components/ui/LoadingDeliberation";
import { DeliberationProgress } from "@/components/analysis/DeliberationProgress";
import { BENCH_ROWS } from "@/config/bench";
import { useDeliberation } from "@/hooks/useDeliberation";
import { apiFetch } from "@/lib/api";
import type { JusticeVote } from "@/components/ui/JusticeCard";

type CaseDetail = {
  docket: string;
  name: string;
  legal_question: string;
  oral_argument_date?: string;
  lower_court?: string;
  tickers_at_risk?: string[];
  sectors_affected?: string[];
};

type JusticeMeta = {
  id: string;
  name: string;
  title?: string;
};

function mapVote(v: string | undefined): JusticeVote {
  if (v === "AFFIRM" || v === "REVERSE" || v === "ABSTAINED") return v;
  return "ABSTAINED";
}

export function CaseAnalysisClient({ docket }: { docket: string }) {
  const [detail, setDetail] = React.useState<CaseDetail | null>(null);
  const [meta, setMeta] = React.useState<Record<string, JusticeMeta>>({});
  const [loadErr, setLoadErr] = React.useState<string | null>(null);

  const {
    justiceAnalyses,
    coalition,
    verdict,
    market,
    status,
    error,
    completedJustices,
    startAnalysis,
  } = useDeliberation();

  React.useEffect(() => {
    Promise.all([
      apiFetch<CaseDetail>(`/api/cases/${encodeURIComponent(docket)}`),
      apiFetch<JusticeMeta[]>("/api/justices"),
    ])
      .then(([c, list]) => {
        setDetail(c);
        setMeta(Object.fromEntries(list.map((j) => [j.id, j])));
      })
      .catch((e: Error) => setLoadErr(e.message));
  }, [docket]);

  const started =
    status === "starting" ||
    status === "streaming" ||
    status === "complete";

  let idx = 0;

  return (
    <div className="px-6 py-8 shell:px-10">
      {loadErr ? (
        <p className="font-mono text-reverse">{loadErr}</p>
      ) : !detail ? (
        <div className="h-40 animate-shimmer rounded-xs border border-[var(--divider)] bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
      ) : (
        <>
          <section>
            <h1 className="font-heading text-[28px] leading-tight tracking-[0.06em] text-ink shell:text-[36px]">
              {detail.name}
            </h1>
            <p className="mt-3 max-w-[70ch] font-body text-[14px] italic leading-7 text-ink-muted">
              {detail.legal_question}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.12em] text-ink-faint">
              {detail.oral_argument_date ? (
                <span>ORAL · {detail.oral_argument_date}</span>
              ) : null}
              {detail.lower_court ? (
                <span>CIRCUIT · {detail.lower_court}</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => startAnalysis(docket)}
              disabled={status === "starting" || status === "streaming"}
              className="mt-8 rounded-xs border border-gold/50 bg-gold/15 px-6 py-3 font-mono text-[12px] tracking-[0.2em] text-gold transition hover:bg-gold/25 disabled:opacity-50"
            >
              RUN ANALYSIS
            </button>
            {error ? (
              <p className="mt-2 font-mono text-[11px] text-reverse">{error}</p>
            ) : null}
          </section>

          {status === "starting" || status === "streaming" ? (
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
              <LoadingDeliberation />
              <DeliberationProgress
                started={started}
                completedJustices={completedJustices}
                hasCoalition={!!coalition}
                hasVerdict={!!verdict}
                hasMarket={!!market}
              />
            </div>
          ) : null}

          {Object.keys(justiceAnalyses).length > 0 ? (
            <section className="mt-14">
              <h2 className="font-heading text-[14px] tracking-[0.28em] text-gold">
                THE BENCH
              </h2>
              <div className="mt-6 space-y-4">
                {BENCH_ROWS.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid grid-cols-1 gap-4 md:grid-cols-3"
                  >
                    {row.map((jid) => {
                      const a = justiceAnalyses[jid];
                      const m = meta[jid];
                      const stagger = idx++;
                      return (
                        <motion.div
                          key={jid}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: stagger * 0.08,
                            ease: "easeOut",
                          }}
                        >
                          {a && m ? (
                            <JusticeCard
                              name={m.name}
                              title={m.title}
                              vote={mapVote(a.vote)}
                              confidence={a.confidence}
                              keyConcern={a.key_concern}
                              primaryReasoning={a.primary_reasoning}
                              analogousCases={a.analogous_cases}
                            />
                          ) : (
                            <div className="h-[120px] rounded-xs border border-[var(--divider)] bg-white/[0.03]" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {verdict && typeof verdict === "object" && "probability" in verdict ? (
            <section className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="font-heading text-[14px] tracking-[0.28em] text-gold">
                  VERDICT
                </h2>
                <div className="mt-4">
                  <ProbabilityMeter
                    probabilityAffirm={(() => {
                      const v = verdict as {
                        outcome?: string;
                        probability?: number;
                        vote_count?: { affirm?: number; reverse?: number };
                      };
                      const vc = v.vote_count;
                      if (
                        vc &&
                        typeof vc.affirm === "number" &&
                        typeof vc.reverse === "number" &&
                        vc.affirm + vc.reverse > 0
                      ) {
                        return vc.affirm / (vc.affirm + vc.reverse);
                      }
                      const p = Number(v.probability ?? 0.5);
                      return v.outcome === "AFFIRM" ? p : 1 - p;
                    })()}
                  />
                  <div className="mt-3 font-mono text-[12px] tracking-[0.12em] text-ink-muted">
                    {(verdict as { vote_count?: { affirm?: number; reverse?: number } }).vote_count
                      ? `${(verdict as { vote_count: { affirm: number; reverse: number } }).vote_count.affirm} AFFIRM · ${(verdict as { vote_count: { affirm: number; reverse: number } }).vote_count.reverse} REVERSE`
                      : ""}
                  </div>
                </div>
                <blockquote className="mt-6 border-l-2 border-gold/60 pl-4 font-body text-[13px] italic leading-7 text-ink-muted">
                  {(verdict as { key_holding_prediction?: string }).key_holding_prediction}
                </blockquote>
              </div>
              <div className="rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.5)] p-4">
                <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint">
                  UNCERTAINTY
                </div>
                <div className="mt-2 font-mono text-[18px] text-gold">
                  {(verdict as { uncertainty_level?: string }).uncertainty_level}
                </div>
                <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-ink-faint">
                  SWING
                </div>
                <div className="mt-1 font-body text-[12px] text-ink">
                  {(
                    (verdict as { swing_justices?: string[] }).swing_justices ||
                    []
                  ).join(", ") || "—"}
                </div>
              </div>
            </section>
          ) : null}

          {market &&
          typeof market === "object" &&
          "tickers" in market &&
          Array.isArray((market as { tickers: unknown }).tickers) ? (
            <section className="mt-14">
              <h2 className="font-heading text-[14px] tracking-[0.28em] text-gold">
                MARKET IMPLICATIONS
              </h2>
              <div className="mt-4 space-y-2">
                {(
                  market as {
                    tickers: Array<{
                      ticker: string;
                      direction?: string;
                      rationale?: string;
                    }>;
                  }
                ).tickers.map((t) => (
                  <MarketTickerRow
                    key={t.ticker}
                    ticker={t.ticker}
                    direction={
                      t.direction === "UP" || t.direction === "DOWN"
                        ? t.direction
                        : "FLAT"
                    }
                    comparableMove={t.rationale || "—"}
                  />
                ))}
              </div>
              {Array.isArray(
                (market as { sector_exposure?: unknown }).sector_exposure,
              ) ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {(
                    market as {
                      sector_exposure: Array<{
                        sector: string;
                        intensity?: number;
                      }>;
                    }
                  ).sector_exposure.map((s) => (
                    <div
                      key={s.sector}
                      className="rounded-xs border border-[var(--divider)] px-2 py-1 font-mono text-[10px]"
                      style={{
                        background: `rgba(201,168,76,${0.15 + (s.intensity || 0) * 0.4})`,
                      }}
                    >
                      {s.sector}
                    </div>
                  ))}
                </div>
              ) : null}
              {(market as { historical_comparable?: { case?: string; move_30d?: string } })
                .historical_comparable ? (
                <div className="mt-6 rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.45)] p-4 font-mono text-[11px] text-ink-muted">
                  Analogous ruling:{" "}
                  {
                    (market as { historical_comparable: { case?: string } })
                      .historical_comparable.case
                  }{" "}
                  →{" "}
                  {
                    (market as { historical_comparable: { move_30d?: string } })
                      .historical_comparable.move_30d
                  }
                </div>
              ) : null}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
