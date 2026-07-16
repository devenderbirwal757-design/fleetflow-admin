"use server";

import { cleanPhone } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["SUPER_ADMIN", "OPERATOR"]),
  phone: z.string().optional(),
});

export async function getUsers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, phone, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

export async function inviteUser(formData: FormData) {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    role: formData.get("role"),
    phone: formData.get("phone"),
  };

  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid input. Please check the form." };
  }

  try {
    const admin = createAdminClient();

    const { error: createError, data: createdUser } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        name: parsed.data.name,
        role: parsed.data.role,
      },
    });

    if (createError) throw createError;

    if (parsed.data.phone && createdUser?.user?.id) {
      const cleaned = cleanPhone(parsed.data.phone);
      await admin.from("profiles").update({ phone: cleaned } as never).eq("id", createdUser.user.id);
    }

    revalidatePath("/settings");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function updateUserPhone(userId: string, phone: string) {
  try {
    const cleaned = cleanPhone(phone);
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ phone: cleaned || null } as never)
      .eq("id", userId);
    if (error) throw error;
    revalidatePath("/settings");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function updateUserRole(userId: string, role: "SUPER_ADMIN" | "OPERATOR") {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/settings");
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
