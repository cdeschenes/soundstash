import { Metadata } from "next";
import { db } from "@/lib/db";
import { InviteForm } from "@/components/admin/InviteForm";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Invites" };

export default async function AdminInvitesPage() {
  const invites = await db.invite.findMany({
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Invites</h1>
        <div className="bg-surface border border-border rounded-lg p-5">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            Send new invite
          </h2>
          <InviteForm />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent invites
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Email</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Role</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
                <th className="pb-3 pr-4 font-medium text-muted-foreground">Sent</th>
                <th className="pb-3 font-medium text-muted-foreground">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invites.map((invite) => {
                const isExpired =
                  !invite.acceptedAt && invite.expiresAt < new Date();
                const status = invite.acceptedAt
                  ? "accepted"
                  : isExpired
                  ? "expired"
                  : "pending";

                return (
                  <tr key={invite.id}>
                    <td className="py-3 pr-4 text-foreground">{invite.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{invite.role}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          status === "accepted"
                            ? "bg-green-900/50 text-green-400"
                            : status === "expired"
                            ? "bg-surface-2 text-muted-foreground"
                            : "bg-blue-900/50 text-blue-400"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDistanceToNow(invite.createdAt, {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {isExpired || invite.acceptedAt
                        ? "—"
                        : formatDistanceToNow(invite.expiresAt, {
                            addSuffix: true,
                          })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {invites.length === 0 && (
            <p className="py-8 text-center text-muted-foreground text-sm">
              No invites yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
