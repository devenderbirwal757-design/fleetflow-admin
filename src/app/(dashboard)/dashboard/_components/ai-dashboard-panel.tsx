"use client";

import { AiInsightCard, StatusBadge } from "@/components/shared/ai-insight-card";
import {
  getOperationalInsightsAction,
  getMonthlySummary,
  getProfitLoss,
} from "@/lib/actions/ai";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";

export function AiDashboardPanel() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">AI Insights</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <AiInsightCard
          title="Operational Insights"
          description="Fleet efficiency and resource optimization"
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          onGenerate={getOperationalInsightsAction}
        >
          {(data) => {
            const d = data as {
              summary: string;
              metrics: Array<{
                label: string;
                value: string;
                status: "good" | "warning" | "critical";
                suggestion: string;
              }>;
              recommendations: string[];
            };
            return (
              <div className="space-y-3">
                <p className="text-sm">{d.summary}</p>
                <div className="space-y-2">
                  {d.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.label}</span>
                        <span className="text-sm">{m.value}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <StatusBadge status={m.status} />
                        <span className="text-xs text-muted-foreground">
                          {m.suggestion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {d.recommendations.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Recommendations
                    </p>
                    <ul className="list-inside list-disc space-y-0.5 text-sm">
                      {d.recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          }}
        </AiInsightCard>

        <AiInsightCard
          title="Profit & Loss"
          description="Revenue vs expense analysis"
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          onGenerate={getProfitLoss}
        >
          {(data) => {
            const d = data as {
              period: string;
              totalRevenue: number;
              totalExpenses: number;
              netProfit: number;
              profitMargin: number;
              breakdown: { revenue: { trips: number; other: number }; expenses: Record<string, number> };
              assessment: string;
              suggestions: string[];
            };
            const isProfitable = d.netProfit >= 0;
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      ₹{d.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="text-sm font-semibold text-red-600">
                      ₹{d.totalExpenses.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Net</p>
                    <p
                      className={`text-sm font-semibold ${isProfitable ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {isProfitable ? "+" : ""}₹{d.netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span
                    className={`font-medium ${isProfitable ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {d.profitMargin.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm">{d.assessment}</p>
                {d.suggestions.length > 0 && (
                  <ul className="list-inside list-disc space-y-0.5 text-sm">
                    {d.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }}
        </AiInsightCard>

        <AiInsightCard
          title="Monthly Summary"
          description="Current month operational overview"
          icon={<Wallet className="h-5 w-5 text-purple-500" />}
          onGenerate={() => getMonthlySummary()}
        >
          {(data) => {
            const d = data as {
              month: string;
              year: number;
              tripsCompleted: number;
              totalRevenue: number;
              totalExpenses: number;
              netProfit: number;
              topPerformer: string;
              highlights: string[];
              concerns: string[];
            };
            return (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {d.month} {d.year}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Trips</p>
                    <p className="text-lg font-semibold">{d.tripsCompleted}</p>
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      ₹{d.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-md border p-2 text-center">
                    <p className="text-xs text-muted-foreground">Profit</p>
                    <p
                      className={`text-sm font-semibold ${d.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      ₹{d.netProfit.toLocaleString()}
                    </p>
                  </div>
                </div>
                {d.highlights.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-emerald-600">Highlights</p>
                    <ul className="list-inside list-disc space-y-0.5 text-sm">
                      {d.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {d.concerns.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-amber-600">Concerns</p>
                    <ul className="list-inside list-disc space-y-0.5 text-sm">
                      {d.concerns.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          }}
        </AiInsightCard>
      </div>
    </div>
  );
}
