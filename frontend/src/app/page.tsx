import { CaseFeed } from "@/components/feed/CaseFeed";

export default function Home({
  searchParams,
}: {
  searchParams: { market?: string };
}) {
  return (
    <main className="px-4 py-6 shell:px-8">
      <CaseFeed marketLens={searchParams.market} />
    </main>
  );
}
