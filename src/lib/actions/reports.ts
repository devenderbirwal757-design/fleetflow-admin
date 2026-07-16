"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReportData {
  trips: {
    total: number;
    byStatus: Record<string, number>;
    completed: number;
    cancelled: number;
    revenue: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    count: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
  };
  fleet: {
    totalDrivers: number;
    activeDrivers: number;
    totalVehicles: number;
    availableVehicles: number;
  };
}

export async function getReportData(startDate: string, endDate: string) {
  try {
    const supabase = await createClient();

    const [{ data: trips }, { data: expenses }, { data: payments }, { count: totalDrivers }, { count: activeDrivers }, { count: totalVehicles }, { count: availableVehicles }] =
      await Promise.all([
        supabase
          .from("trips")
          .select("status, total_amount")
          .gte("trip_date", startDate)
          .lte("trip_date", endDate),
        supabase
          .from("expenses")
          .select("category, amount")
          .gte("expense_date", startDate)
          .lte("expense_date", endDate),
        supabase
          .from("payments")
          .select("amount, payment_status")
          .gte("payment_date", startDate)
          .lte("payment_date", endDate),
        supabase.from("drivers").select("*", { count: "exact", head: true }),
        supabase.from("drivers").select("*", { count: "exact", head: true }).in("status", ["available", "on_trip"]),
        supabase.from("vehicles").select("*", { count: "exact", head: true }),
        supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "available"),
      ]);

    const tripRows = trips ?? [];
    const byStatus: Record<string, number> = {};
    let completedCount = 0;
    let cancelledCount = 0;
    let revenue = 0;

    for (const t of tripRows) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      if (t.status === "completed") {
        completedCount++;
        revenue += Number(t.total_amount) || 0;
      }
      if (t.status === "cancelled") cancelledCount++;
    }

    const expenseRows = expenses ?? [];
    const byCategory: Record<string, number> = {};
    let totalExpenses = 0;

    for (const e of expenseRows) {
      const amt = Number(e.amount);
      byCategory[e.category] = (byCategory[e.category] ?? 0) + amt;
      totalExpenses += amt;
    }

    const paymentRows = payments ?? [];
    let paidTotal = 0;
    let pendingTotal = 0;

    for (const p of paymentRows) {
      const amt = Number(p.amount);
      if (p.payment_status === "paid" || p.payment_status === "partial") {
        paidTotal += amt;
      } else {
        pendingTotal += amt;
      }
    }

    return {
      data: {
        trips: {
          total: tripRows.length,
          byStatus,
          completed: completedCount,
          cancelled: cancelledCount,
          revenue,
        },
        expenses: {
          total: totalExpenses,
          byCategory,
          count: expenseRows.length,
        },
        payments: {
          total: paidTotal + pendingTotal,
          paid: paidTotal,
          pending: pendingTotal,
        },
        fleet: {
          totalDrivers: totalDrivers ?? 0,
          activeDrivers: activeDrivers ?? 0,
          totalVehicles: totalVehicles ?? 0,
          availableVehicles: availableVehicles ?? 0,
        },
      } satisfies ReportData,
      error: null,
    };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}
