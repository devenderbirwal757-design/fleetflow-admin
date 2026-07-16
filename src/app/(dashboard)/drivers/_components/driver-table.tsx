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
import { deleteDriver, updateDriverStatus } from "@/lib/actions/drivers";
import { Pencil, Trash2 } from "lucide-react";
import type { Database } from "@/types/database";

const DRIVER_STATUS_OPTIONS = ["available", "on_trip", "off_duty", "inactive"] as const;

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

interface DriverTableProps {
  drivers: DriverRow[];
  currentPage: number;
  totalPages: number;
  lockedIds: Set<string>;
}

export function DriverTable({ drivers, currentPage, totalPages, lockedIds }: DriverTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`/drivers?${params.toString()}`);
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
    const { error } = await deleteDriver(deleteId);
    setDeleting(false);
    setDeleteId(null);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Driver deleted");
      router.refresh();
    }
  }

  const handleStatusChange = useCallback(async (driverId: string, newStatus: string) => {
    setLocalStatuses((prev) => ({ ...prev, [driverId]: newStatus }));
    const result = await updateDriverStatus(driverId, newStatus);
    if (result.error) {
      setLocalStatuses((prev) => {
        const next = { ...prev };
        delete next[driverId];
        return next;
      });
      toast.error(result.error);
    } else {
      toast.success("Status updated");
    }
  }, []);

  const columns: Column<DriverRow>[] = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Phone",
      accessorKey: "phone",
      hideOnMobile: true,
    },
    {
      header: "License",
      accessorKey: "license_number",
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Expiry",
      accessorKey: (d) => new Date(d.license_expiry).toLocaleDateString("en-GB"),
      className: "hidden md:table-cell",
      hideOnMobile: true,
    },
    {
      header: "Status",
      accessorKey: (d) => {
        const currentStatus = localStatuses[d.id] ?? d.status;
        const locked = lockedIds.has(d.id);
        return (
          <Select
            value={currentStatus}
            disabled={locked}
            onValueChange={(v) => { if (v) handleStatusChange(d.id, v); }}
          >
            <SelectTrigger className="h-7 w-32" size="sm">
              <SelectValue>
                {(value) => ((value as string) ?? currentStatus).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DRIVER_STATUS_OPTIONS.map((s) => (
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
      header: "Actions",
      accessorKey: (d) => (
        <div className="flex items-center gap-1">
          <Link
              href={`/drivers/${d.id}/edit`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteId(d.id)}
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
        <div className="flex gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search by name, phone, license..."
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="on_trip">On Trip</SelectItem>
            <SelectItem value="off_duty">Off Duty</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        keyExtractor={(d) => d.id}
        emptyMessage={
          search || statusFilter !== "all"
            ? "No drivers match your filters."
            : "No drivers yet. Add your first driver."
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
        title="Delete Driver"
        description="Are you sure? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleting}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
