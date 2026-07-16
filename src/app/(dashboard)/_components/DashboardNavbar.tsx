"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/lib/actions/auth";
import { ROLE_LABELS } from "@/types/auth";
import { Menu, Search, Bell, LogOut, Settings } from "lucide-react";

function DashboardNavbar() {
  const router = useRouter();
  const { open } = useSidebar();
  const { user, role } = useUser();

  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";
  const displayName = user?.email?.split("@")[0] ?? "User";

  const handleSignOut = useCallback(() => {
    signOut()
      .catch(() => {})
      .finally(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <header className="bg-background sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={open}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex sm:flex-1">
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            placeholder="Search trips, drivers..."
            className="bg-background h-9 w-full rounded-md border pr-4 pl-9 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent hover:text-accent-foreground flex h-8 cursor-default items-center gap-2 rounded-full px-2 text-sm font-medium outline-none">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block">{displayName}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-muted-foreground text-xs font-normal">{user?.email}</p>
                  {role && (
                    <Badge variant="outline" className="mt-1 w-fit text-xs">
                      {ROLE_LABELS[role]}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { DashboardNavbar };
