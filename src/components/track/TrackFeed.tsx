"use client";

import { useRouter } from "next/navigation";
import { TrackBarPlayer } from "@/components/player/TrackBarPlayer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Music } from "lucide-react";
import type { TrackWithUser } from "@/types";

interface TrackFeedProps {
  tracks: TrackWithUser[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export function TrackFeed({ tracks, currentUserId, isAdmin }: TrackFeedProps) {
  const router = useRouter();

  if (tracks.length === 0) {
    return (
      <EmptyState
        title="No tracks yet"
        description="Tracks will appear here once uploaded."
        icon={<Music className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <div
          key={track.id}
          onClick={() => router.push(`/track/${track.slug}`)}
          className="cursor-pointer"
        >
          <TrackBarPlayer
              track={track}
              variant="feed"
              canManage={isAdmin || currentUserId === track.userId}
            />
        </div>
      ))}
    </div>
  );
}
