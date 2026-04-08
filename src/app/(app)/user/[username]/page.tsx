import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserByUsername } from "@/server/queries/users";
import { getUserTracks } from "@/server/queries/tracks";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TrackFeed } from "@/components/track/TrackFeed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return {
    title: user?.profile?.displayName ?? user?.name ?? username,
  };
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUserByUsername(username),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!user) notFound();

  const tracks = await getUserTracks(user.id);

  return (
    <div className="space-y-8">
      <ProfileHeader user={user} trackCount={tracks.length} />
      <TrackFeed
        tracks={tracks}
        currentUserId={session?.user.id}
        isAdmin={session?.user.role === "admin"}
      />
    </div>
  );
}
