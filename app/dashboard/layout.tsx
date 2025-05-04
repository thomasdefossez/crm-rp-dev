"use client"
import { usePathname } from "next/navigation";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();

    return (
        <main className="min-h-screen bg-white">{children}</main>
    );
}