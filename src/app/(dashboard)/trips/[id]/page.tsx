import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getTrip } from "@/lib/actions/trips";
import { TripStatusActions } from "./_components/trip-status-actions";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  Receipt,
  Banknote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Trip Details",
};

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: trip } = await getTrip(id);

  if (!trip) notFound();

  const driver = trip.drivers;
  const vehicle = trip.vehicles;
  const expenses = trip.expenses ?? [];
  const payments = trip.payments ?? [];
  const totalPaid = payments.reduce(
    (sum: number, p: { amount: number }) => sum + Number(p.amount),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Trip - ${trip.customer_name}`}
        description={new Date(trip.trip_date).toLocaleDateString()}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              Customer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{trip.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{trip.customer_phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              Trip Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p>{trip.pickup_location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Drop</p>
                <p>{trip.drop_location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Trip Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(trip.trip_date).toLocaleDateString()}</span>
            </div>
            {trip.trip_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{trip.trip_time}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Type:
              </span>
              <span className="capitalize">{trip.trip_type.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                Status:
              </span>
              <StatusBadge status={trip.status} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-muted-foreground" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-medium">{driver?.name ?? "Not assigned"}</span>
            </div>
            {driver && (
              <div className="flex items-center gap-2 pl-6">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{driver.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Vehicle:</span>
              <span className="font-medium">
                {vehicle
                  ? `${vehicle.vehicle_number} - ${vehicle.brand_model}`
                  : "Not assigned"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">
                {trip.total_amount
                  ? `₹${Number(trip.total_amount).toLocaleString()}`
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Advance Paid</span>
              <span>₹{Number(trip.advance_amount).toLocaleString()}</span>
            </div>
            <hr />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-medium text-emerald-600">
                ₹{totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <StatusBadge
                status={
                  trip.total_amount && totalPaid >= Number(trip.total_amount)
                    ? "paid"
                    : totalPaid > 0
                      ? "partial"
                      : "pending"
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              Expenses ({expenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No expenses recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {expenses.map(
                  (exp: {
                    id: string;
                    category: string;
                    amount: number;
                    description: string | null;
                  }) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium capitalize">
                          {exp.category.replace(/_/g, " ")}
                        </span>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <span className="font-medium">
                        ₹{Number(exp.amount).toLocaleString()}
                      </span>
                    </div>
                  )
                )}
                <div className="flex justify-between border-t pt-2 text-sm font-medium">
                  <span>Total Expenses</span>
                  <span>
                    ₹
                    {expenses
                      .reduce(
                        (s: number, e: { amount: number }) => s + Number(e.amount),
                        0
                      )
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              Payments ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No payments recorded.
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map(
                  (p: {
                    id: string;
                    amount: number;
                    payment_mode: string;
                    payment_status: string;
                    payment_date: string;
                  }) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          ₹{Number(p.amount).toLocaleString()}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {p.payment_mode.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}{" "}
                          &middot;{" "}
                          {new Date(p.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={p.payment_status} />
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(trip.notes || trip.special_requirements) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {trip.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p>{trip.notes}</p>
              </div>
            )}
            {trip.special_requirements && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Special Requirements
                </p>
                <p>{trip.special_requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TripStatusActions tripId={trip.id} currentStatus={trip.status} />
    </div>
  );
}
