import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getTrip, getDriverOptions, getVehicleOptions } from "@/lib/actions/trips";
import { EditTripForm } from "../../_components/edit-trip-form";

export const metadata: Metadata = {
  title: "Edit Trip",
};

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: trip }, { data: drivers }, { data: vehicles }] = await Promise.all([
    getTrip(id),
    getDriverOptions(),
    getVehicleOptions(),
  ]);

  if (!trip) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Trip"
        description={`Updating trip for ${trip.customer_name}`}
      />

      <Card>
        <CardContent className="pt-6">
          <EditTripForm
            trip={trip}
            driverOptions={drivers ?? []}
            vehicleOptions={vehicles ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
