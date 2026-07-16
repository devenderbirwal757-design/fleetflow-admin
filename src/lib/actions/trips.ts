"use server";

import { createClient } from "@/lib/supabase/server";
import { tripSchema, type TripInput } from "@/lib/validations/trip";
import { revalidatePath } from "next/cache";

function parseAmount(val: string | null | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

export async function getTrips(options?: {
  search?: string;
  status?: string;
  driver_id?: string;
  vehicle_id?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from("trips")
      .select("*, drivers(name, phone), vehicles(vehicle_number, brand_model)", {
        count: "exact",
      });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }
    if (options?.driver_id) {
      query = query.eq("driver_id", options.driver_id);
    }
    if (options?.vehicle_id) {
      query = query.eq("vehicle_id", options.vehicle_id);
    }
    if (options?.search) {
      query = query.or(
        `customer_name.ilike.%${options.search}%,customer_phone.ilike.%${options.search}%`
      );
    }

    const { data, count, error } = await query
      .range(start, end)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return {
      data,
      count: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error: null,
    };
  } catch (error) {
    return { data: null, count: 0, totalPages: 0, error: (error as Error).message };
  }
}

export async function getTrip(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trips")
      .select(
        `
        *,
        drivers(id, name, phone),
        vehicles(id, vehicle_number, brand_model),
        expenses(*),
        payments(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createTrip(input: TripInput) {
  const parsed = tripSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input. Please check the form." };
  }

  try {
    const supabase = await createClient();
    const total_amount = parseAmount(parsed.data.total_amount);
    const advance_amount = parseAmount(parsed.data.advance_amount) ?? 0;

    const { data, error } = await supabase
      .from("trips")
      .insert({
        customer_name: parsed.data.customer_name,
        customer_phone: parsed.data.customer_phone,
        pickup_location: parsed.data.pickup_location,
        drop_location: parsed.data.drop_location,
        trip_date: parsed.data.trip_date,
        trip_time: parsed.data.trip_time || null,
        trip_type: parsed.data.trip_type ?? "one_way",
        driver_id: parsed.data.driver_id || null,
        vehicle_id: parsed.data.vehicle_id || null,
        status: parsed.data.status ?? "pending",
        total_amount,
        advance_amount,
        notes: parsed.data.notes ?? null,
        special_requirements: parsed.data.special_requirements ?? null,
      } as never)
      .select()
      .single();

    if (error) throw error;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "New Trip Booked",
        message: `Trip for ${parsed.data.customer_name} from ${parsed.data.pickup_location} to ${parsed.data.drop_location}`,
        type: "trip_created",
        trip_id: data.id,
      });
    }

    revalidatePath("/trips");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateTrip(id: string, input: Partial<TripInput>) {
  const parsed = tripSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = { ...parsed.data };

    if ("total_amount" in parsed.data) {
      updateData.total_amount = parseAmount(parsed.data.total_amount);
    }
    if ("advance_amount" in parsed.data) {
      updateData.advance_amount = parseAmount(parsed.data.advance_amount) ?? 0;
    }
    if ("trip_time" in parsed.data) {
      updateData.trip_time = parsed.data.trip_time || null;
    }

    const { data, error } = await supabase
      .from("trips")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/trips");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateTripStatus(id: string, status: string) {
  try {
    const supabase = await createClient();

    const { data: trip, error: fetchError } = await supabase
      .from("trips")
      .select("driver_id, vehicle_id, customer_name, drivers(name)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("trips")
      .update({ status } as never)
      .eq("id", id);

    if (error) throw error;

    if (trip?.driver_id || trip?.vehicle_id) {
      if (status === "assigned" || status === "started") {
        if (trip.driver_id) {
          await supabase.from("drivers").update({ status: "on_trip" } as never).eq("id", trip.driver_id);
        }
        if (trip.vehicle_id) {
          await supabase.from("vehicles").update({ status: "on_trip" } as never).eq("id", trip.vehicle_id);
        }
      } else if (status === "completed" || status === "cancelled") {
        if (trip.driver_id) {
          await supabase.from("drivers").update({ status: "available" } as never).eq("id", trip.driver_id);
        }
        if (trip.vehicle_id) {
          await supabase.from("vehicles").update({ status: "available" } as never).eq("id", trip.vehicle_id);
        }
      }
    }

    revalidatePath("/trips");
    revalidatePath("/drivers");
    revalidatePath("/vehicles");
    revalidatePath("/dashboard");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && trip) {
      const tripData = trip as typeof trip & { drivers?: { name: string } | null };
      const driverName = tripData.drivers?.name ?? null;
      const statusMessages: Record<string, { title: string; message: string }> = {
        assigned: {
          title: "Trip Assigned",
          message: driverName
            ? `${driverName} assigned to trip for ${trip.customer_name}`
            : `Driver assigned to trip for ${trip.customer_name}`,
        },
        started: {
          title: "Trip Started",
          message: `Trip for ${trip.customer_name} has started`,
        },
        completed: {
          title: "Trip Completed",
          message: `Trip for ${trip.customer_name} has been completed`,
        },
        cancelled: {
          title: "Trip Cancelled",
          message: `Trip for ${trip.customer_name} was cancelled`,
        },
      };
      const msg = statusMessages[status];
      if (msg) {
        await supabase.from("notifications").insert({
          user_id: user.id,
          title: msg.title,
          message: msg.message,
          type: `trip_${status}`,
          trip_id: id,
        });
      }
    }

    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function deleteTrip(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/trips");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function getDriverOptions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name")
      .order("name");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function getVehicleOptions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, vehicle_number, brand_model")
      .order("vehicle_number");

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}
