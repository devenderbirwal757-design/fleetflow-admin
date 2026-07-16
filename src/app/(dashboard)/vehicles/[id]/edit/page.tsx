import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getVehicle } from "@/lib/actions/vehicles";
import { EditVehicleForm } from "./_components/edit-vehicle-form";

export const metadata: Metadata = {
  title: "Edit Vehicle",
};

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: vehicle } = await getVehicle(id);

  if (!vehicle) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Vehicle" description={`Updating ${vehicle.vehicle_number}`} />

      <Card>
        <CardContent className="pt-6">
          <EditVehicleForm vehicle={vehicle} />
        </CardContent>
      </Card>
    </div>
  );
}
