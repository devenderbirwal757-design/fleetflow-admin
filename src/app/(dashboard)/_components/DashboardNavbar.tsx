"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/hooks/use-sidebar";
import { useUser } from "@/hooks/use-user";
import { signOut } from "@/lib/actions/auth";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/lib/actions/notifications";
import { ROLE_LABELS } from "@/types/auth";
import { Menu, Search, Bell, LogOut, Settings, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  trip_id: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function DashboardNavbar() {
  const router = useRouter();
  const { open } = useSidebar();
  const { user, role } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";
  const displayName = user?.email?.split("@")[0] ?? "User";

  const fetchNotifications = useCallback(async () => {
    const [notifs, count] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
    ]);
    if (notifs.data) setNotifications(notifs.data);
    if (count.count !== undefined) setUnreadCount(count.count);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.trip_id) {
      router.push(`/trips/${notif.trip_id}`);
    }
  };

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
        <DropdownMenu onOpenChange={(isOpen) => { if (isOpen) fetchNotifications(); }}>
          <DropdownMenuTrigger className="hover:bg-accent hover:text-accent-foreground relative flex h-9 items-center justify-center rounded-md outline-none">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAllRead}
                >
                  <CheckCheck className="mr-1 h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                No notifications yet
              </div>
            ) : (
              <ScrollArea className="h-72">
                {notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`flex flex-col items-start gap-1 py-2 ${
                      !notif.is_read ? "bg-accent/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-medium">{notif.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {notif.message}
                    </span>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
