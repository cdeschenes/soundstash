"use client";

import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserWithProfile } from "@/types";

interface UserTableProps {
  users: UserWithProfile[];
  currentUserId: string;
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  async function handleBan(userId: string, currentlyBanned: boolean) {
    try {
      const res = await fetch("/api/auth/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !currentlyBanned }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(currentlyBanned ? "User unbanned" : "User banned");
    } catch {
      toast.error("Action failed");
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">User</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Username</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Role</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Joined</th>
            <th className="pb-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <UserAvatar
                    name={user.name}
                    avatarPath={user.profile?.avatarPath}
                    className="h-7 w-7"
                  />
                  <div>
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                {user.profile?.username ?? "—"}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    user.role === "admin"
                      ? "bg-amber-900/50 text-amber-400"
                      : "bg-surface-2 text-muted-foreground"
                  }`}
                >
                  {user.role ?? "user"}
                </span>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">
                {formatDistanceToNow(user.createdAt, { addSuffix: true })}
              </td>
              <td className="py-3">
                {user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBan(user.id, user.banned ?? false)}
                    className={
                      user.banned
                        ? "text-green-500 hover:text-green-400"
                        : "text-red-500 hover:text-red-400"
                    }
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
