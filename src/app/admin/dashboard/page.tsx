import { Metadata } from "next";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [userCount, trackCount, commentCount, pendingInvites] =
    await Promise.all([
      db.user.count(),
      db.track.count({ where: { deletedAt: null } }),
      db.comment.count({ where: { deletedAt: null } }),
      db.invite.count({
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
      }),
    ]);

  const stats = [
    { label: "Users", value: userCount },
    { label: "Tracks", value: trackCount },
    { label: "Comments", value: commentCount },
    { label: "Pending invites", value: pendingInvites },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-surface border border-border rounded-lg p-4"
          >
            <div className="text-3xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
