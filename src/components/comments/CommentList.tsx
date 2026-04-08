"use client";

import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { deleteComment } from "@/server/actions/comments";
import { toast } from "sonner";
import type { CommentWithUser } from "@/types";

interface CommentListProps {
  comments: CommentWithUser[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No comments yet. Be the first!
      </p>
    );
  }

  async function handleDelete(commentId: string) {
    const result = await deleteComment(commentId);
    if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => {
        const canDelete =
          isAdmin || currentUserId === comment.userId;
        const username =
          comment.user.profile?.username ?? comment.user.name;
        const avatarPath = comment.user.profile?.avatarPath;

        return (
          <li key={comment.id} className="flex gap-3 group">
            <UserAvatar
              name={comment.user.name}
              avatarPath={avatarPath}
              className="h-8 w-8 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">
                  {username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
            {canDelete && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 flex-shrink-0"
                aria-label="Delete comment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
