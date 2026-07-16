"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateUserRole, updateUserPhone } from "@/lib/actions/users";
import { Shield, ShieldOff, Users, Phone, Check, X } from "lucide-react";

interface UserListProps {
  users: { id: string; name: string; email: string; role: string; phone: string | null; created_at: string }[];
}

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState("");

  async function handleRoleToggle(userId: string, currentRole: string) {
    const newRole = currentRole === "SUPER_ADMIN" ? "OPERATOR" : "SUPER_ADMIN";
    const { error } = await updateUserRole(userId, newRole);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(`Role changed to ${newRole}`);
    router.refresh();
  }

  function startEditPhone(userId: string, current: string | null) {
    setEditingPhone(userId);
    setPhoneValue(current ?? "");
  }

  async function savePhone(userId: string) {
    const { error } = await updateUserPhone(userId, phoneValue);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Phone updated");
    setEditingPhone(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No users found.
          </p>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {editingPhone === user.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.target.value)}
                          placeholder="+91 9876543210"
                          className="h-7 w-40 text-xs"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => savePhone(user.id)}
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setEditingPhone(null)}
                        >
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditPhone(user.id, user.phone)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-3 w-3" />
                        {user.phone ?? "Add phone"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      user.role === "SUPER_ADMIN"
                        ? "border-0 bg-purple-100 font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                        : "border-0 bg-blue-100 font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }
                  >
                    {user.role === "SUPER_ADMIN" ? "Super Admin" : "Operator"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRoleToggle(user.id, user.role)}
                    className="text-xs"
                  >
                    {user.role === "SUPER_ADMIN" ? (
                      <ShieldOff className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
