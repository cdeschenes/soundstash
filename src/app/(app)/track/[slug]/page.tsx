import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTrackBySlug } from "@/server/queries/tracks";
import { TrackBarPlayer } from "@/components/player/TrackBarPlayer";
import { CommentList } from "@/components/comments/CommentList";
import { CommentForm } from "@/components/comments/CommentForm";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = await getTrackBySlug(slug);
  return { title: track?.title ?? "Track" };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [track, session] = await Promise.all([
    getTrackBySlug(slug),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!track) notFound();

  const profile = track.user.profile;
  const artistName = profile?.displayName ?? track.user.name;
  const username = profile?.username ?? track.user.id;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Player */}
      <TrackBarPlayer
        track={track}
        variant="page"
        canManage={
          session?.user.id === track.userId ||
          session?.user.role === "admin"
        }
      />

      {/* Description */}
      {track.description && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">About</h2>
          <p className="text-foreground whitespace-pre-wrap">{track.description}</p>
        </div>
      )}

      {/* External links */}
      {track.links.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Links</h2>
          <ul className="space-y-1">
            {track.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Artist mini-card */}
      <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg">
        <UserAvatar
          name={artistName}
          avatarPath={profile?.avatarPath}
          className="h-12 w-12"
        />
        <div>
          <Link
            href={`/user/${username}`}
            className="font-medium text-foreground hover:text-foreground"
          >
            {artistName}
          </Link>
          {profile?.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Comments ({track.comments.length})
        </h2>
        <div className="space-y-6">
          <CommentForm trackId={track.id} />
          <CommentList
            comments={track.comments}
            currentUserId={session?.user.id}
            isAdmin={session?.user.role === "admin"}
          />
        </div>
      </div>
    </div>
  );
}
