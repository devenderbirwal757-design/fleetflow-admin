"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExpenseForm } from "./expense-form";
import { createExpense } from "@/lib/actions/expenses";
import type { ExpenseInput } from "@/lib/validations/expense";

interface CreateExpenseFormProps {
  tripOptions: { id: string; customer_name: string; trip_date: string }[];
}

export function CreateExpenseForm({ tripOptions }: CreateExpenseFormProps) {
  const router = useRouter();

  async function handleSubmit(data: ExpenseInput & { bill_url?: string | null }) {
    const { error } = await createExpense(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Expense added");
    router.push("/expenses");
    router.refresh();
  }

  return <ExpenseForm tripOptions={tripOptions} onSubmit={handleSubmit} />;
}
