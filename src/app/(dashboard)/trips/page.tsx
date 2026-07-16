import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getTrips } from "@/lib/actions/trips";
import { TripTable } from "./_components/trip-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trips",
};

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || "all";
  const search = params.search || "";

  const { data: trips, totalPages } = await getTrips({
    page,
    status,
    search,
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Trips" description="Manage passenger trip bookings">
        <Link
          href="/trips/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Link>
      </PageHeader>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <TripTable trips={trips ?? []} currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
