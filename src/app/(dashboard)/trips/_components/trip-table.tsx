"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SearchInput } from "@/components/shared/search-input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTrip, updateTripStatus } from "@/lib/actions/trips";
import { Pencil, Trash2, Eye } from "lucide-react";

const TRIP_STATUS_OPTIONS = ["pending", "assigned", "started", "completed", "cancelled"] as const;

interface TripRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  pickup_location: string;
  drop_location: string;
  trip_date: string;
  status: string;
  total_amount: number | null;
  advance_amount: number;
  drivers: { name: string; phone: string } | null;
  vehicles: { vehicle_number: string; brand_model: string } | null;
}

interface TripTableProps {
  trips: TripRow[];
  currentPage: number;
  totalPages: number;
}

export function TripTable({ trips, currentPage, totalPages }: TripTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const handleStatusChange = useCallback(async (tripId: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [tripId]: newStatus }));
    const result = await updateTripStatus(tripId, newStatus);
    if (result.error) {
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[tripId];
        return next;
      });
      toast.error(result.error);
    } else {
      toast.success("Trip status updated");
    }
  }, []);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`/trips?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateParam("search", search);
  }, [search, updateParam]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await deleteTrip(deleteId);
    setDeleting(false);
    setDeleteId(null);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Trip deleted");
      router.refresh();
    }
  }

  const columns: Column<TripRow>[] = [
    { header: "Customer", accessorKey: "customer_name" },
    {
      header: "Pickup",
      accessorKey: (t) => t.pickup_location,
      hideOnMobile: true,
    },
    {
      header: "Drop",
      accessorKey: (t) => t.drop_location,
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Date",
      accessorKey: (t) => new Date(t.trip_date).toLocaleDateString("en-GB"),
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Driver",
      accessorKey: (t) => t.drivers?.name ?? "-",
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Vehicle",
      accessorKey: (t) => t.vehicles?.vehicle_number ?? "-",
      className: "hidden lg:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Status",
      accessorKey: (t) => {
        const currentStatus = localStatuses[t.id] ?? t.status;
        return (
          <Select
            value={currentStatus}
            onValueChange={(v) => { if (v) handleStatusChange(t.id, v); }}
          >
            <SelectTrigger className="h-7 w-32" size="sm">
              <SelectValue>
                {(value) => ((value as string) ?? currentStatus).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRIP_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  <StatusBadge status={s} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      header: "Amount",
      accessorKey: (t) =>
        t.total_amount ? `₹${t.total_amount.toLocaleString()}` : "-",
      className: "hidden lg:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Actions",
      accessorKey: (t) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/trips/${t.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/trips/${t.id}/edit`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteId(t.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search customers..."
          />
          <Button variant="secondary" size="sm" className="h-9" onClick={handleSearch}>
            Search
          </Button>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            if (val) {
              setStatusFilter(val);
              updateParam("status", val);
            }
          }}
        >
          <SelectTrigger className="h-9 w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="started">Started</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={trips}
        keyExtractor={(t) => t.id}
        emptyMessage={
          search || statusFilter !== "all"
            ? "No trips match your filters."
            : "No trips yet. Create your first trip."
        }
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
        title="Delete Trip"
        description="Are you sure? This will also remove linked expenses and payments."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
