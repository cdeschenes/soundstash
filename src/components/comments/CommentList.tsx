"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteComment, updateComment } from "@/server/actions/comments";
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
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

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

  function startEdit(comment: CommentWithUser) {
    setEditingId(comment.id);
    setEditBody(comment.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  async function handleSave(commentId: string) {
    const result = await updateComment(commentId, editBody);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Comment updated");
    setEditingId(null);
    setEditBody("");
    router.refresh();
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => {
        const canDelete = isAdmin || currentUserId === comment.userId;
        const canEdit = currentUserId === comment.userId;
        const username =
          comment.user.profile?.username ?? comment.user.name;
        const avatarPath = comment.user.profile?.avatarPath;
        const isEditing = editingId === comment.id;

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
              {isEditing ? (
                <div className="mt-1 space-y-2">
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="text-sm min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSave(comment.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap">
                  {comment.body}
                </p>
              )}
            </div>
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {canEdit && (
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit comment"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted-foreground hover:text-red-500"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
