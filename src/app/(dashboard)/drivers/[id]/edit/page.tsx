import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getDriver } from "@/lib/actions/drivers";
import { EditDriverForm } from "./_components/edit-driver-form";

export const metadata: Metadata = {
  title: "Edit Driver",
};

export default async function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: driver } = await getDriver(id);

  if (!driver) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Driver" description={`Updating ${driver.name}`} />

      <Card>
        <CardContent className="pt-6">
          <EditDriverForm driver={driver} />
        </CardContent>
      </Card>
    </div>
  );
}
