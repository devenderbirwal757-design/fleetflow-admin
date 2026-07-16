import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CreateDriverForm } from "../_components/create-driver-form";

export const metadata: Metadata = {
  title: "Add Driver",
};

export default function NewDriverPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Add Driver" description="Register a new driver" />

      <Card>
        <CardContent className="pt-6">
          <CreateDriverForm />
        </CardContent>
      </Card>
    </div>
  );
}
