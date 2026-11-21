"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, BookOpen, Users, FileBarChart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_TABS = [
  { href: "/", label: "Home", hindi: "होम", icon: Store },
  { href: "/galla", label: "Galla", hindi: "गल्ला", icon: Wallet },
  { href: "/udhar", label: "Udhar", hindi: "उधार", icon: BookOpen },
  { href: "/contacts", label: "Parties", hindi: "पार्टी", icon: Users },
  { href: "/reports", label: "Reports", hindi: "रिपोर्ट", icon: FileBarChart },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md md:hidden no-print">
      <div className="flex h-16 items-center justify-around px-2">
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-xs transition-colors",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-0.5",
                  isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                )}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
