const env = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "FleetFlow",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
  },
} as const;

function checkEnv() {
  const missing: string[] = [];

  if (!env.supabase.url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabase.anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!env.gemini.apiKey) {
    console.warn(
      "Missing GEMINI_API_KEY — AI features will be disabled. " +
      "Set it in .env.local to enable expense analysis, insights, and summaries."
    );
  }

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`);
  }
}

checkEnv();

export { env };
