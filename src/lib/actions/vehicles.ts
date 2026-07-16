"use server";

import { createClient } from "@/lib/supabase/server";
import { vehicleSchema, type VehicleInput } from "@/lib/validations/vehicle";
import { revalidatePath } from "next/cache";

export async function getVehicles(options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase.from("vehicles").select("*", { count: "exact" }).order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options?.search) {
      query = query.or(
        `vehicle_number.ilike.%${options.search}%,brand_model.ilike.%${options.search}%`
      );
    }

    const { data, count, error } = await query.range(start, end);
    if (error) throw error;
    return { data, count: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize), error: null };
  } catch (error) {
    return { data: null, count: 0, totalPages: 0, error: (error as Error).message };
  }
}

export async function getVehicle(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createVehicle(input: VehicleInput) {
  const parsed = vehicleSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input. Please check the form." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        vehicle_number: parsed.data.vehicle_number,
        vehicle_type: parsed.data.vehicle_type ?? "sedan",
        brand_model: parsed.data.brand_model,
        seating_capacity: parsed.data.seating_capacity ?? 4,
        fuel_type: parsed.data.fuel_type ?? "petrol",
        insurance_expiry: parsed.data.insurance_expiry,
        permit_expiry: parsed.data.permit_expiry ?? null,
        rc_number: parsed.data.rc_number ?? null,
        fitness_expiry: parsed.data.fitness_expiry ?? null,
        status: parsed.data.status ?? "available",
      } as never)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/vehicles");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>) {
  const parsed = vehicleSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .update(parsed.data as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/vehicles");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateVehicleStatus(id: string, status: string) {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("vehicle_id", id)
      .in("status", ["assigned", "started"]);

    if (count && count > 0) {
      return { error: "Vehicle is on an active trip. Complete or cancel the trip first." };
    }

    const { error } = await supabase
      .from("vehicles")
      .update({ status } as never)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/vehicles");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteVehicle(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/vehicles");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
