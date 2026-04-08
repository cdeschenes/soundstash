import { TopNav } from "@/components/TopNav";
import { AudioProvider } from "@/components/AudioContext";

interface AppShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    profile?: { username: string; avatarPath?: string | null } | null;
  };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <AudioProvider>
      <div className="min-h-screen bg-background">
        <TopNav user={user} />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AudioProvider>
  );
}
