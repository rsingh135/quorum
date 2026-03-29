"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const JUSTICE_INITIALS = ["T", "A", "S", "K", "G", "K", "B", "J", "R"];

export function LoadingDeliberation({ className }: { className?: string }) {
  const [completeCount, setCompleteCount] = React.useState(0);

  React.useEffect(() => {
    setCompleteCount(0);
    const t = setInterval(() => {
      setCompleteCount((c) => (c >= JUSTICE_INITIALS.length ? c : c + 1));
    }, 320);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        "rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.55)] p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="font-heading text-[18px] tracking-[0.12em] text-gold">
            THE BENCH IS DELIBERATING...
          </div>
          <div className="mt-2 font-mono text-[11px] tracking-[0.16em] text-ink-faint">
            PARALLEL ANALYSIS · NINE CHAMBERS
          </div>
        </div>

        <div className="flex items-center gap-2">
          {JUSTICE_INITIALS.map((ch, i) => {
            const done = i < completeCount;
            return (
              <motion.div
                key={`${ch}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.25, delay: i * 0.08 },
                }}
                className={cn(
                  "relative grid h-10 w-10 place-items-center rounded-full border",
                  done
                    ? "border-gold/50 bg-gold/10"
                    : "border-white/10 bg-white/5",
                )}
              >
                <span className="font-mono text-[12px] tracking-[0.12em] text-ink">
                  {ch}
                </span>
                <motion.span
                  className={cn(
                    "absolute -bottom-1 h-[6px] w-[6px] rounded-full",
                    done ? "bg-gold" : "bg-white/20",
                  )}
                  animate={
                    done
                      ? { opacity: [0.35, 1, 0.35], scale: [1, 1.25, 1] }
                      : { opacity: 0.15, scale: 1 }
                  }
                  transition={
                    done
                      ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.2 }
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 h-[1px] w-full bg-[var(--divider)]" />

      <div className="mt-4 font-body text-[12px] leading-6 text-ink-muted">
        Signals are being reconciled against precedent. Confidence bands will
        stabilize as each chamber returns.
      </div>
    </div>
  );
}

