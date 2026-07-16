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
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle";

interface VehicleFormProps {
  defaultValues?: Partial<VehicleInput>;
  onSubmit: (data: VehicleInput) => Promise<void>;
  loading?: boolean;
}

const typeOptions = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
  { value: "other", label: "Other" },
];

const fuelOptions = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "cng", label: "CNG" },
  { value: "electric", label: "Electric" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "on_trip", label: "On Trip" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

export function VehicleForm({ defaultValues, onSubmit, loading }: VehicleFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_number: "",
      vehicle_type: "sedan",
      brand_model: "",
      seating_capacity: 4,
      fuel_type: "petrol",
      insurance_expiry: "",
      permit_expiry: "",
      rc_number: "",
      fitness_expiry: "",
      status: "available",
      ...defaultValues,
    },
  });

  const isBusy = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="vehicle_number" className="text-sm font-medium">
            Vehicle Number <span className="text-destructive">*</span>
          </label>
          <Input id="vehicle_number" placeholder="KA-01-AB-1234" {...register("vehicle_number")} />
          {errors.vehicle_number && (
            <p className="text-xs text-destructive">{errors.vehicle_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="brand_model" className="text-sm font-medium">
            Brand / Model <span className="text-destructive">*</span>
          </label>
          <Input id="brand_model" placeholder="Toyota Innova" {...register("brand_model")} />
          {errors.brand_model && (
            <p className="text-xs text-destructive">{errors.brand_model.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="vehicle_type" className="text-sm font-medium">
            Vehicle Type
          </label>
          <Controller
            name="vehicle_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
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
          <label htmlFor="fuel_type" className="text-sm font-medium">
            Fuel Type
          </label>
          <Controller
            name="fuel_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel" />
                </SelectTrigger>
                <SelectContent>
                  {fuelOptions.map((opt) => (
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
          <label htmlFor="seating_capacity" className="text-sm font-medium">
            Seating Capacity
          </label>
          <Input
            id="seating_capacity"
            type="number"
            min={1}
            {...register("seating_capacity", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="insurance_expiry" className="text-sm font-medium">
            Insurance Expiry <span className="text-destructive">*</span>
          </label>
          <Input id="insurance_expiry" type="date" {...register("insurance_expiry")} />
          {errors.insurance_expiry && (
            <p className="text-xs text-destructive">{errors.insurance_expiry.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="permit_expiry" className="text-sm font-medium">
            Permit Expiry
          </label>
          <Input id="permit_expiry" type="date" {...register("permit_expiry")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="fitness_expiry" className="text-sm font-medium">
            Fitness Expiry
          </label>
          <Input id="fitness_expiry" type="date" {...register("fitness_expiry")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="rc_number" className="text-sm font-medium">
            RC Number
          </label>
          <Input id="rc_number" placeholder="Registration certificate number" {...register("rc_number")} />
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
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}
