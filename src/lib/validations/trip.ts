import { z } from "zod";

export const tripSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[\d\s-()]{7,15}$/, "Invalid phone number"),
  pickup_location: z.string().min(1, "Pickup location is required"),
  drop_location: z.string().min(1, "Drop location is required"),
  trip_date: z.string().min(1, "Trip date is required"),
  trip_time: z.string().optional().nullable(),
  trip_type: z.enum(["one_way", "round_trip", "airport", "rental"]).optional(),
  driver_id: z.string().optional().nullable(),
  vehicle_id: z.string().optional().nullable(),
  status: z
    .enum(["pending", "assigned", "started", "completed", "cancelled"])
    .optional(),
  total_amount: z.string().optional().nullable(),
  advance_amount: z.string().optional(),
  notes: z.string().optional().nullable(),
  special_requirements: z.string().optional().nullable(),
});

export type TripInput = z.infer<typeof tripSchema>;

export const tripStatusSchema = z.enum([
  "pending",
  "assigned",
  "started",
  "completed",
  "cancelled",
]);

export type TripStatus = z.infer<typeof tripStatusSchema>;
