"use server";

import { cleanPhone } from "@/lib/validations/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // best-effort; client will navigate regardless
  }
}

export async function signUpUser(input: SignUpInput) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input. Please check the form." };
  }

  try {
    const admin = createAdminClient();
    const { error, data: createdUser } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        name: parsed.data.name,
        role: "OPERATOR",
      },
    });

    if (error) throw error;

    if (parsed.data.phone && createdUser?.user?.id) {
      const cleaned = cleanPhone(parsed.data.phone);
      await admin.from("profiles").update({ phone: cleaned } as never).eq("id", createdUser.user.id);
    }

    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    if (message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: message };
  }
}

export async function resolvePhoneToEmail(phone: string) {
  try {
    const supabase = await createClient();
    const cleaned = cleanPhone(phone);
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("phone", cleaned)
      .maybeSingle();
    return { email: data?.email ?? null };
  } catch {
    return { email: null };
  }
}


