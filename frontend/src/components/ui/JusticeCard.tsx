"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export type JusticeVote = "AFFIRM" | "REVERSE" | "ABSTAINED";

export type JusticeCardProps = {
  name: string;
  title?: string;
  vote: JusticeVote;
  confidence: number; // 0..1
  keyConcern: string;
  primaryReasoning?: string;
  analogousCases?: string[];
  defaultExpanded?: boolean;
  /** Dense exchange-style panel */
  variant?: "court" | "terminal";
  className?: string;
};

function voteStyles(vote: JusticeVote) {
  if (vote === "AFFIRM") {
    return {
      badge: "text-affirm border-affirm/30 bg-affirm/10",
      glow: "shadow-glowAffirm border-affirm/30",
      edge: "from-affirm/40 to-transparent",
    };
  }
  if (vote === "REVERSE") {
    return {
      badge: "text-reverse border-reverse/30 bg-reverse/10",
      glow: "shadow-glowReverse border-reverse/30",
      edge: "from-reverse/40 to-transparent",
    };
  }
  return {
    badge: "text-ink-faint border-white/10 bg-white/5",
    glow: "shadow-[0_0_0_1px_rgba(255,255,255,0.08)] border-white/10",
    edge: "from-white/20 to-transparent",
  };
}

export function JusticeCard({
  name,
  title,
  vote,
  confidence,
  keyConcern,
  primaryReasoning,
  analogousCases,
  defaultExpanded = false,
  variant = "court",
  className,
}: JusticeCardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const pct = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  const styles = voteStyles(vote);
  const terminal = variant === "terminal";

  return (
    <motion.div
      layout
      className={cn(
        "group relative overflow-hidden rounded-xs border backdrop-blur-[3px]",
        terminal
          ? "border-terminal-line bg-terminal-panel/90"
          : "border-gold-muted bg-[rgba(10,10,15,0.65)]",
        !terminal && styles.glow,
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r opacity-70",
          terminal
            ? "from-transparent via-terminal-up/30 to-transparent"
            : "from-transparent via-gold/25 to-transparent",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-60",
          "bg-gradient-to-b",
          styles.edge,
        )}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "relative z-[1] w-full text-left p-4",
          "transition-transform duration-200 ease-out",
          "hover:-translate-y-[2px] hover:shadow-ink",
          "focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/60",
        )}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -left-24 -top-28 h-64 w-64 rounded-full bg-gold/10 blur-2xl" />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="font-heading text-[15px] tracking-[0.06em] text-ink">
                {name}
              </h3>
              {title ? (
                <span className="truncate font-body text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                  {title}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-1 font-body text-[12px] italic text-ink-muted">
              {keyConcern}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-xs border px-2 py-1",
                "font-mono text-[11px] tracking-[0.14em]",
                styles.badge,
              )}
            >
              <span className="h-[6px] w-[6px] rounded-full bg-current opacity-80" />
              {vote}
            </span>
            <div className="font-mono text-[12px] text-ink">
              {pct}
              <span className="text-ink-faint">%</span>
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "mt-4 overflow-hidden border-t pt-3",
                terminal ? "border-terminal-line" : "border-[var(--divider)]",
              )}
            >
              {primaryReasoning ? (
                <p className="font-body text-[12px] leading-6 text-ink-muted">
                  {primaryReasoning}
                </p>
              ) : (
                <p className="font-body text-[12px] leading-6 text-ink-faint">
                  No reasoning available.
                </p>
              )}

              {analogousCases?.length ? (
                <div className="mt-3">
                  <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
                    ANALOGOUS
                  </div>
                  <ul className="mt-2 space-y-1">
                    {analogousCases.slice(0, 3).map((c) => (
                      <li
                        key={c}
                        className="font-body text-[12px] text-ink-muted"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

