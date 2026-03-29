export default function Loading() {
  return (
    <div className="px-6 py-10 shell:px-10">
      <div className="h-10 w-64 animate-shimmer rounded-xs bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[168px] animate-shimmer rounded-xs border border-[var(--divider)] bg-gradient-to-r from-white/[0.04] via-white/[0.09] to-white/[0.04] bg-[length:200%_100%]"
          />
        ))}
      </div>
    </div>
  );
}
