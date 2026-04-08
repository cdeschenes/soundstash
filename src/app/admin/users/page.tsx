import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllUsersAdmin } from "@/server/queries/users";
import { UserTable } from "@/components/admin/UserTable";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    getAllUsersAdmin(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <UserTable
        users={users}
        currentUserId={session?.user.id ?? ""}
      />
    </div>
  );
}
