"use server";

import { createClient } from "@/lib/supabase/server";
import { driverSchema, type DriverInput } from "@/lib/validations/driver";
import { revalidatePath } from "next/cache";

export async function getDrivers(options?: {
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

    let query = supabase.from("drivers").select("*", { count: "exact" }).order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,phone.ilike.%${options.search}%,license_number.ilike.%${options.search}%`
      );
    }

    const { data, count, error } = await query.range(start, end);
    if (error) throw error;
    return { data, count: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize), error: null };
  } catch (error) {
    return { data: null, count: 0, totalPages: 0, error: (error as Error).message };
  }
}

export async function getDriver(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createDriver(input: DriverInput) {
  const parsed = driverSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input. Please check the form." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        license_number: parsed.data.license_number,
        license_expiry: parsed.data.license_expiry,
        address: parsed.data.address ?? null,
        joining_date: parsed.data.joining_date ?? new Date().toISOString().split("T")[0],
        salary_type: parsed.data.salary_type ?? "per_trip",
        status: parsed.data.status ?? "available",
      } as never)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/drivers");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateDriver(id: string, input: Partial<DriverInput>) {
  const parsed = driverSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drivers")
      .update(parsed.data as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/drivers");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateDriverStatus(id: string, status: string) {
  try {
    const supabase = await createClient();

    const { count } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("driver_id", id)
      .in("status", ["assigned", "started"]);

    if (count && count > 0) {
      return { error: "Driver is on an active trip. Complete or cancel the trip first." };
    }

    const { error } = await supabase
      .from("drivers")
      .update({ status } as never)
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/drivers");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteDriver(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("drivers").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/drivers");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
