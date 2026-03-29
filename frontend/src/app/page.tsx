import { CaseCard } from "@/components/ui/CaseCard";
import { JusticeCard } from "@/components/ui/JusticeCard";
import { LoadingDeliberation } from "@/components/ui/LoadingDeliberation";
import { MarketTickerRow } from "@/components/ui/MarketTickerRow";
import { ProbabilityMeter } from "@/components/ui/ProbabilityMeter";

export default function Home() {
  return (
    <div className="flex flex-1">
      <aside className="w-[240px] border-r border-[var(--divider)] bg-[rgba(10,10,15,0.7)] px-4 py-6">
        <div className="font-heading text-[18px] tracking-[0.18em] text-gold">
          SCOTUS ALPHA
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
          DESIGN SYSTEM · PHASE 1
        </div>
        <div className="mt-6 space-y-2">
          <div className="rounded-xs border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] tracking-[0.14em] text-ink-muted">
            FEED
          </div>
          <div className="rounded-xs border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] tracking-[0.14em] text-ink-muted">
            ANALYZE
          </div>
          <div className="rounded-xs border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] tracking-[0.14em] text-ink-muted">
            PORTFOLIO
          </div>
          <div className="rounded-xs border border-white/10 bg-white/5 px-3 py-2 font-mono text-[11px] tracking-[0.14em] text-ink-muted">
            ASK THE BENCH
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-10 py-8">
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-8">
          <div>
            <div className="font-heading text-[26px] tracking-[0.12em] text-gold">
              JUDICIAL INTELLIGENCE
            </div>
            <div className="mt-2 max-w-[62ch] font-body text-[13px] leading-6 text-ink-muted">
              Phase 1 scaffold: palette, typography, background texture, and core
              UI primitives.
            </div>

            <div className="mt-6">
              <ProbabilityMeter probabilityAffirm={0.62} />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <CaseCard
                docket="24-123"
                name="Example v. Respondent"
                probabilityAffirm={0.62}
                marketImpactLevel="HIGH"
                sector="biotech"
                swingJustice="Roberts"
              />
              <CaseCard
                docket="24-221"
                name="State v. Agency"
                probabilityAffirm={0.41}
                marketImpactLevel="MEDIUM"
                sector="energy"
                swingJustice="Kavanaugh"
              />
            </div>
          </div>

          <div className="space-y-4">
            <LoadingDeliberation />

            <div className="rounded-xs border border-[var(--divider)] bg-[rgba(10,10,15,0.55)] p-4">
              <div className="font-mono text-[11px] tracking-[0.16em] text-ink-faint">
                MARKET TICKERS
              </div>
              <div className="mt-3 space-y-2">
                <MarketTickerRow
                  ticker="PFE"
                  direction="DOWN"
                  comparableMove="-3.8% / 30D"
                />
                <MarketTickerRow
                  ticker="MRNA"
                  direction="UP"
                  comparableMove="+6.1% / 30D"
                />
                <MarketTickerRow
                  ticker="JNJ"
                  direction="FLAT"
                  comparableMove="+0.4% / 30D"
                />
              </div>
            </div>

            <JusticeCard
              name="John G. Roberts Jr."
              title="Chief Justice"
              vote="AFFIRM"
              confidence={0.62}
              keyConcern="Whether the Court can resolve the dispute on statutory grounds without broad constitutional holdings."
              primaryReasoning="Institutional legitimacy and narrow tailoring favor affirmance; the lower court’s approach minimizes collateral disruption while honoring settled expectations."
              analogousCases={[
                "NFIB v. Sebelius (2012)",
                "West Virginia v. EPA (2022)",
              ]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
