import { Suspense } from "react";
import LoginForm from "./login-form";
import Link from "next/link";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="bg-card/80 dark:bg-white/8 mx-auto w-full max-w-[400px] rounded-2xl border border-black/10 px-8 py-10 shadow-2xl backdrop-blur-xl dark:border-white/15">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          FleetFlow
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-4">
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
