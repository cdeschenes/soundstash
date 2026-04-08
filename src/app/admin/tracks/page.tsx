import { Metadata } from "next";
import { getAllTracksAdmin } from "@/server/queries/tracks";
import { TrackFeed } from "@/components/track/TrackFeed";

export const metadata: Metadata = { title: "Tracks" };

export default async function AdminTracksPage() {
  const { tracks, total } = await getAllTracksAdmin(1, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-foreground">Tracks</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>
      <TrackFeed tracks={tracks} isAdmin />
    </div>
  );
}
