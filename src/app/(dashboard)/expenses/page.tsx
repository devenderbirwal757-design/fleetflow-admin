import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getExpenses, getExpenseSummary } from "@/lib/actions/expenses";
import { ExpenseTable } from "./_components/expense-table";
import { ExpenseSummary } from "./_components/expense-summary";
import { ExpenseAiAnalysis } from "./_components/expense-ai-analysis";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Expenses",
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const category = params.category || "all";

  const [{ data: expenses, totalPages }, { data: summary }] = await Promise.all([
    getExpenses({ page, category, pageSize: 15 }),
    getExpenseSummary(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Track trip and operational expenses">
        <Link
          href="/expenses/new"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </PageHeader>

      <ExpenseSummary data={summary} />

      <ExpenseAiAnalysis />

      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <ExpenseTable
          expenses={expenses ?? []}
          currentPage={page}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
}
