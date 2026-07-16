import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RoleGuard } from "@/components/shared/role-guard";
import { getReportData } from "@/lib/actions/reports";
import { ReportsClient } from "./_components/reports-client";
import { ROLES } from "@/types/auth";

export const metadata: Metadata = {
  title: "Reports",
};

function getDateRange(searchParams: URLSearchParams): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  if (searchParams.has("startDate") && searchParams.has("endDate")) {
    return {
      start: searchParams.get("startDate")!,
      end: searchParams.get("endDate")!,
    };
  }

  start.setDate(start.getDate() - 30);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  if (params.startDate) sp.set("startDate", params.startDate);
  if (params.endDate) sp.set("endDate", params.endDate);

  const { start, end } = getDateRange(sp);
  const { data } = await getReportData(start, end);

  return (
    <RoleGuard
      allowedRoles={[ROLES.SUPER_ADMIN]}
      fallback={
        <div className="space-y-6">
          <PageHeader title="Reports" description="Daily, monthly, and custom reports" />
          <div className="flex items-center justify-center rounded-lg border py-12">
            <p className="text-sm text-muted-foreground">
              Only Super Admins can access reports.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader title="Reports" description="Daily, monthly, and custom reports" />

        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          }
        >
          <ReportsClient
            initialData={
              data ?? {
                trips: { total: 0, byStatus: {}, completed: 0, cancelled: 0, revenue: 0 },
                expenses: { total: 0, byCategory: {}, count: 0 },
                payments: { total: 0, paid: 0, pending: 0 },
                fleet: { totalDrivers: 0, activeDrivers: 0, totalVehicles: 0, availableVehicles: 0 },
              }
            }
            startDate={start}
            endDate={end}
          />
        </Suspense>
      </div>
    </RoleGuard>
  );
}
