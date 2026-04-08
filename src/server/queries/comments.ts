import { db } from "@/lib/db";
import type { CommentWithUser } from "@/types";

export async function getTrackComments(
  trackId: string
): Promise<CommentWithUser[]> {
  const comments = await db.comment.findMany({
    where: { trackId, deletedAt: null },
    include: {
      user: { include: { profile: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return comments as CommentWithUser[];
}
