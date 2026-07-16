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
import { driverSchema, type DriverInput } from "@/lib/validations/driver";

interface DriverFormProps {
  defaultValues?: Partial<DriverInput>;
  onSubmit: (data: DriverInput) => Promise<void>;
  loading?: boolean;
}

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "on_trip", label: "On Trip" },
  { value: "off_duty", label: "Off Duty" },
  { value: "inactive", label: "Inactive" },
];

const salaryOptions = [
  { value: "fixed", label: "Fixed" },
  { value: "per_trip", label: "Per Trip" },
  { value: "percentage", label: "Percentage" },
];

export function DriverForm({ defaultValues, onSubmit, loading }: DriverFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriverInput>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      phone: "",
      license_number: "",
      license_expiry: "",
      address: "",
      joining_date: new Date().toISOString().split("T")[0],
      salary_type: "per_trip",
      status: "available",
      ...defaultValues,
    },
  });

  const isBusy = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </label>
          <Input id="name" placeholder="Driver name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone <span className="text-destructive">*</span>
          </label>
          <Input id="phone" placeholder="+91 98765 43210" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="license_number" className="text-sm font-medium">
            License Number <span className="text-destructive">*</span>
          </label>
          <Input id="license_number" placeholder="DL-123456789" {...register("license_number")} />
          {errors.license_number && (
            <p className="text-xs text-destructive">{errors.license_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="license_expiry" className="text-sm font-medium">
            License Expiry <span className="text-destructive">*</span>
          </label>
          <Input id="license_expiry" type="date" {...register("license_expiry")} />
          {errors.license_expiry && (
            <p className="text-xs text-destructive">{errors.license_expiry.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="joining_date" className="text-sm font-medium">
            Joining Date
          </label>
          <Input id="joining_date" type="date" {...register("joining_date")} />
        </div>

        <div className="space-y-2">
          <label htmlFor="salary_type" className="text-sm font-medium">
            Salary Type
          </label>
          <Controller
            name="salary_type"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {salaryOptions.map((opt) => (
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
              <Select
                value={field.value}
                onValueChange={(val) => field.onChange(val)}
              >
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

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="address" className="text-sm font-medium">
            Address
          </label>
          <Input id="address" placeholder="Full address" {...register("address")} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Driver" : "Add Driver"}
        </Button>
      </div>
    </form>
  );
}
