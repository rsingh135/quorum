"use client";

import * as React from "react";
import { getApiBaseUrl } from "@/lib/api";

export type JusticeAnalysisPayload = {
  vote: "AFFIRM" | "REVERSE" | "ABSTAINED";
  confidence: number;
  primary_reasoning: string;
  key_concern: string;
  analogous_cases: string[];
  uncertainty_factors: string[];
  likely_opinion_type: string;
};

export type CoalitionPayload = Record<string, unknown>;
export type VerdictPayload = Record<string, unknown>;
export type MarketPayload = Record<string, unknown>;

export type DeliberationStatus =
  | "idle"
  | "starting"
  | "streaming"
  | "complete"
  | "error";

export function useDeliberation() {
  const [justiceAnalyses, setJusticeAnalyses] = React.useState<
    Record<string, JusticeAnalysisPayload>
  >({});
  const [coalition, setCoalition] = React.useState<CoalitionPayload | null>(
    null,
  );
  const [verdict, setVerdict] = React.useState<VerdictPayload | null>(null);
  const [market, setMarket] = React.useState<MarketPayload | null>(null);
  const [completedJustices, setCompletedJustices] = React.useState<string[]>(
    [],
  );
  const [status, setStatus] = React.useState<DeliberationStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  const esRef = React.useRef<EventSource | null>(null);

  const cleanup = React.useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  React.useEffect(() => () => cleanup(), [cleanup]);

  const startAnalysis = React.useCallback(
    async (docketId: string) => {
      cleanup();
      setJusticeAnalyses({});
      setCoalition(null);
      setVerdict(null);
      setMarket(null);
      setCompletedJustices([]);
      setError(null);
      setStatus("starting");

      const base = getApiBaseUrl();
      let sid: string;
      try {
        const run = await fetch(`${base}/api/analysis/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docket_id: docketId }),
        });
        if (!run.ok) throw new Error(await run.text());
        const data = (await run.json()) as { session_id: string };
        sid = data.session_id;
        setSessionId(sid);
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Failed to start analysis");
        return;
      }

      setStatus("streaming");
      const es = new EventSource(`${base}/api/analysis/stream/${sid}`);
      esRef.current = es;

      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data) as {
            event: string;
            data: unknown;
          };
          const { event, data } = payload;
          if (event === "justice_complete" && data && typeof data === "object") {
            const d = data as {
              justice_id: string;
              analysis: JusticeAnalysisPayload;
            };
            setJusticeAnalyses((prev) => ({
              ...prev,
              [d.justice_id]: d.analysis,
            }));
            setCompletedJustices((prev) =>
              prev.includes(d.justice_id) ? prev : [...prev, d.justice_id],
            );
          } else if (event === "coalition_detected") {
            setCoalition(data as CoalitionPayload);
          } else if (event === "verdict_ready") {
            setVerdict(data as VerdictPayload);
          } else if (event === "market_mapped") {
            setMarket(data as MarketPayload);
          } else if (event === "complete") {
            setStatus("complete");
            es.close();
            esRef.current = null;
          } else if (event === "error") {
            setStatus("error");
            setError(JSON.stringify(data));
            es.close();
            esRef.current = null;
          }
        } catch {
          /* ignore malformed chunks */
        }
      };

      es.onerror = () => {
        setStatus((s) => (s === "streaming" ? "complete" : s));
        es.close();
        esRef.current = null;
      };
    },
    [cleanup],
  );

  return {
    justiceAnalyses,
    coalition,
    verdict,
    market,
    status,
    error,
    sessionId,
    completedJustices,
    startAnalysis,
    cleanup,
  };
}
