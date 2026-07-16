"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTripStatus } from "@/lib/actions/trips";
import { Loader2 } from "lucide-react";

const statusFlow = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "assigned", label: "Assigned", color: "bg-indigo-100 text-indigo-800" },
  { value: "started", label: "Started", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

interface TripStatusActionsProps {
  tripId: string;
  currentStatus: string;
}

export function TripStatusActions({ tripId, currentStatus }: TripStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(status: string) {
    if (status === currentStatus) return;
    setLoading(status);
    const { error } = await updateTripStatus(tripId, status);
    setLoading(null);

    if (error) {
      toast.error(error);
    } else {
      toast.success(`Trip status updated to ${status}`);
      router.refresh();
    }
  }

  const currentIndex = statusFlow.findIndex((s) => s.value === currentStatus);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {statusFlow.map((s, i) => {
            const isCurrent = s.value === currentStatus;
            const isPast = i < currentIndex && s.value !== "cancelled";
            const isDisabled = loading !== null;

            return (
              <Button
                key={s.value}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                disabled={isDisabled || isCurrent}
                onClick={() => handleStatusChange(s.value)}
                className={isCurrent ? "" : isPast ? "border-emerald-300 text-emerald-700" : ""}
              >
                {loading === s.value && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                {s.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
