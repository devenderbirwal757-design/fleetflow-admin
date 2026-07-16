"use client";

import { AiInsightCard } from "@/components/shared/ai-insight-card";
import { getExpenseAnalysis } from "@/lib/actions/ai";
import { Receipt } from "lucide-react";

export function ExpenseAiAnalysis() {
  return (
    <AiInsightCard
      title="AI Expense Analysis"
      description="Spending patterns and cost-saving insights"
      icon={<Receipt className="h-5 w-5 text-rose-500" />}
      onGenerate={getExpenseAnalysis}
    >
      {(data) => {
        const d = data as {
          summary: string;
          totalExpenses: number;
          categoryBreakdown: Array<{
            category: string;
            amount: number;
            percentage: number;
          }>;
          topCategory: string;
          anomalyFlags: string[];
          recommendations: string[];
        };
        return (
          <div className="space-y-3">
            <p className="text-sm">{d.summary}</p>

            <div className="rounded-md border p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Category Breakdown
              </p>
              <div className="space-y-1.5">
                {d.categoryBreakdown.map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{c.category}</span>
                      <span className="font-medium">
                        ₹{c.amount.toLocaleString()} ({c.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-rose-500"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {d.anomalyFlags.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-amber-600">
                  Anomalies Detected
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-sm">
                  {d.anomalyFlags.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {d.recommendations.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-emerald-600">
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
  );
}
