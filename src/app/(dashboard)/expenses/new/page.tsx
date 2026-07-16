import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getTripOptions } from "@/lib/actions/expenses";
import { CreateExpenseForm } from "../_components/create-expense-form";

export const metadata: Metadata = {
  title: "Add Expense",
};

export default async function NewExpensePage() {
  const { data: trips } = await getTripOptions();

  return (
    <div className="space-y-6">
      <PageHeader title="Add Expense" description="Record a new expense" />

      <Card>
        <CardContent className="pt-6">
          <CreateExpenseForm tripOptions={trips ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
