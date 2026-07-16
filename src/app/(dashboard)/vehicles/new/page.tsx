import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CreateVehicleForm } from "../_components/create-vehicle-form";

export const metadata: Metadata = {
  title: "Add Vehicle",
};

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Vehicle" description="Register a new vehicle" />

      <Card>
        <CardContent className="pt-6">
          <CreateVehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}
