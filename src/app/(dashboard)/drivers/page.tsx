import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import { getDrivers } from "@/lib/actions/drivers";
import { DriverTable } from "./_components/driver-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Drivers",
};

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || "all";
  const search = params.search || "";

  const supabase = await createClient();
  const [{ data: drivers, totalPages }, { data: activeTripDrivers }] = await Promise.all([
    getDrivers({ page, status, search }),
    supabase.from("trips").select("driver_id").in("status", ["assigned", "started"]).not("driver_id", "is", null),
  ]);

  const lockedDriverIds = new Set(activeTripDrivers?.map((t) => t.driver_id).filter(Boolean) as string[]);

  return (
    <div className="space-y-6">
      <PageHeader title="Drivers" description="Manage driver database">
        <Link
          href="/drivers/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </Link>
      </PageHeader>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <DriverTable drivers={drivers ?? []} currentPage={page} totalPages={totalPages} lockedIds={lockedDriverIds} />
      </Suspense>
    </div>
  );
}
