import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string().min(1, "Email or phone is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export function isPhoneInput(val: string): boolean {
  return /^[\d\+\s\-\(\)]+$/.test(val) && val.replace(/[\s\-\(\)\+]/g, "").length >= 7;
}

export function cleanPhone(val: string): string {
  return val.replace(/[\s\-\(\)\+]/g, "");
}

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;
