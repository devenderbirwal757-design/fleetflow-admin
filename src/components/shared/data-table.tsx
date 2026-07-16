import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-muted/50">
              {columns.map((col) => {
                const value =
                  typeof col.accessorKey === "function"
                    ? col.accessorKey(item)
                    : (item[col.accessorKey] as React.ReactNode);

                return (
                  <td
                    key={col.header}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-sm",
                      col.hideOnMobile && "hidden sm:table-cell",
                      col.className
                    )}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
