"use client";

export function AccountSummary() {
  return (
    <div className="flex w-full shrink-0 flex-col border-t border-txyz-border bg-txyz-panel p-4 lg:w-[260px] lg:border-l lg:border-t-0">
      <div className="font-mono text-[10px] tracking-wider text-zinc-500">
        Account value
      </div>
      <div className="mt-1 font-trade text-[28px] font-semibold tabular-nums tracking-tight text-white">
        $0.00
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          className="rounded-md border border-txyz-border bg-txyz-bg py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600"
        >
          Deposit
        </button>
        <button
          type="button"
          className="rounded-md border border-txyz-border bg-txyz-bg py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600"
        >
          Transfer
        </button>
        <button
          type="button"
          className="rounded-md border border-txyz-border bg-txyz-bg py-1.5 text-[11px] text-zinc-300 hover:border-zinc-600"
        >
          Withdraw
        </button>
      </div>
      <div className="mt-5 space-y-2 border-t border-txyz-border pt-4 font-mono text-[11px]">
        {[
          ["Spot", "$0.00"],
          ["Perps (xyz)", "$0.00"],
          ["Perps (H)", "$0.00"],
          ["Vaults", "$0.00"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-zinc-500">
            <span>{k}</span>
            <span className="tabular-nums text-zinc-300">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
