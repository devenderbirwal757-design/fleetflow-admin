"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteExpense } from "@/lib/actions/expenses";
import { expenseCategoryLabels } from "@/lib/validations/expense";
import { Pencil, Trash2, ExternalLink, FileText } from "lucide-react";

interface ExpenseRow {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  expense_date: string;
  bill_url: string | null;
  trip_id: string | null;
  trips: { customer_name: string; trip_date: string } | null;
}

interface ExpenseTableProps {
  expenses: ExpenseRow[];
  currentPage: number;
  totalPages: number;
}

const categoryOptions = [
  { value: "all", label: "All Categories" },
  ...Object.entries(expenseCategoryLabels).map(([value, label]) => ({
    value,
    label,
  })),
];

export function ExpenseTable({ expenses, currentPage, totalPages }: ExpenseTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") ?? "all"
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`/expenses?${params.toString()}`);
    },
    [router, searchParams]
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await deleteExpense(deleteId);
    setDeleting(false);
    setDeleteId(null);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Expense deleted");
      router.refresh();
    }
  }

  const columns: Column<ExpenseRow>[] = [
    {
      header: "Date",
      accessorKey: (e) => new Date(e.expense_date).toLocaleDateString("en-GB"),
    },
    {
      header: "Category",
      accessorKey: (e) => (
        <span className="capitalize">
          {expenseCategoryLabels[e.category] ?? e.category}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: (e) => `₹${Number(e.amount).toLocaleString()}`,
    },
    {
      header: "Description",
      accessorKey: (e) => e.description ?? "-",
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Trip",
      accessorKey: (e) =>
        e.trips ? (
          <Link
            href={`/trips/${e.trip_id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {e.trips.customer_name}
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Bill",
      accessorKey: (e) =>
        e.bill_url ? (
          <a
            href={e.bill_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <FileText className="h-3 w-3" />
            View
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      className: "w-16",
    },
    {
      header: "Actions",
      accessorKey: (e) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/expenses/${e.id}/edit`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteId(e.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={categoryFilter}
          onValueChange={(val) => {
            if (val) {
              setCategoryFilter(val);
              updateParam("category", val);
            }
          }}
        >
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        keyExtractor={(e) => e.id}
        emptyMessage="No expenses found."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateParam("page", String(currentPage - 1))}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => updateParam("page", String(page))}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam("page", String(currentPage + 1))}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Expense"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
