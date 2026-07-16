"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { UserProvider } from "@/hooks/use-user";
import { AppSidebar } from "./AppSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

export function DashboardShell({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <UserProvider user={user}>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
          />
          <MobileSidebar />
          <div
            className="flex flex-1 flex-col transition-all duration-300 md:pl-60"
            style={{ paddingLeft: sidebarCollapsed ? "4rem" : "15rem" }}
          >
            <DashboardNavbar />
            <main className="flex-1 p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
