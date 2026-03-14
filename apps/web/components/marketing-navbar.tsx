"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Mountain } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/community", label: "Community" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNavbar() {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Mountain className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight">
              The Mind Point
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-muted-foreground hover:text-foreground text-sm transition-colors",
                pathname === l.href && "text-foreground font-medium",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex">
          <Button asChild>
            <Link href="/courses">Explore Courses</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center gap-2">
                <Mountain className="h-5 w-5" />
                <span className="text-sm font-semibold">The Mind Point</span>
              </div>
              <nav className="mt-6 grid gap-3">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm",
                      pathname === l.href && "bg-accent text-accent-foreground",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
