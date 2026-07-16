"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExpenseForm } from "./expense-form";
import { updateExpense } from "@/lib/actions/expenses";
import type { ExpenseInput } from "@/lib/validations/expense";

interface EditExpenseFormProps {
  expense: {
    id: string;
    category: string;
    amount: number;
    description: string | null;
    expense_date: string;
    trip_id: string | null;
    bill_url: string | null;
  };
  tripOptions: { id: string; customer_name: string; trip_date: string }[];
}

export function EditExpenseForm({ expense, tripOptions }: EditExpenseFormProps) {
  const router = useRouter();

  async function handleSubmit(data: ExpenseInput & { bill_url?: string | null }) {
    const { error } = await updateExpense(expense.id, data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Expense updated");
    router.push("/expenses");
    router.refresh();
  }

  return (
    <ExpenseForm
      tripOptions={tripOptions}
      defaultValues={{
        trip_id: expense.trip_id ?? "",
        category: expense.category as ExpenseInput["category"],
        amount: expense.amount.toString(),
        description: expense.description ?? "",
        expense_date: expense.expense_date,
        bill_url: expense.bill_url,
      }}
      onSubmit={handleSubmit}
    />
  );
}
