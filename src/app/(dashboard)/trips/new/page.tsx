import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getDriverOptions, getVehicleOptions } from "@/lib/actions/trips";
import { CreateTripForm } from "../_components/create-trip-form";

export const metadata: Metadata = {
  title: "New Trip",
};

export default async function NewTripPage() {
  const [{ data: drivers }, { data: vehicles }] = await Promise.all([
    getDriverOptions(),
    getVehicleOptions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Trip" description="Create a new trip booking" />

      <Card>
        <CardContent className="pt-6">
          <CreateTripForm
            driverOptions={drivers ?? []}
            vehicleOptions={vehicles ?? []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
