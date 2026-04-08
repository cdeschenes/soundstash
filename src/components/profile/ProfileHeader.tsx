import { UserAvatar } from "@/components/ui/UserAvatar";
import { Globe, MapPin } from "lucide-react";
import type { UserWithProfile } from "@/types";

interface ProfileHeaderProps {
  user: UserWithProfile;
  trackCount: number;
}

export function ProfileHeader({ user, trackCount }: ProfileHeaderProps) {
  const profile = user.profile;
  const displayName = profile?.displayName ?? user.name;
  const username = profile?.username ?? user.id;

  return (
    <div className="flex items-start gap-5 pb-8 border-b border-border">
      <UserAvatar
        name={displayName}
        avatarPath={profile?.avatarPath}
        className="h-20 w-20"
      />
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
        <p className="text-muted-foreground">@{username}</p>

        {profile?.bio && (
          <p className="mt-2 text-sm text-foreground max-w-lg">{profile.bio}</p>
        )}

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{trackCount} tracks</span>

          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
          )}

          {profile?.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              {new URL(profile.website).hostname}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
