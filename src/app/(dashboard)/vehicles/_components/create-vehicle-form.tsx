"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VehicleForm } from "./vehicle-form";
import { createVehicle } from "@/lib/actions/vehicles";
import type { VehicleInput } from "@/lib/validations/vehicle";

export function CreateVehicleForm() {
  const router = useRouter();

  async function handleSubmit(data: VehicleInput) {
    const { error } = await createVehicle(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Vehicle added successfully");
    router.push("/vehicles");
    router.refresh();
  }

  return <VehicleForm onSubmit={handleSubmit} />;
}
