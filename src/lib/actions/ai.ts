"use server";

import { createClient } from "@/lib/supabase/server";
import {
  analyzeExpenses,
  calculateProfitLoss,
  generateMonthlySummary,
  getOperationalInsights,
} from "@/lib/ai/service";

export async function getExpenseAnalysis() {
  try {
    const supabase = await createClient();

    const { data: expenses } = await supabase
      .from("expenses")
      .select("category, amount, expense_date")
      .order("expense_date", { ascending: false })
      .limit(500);

    if (!expenses || expenses.length === 0) {
      return { success: false, error: "No expenses found." };
    }

    const formatted = expenses.map(
      (e) => ({
        category: e.category,
        amount: Number(e.amount),
        date: e.expense_date,
      })
    );

    return await analyzeExpenses(formatted);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}

export async function getProfitLoss() {
  try {
    const supabase = await createClient();

    const [{ data: trips }, { data: expenses }, { data: payments }] =
      await Promise.all([
        supabase.from("trips").select("total_amount, status"),
        supabase.from("expenses").select("category, amount"),
        supabase.from("payments").select("amount, payment_status"),
      ]);

    return await calculateProfitLoss({
      trips: trips?.map((t) => ({
        total_amount: Number(t.total_amount) || 0,
        status: t.status,
      })) ?? [],
      expenses: expenses?.map((e) => ({
        category: e.category,
        amount: Number(e.amount),
      })) ?? [],
      payments: payments?.map((p) => ({
        amount: Number(p.amount),
        payment_status: p.payment_status,
      })) ?? [],
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}

export async function getMonthlySummary(month?: number, year?: number) {
  try {
    const supabase = await createClient();
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split("T")[0];

    const [{ data: trips }, { data: expenses }, { data: payments }, { data: drivers }, { data: vehicles }] =
      await Promise.all([
        supabase
          .from("trips")
          .select("total_amount, status")
          .gte("trip_date", startDate)
          .lte("trip_date", endDate),
        supabase
          .from("expenses")
          .select("category, amount")
          .gte("expense_date", startDate)
          .lte("expense_date", endDate),
        supabase
          .from("payments")
          .select("amount")
          .gte("payment_date", startDate)
          .lte("payment_date", endDate),
        supabase.from("drivers").select("id", { count: "exact", head: true }),
        supabase.from("vehicles").select("id", { count: "exact", head: true }),
      ]);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return await generateMonthlySummary({
      month: monthNames[targetMonth - 1],
      year: targetYear,
      trips: trips?.map((t) => ({
        total_amount: Number(t.total_amount) || 0,
        status: t.status,
      })) ?? [],
      expenses: expenses?.map((e) => ({
        category: e.category,
        amount: Number(e.amount),
      })) ?? [],
      payments: payments?.map((p) => ({
        amount: Number(p.amount),
      })) ?? [],
      driverCount: drivers?.length ?? 0,
      vehicleCount: vehicles?.length ?? 0,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}

export async function getOperationalInsightsAction() {
  try {
    const supabase = await createClient();

    const [
      { count: totalTrips },
      { count: totalDrivers },
      { count: totalVehicles },
      { count: activeTrips },
      { count: availableDrivers },
      { count: availableVehicles },
      { data: completedData },
      { data: expenseData },
    ] = await Promise.all([
      supabase.from("trips").select("*", { count: "exact", head: true }),
      supabase.from("drivers").select("*", { count: "exact", head: true }),
      supabase.from("vehicles").select("*", { count: "exact", head: true }),
      supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .in("status", ["assigned", "started"]),
      supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .eq("status", "available"),
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "available"),
      supabase
        .from("trips")
        .select("status, total_amount")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from("expenses")
        .select("amount")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    const completed30d =
      completedData?.filter((t) => t.status === "completed").length ?? 0;
    const total30d = completedData?.length ?? 0;
    const completionRate = total30d > 0 ? (completed30d / total30d) * 100 : 0;

    const totalExpenses30d = expenseData?.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    ) ?? 0;

    const avgTripRevenue =
      completedData?.reduce(
        (sum, t) =>
          sum + (t.status === "completed" ? Number(t.total_amount) || 0 : 0),
        0
      ) ?? 0;

    const expenseRatio =
      avgTripRevenue > 0 ? (totalExpenses30d / avgTripRevenue) * 100 : 0;

    return await getOperationalInsights({
      totalTrips: totalTrips ?? 0,
      totalDrivers: totalDrivers ?? 0,
      totalVehicles: totalVehicles ?? 0,
      activeTrips: activeTrips ?? 0,
      availableDrivers: availableDrivers ?? 0,
      availableVehicles: availableVehicles ?? 0,
      recentCompletionRate: Math.round(completionRate),
      expenseRatio: Math.round(expenseRatio),
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch data",
    };
  }
}
