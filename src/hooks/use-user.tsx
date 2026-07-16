"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { Role } from "@/types/auth";

interface UserContextValue {
  user: User | null;
  role: Role | null;
}

const UserContext = createContext<UserContextValue>({ user: null, role: null });

export function UserProvider({ user, children }: { user: User | null; children: React.ReactNode }) {
  const role = (user?.user_metadata?.role as Role) ?? null;
  return <UserContext.Provider value={{ user, role }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
