"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { tripSchema, type TripInput } from "@/lib/validations/trip";

interface TripFormProps {
  driverOptions: { id: string; name: string }[];
  vehicleOptions: { id: string; vehicle_number: string; brand_model: string }[];
  defaultValues?: Partial<TripInput>;
  onSubmit: (data: TripInput) => Promise<void>;
  loading?: boolean;
}

const tripTypeOptions = [
  { value: "one_way", label: "One Way" },
  { value: "round_trip", label: "Round Trip" },
  { value: "airport", label: "Airport" },
  { value: "rental", label: "Rental" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "started", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TripForm({
  driverOptions,
  vehicleOptions,
  defaultValues,
  onSubmit,
  loading,
}: TripFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripInput>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      pickup_location: "",
      drop_location: "",
      trip_date: new Date().toISOString().split("T")[0],
      trip_time: "",
      trip_type: "one_way",
      driver_id: "",
      vehicle_id: "",
      status: "pending",
      total_amount: "",
      advance_amount: "0",
      notes: "",
      special_requirements: "",
      ...defaultValues,
    },
  });

  const isBusy = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="customer_name" className="text-sm font-medium">
            Customer Name <span className="text-destructive">*</span>
          </label>
          <Input id="customer_name" placeholder="Full name" {...register("customer_name")} />
          {errors.customer_name && (
            <p className="text-xs text-destructive">{errors.customer_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="customer_phone" className="text-sm font-medium">
            Customer Phone <span className="text-destructive">*</span>
          </label>
          <Input id="customer_phone" placeholder="+91 98765 43210" {...register("customer_phone")} />
          {errors.customer_phone && (
            <p className="text-xs text-destructive">{errors.customer_phone.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="pickup_location" className="text-sm font-medium">
            Pickup Location <span className="text-destructive">*</span>
          </label>
          <Input id="pickup_location" placeholder="Full address" {...register("pickup_location")} />
          {errors.pickup_location && (
            <p className="text-xs text-destructive">{errors.pickup_location.message}</p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="drop_location" className="text-sm font-medium">
            Drop Location <span className="text-destructive">*</span>
          </label>
          <Input id="drop_location" placeholder="Full address" {...register("drop_location")} />
          {errors.drop_location && (
            <p className="text-xs text-destructive">{errors.drop_location.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="trip_date" className="text-sm font-medium">
            Trip Date <span className="text-destructive">*</span>
          </label>
          <Input id="trip_date" type="date" {...register("trip_date")} />
          {errors.trip_date && (
            <p className="text-xs text-destructive">{errors.trip_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="trip_time" className="text-sm font-medium">
            Trip Time
          </label>
          <Input id="trip_time" type="time" {...register("trip_time")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="trip_type" className="text-sm font-medium">
            Trip Type
          </label>
          <Controller
            name="trip_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {tripTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="driver_id" className="text-sm font-medium">
            Assign Driver
          </label>
          <Controller
            name="driver_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {driverOptions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="vehicle_id" className="text-sm font-medium">
            Assign Vehicle
          </label>
          <Controller
            name="vehicle_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {vehicleOptions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_number} - {v.brand_model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="total_amount" className="text-sm font-medium">
            Total Amount
          </label>
          <Input
            id="total_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("total_amount")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="advance_amount" className="text-sm font-medium">
            Advance Amount
          </label>
          <Input
            id="advance_amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("advance_amount")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes
          </label>
          <Input id="notes" placeholder="Additional notes..." {...register("notes")} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="special_requirements" className="text-sm font-medium">
            Special Requirements
          </label>
          <Input
            id="special_requirements"
            placeholder="Special requests or requirements..."
            {...register("special_requirements")}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  );
}
