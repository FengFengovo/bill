import { ReactNode } from "react";
import { BottomNav } from "@/components/bottom-nav";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">{children}</div>
      <BottomNav />
    </div>
  );
}
