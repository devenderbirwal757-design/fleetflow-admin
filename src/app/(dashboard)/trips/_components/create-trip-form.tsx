"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TripForm } from "./trip-form";
import { createTrip } from "@/lib/actions/trips";
import type { TripInput } from "@/lib/validations/trip";

interface CreateTripFormProps {
  driverOptions: { id: string; name: string }[];
  vehicleOptions: { id: string; vehicle_number: string; brand_model: string }[];
}

export function CreateTripForm({ driverOptions, vehicleOptions }: CreateTripFormProps) {
  const router = useRouter();

  async function handleSubmit(data: TripInput) {
    const { error } = await createTrip(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Trip created successfully");
    router.push("/trips");
    router.refresh();
  }

  return (
    <TripForm
      driverOptions={driverOptions}
      vehicleOptions={vehicleOptions}
      onSubmit={handleSubmit}
    />
  );
}
