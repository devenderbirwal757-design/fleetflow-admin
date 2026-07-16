"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VehicleForm } from "@/app/(dashboard)/vehicles/_components/vehicle-form";
import { updateVehicle } from "@/lib/actions/vehicles";
import type { VehicleInput } from "@/lib/validations/vehicle";
import type { Database } from "@/types/database";

type VehicleRow = Database["public"]["Tables"]["vehicles"]["Row"];

interface EditVehicleFormProps {
  vehicle: VehicleRow;
}

export function EditVehicleForm({ vehicle }: EditVehicleFormProps) {
  const router = useRouter();

  async function handleSubmit(data: VehicleInput) {
    const { error } = await updateVehicle(vehicle.id, data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Vehicle updated successfully");
    router.push("/vehicles");
    router.refresh();
  }

  return (
    <VehicleForm
      defaultValues={{
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: vehicle.vehicle_type,
        brand_model: vehicle.brand_model,
        seating_capacity: vehicle.seating_capacity,
        fuel_type: vehicle.fuel_type,
        insurance_expiry: vehicle.insurance_expiry,
        permit_expiry: vehicle.permit_expiry ?? "",
        rc_number: vehicle.rc_number ?? "",
        fitness_expiry: vehicle.fitness_expiry ?? "",
        status: vehicle.status,
      }}
      onSubmit={handleSubmit}
    />
  );
}
