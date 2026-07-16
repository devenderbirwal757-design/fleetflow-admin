"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DriverForm } from "@/app/(dashboard)/drivers/_components/driver-form";
import { updateDriver } from "@/lib/actions/drivers";
import type { DriverInput } from "@/lib/validations/driver";
import type { Database } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

interface EditDriverFormProps {
  driver: DriverRow;
}

export function EditDriverForm({ driver }: EditDriverFormProps) {
  const router = useRouter();

  async function handleSubmit(data: DriverInput) {
    const { error } = await updateDriver(driver.id, data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Driver updated successfully");
    router.push("/drivers");
    router.refresh();
  }

  return (
    <DriverForm
      defaultValues={{
        name: driver.name,
        phone: driver.phone,
        license_number: driver.license_number,
        license_expiry: driver.license_expiry,
        address: driver.address ?? "",
        joining_date: driver.joining_date,
        salary_type: driver.salary_type,
        status: driver.status,
      }}
      onSubmit={handleSubmit}
    />
  );
}
