import DashboardNavbar from "@/components/DashboardNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardNavbar />
            <main className="min-h-screen bg-white">{children}</main>
        </>
    );
}