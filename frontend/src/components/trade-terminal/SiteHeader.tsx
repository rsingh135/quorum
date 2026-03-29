"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { TickerTape } from "./TickerTape";

const MAIN_NAV = [
  { href: "/", label: "Trade" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/ask", label: "Bounds" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="flex shrink-0 flex-col border-b border-txyz-border bg-txyz-bg">
      <div className="flex h-12 items-stretch gap-0 px-2 md:px-3">
        <div className="flex shrink-0 items-center gap-6 pr-3">
          <Link href="/" className="group flex items-baseline gap-0.5 pl-2 font-trade text-[15px] font-semibold tracking-tight text-white">
            <span>trade</span>
            <span className="text-[13px] font-normal text-zinc-400 group-hover:text-txyz-up">
              [xyz]
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {MAIN_NAV.map((n) => {
              const active =
                n.href === "/"
                  ? pathname === "/" || pathname.startsWith("/case/")
                  : pathname === n.href || pathname.startsWith(`${n.href}/`);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-txyz-panel2 text-white"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <TickerTape />

        <div className="flex shrink-0 items-center gap-1 border-l border-txyz-border pl-2 md:gap-2 md:pl-3">
          <button
            type="button"
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-md text-zinc-400 hover:bg-txyz-panel2 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-md text-zinc-400 hover:bg-txyz-panel2 hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-txyz-down" />
          </button>
          <button
            type="button"
            className="hidden h-9 shrink-0 items-center rounded-md bg-txyz-up px-3 text-[13px] font-semibold text-black sm:flex"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
