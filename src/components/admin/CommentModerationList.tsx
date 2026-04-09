"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteComment } from "@/server/actions/comments";
import { toast } from "sonner";
import type { AdminComment } from "@/server/queries/comments";

interface CommentModerationListProps {
  comments: AdminComment[];
}

export function CommentModerationList({ comments }: CommentModerationListProps) {
  const router = useRouter();

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">No comments found.</p>
    );
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    const result = await deleteComment(commentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Comment deleted");
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => {
        const username =
          comment.user.profile?.username ?? comment.user.name;
        const body =
          comment.body.length > 120
            ? comment.body.slice(0, 120) + "…"
            : comment.body;

        return (
          <div
            key={comment.id}
            className="flex items-start gap-4 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <Link
                  href={`/track/${comment.track.slug}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {comment.track.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  by {username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p
                className="text-sm text-muted-foreground"
                title={comment.body}
              >
                {body}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500 flex-shrink-0"
              onClick={() => handleDelete(comment.id)}
              aria-label="Delete comment"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
