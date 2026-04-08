import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getFeedTracks } from "@/server/queries/tracks";
import { TrackFeed } from "@/components/track/TrackFeed";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const [{ tracks }, session] = await Promise.all([
    getFeedTracks(1, 30),
    auth.api.getSession({ headers: await headers() }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Latest tracks</h1>
      <TrackFeed
        tracks={tracks}
        currentUserId={session?.user.id}
        isAdmin={session?.user.role === "admin"}
      />
    </div>
  );
}
