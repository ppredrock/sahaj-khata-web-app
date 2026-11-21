"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  BookOpen,
  Users,
  FileBarChart,
  Settings,
  PlusCircle,
  Store,
} from "lucide-react";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", hindi: "डैशबोर्ड", icon: Store },
  { href: "/galla", label: "Galla (Cash)", hindi: "गल्ला", icon: Wallet },
  { href: "/udhar", label: "Udhar (Khata)", hindi: "उधार", icon: BookOpen },
  { href: "/contacts", label: "Parties", hindi: "पार्टी", icon: Users },
  { href: "/reports", label: "Reports", hindi: "रिपोर्ट्स", icon: FileBarChart },
  { href: "/settings", label: "Settings", hindi: "सेटिंग्स", icon: Settings },
];

export function Navbar({ storeName = "Sahaj Kirana Store" }: { storeName?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-sm transition-transform group-hover:scale-105">
              ₹
            </div>
            <div>
              <div className="font-bold tracking-tight text-foreground flex items-center gap-1.5 leading-none">
                <span>सहज खाता</span>
                <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
                  • Sahaj Khata
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px] sm:max-w-[240px]">
                {storeName}
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
