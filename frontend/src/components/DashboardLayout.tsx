import { CustomSidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row w-full h-screen bg-black overflow-hidden selection:bg-teal-500/30">
            <CustomSidebar />
            <main className="flex-1 overflow-y-auto h-screen relative w-full">
                {children}
            </main>
        </div>
    );
}
