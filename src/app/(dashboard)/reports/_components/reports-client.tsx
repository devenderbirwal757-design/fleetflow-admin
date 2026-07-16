"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Route, TrendingUp, Receipt, Truck, Users, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ReportData } from "@/lib/actions/reports";

type TabId = "overview" | "trips" | "revenue" | "expenses" | "fleet";

interface ReportsClientProps {
  initialData: ReportData;
  startDate: string;
  endDate: string;
}

const datePresets = [
  { label: "Today", days: 0 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "This Quarter", days: 90 },
  { label: "This Year", days: 365 },
] as const;

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "trips", label: "Trips" },
  { id: "revenue", label: "Revenue" },
  { id: "expenses", label: "Expenses" },
  { id: "fleet", label: "Fleet" },
];

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (days > 0) {
    start.setDate(start.getDate() - days);
  }
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendLabel?: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        {trend && trendLabel && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === "up" ? "text-emerald-600" : "text-red-600"}>
              {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewTab({ data }: { data: ReportData }) {
  const profit = data.trips.revenue - data.expenses.total;
  const profitMargin = data.trips.revenue > 0 ? (profit / data.trips.revenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Trips" value={String(data.trips.total)} icon={Route} />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.trips.revenue)}
          icon={TrendingUp}
          trend={data.trips.revenue > 0 ? "up" : undefined}
          trendLabel={data.trips.revenue > 0 ? "Revenue generating" : undefined}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(data.expenses.total)}
          icon={Receipt}
          trend={data.expenses.total > 0 ? "down" : undefined}
          trendLabel={`${data.expenses.count} entries`}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(profit)}
          icon={IndianRupee}
          trend={profit >= 0 ? "up" : "down"}
          trendLabel={`${profitMargin.toFixed(1)}% margin`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Trips"
          value={String(data.trips.completed)}
          icon={Route}
        />
        <StatCard
          title="Cancelled"
          value={String(data.trips.cancelled)}
          icon={Route}
        />
        <StatCard
          title="Active Drivers"
          value={`${data.fleet.activeDrivers}/${data.fleet.totalDrivers}`}
          icon={Users}
        />
        <StatCard
          title="Available Vehicles"
          value={`${data.fleet.availableVehicles}/${data.fleet.totalVehicles}`}
          icon={Truck}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.trips.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(data.trips.byStatus).length === 0 && (
                <p className="text-muted-foreground text-sm">No trips in this period.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.expenses.byCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{category.replace(/_/g, " ")}</span>
                  <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
              {Object.keys(data.expenses.byCategory).length === 0 && (
                <p className="text-muted-foreground text-sm">No expenses in this period.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TripsTab({ data }: { data: ReportData }) {
  const tripData = Object.entries(data.trips.byStatus).map(([status, count]) => ({
    status,
    count,
    percentage:
      data.trips.total > 0 ? ((count / data.trips.total) * 100).toFixed(1) : "0",
  }));

  const columns: Column<{ status: string; count: number; percentage: string }>[] = [
    {
      header: "Status",
      accessorKey: (t) => <StatusBadge status={t.status} />,
    },
    { header: "Count", accessorKey: "count" },
    { header: "Percentage", accessorKey: "percentage" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.trips.total}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {data.trips.completed}
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.trips.cancelled}
            </div>
          </CardContent>
        </Card>
      </div>
      <DataTable
        columns={columns}
        data={tripData}
        keyExtractor={(t) => t.status}
        emptyMessage="No trip data in this period."
      />
    </div>
  );
}

function RevenueTab({ data }: { data: ReportData }) {
  const pendingAmount = data.payments.pending;
  const collectedAmount = data.payments.paid;
  const collectionRate =
    data.payments.total > 0
      ? ((collectedAmount / data.payments.total) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Trip Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.trips.revenue)}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(collectedAmount)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {collectionRate}% collection rate
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Revenue</span>
              <span className="text-sm font-medium text-emerald-600">
                {formatCurrency(data.trips.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expenses</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(data.expenses.total)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Profit</span>
                <span
                  className={`text-sm font-bold ${
                    data.trips.revenue - data.expenses.total >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.trips.revenue - data.expenses.total)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExpensesTab({ data }: { data: ReportData }) {
  const expenseData = Object.entries(data.expenses.byCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage:
      data.expenses.total > 0
        ? ((amount / data.expenses.total) * 100).toFixed(1)
        : "0",
  }));

  const columns: Column<{ category: string; amount: number; percentage: string }>[] = [
    {
      header: "Category",
      accessorKey: (e) => (
        <span className="capitalize">{e.category.replace(/_/g, " ")}</span>
      ),
    },
    {
      header: "Amount",
      accessorKey: (e) => formatCurrency(e.amount),
    },
    {
      header: "Percentage",
      accessorKey: (e) => `${e.percentage}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.expenses.total)}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.expenses.count}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={expenseData}
        keyExtractor={(e) => e.category}
        emptyMessage="No expenses in this period."
      />
    </div>
  );
}

function FleetTab({ data }: { data: ReportData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.fleet.totalDrivers}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Active Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data.fleet.activeDrivers}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {data.fleet.totalDrivers > 0
                ? `${((data.fleet.activeDrivers / data.fleet.totalDrivers) * 100).toFixed(0)}% utilization`
                : "No drivers"}
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.fleet.totalVehicles}</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium">
              Available Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {data.fleet.availableVehicles}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {data.fleet.totalVehicles > 0
                ? `${((data.fleet.availableVehicles / data.fleet.totalVehicles) * 100).toFixed(0)}% available`
                : "No vehicles"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ReportsClient({ initialData, startDate, endDate }: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) ?? "overview"
  );
  const data = initialData;

  const navigateWithParams = useCallback(
    (params: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        sp.set(key, value);
      }
      startTransition(() => {
        router.push(`/reports?${sp.toString()}`);
      });
    },
    [router, searchParams]
  );

  function handleDatePreset(days: number) {
    const range = getDateRange(days);
    navigateWithParams({ startDate: range.start, endDate: range.end });
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    navigateWithParams({ tab });
  }

  function renderTab() {
    switch (activeTab) {
      case "overview":
        return <OverviewTab data={data} />;
      case "trips":
        return <TripsTab data={data} />;
      case "revenue":
        return <RevenueTab data={data} />;
      case "expenses":
        return <ExpensesTab data={data} />;
      case "fleet":
        return <FleetTab data={data} />;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {datePresets.map((preset) => {
            const range = getDateRange(preset.days);
            const isActive = range.start === startDate && range.end === endDate;
            return (
              <Button
                key={preset.label}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(preset.days)}
                disabled={isPending}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          {startDate} to {endDate}
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
