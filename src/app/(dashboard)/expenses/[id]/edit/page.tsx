import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getExpense, getTripOptions } from "@/lib/actions/expenses";
import { EditExpenseForm } from "../../_components/edit-expense-form";

export const metadata: Metadata = {
  title: "Edit Expense",
};

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: expense }, { data: trips }] = await Promise.all([
    getExpense(id),
    getTripOptions(),
  ]);

  if (!expense) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Expense" description="Update expense details" />

      <Card>
        <CardContent className="pt-6">
          <EditExpenseForm expense={expense} tripOptions={trips ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
