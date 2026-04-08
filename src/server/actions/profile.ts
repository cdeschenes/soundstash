"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { saveFile } from "@/lib/media";
import { z } from "zod";
import path from "path";
import { nanoid } from "nanoid";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
});

export async function getMyProfile(): Promise<{
  displayName: string;
  bio: string;
  website: string;
  location: string;
  avatarPath: string | null;
} | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  return {
    displayName: profile?.displayName ?? session.user.name ?? "",
    bio: profile?.bio ?? "",
    website: profile?.website ?? "",
    location: profile?.location ?? "",
    avatarPath: profile?.avatarPath ?? null,
  };
}

export async function updateProfile(
  input: z.infer<typeof updateProfileSchema>
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  await db.userProfile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: {
      userId: session.user.id,
      username: session.user.email.split("@")[0],
      ...parsed.data,
    },
  });

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) {
    revalidatePath(`/user/${profile.username}`);
  }
  revalidatePath("/settings/profile");

  return {};
}

export async function uploadAvatar(
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return { error: "Unauthorized" };

  const file = formData.get("avatar");
  if (!(file instanceof File)) return { error: "No file provided" };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) return { error: "File too large. Max 5MB." };

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${nanoid()}_avatar${ext}`;
  const relativePath = `avatars/${filename}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await saveFile(buffer, relativePath);

  await db.userProfile.upsert({
    where: { userId: session.user.id },
    update: { avatarPath: relativePath },
    create: {
      userId: session.user.id,
      username: session.user.email.split("@")[0],
      avatarPath: relativePath,
    },
  });

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (profile) {
    revalidatePath(`/user/${profile.username}`);
  }
  revalidatePath("/settings/profile");

  return {};
}
