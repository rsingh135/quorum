export default function AskLoading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 shell:px-10">
      <div className="h-10 w-48 animate-shimmer rounded-xs bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
      <div className="mt-8 h-32 w-full animate-shimmer rounded-xs bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]" />
    </div>
  );
}
