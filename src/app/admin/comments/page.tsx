import { Metadata } from "next";
import { getAllCommentsAdmin } from "@/server/queries/comments";
import { CommentModerationList } from "@/components/admin/CommentModerationList";

export const metadata: Metadata = { title: "Comments" };

export default async function AdminCommentsPage() {
  const { comments, total } = await getAllCommentsAdmin(1, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-foreground">Comments</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>
      <CommentModerationList comments={comments} />
    </div>
  );
}
