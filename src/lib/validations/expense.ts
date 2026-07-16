import { z } from "zod";

export const expenseSchema = z.object({
  trip_id: z.string().optional().nullable(),
  category: z.enum([
    "fuel",
    "toll",
    "parking",
    "maintenance",
    "food",
    "driver_allowance",
    "other",
  ]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Amount must be positive"),
  description: z.string().optional().nullable(),
  expense_date: z.string().min(1, "Date is required"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const expenseCategoryLabels: Record<string, string> = {
  fuel: "Fuel",
  toll: "Toll",
  parking: "Parking",
  maintenance: "Maintenance",
  food: "Food",
  driver_allowance: "Driver Allowance",
  other: "Other",
} as const;
