import { db } from "@/lib/db";
import type { UserWithProfile } from "@/types";

export async function getUserByUsername(
  username: string
): Promise<UserWithProfile | null> {
  const profile = await db.userProfile.findUnique({
    where: { username },
    include: {
      user: true,
    },
  });

  if (!profile) return null;

  return {
    ...profile.user,
    profile,
  };
}

export async function getUserById(id: string): Promise<UserWithProfile | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: { profile: true },
  });

  return user as UserWithProfile | null;
}

export async function getAllUsersAdmin(): Promise<UserWithProfile[]> {
  const users = await db.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return users as UserWithProfile[];
}
