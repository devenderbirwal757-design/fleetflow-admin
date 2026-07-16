import { z } from "zod";

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[\d\s-()]{7,15}$/, "Invalid phone number"),
  license_number: z.string().min(1, "License number is required"),
  license_expiry: z.string().min(1, "License expiry is required"),
  address: z.string().max(500).optional().nullable(),
  joining_date: z.string().optional(),
  salary_type: z.enum(["fixed", "per_trip", "percentage"]).optional(),
  status: z.enum(["available", "on_trip", "off_duty", "inactive"]).optional(),
});

export type DriverInput = z.infer<typeof driverSchema>;

export const driverStatusSchema = z.enum([
  "available",
  "on_trip",
  "off_duty",
  "inactive",
]);

export type DriverStatus = z.infer<typeof driverStatusSchema>;
