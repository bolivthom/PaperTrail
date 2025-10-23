import { Outlet, redirect, useLoaderData } from "@remix-run/react";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { Header } from "~/components/header";
import { getUserFromRequest } from "~/lib/user";

export async function loader({ request}: any) {
  const { user } = await getUserFromRequest(request);
  if(!user) return redirect('/');
  return { };
}

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