"use server";

import { createClient } from "@/lib/supabase/server";
import { expenseSchema, type ExpenseInput } from "@/lib/validations/expense";
import { revalidatePath } from "next/cache";

export async function getExpenses(options?: {
  category?: string;
  trip_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 15;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from("expenses")
      .select("*, trips(customer_name, trip_date)", { count: "exact" });

    if (options?.category && options.category !== "all") {
      query = query.eq("category", options.category);
    }
    if (options?.trip_id) {
      query = query.eq("trip_id", options.trip_id);
    }
    if (options?.start_date) {
      query = query.gte("expense_date", options.start_date);
    }
    if (options?.end_date) {
      query = query.lte("expense_date", options.end_date);
    }

    const { data, count, error } = await query
      .range(start, end)
      .order("expense_date", { ascending: false });

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

export async function getExpense(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .select("*, trips(customer_name, trip_date)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function getExpenseSummary(options?: {
  start_date?: string;
  end_date?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase.from("expenses").select("category, amount");

    if (options?.start_date) {
      query = query.gte("expense_date", options.start_date);
    }
    if (options?.end_date) {
      query = query.lte("expense_date", options.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];
    const total = rows.reduce((sum: number, r: { amount: number }) => sum + Number(r.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const r of rows) {
      const cat = r.category;
      byCategory[cat] = (byCategory[cat] ?? 0) + Number(r.amount);
    }

    return { data: { total, byCategory, count: rows.length }, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function createExpense(input: ExpenseInput & { bill_url?: string | null }) {
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input. Please check the form." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        trip_id: parsed.data.trip_id ?? null,
        category: parsed.data.category,
        amount: parseFloat(parsed.data.amount),
        description: parsed.data.description ?? null,
        bill_url: input.bill_url ?? null,
        expense_date: parsed.data.expense_date,
        created_by: user?.id ?? null,
      } as never)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/expenses");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function updateExpense(
  id: string,
  input: ExpenseInput & { bill_url?: string | null }
) {
  const parsed = expenseSchema.partial().safeParse(input);
  if (!parsed.success) {
    return { data: null, error: "Invalid input." };
  }

  try {
    const supabase = await createClient();
    const updateData: Record<string, unknown> = { ...parsed.data };

    if ("amount" in parsed.data && parsed.data.amount) {
      updateData.amount = parseFloat(parsed.data.amount);
    }
    if (input.bill_url !== undefined) {
      updateData.bill_url = input.bill_url;
    }

    const { data, error } = await supabase
      .from("expenses")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/expenses");
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function deleteExpense(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/expenses");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function getTripOptions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trips")
      .select("id, customer_name, trip_date")
      .order("trip_date", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}
