"use server";

import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";
import { saveFile, deleteFile } from "@/lib/media";

export async function deleteTrack(trackId: string): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const track = await db.track.findUnique({ where: { id: trackId } });

  if (!track) return { error: "Track not found" };

  const isOwner = track.userId === session.user.id;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) return { error: "Forbidden" };

  await db.track.update({
    where: { id: trackId },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/feed");
  revalidatePath(`/track/${track.slug}`);

  return {};
}

export async function updateTrack(
  trackId: string,
  data: {
    title?: string;
    description?: string;
    genre?: string;
    tags?: string[];
    isPublic?: boolean;
  }
): Promise<{ slug?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const track = await db.track.findUnique({ where: { id: trackId } });

  if (!track) return { error: "Track not found" };

  const isOwner = track.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) return { error: "Forbidden" };

  const updateData: typeof data & { slug?: string } = { ...data };

  if (data.title && data.title !== track.title) {
    updateData.slug = slugify(data.title, nanoid(6));
  }

  await db.track.update({
    where: { id: trackId },
    data: updateData,
  });

  revalidatePath("/feed");
  revalidatePath(`/track/${track.slug}`);

  return { slug: updateData.slug ?? track.slug };
}

export async function updateTrackArtwork(
  trackId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const track = await db.track.findUnique({ where: { id: trackId } });

  if (!track) return { error: "Track not found" };

  const isOwner = track.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) return { error: "Forbidden" };

  const artworkFile = formData.get("artwork");
  if (!(artworkFile instanceof File) || artworkFile.size === 0) {
    return { error: "No artwork file provided" };
  }

  if (!artworkFile.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  const ext = path.extname(artworkFile.name) || ".jpg";
  const artworkRelativePath = `tracks/${track.userId}/${trackId}_artwork${ext}`;

  const buffer = Buffer.from(await artworkFile.arrayBuffer());
  await saveFile(buffer, artworkRelativePath);

  if (track.artworkPath && track.artworkPath !== artworkRelativePath) {
    await deleteFile(track.artworkPath);
  }

  await db.track.update({
    where: { id: trackId },
    data: { artworkPath: artworkRelativePath },
  });

  revalidatePath("/feed");
  revalidatePath(`/track/${track.slug}`);

  return {};
}
