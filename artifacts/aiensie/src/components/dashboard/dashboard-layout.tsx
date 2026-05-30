import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
