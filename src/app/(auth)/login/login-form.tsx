"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { signInSchema, isPhoneInput, type SignInInput } from "@/lib/validations/auth";
import { resolvePhoneToEmail } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(data: SignInInput) {
    setServerError(null);

    try {
      let email = data.identifier;

      if (isPhoneInput(data.identifier)) {
        const { email: resolved } = await resolvePhoneToEmail(data.identifier);
        if (!resolved) {
          const msg = "Invalid credentials";
          setServerError(msg);
          toast.error(msg);
          return;
        }
        email = resolved;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (error) {
        const message = "Invalid credentials";
        setServerError(message);
        toast.error(message);
        return;
      }

      toast.success("Signed in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch {
      const message = "Unable to connect. Please try again.";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="identifier" className="text-foreground text-sm font-medium">
          Email or Phone
        </label>
        <Input
          id="identifier"
          placeholder="admin@example.com or +91 9876543210"
          autoComplete="username"
          className="h-10"
          {...register("identifier")}
        />
        {errors.identifier && <p className="text-destructive text-xs">{errors.identifier.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-foreground text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className="h-10"
          {...register("password")}
        />
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-destructive text-sm">{serverError}</p>}

      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
