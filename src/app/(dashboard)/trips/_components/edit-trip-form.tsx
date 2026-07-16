"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TripForm } from "./trip-form";
import { updateTrip } from "@/lib/actions/trips";
import type { TripInput } from "@/lib/validations/trip";

interface EditTripFormProps {
  trip: {
    id: string;
    customer_name: string;
    customer_phone: string;
    pickup_location: string;
    drop_location: string;
    trip_date: string;
    trip_time: string | null;
    trip_type: string;
    driver_id: string | null;
    vehicle_id: string | null;
    status: string;
    total_amount: number | null;
    advance_amount: number;
    notes: string | null;
    special_requirements: string | null;
  };
  driverOptions: { id: string; name: string }[];
  vehicleOptions: { id: string; vehicle_number: string; brand_model: string }[];
}

export function EditTripForm({ trip, driverOptions, vehicleOptions }: EditTripFormProps) {
  const router = useRouter();

  async function handleSubmit(data: TripInput) {
    const { error } = await updateTrip(trip.id, data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Trip updated successfully");
    router.push("/trips");
    router.refresh();
  }

  return (
    <TripForm
      driverOptions={driverOptions}
      vehicleOptions={vehicleOptions}
      defaultValues={{
        customer_name: trip.customer_name,
        customer_phone: trip.customer_phone,
        pickup_location: trip.pickup_location,
        drop_location: trip.drop_location,
        trip_date: trip.trip_date,
        trip_time: trip.trip_time ?? "",
        trip_type: trip.trip_type as TripInput["trip_type"],
        driver_id: trip.driver_id ?? "",
        vehicle_id: trip.vehicle_id ?? "",
        status: trip.status as TripInput["status"],
        total_amount: trip.total_amount?.toString() ?? "",
        advance_amount: trip.advance_amount.toString(),
        notes: trip.notes ?? "",
        special_requirements: trip.special_requirements ?? "",
      }}
      onSubmit={handleSubmit}
    />
  );
}
