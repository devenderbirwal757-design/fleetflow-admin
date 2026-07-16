import { getCurrentUser } from "@/lib/auth-server";
import type { Role } from "@/types/auth";
import { notFound } from "next/navigation";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const user = await getCurrentUser();
  const role = user?.user_metadata?.role as Role | undefined;

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;
    notFound();
  }

  return <>{children}</>;
}
