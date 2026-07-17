"use client";

import type { User } from "@supabase/supabase-js";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { UserProvider } from "@/hooks/use-user";
import { MobileSidebar } from "./MobileSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

export function DashboardShell({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col">
          <MobileSidebar />
          <DashboardNavbar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
