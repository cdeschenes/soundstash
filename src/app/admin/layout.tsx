import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    redirect("/feed");
  }

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/invites", label: "Invites" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/tracks", label: "Tracks" },
    { href: "/admin/comments", label: "Comments" },
  ];

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        profile: profile
          ? { username: profile.username, avatarPath: profile.avatarPath }
          : null,
      }}
    >
      <div className="flex gap-8">
        <aside className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AppShell>
  );
}
