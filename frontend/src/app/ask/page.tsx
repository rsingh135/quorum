"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { JusticeCard } from "@/components/ui/JusticeCard";
import { apiFetch, getApiBaseUrl } from "@/lib/api";
import type { JusticeVote } from "@/components/ui/JusticeCard";

type JusticeRow = { id: string; name: string; title?: string };

export default function AskPage() {
  const [justices, setJustices] = React.useState<JusticeRow[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [answers, setAnswers] = React.useState<
    Record<string, { answer: string; cited?: string[] }>
  >({});

  React.useEffect(() => {
    apiFetch<JusticeRow[]>("/api/justices")
      .then((rows) => {
        setJustices(rows);
        setSelected(new Set(rows.map((r) => r.id)));
      })
      .catch(() => {});
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const submit = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswers({});
    const ids = Array.from(selected);
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(
            `${getApiBaseUrl()}/api/justices/${id}/query`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question: q }),
            },
          );
          const data = await res.json();
          return [
            id,
            {
              answer: data.answer || JSON.stringify(data),
              cited: data.cited_opinion_snippets,
            },
          ] as const;
        } catch {
          return [
            id,
            { answer: "Request failed.", cited: [] },
          ] as const;
        }
      }),
    );
    const map: Record<string, { answer: string; cited?: string[] }> = {};
    results.forEach(([id, v]) => {
      map[id] = v;
    });
    setAnswers(map);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 shell:px-10">
      <h1 className="font-heading text-[26px] tracking-[0.12em] text-gold">
        ASK THE BENCH
      </h1>
      <p className="mt-2 font-body text-[13px] text-ink-muted">
        Pose a legal question; selected chambers answer in parallel.
      </p>

      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pose a legal question to any Justice"
        rows={5}
        className="mt-8 w-full resize-y rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.65)] px-4 py-3 font-body text-[14px] text-ink placeholder:text-ink-faint focus:border-gold/50 focus:outline-none"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {justices.map((j) => {
          const on = selected.has(j.id);
          return (
            <button
              key={j.id}
              type="button"
              onClick={() => toggle(j.id)}
              className={`rounded-full border px-3 py-2 font-mono text-[11px] tracking-[0.12em] transition ${
                on
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-white/10 bg-white/5 text-ink-faint"
              }`}
            >
              {j.id.slice(0, 2).toUpperCase()}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={submit}
        className="mt-6 rounded-xs border border-gold/50 bg-gold/15 px-6 py-3 font-mono text-[12px] tracking-[0.2em] text-gold disabled:opacity-50"
      >
        {loading ? "SUBMITTING…" : "SUBMIT"}
      </button>

      <div className="mt-10 space-y-4">
        <AnimatePresence>
          {justices.map((j, i) => {
            const a = answers[j.id];
            if (!a) return null;
            return (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <JusticeCard
                  name={j.name}
                  title={j.title}
                  vote={"AFFIRM" as JusticeVote}
                  confidence={0.88}
                  keyConcern="Response"
                  primaryReasoning={a.answer}
                  analogousCases={a.cited}
                  defaultExpanded
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
