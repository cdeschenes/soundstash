"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { z } from "zod";

const addCommentSchema = z.object({
  trackId: z.string().min(1),
  body: z.string().min(1).max(1000),
});

export async function addComment(
  input: z.infer<typeof addCommentSchema>
): Promise<{ error?: string; commentId?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const parsed = addCommentSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { trackId, body } = parsed.data;

  const track = await db.track.findFirst({
    where: { id: trackId, deletedAt: null, status: "READY" },
    select: { slug: true },
  });

  if (!track) return { error: "Track not found" };

  const comment = await db.comment.create({
    data: {
      trackId,
      userId: session.user.id,
      body,
    },
  });

  revalidatePath(`/track/${track.slug}`);

  return { commentId: comment.id };
}

export async function updateComment(
  commentId: string,
  body: string
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const parsed = z.string().min(1).max(1000).safeParse(body);
  if (!parsed.success) return { error: "Comment must be between 1 and 1000 characters" };

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { track: { select: { slug: true } } },
  });

  if (!comment || comment.deletedAt) return { error: "Comment not found" };

  if (comment.userId !== session.user.id) return { error: "Forbidden" };

  await db.comment.update({
    where: { id: commentId },
    data: { body: parsed.data },
  });

  revalidatePath(`/track/${comment.track.slug}`);

  return {};
}

export async function deleteComment(
  commentId: string
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const comment = await db.comment.findUnique({
    where: { id: commentId },
    include: { track: { select: { slug: true } } },
  });

  if (!comment) return { error: "Comment not found" };

  const isOwner = comment.userId === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) return { error: "Forbidden" };

  await db.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/track/${comment.track.slug}`);

  return {};
}
