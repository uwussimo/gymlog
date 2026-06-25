"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, UtensilsCrossed, Dumbbell, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Sprints", icon: Clock, match: (p: string) => p === "/" || p.startsWith("/day") },
  { href: "/food", label: "Food", icon: UtensilsCrossed, match: (p: string) => p.startsWith("/food") },
  { href: "/workouts", label: "Workouts", icon: Dumbbell, match: (p: string) => p.startsWith("/workouts") },
  { href: "/health", label: "Health", icon: Activity, match: (p: string) => p.startsWith("/health") },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / top bar */}
      <header className="sticky top-0 z-30 hidden border-b bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
          <Link href="/" className="mr-4 flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
              ⏱
            </span>
            gymlog
          </Link>
          {links.map((l) => {
            const active = l.match(pathname);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {l.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map((l) => {
            const active = l.match(pathname);
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "text-primary")} />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
