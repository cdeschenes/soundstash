import { db } from "@/lib/db";
import type { TrackWithUser, TrackWithDetails } from "@/types";

const trackWithUserInclude = {
  user: {
    include: {
      profile: true,
    },
  },
  links: {
    orderBy: { sortOrder: "asc" as const },
  },
  _count: {
    select: { comments: true, plays: true },
  },
};

export async function getFeedTracks(
  page = 1,
  limit = 20
): Promise<{ tracks: TrackWithUser[]; total: number }> {
  const skip = (page - 1) * limit;

  const [tracks, total] = await Promise.all([
    db.track.findMany({
      where: { status: "READY", isPublic: true, deletedAt: null },
      include: trackWithUserInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.track.count({
      where: { status: "READY", isPublic: true, deletedAt: null },
    }),
  ]);

  return { tracks: tracks as TrackWithUser[], total };
}

export async function getTrackBySlug(
  slug: string
): Promise<TrackWithDetails | null> {
  const track = await db.track.findFirst({
    where: { slug, deletedAt: null },
    include: {
      ...trackWithUserInclude,
      comments: {
        where: { deletedAt: null },
        include: {
          user: { include: { profile: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return track as TrackWithDetails | null;
}

export async function getUserTracks(userId: string): Promise<TrackWithUser[]> {
  const tracks = await db.track.findMany({
    where: { userId, status: "READY", isPublic: true, deletedAt: null },
    include: trackWithUserInclude,
    orderBy: { createdAt: "desc" },
  });

  return tracks as TrackWithUser[];
}

export async function getTrackById(id: string): Promise<TrackWithUser | null> {
  const track = await db.track.findUnique({
    where: { id },
    include: trackWithUserInclude,
  });

  return track as TrackWithUser | null;
}

export async function getAllTracksAdmin(
  page = 1,
  limit = 50
): Promise<{ tracks: TrackWithUser[]; total: number }> {
  const skip = (page - 1) * limit;

  const [tracks, total] = await Promise.all([
    db.track.findMany({
      include: trackWithUserInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.track.count(),
  ]);

  return { tracks: tracks as TrackWithUser[], total };
}
