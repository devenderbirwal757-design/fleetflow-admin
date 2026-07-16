import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ROUTES } from "@/config/routes";
import type { Role } from "@/types/auth";

const protectedPaths = [
  ROUTES.dashboard.home,
  ROUTES.dashboard.trips,
  ROUTES.dashboard.drivers,
  ROUTES.dashboard.vehicles,
  ROUTES.dashboard.expenses,
  ROUTES.dashboard.reports,
  ROUTES.dashboard.settings,
];

const roleRestrictedPaths: { path: string; allowedRoles: Role[] }[] = [
  { path: "/settings", allowedRoles: ["SUPER_ADMIN"] },
  { path: "/reports", allowedRoles: ["SUPER_ADMIN"] },
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage =
    pathname.startsWith(ROUTES.auth.login) || pathname.startsWith("/register");

  if (!user && isProtected) {
    const url = new URL(ROUTES.auth.login, request.url);
    url.searchParams.set("redirect", pathname);
    return Response.redirect(url);
  }

  if (user && isAuthPage) {
    const url = new URL(ROUTES.dashboard.home, request.url);
    return Response.redirect(url);
  }

  const role = user?.user_metadata?.role as Role | undefined;

  if (user && role) {
    for (const { path, allowedRoles } of roleRestrictedPaths) {
      if (pathname.startsWith(path) && !allowedRoles.includes(role)) {
        const url = new URL(ROUTES.dashboard.home, request.url);
        return Response.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
