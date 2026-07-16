"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { expenseSchema, type ExpenseInput, expenseCategoryLabels } from "@/lib/validations/expense";
import { BillUpload } from "./bill-upload";

interface ExpenseFormProps {
  tripOptions: { id: string; customer_name: string; trip_date: string }[];
  defaultValues?: Partial<ExpenseInput & { bill_url?: string | null }>;
  onSubmit: (data: ExpenseInput & { bill_url?: string | null }) => Promise<void>;
  loading?: boolean;
}

const categoryOptions = Object.entries(expenseCategoryLabels).map(([value, label]) => ({
  value,
  label,
}));

export function ExpenseForm({
  tripOptions,
  defaultValues,
  onSubmit,
  loading,
}: ExpenseFormProps) {
  const [billUrl, setBillUrl] = useState<string | null>(
    (defaultValues as { bill_url?: string | null })?.bill_url ?? null
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      trip_id: "",
      category: "fuel",
      amount: "",
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
      ...defaultValues,
    },
  });

  const isBusy = loading || isSubmitting;

  async function handleFormSubmit(data: ExpenseInput) {
    await onSubmit({ ...data, bill_url: billUrl });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => field.onChange(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount <span className="text-destructive">*</span>
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="expense_date" className="text-sm font-medium">
            Date <span className="text-destructive">*</span>
          </label>
          <Input id="expense_date" type="date" {...register("expense_date")} />
          {errors.expense_date && (
            <p className="text-xs text-destructive">{errors.expense_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="trip_id" className="text-sm font-medium">
            Link to Trip
          </label>
          <Controller
            name="trip_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(val) => field.onChange(val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trip (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No trip</SelectItem>
                  {tripOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.customer_name} ({new Date(t.trip_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Input
            id="description"
            placeholder="What is this expense for?"
            {...register("description")}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <BillUpload onUpload={setBillUrl} defaultValue={billUrl} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isBusy}>
          {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Expense" : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
