"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "FEED" },
  { href: "/case/24-983", label: "ANALYZE" },
  { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/ask", label: "ASK THE BENCH" },
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
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-white/10 bg-white/5 text-ink-muted hover:border-gold/30 hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

function TopBar() {
  const [now, setNow] = React.useState<string>("");
  React.useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date());
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--divider)] bg-[rgba(10,10,15,0.55)] px-6">
      <div className="flex items-center gap-3">
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-reverse opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-reverse" />
        </span>
        <span className="font-mono text-[11px] tracking-[0.18em] text-reverse">
          LIVE TERM
        </span>
      </div>
      <div className="font-mono text-[11px] tracking-[0.12em] text-ink-muted">
        {now || "—"}
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="shell:flex hidden w-[240px] shrink-0 flex-col border-r border-[var(--divider)] bg-[rgba(10,10,15,0.85)] px-4 py-6">
        <div className="font-heading text-[18px] tracking-[0.18em] text-gold">
          QUORUM
        </div>
        <div className="mt-2 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
          CURRENT TERM · OT 2025
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <aside className="shell:hidden flex w-14 shrink-0 flex-col items-center border-r border-[var(--divider)] bg-[rgba(10,10,15,0.9)] py-4">
        <div className="font-heading text-[11px] tracking-[0.2em] text-gold [writing-mode:vertical-rl]">
          QUORUM
        </div>
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
