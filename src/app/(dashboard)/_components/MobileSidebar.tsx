"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/hooks/use-sidebar";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Route,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import type { Role } from "@/types/auth";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Trips", href: "/trips", icon: Route },
  { title: "Drivers", href: "/drivers", icon: Users },
  { title: "Vehicles", href: "/vehicles", icon: Truck },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Reports", href: "/reports", icon: BarChart3, roles: ["SUPER_ADMIN"] },
  { title: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];

function MobileSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { role } = useUser();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="left" className="w-60 p-0">
        <SheetHeader className="flex h-14 flex-row items-center justify-between border-b px-4">
          <SheetTitle className="text-base">FleetFlow</SheetTitle>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-1">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export { MobileSidebar };
