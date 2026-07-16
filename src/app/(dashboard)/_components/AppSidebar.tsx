"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Route,
  Users,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
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

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const { role } = useUser();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <aside
      className={cn(
        "bg-sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!collapsed && (
          <Link href="/dashboard" className="text-sidebar-foreground font-semibold">
            FleetFlow
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("text-sidebar-foreground", collapsed && "mx-auto")}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}

export { AppSidebar };
