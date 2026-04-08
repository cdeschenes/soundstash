"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/server/actions/comments";
import { toast } from "sonner";

interface CommentFormProps {
  trackId: string;
}

export function CommentForm({ trackId }: CommentFormProps) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleCancel() {
    setOpen(false);
    setBody("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    const result = await addComment({ trackId, body: body.trim() });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setBody("");
      setOpen(false);
      toast.success("Comment added");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={handleOpen}>
        Post comment
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment…"
        rows={3}
        maxLength={1000}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading || !body.trim()}>
          {loading ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
