import { db } from "@/lib/db";
import type { CommentWithUser } from "@/types";

export type AdminComment = CommentWithUser & {
  track: { slug: string; title: string };
};

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

export async function getAllCommentsAdmin(
  page = 1,
  limit = 100
): Promise<{ comments: AdminComment[]; total: number }> {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    db.comment.findMany({
      where: { deletedAt: null },
      include: {
        user: { include: { profile: true } },
        track: { select: { slug: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.comment.count({ where: { deletedAt: null } }),
  ]);

  return { comments: comments as AdminComment[], total };
}
