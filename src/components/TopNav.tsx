"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Settings, Shield, LogOut, Music2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { HelpDialog } from "@/components/HelpDialog";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TopNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    profile?: { username: string; avatarPath?: string | null } | null;
  };
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  const navLinks = [
    { href: "/feed", label: "Feed" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 font-bold text-foreground">
          <Music2 className="h-5 w-5" />
          <span>SoundStash</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded text-sm transition-colors",
                pathname.startsWith(href)
                  ? "text-foreground bg-surface-2"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Link>

          {user.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <HelpDialog />

          <Link
            href="/settings/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <Link
            href={`/user/${user.profile?.username ?? user.id}`}
            className="flex items-center gap-2"
          >
            <UserAvatar
              name={user.name}
              avatarPath={user.profile?.avatarPath}
              className="h-8 w-8"
            />
          </Link>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded text-muted-foreground hover:text-muted-foreground hover:bg-surface-2 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
