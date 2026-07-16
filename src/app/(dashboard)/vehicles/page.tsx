import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/supabase/server";
import { getVehicles } from "@/lib/actions/vehicles";
import { VehicleTable } from "./_components/vehicle-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vehicles",
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || "all";
  const search = params.search || "";

  const supabase = await createClient();
  const [{ data: vehicles, totalPages }, { data: activeTripVehicles }] = await Promise.all([
    getVehicles({ page, status, search }),
    supabase.from("trips").select("vehicle_id").in("status", ["assigned", "started"]).not("vehicle_id", "is", null),
  ]);

  const lockedVehicleIds = new Set(activeTripVehicles?.map((t) => t.vehicle_id).filter(Boolean) as string[]);

  return (
    <div className="space-y-6">
      <PageHeader title="Vehicles" description="Manage vehicle fleet and availability">
        <Link
          href="/vehicles/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </PageHeader>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <VehicleTable vehicles={vehicles ?? []} currentPage={page} totalPages={totalPages} lockedIds={lockedVehicleIds} />
      </Suspense>
    </div>
  );
}
