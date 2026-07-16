import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RoleGuard } from "@/components/shared/role-guard";
import { getUsers } from "@/lib/actions/users";
import { InviteUserForm } from "./_components/invite-user-form";
import { UserList } from "./_components/user-list";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const { data: users } = await getUsers();

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage users and application settings"
        />

        <InviteUserForm />

        <UserList users={users ?? []} />
      </div>
    </RoleGuard>
  );
}
