"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, BarChart3, User } from "lucide-react";

const tabs = [
  {
    name: "首页",
    href: "/home",
    icon: Home,
  },
  {
    name: "账单",
    href: "/home/bills",
    icon: Receipt,
  },
  {
    name: "统计",
    href: "/home/stats",
    icon: BarChart3,
  },
  {
    name: "我的",
    href: "/home/profile",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""}`} />
                <span className={`text-xs ${isActive ? "font-medium" : ""}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
