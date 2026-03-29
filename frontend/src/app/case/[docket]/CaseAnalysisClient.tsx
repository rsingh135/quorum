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
import { cn } from "@/lib/cn";

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

type CoalitionView = {
  majority?: string[];
  minority?: string[];
  swing_justices?: string[];
  predicted_margin?: string;
  majority_author?: string | null;
};

function mapVote(v: string | undefined): JusticeVote {
  if (v === "AFFIRM" || v === "REVERSE" || v === "ABSTAINED") return v;
  return "ABSTAINED";
}

function hashProb(docket: string): number {
  let h = 0;
  for (let i = 0; i < docket.length; i++) h = (h * 31 + docket.charCodeAt(i)) >>> 0;
  return 0.35 + (h % 45) / 100;
}

function affirmFromVerdict(verdict: Record<string, unknown>): number {
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
}

function Panel({
  title,
  children,
  className,
  flush,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Omit inner padding (use for dense stat cells) */
  flush?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xs border border-terminal-line bg-terminal-panel/75 backdrop-blur-sm",
        className,
      )}
    >
      <div className="border-b border-terminal-line bg-black/30 px-3 py-2 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
        {title}
      </div>
      <div className={cn(!flush && "p-3")}>{children}</div>
    </div>
  );
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

  const coalitionView =
    coalition && typeof coalition === "object"
      ? (coalition as CoalitionView)
      : null;

  const preMark = hashProb(docket);
  const mark =
    verdict && typeof verdict === "object" && "probability" in verdict
      ? affirmFromVerdict(verdict as Record<string, unknown>)
      : preMark;

  let idx = 0;

  return (
    <div className="px-4 py-6 shell:px-8">
      {loadErr ? (
        <p className="font-mono text-reverse">{loadErr}</p>
      ) : !detail ? (
        <div className="h-40 animate-shimmer rounded-xs border border-terminal-line bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] bg-[length:200%_100%]" />
      ) : (
        <>
          {/* Instrument header — trade.xyz perpetual-style */}
          <section className="border-b border-terminal-line pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[20px] font-semibold tracking-[0.12em] text-ink md:text-[24px]">
                    CASE-{detail.docket}
                  </span>
                  <span
                    className={cn(
                      "rounded-xs border px-2 py-0.5 font-mono text-[9px] tracking-[0.2em]",
                      started && status !== "complete"
                        ? "border-terminal-up/45 bg-terminal-up/10 text-terminal-up"
                        : "border-terminal-line text-ink-faint",
                    )}
                  >
                    {status === "streaming" || status === "starting"
                      ? "STREAMING"
                      : status === "complete"
                        ? "SETTLED"
                        : "IDLE"}
                  </span>
                </div>
                <h1 className="mt-2 font-heading text-[22px] leading-tight tracking-[0.04em] text-ink shell:text-[28px]">
                  {detail.name}
                </h1>
                <p className="mt-2 max-w-[68ch] font-body text-[13px] italic leading-7 text-ink-muted">
                  {detail.legal_question}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Panel title="MARK (AFFIRM)" className="min-w-[120px]" flush>
                  <div className="px-3 py-3">
                    <div
                      className={cn(
                        "font-mono text-[26px] leading-none tracking-tight tabular-nums",
                        mark >= 0.5 ? "text-terminal-up" : "text-terminal-down",
                      )}
                    >
                      {(mark * 100).toFixed(1)}
                      <span className="text-sm text-ink-faint">%</span>
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-ink-faint">
                      pre-run est. {Math.round(preMark * 100)}% → live after verdict
                    </div>
                  </div>
                </Panel>
                <Panel title="ORAL" className="min-w-[100px] p-0">
                  <div className="px-3 py-3 font-mono text-[11px] leading-snug text-ink-muted">
                    {detail.oral_argument_date || "—"}
                  </div>
                </Panel>
                <Panel title="CIRCUIT" className="min-w-[100px] p-0">
                  <div className="px-3 py-3 font-mono text-[11px] leading-snug text-ink-muted">
                    {detail.lower_court || "—"}
                  </div>
                </Panel>
                <Panel title="RELATED" className="min-w-[140px]" flush>
                  <div className="px-3 py-3 font-mono text-[10px] leading-snug text-terminal-up/90">
                    {(detail.tickers_at_risk || []).slice(0, 4).join(" · ") ||
                      "—"}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => startAnalysis(docket)}
                disabled={status === "starting" || status === "streaming"}
                className="rounded-xs border border-terminal-up/55 bg-terminal-up/15 px-6 py-2.5 font-mono text-[11px] font-medium tracking-[0.2em] text-terminal-up transition hover:bg-terminal-up/25 disabled:opacity-45"
              >
                RUN AGENT ANALYSIS
              </button>
              <span className="font-mono text-[9px] tracking-[0.14em] text-ink-faint">
                nine parallel justices · coalition · verdict · market map
              </span>
            </div>
            {error ? (
              <p className="mt-2 font-mono text-[11px] text-reverse">{error}</p>
            ) : null}
          </section>

          {status === "starting" || status === "streaming" ? (
            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
              <LoadingDeliberation />
              <Panel title="AGENT PIPELINE">
                <DeliberationProgress
                  started={started}
                  completedJustices={completedJustices}
                  hasCoalition={!!coalition}
                  hasVerdict={!!verdict}
                  hasMarket={!!market}
                />
              </Panel>
            </div>
          ) : null}

          {coalitionView &&
          ((coalitionView.majority?.length || 0) > 0 ||
            (coalitionView.minority?.length || 0) > 0) ? (
            <section className="mt-8">
              <Panel title="COALITION MAP (JUDGE HEARING)">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.16em] text-terminal-up">
                      MAJORITY
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-muted">
                      {(coalitionView.majority || []).join(", ") || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.16em] text-terminal-down">
                      MINORITY
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-muted">
                      {(coalitionView.minority || []).join(", ") || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-[0.16em] text-gold">
                      SWING · MARGIN
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-ink-muted">
                      {(coalitionView.swing_justices || []).join(", ") || "—"}
                      <span className="mx-1 text-ink-faint">|</span>
                      {coalitionView.predicted_margin || "—"}
                    </div>
                    {coalitionView.majority_author ? (
                      <div className="mt-2 font-mono text-[10px] text-ink-faint">
                        author · {coalitionView.majority_author}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Panel>
            </section>
          ) : null}

          <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
            <Panel title="VERDICT TAPE" className="p-0">
              <div className="p-4">
                {verdict && typeof verdict === "object" && "probability" in verdict ? (
                  <>
                    <ProbabilityMeter
                      probabilityAffirm={affirmFromVerdict(
                        verdict as Record<string, unknown>,
                      )}
                      variant="terminal"
                    />
                    <div className="mt-3 font-mono text-[11px] tracking-[0.12em] text-ink-muted">
                      {(verdict as { vote_count?: { affirm?: number; reverse?: number } }).vote_count
                        ? `${(verdict as { vote_count: { affirm: number; reverse: number } }).vote_count.affirm} AFFIRM · ${(verdict as { vote_count: { affirm: number; reverse: number } }).vote_count.reverse} REVERSE`
                        : ""}
                    </div>
                    <blockquote className="mt-5 border-l-2 border-terminal-up/50 pl-4 font-body text-[13px] italic leading-7 text-ink-muted">
                      {
                        (verdict as { key_holding_prediction?: string })
                          .key_holding_prediction
                      }
                    </blockquote>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-ink-faint">
                    Run analysis to print verdict tape — probability rail updates
                    after coalition synthesis.
                  </p>
                )}
              </div>
            </Panel>
            <div className="space-y-4">
              {verdict && typeof verdict === "object" && "probability" in verdict ? (
                <Panel title="RISK BANDS">
                  <div className="font-mono text-[9px] tracking-[0.16em] text-ink-faint">
                    UNCERTAINTY
                  </div>
                  <div className="mt-1 font-mono text-[20px] text-gold">
                    {(verdict as { uncertainty_level?: string }).uncertainty_level}
                  </div>
                  <div className="mt-4 font-mono text-[9px] tracking-[0.14em] text-ink-faint">
                    SWING
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-ink">
                    {(
                      (verdict as { swing_justices?: string[] }).swing_justices ||
                      []
                    ).join(", ") || "—"}
                  </div>
                </Panel>
              ) : null}
              {status !== "starting" && status !== "streaming" ? (
                <Panel title="AGENT PIPELINE">
                  <DeliberationProgress
                    started={started}
                    completedJustices={completedJustices}
                    hasCoalition={!!coalition}
                    hasVerdict={!!verdict}
                    hasMarket={!!market}
                  />
                </Panel>
              ) : null}
            </div>
          </section>

          {Object.keys(justiceAnalyses).length > 0 ? (
            <section className="mt-12">
              <h2 className="font-mono text-[10px] tracking-[0.28em] text-terminal-up">
                BENCH DEPTH · PER-JUSTICE AGENTS
              </h2>
              <div className="mt-4 space-y-3">
                {BENCH_ROWS.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid grid-cols-1 gap-3 md:grid-cols-3"
                  >
                    {row.map((jid) => {
                      const a = justiceAnalyses[jid];
                      const m = meta[jid];
                      const stagger = idx++;
                      return (
                        <motion.div
                          key={jid}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.32,
                            delay: stagger * 0.06,
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
                              variant="terminal"
                            />
                          ) : (
                            <div className="h-[120px] rounded-xs border border-terminal-line bg-black/25" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {market &&
          typeof market === "object" &&
          "tickers" in market &&
          Array.isArray((market as { tickers: unknown }).tickers) ? (
            <section className="mt-12">
              <h2 className="font-mono text-[10px] tracking-[0.28em] text-terminal-up">
                IMPLIED TAPE · MARKET MAP
              </h2>
              <div className="mt-3 overflow-hidden rounded-xs border border-terminal-line bg-terminal-panel/60">
                <div className="grid grid-cols-[88px_1fr_1fr] gap-2 border-b border-terminal-line bg-black/35 px-3 py-2 font-mono text-[9px] tracking-[0.16em] text-ink-faint max-sm:grid-cols-2">
                  <span>TICKER</span>
                  <span className="max-sm:col-span-1">DIR</span>
                  <span className="text-right max-sm:hidden">RATIONALE</span>
                </div>
                <div className="divide-y divide-terminal-line">
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
                      variant="terminal"
                    />
                  ))}
                </div>
              </div>
              {Array.isArray(
                (market as { sector_exposure?: unknown }).sector_exposure,
              ) ? (
                <div className="mt-4 flex flex-wrap gap-2">
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
                      className="rounded-xs border border-terminal-line px-2 py-1 font-mono text-[9px]"
                      style={{
                        background: `rgba(61,255,156,${0.08 + (s.intensity || 0) * 0.35})`,
                      }}
                    >
                      {s.sector}
                    </div>
                  ))}
                </div>
              ) : null}
              {(market as { historical_comparable?: { case?: string; move_30d?: string } })
                .historical_comparable ? (
                <div className="mt-4 rounded-xs border border-terminal-line bg-black/35 p-4 font-mono text-[10px] text-ink-muted">
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
