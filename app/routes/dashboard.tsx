import { Outlet } from "@remix-run/react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { Header } from "~/components/header";

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 p-4 md:p-8">
          <Header />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}