"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { sendInviteEmail } from "@/lib/email";
import { nanoid } from "nanoid";
import { z } from "zod";
import { addDays } from "date-fns";

const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
});

export async function createInvite(
  input: z.infer<typeof createInviteSchema>
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const parsed = createInviteSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const { email, role } = parsed.data;

  // Check if user already exists
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "User with this email already exists" };

  // Check for pending invite
  const pendingInvite = await db.invite.findFirst({
    where: { email, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (pendingInvite) return { error: "A pending invite already exists for this email" };

  const token = nanoid(32);
  const expiresAt = addDays(new Date(), 7);

  await db.invite.create({
    data: {
      email,
      token,
      role,
      createdById: session.user.id,
      expiresAt,
    },
  });

  await sendInviteEmail(email, token);

  revalidatePath("/admin/invites");

  return {};
}

export async function resendInvite(
  inviteId: string
): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const invite = await db.invite.findUnique({ where: { id: inviteId } });

  if (!invite) return { error: "Invite not found" };
  if (invite.acceptedAt) return { error: "Invite already accepted" };

  const token = nanoid(32);
  const expiresAt = addDays(new Date(), 7);

  await db.invite.update({
    where: { id: inviteId },
    data: { token, expiresAt },
  });

  await sendInviteEmail(invite.email, token);

  revalidatePath("/admin/invites");

  return {};
}

export async function acceptInvite(
  token: string,
  name: string,
  password: string,
  username: string
): Promise<{ error?: string }> {
  const invite = await db.invite.findUnique({ where: { token } });

  if (!invite) return { error: "Invalid invite token" };
  if (invite.acceptedAt) return { error: "Invite already used" };
  if (invite.expiresAt < new Date()) return { error: "Invite has expired" };

  // Check username availability
  const usernameExists = await db.userProfile.findUnique({
    where: { username },
  });
  if (usernameExists) return { error: "Username already taken" };

  // Create user via Better Auth admin API
  const newUser = await auth.api.createUser({
    body: {
      email: invite.email,
      password,
      name,
      role: invite.role as "user" | "admin",
    },
  });

  if (!newUser) return { error: "Failed to create user" };

  // Create profile
  await db.userProfile.create({
    data: {
      userId: newUser.user.id,
      username,
      displayName: name,
    },
  });

  // Mark invite as accepted
  await db.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  return {};
}
