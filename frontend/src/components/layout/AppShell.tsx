"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "MARKETS" },
  { href: "/case/24-983", label: "CHART" },
  { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/ask", label: "AGENTS" },
] as const;

function NavLink({
  href,
  children,
  narrow,
}: {
  href: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xs border px-3 py-2 font-mono text-[11px] tracking-[0.14em] transition-colors",
        narrow && "px-2 text-center text-[10px]",
        active
          ? "border-terminal-up/45 bg-terminal-up/10 text-terminal-up"
          : "border-terminal-line bg-black/30 text-ink-muted hover:border-terminal-up/25 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function MarketStrip() {
  const pathname = usePathname();
  const params = useSearchParams();
  const sp500Lens = pathname === "/" && params.get("market")?.toUpperCase() === "SP500";

  if (pathname !== "/") {
    return (
      <div className="border-l border-terminal-line pl-4 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
        DOCKET TERMINAL
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 border-l border-terminal-line pl-4">
      <Link
        href="/"
        className={cn(
          "rounded-xs border px-3 py-1 font-mono text-[10px] tracking-[0.2em] transition-colors",
          !sp500Lens
            ? "border-terminal-up/50 bg-terminal-up/15 text-terminal-up"
            : "border-transparent text-ink-faint hover:text-ink-muted",
        )}
      >
        SCOTUS
      </Link>
      <Link
        href="/?market=SP500"
        className={cn(
          "rounded-xs border px-3 py-1 font-mono text-[10px] tracking-[0.2em] transition-colors",
          sp500Lens
            ? "border-terminal-up/50 bg-terminal-up/15 text-terminal-up"
            : "border-transparent text-ink-faint hover:text-ink-muted",
        )}
      >
        SP500
      </Link>
    </div>
  );
}

function TopBar() {
  const [now, setNow] = React.useState<string>("");
  React.useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "America/New_York",
      }).format(new Date());
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-terminal-line bg-terminal-panel px-4 backdrop-blur-sm">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terminal-up opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-terminal-up" />
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-terminal-up sm:inline">
            STREAM
          </span>
        </div>
        <Suspense
          fallback={
            <div className="h-6 w-40 animate-pulse rounded-xs border border-terminal-line bg-black/20" />
          }
        >
          <MarketStrip />
        </Suspense>
        <div className="hidden font-mono text-[10px] text-ink-faint lg:block">
          <span className="text-ink-muted">trade.xyz–style lens</span>
          <span className="mx-2 text-terminal-line">|</span>
          <span>SCOTUS perp terminal (UI sim)</span>
        </div>
      </div>
      <div className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-ink-muted">
        ET {now || "—"}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="trade-terminal-root flex min-h-screen">
      <aside className="shell:flex hidden w-[220px] shrink-0 flex-col border-r border-terminal-line bg-terminal-panel/95 px-3 py-5 backdrop-blur-sm">
        <Link href="/" className="block">
          <div className="font-mono text-[11px] font-semibold tracking-[0.28em] text-terminal-up">
            QUORUM
          </div>
          <div className="mt-1 font-mono text-[9px] tracking-[0.18em] text-ink-faint">
            SCOTUS · MARKET LENS
          </div>
        </Link>
        <nav className="mt-8 flex flex-col gap-1.5">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8 font-mono text-[9px] leading-relaxed tracking-[0.12em] text-ink-faint">
          Eval-first: log traces, Sharpe-style risk bands, and implied sector
          moves — per hackathon playbook.
        </div>
      </aside>

      <aside className="shell:hidden flex w-12 shrink-0 flex-col items-center border-r border-terminal-line bg-terminal-panel py-4">
        <Link
          href="/"
          className="font-mono text-[9px] tracking-[0.2em] text-terminal-up [writing-mode:vertical-rl]"
        >
          QUORUM
        </Link>
        <nav className="mt-6 flex flex-col gap-2">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} narrow>
              {item.label.slice(0, 1)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
