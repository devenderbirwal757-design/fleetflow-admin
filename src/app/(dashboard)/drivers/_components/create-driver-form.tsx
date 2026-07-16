"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DriverForm } from "./driver-form";
import { createDriver } from "@/lib/actions/drivers";
import type { DriverInput } from "@/lib/validations/driver";

export function CreateDriverForm() {
  const router = useRouter();

  async function handleSubmit(data: DriverInput) {
    const { error } = await createDriver(data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Driver added successfully");
    router.push("/drivers");
    router.refresh();
  }

  return <DriverForm onSubmit={handleSubmit} />;
}
