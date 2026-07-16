import { getCurrentUser } from "@/lib/auth-server";
import { DashboardShell } from "./_components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
