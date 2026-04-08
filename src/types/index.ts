import type { User, UserProfile, Track, TrackLink, Comment, Invite } from "@prisma/client";

// ─── User ─────────────────────────────────────────────────────────────────────

export type UserWithProfile = User & {
  profile: UserProfile | null;
};

export type PublicUser = Pick<User, "id" | "name" | "email"> & {
  profile: Pick<
    UserProfile,
    "username" | "displayName" | "bio" | "avatarPath" | "website" | "location"
  > | null;
};

// ─── Track ────────────────────────────────────────────────────────────────────

export type TrackWithUser = Track & {
  user: UserWithProfile;
  links: TrackLink[];
  _count: { comments: number; plays: number };
};

export type TrackWithDetails = TrackWithUser & {
  comments: CommentWithUser[];
};

// ─── Comment ──────────────────────────────────────────────────────────────────

export type CommentWithUser = Comment & {
  user: UserWithProfile;
};

// ─── Invite ───────────────────────────────────────────────────────────────────

export type InviteWithCreator = Invite & {
  createdBy: Pick<User, "id" | "name" | "email">;
};

// ─── API responses ────────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};
