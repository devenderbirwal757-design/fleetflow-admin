import { z } from "zod";

export const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, "Vehicle number is required"),
  vehicle_type: z.enum(["sedan", "suv", "hatchback", "van", "bus", "other"]).optional(),
  brand_model: z.string().min(1, "Brand/model is required"),
  seating_capacity: z.number().int().min(1).optional(),
  fuel_type: z.enum(["petrol", "diesel", "cng", "electric", "other"]).optional(),
  insurance_expiry: z.string().min(1, "Insurance expiry is required"),
  permit_expiry: z.string().optional().nullable(),
  rc_number: z.string().optional().nullable(),
  fitness_expiry: z.string().optional().nullable(),
  status: z.enum(["available", "on_trip", "maintenance", "inactive"]).optional(),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export const vehicleStatusSchema = z.enum([
  "available",
  "on_trip",
  "maintenance",
  "inactive",
]);

export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
