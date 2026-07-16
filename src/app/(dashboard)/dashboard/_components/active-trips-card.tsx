"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTripStatus } from "@/lib/actions/trips";
import { ArrowRight } from "lucide-react";

const STATUS_OPTIONS = ["pending", "assigned", "started", "completed", "cancelled"] as const;

export interface ActiveTrip {
  id: string;
  customer_name: string;
  pickup_location: string;
  drop_location: string;
  status: string;
  drivers: { name: string } | null;
  vehicles: { vehicle_number: string } | null;
}

interface ActiveTripsCardProps {
  trips: ActiveTrip[];
}

export function ActiveTripsCard({ trips }: ActiveTripsCardProps) {
  const [optimisticTrips, setOptimisticTrips] = useState(trips);

  const handleStatusChange = useCallback(async (tripId: string, newStatus: string) => {
    setOptimisticTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t))
    );
    const result = await updateTripStatus(tripId, newStatus);
    if (result.error) {
      setOptimisticTrips((prev) =>
        prev.map((t) => (t.id === tripId ? { ...t, status: trips.find((ot) => ot.id === tripId)?.status ?? t.status } : t))
      );
      toast.error(result.error);
    } else {
      toast.success("Trip status updated");
    }
  }, [trips]);

  if (optimisticTrips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active trips right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {optimisticTrips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{trip.customer_name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="truncate">{trip.pickup_location}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{trip.drop_location}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {trip.drivers?.name ?? "—"} · {trip.vehicles?.vehicle_number ?? "—"}
                </p>
              </div>
              <Select
                value={trip.status}
                onValueChange={(v) => { if (v) handleStatusChange(trip.id, v); }}
              >
                <SelectTrigger className="h-7 w-32" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      <StatusBadge status={s} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
