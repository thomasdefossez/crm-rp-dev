import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}