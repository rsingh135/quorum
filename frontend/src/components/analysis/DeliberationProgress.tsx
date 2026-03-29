"use client";

import { cn } from "@/lib/cn";

const JUSTICES = [
  "roberts",
  "thomas",
  "alito",
  "sotomayor",
  "kagan",
  "gorsuch",
  "kavanaugh",
  "barrett",
  "jackson",
] as const;

function Row({
  label,
  state,
}: {
  label: string;
  state: "pending" | "running" | "done";
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          state === "done" && "bg-affirm",
          state === "running" && "animate-pulse bg-gold",
          state === "pending" && "bg-white/15",
        )}
      />
      <span
        className={cn(
          "font-mono text-[10px] tracking-[0.14em]",
          state === "done" && "text-affirm",
          state === "running" && "text-gold",
          state === "pending" && "text-ink-faint",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function DeliberationProgress({
  started,
  completedJustices,
  hasCoalition,
  hasVerdict,
  hasMarket,
}: {
  started: boolean;
  completedJustices: string[];
  hasCoalition: boolean;
  hasVerdict: boolean;
  hasMarket: boolean;
}) {
  const done = new Set(completedJustices);
  const runningJustice =
    started && completedJustices.length < 9
      ? JUSTICES.find((j) => !done.has(j))
      : null;

  return (
    <div className="space-y-2 border-l border-[var(--divider)] pl-4">
      <Row
        label="Case prep"
        state={!started ? "pending" : completedJustices.length === 0 ? "running" : "done"}
      />
      {JUSTICES.map((id) => (
        <Row
          key={id}
          label={id.charAt(0).toUpperCase() + id.slice(1)}
          state={
            done.has(id)
              ? "done"
              : runningJustice === id
                ? "running"
                : "pending"
          }
        />
      ))}
      <Row
        label="Coalition"
        state={
          hasCoalition ? "done" : completedJustices.length === 9 ? "running" : "pending"
        }
      />
      <Row
        label="Verdict"
        state={
          hasVerdict ? "done" : hasCoalition ? "running" : "pending"
        }
      />
      <Row
        label="Markets"
        state={
          hasMarket ? "done" : hasVerdict ? "running" : "pending"
        }
      />
    </div>
  );
}
