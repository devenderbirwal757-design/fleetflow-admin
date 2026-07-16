import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ActiveTripsCard, type ActiveTrip } from "./_components/active-trips-card";
import { AiDashboardPanel } from "./_components/ai-dashboard-panel";
import { Plus, Route, Users, Truck, Receipt, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const [{ count: todayTrips }, { count: activeTripCount }, { count: driversOnDuty }, { count: availableVehicles }, { data: todayRevenue }, { data: todayExpenses }, { data: activeTripsData }] =
    await Promise.all([
      supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("trip_date", today),
      supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .in("status", ["assigned", "started"]),
      supabase
        .from("drivers")
        .select("*", { count: "exact", head: true })
        .in("status", ["available", "on_trip"]),
      supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .eq("status", "available"),
      supabase
        .from("trips")
        .select("total_amount")
        .eq("trip_date", today)
        .eq("status", "completed"),
      supabase
        .from("expenses")
        .select("amount")
        .eq("expense_date", today),
      supabase
        .from("trips")
        .select("id, customer_name, pickup_location, drop_location, status, drivers(name), vehicles(vehicle_number)")
        .in("status", ["assigned", "started"])
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const activeTrips: ActiveTrip[] = (activeTripsData ?? []).map((t: Record<string, unknown>) => ({
    id: t.id as string,
    customer_name: t.customer_name as string,
    pickup_location: t.pickup_location as string,
    drop_location: t.drop_location as string,
    status: t.status as string,
    drivers: Array.isArray(t.drivers) ? (t.drivers[0] as { name: string }) ?? null : (t.drivers as { name: string } | null),
    vehicles: Array.isArray(t.vehicles) ? (t.vehicles[0] as { vehicle_number: string }) ?? null : (t.vehicles as { vehicle_number: string } | null),
  }));

  const revenue =
    todayRevenue?.reduce(
      (s, t) => s + Number(t.total_amount || 0),
      0
    ) ?? 0;
  const expenses =
    todayExpenses?.reduce(
      (s, e) => s + Number(e.amount || 0),
      0
    ) ?? 0;

  const stats = [
    { title: "Trips Today", value: String(todayTrips ?? 0), icon: Route, href: "/trips" },
    { title: "Active Trips", value: String(activeTripCount ?? 0), icon: Route, href: "/trips?status=assigned" },
    { title: "Drivers on Duty", value: String(driversOnDuty ?? 0), icon: Users, href: "/drivers?status=on_trip" },
    { title: "Available Vehicles", value: String(availableVehicles ?? 0), icon: Truck, href: "/vehicles?status=available" },
    { title: "Today's Revenue", value: `₹${revenue.toLocaleString()}`, icon: TrendingUp, href: "/trips?status=completed" },
    { title: "Today's Expenses", value: `₹${expenses.toLocaleString()}`, icon: Receipt, href: "/expenses" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of today's operations">
        <Link
          href="/trips/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="block">
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-muted-foreground text-xs font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <ActiveTripsCard trips={activeTrips} />
      <AiDashboardPanel />
    </div>
  );
}
