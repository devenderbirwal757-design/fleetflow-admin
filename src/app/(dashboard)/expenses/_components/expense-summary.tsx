import { Card, CardContent } from "@/components/ui/card";
import { expenseCategoryLabels } from "@/lib/validations/expense";
import { IndianRupee, Receipt, TrendingUp } from "lucide-react";

interface ExpenseSummaryData {
  total: number;
  byCategory: Record<string, number>;
  count: number;
}

interface ExpenseSummaryProps {
  data: ExpenseSummaryData | null;
}

export function ExpenseSummary({ data }: ExpenseSummaryProps) {
  if (!data || data.count === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-muted p-3">
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-semibold">₹0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedCategories = Object.entries(data.byCategory).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-xl font-semibold">
                ₹{data.total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-xl font-semibold">{data.count}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg per Entry</p>
              <p className="text-xl font-semibold">
                ₹{Math.round(data.total / data.count).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">By Category</p>
            <div className="space-y-1.5">
              {sortedCategories.map(([cat, amount]) => {
                const pct = data.total > 0 ? (amount / data.total) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {expenseCategoryLabels[cat] ?? cat}
                      </span>
                      <span className="font-medium">
                        ₹{amount.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
