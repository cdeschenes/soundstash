"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { deleteTrack, updateTrack, updateTrackArtwork } from "@/server/actions/tracks";
import { artworkUrl } from "@/lib/utils";

interface TrackActionsProps {
  trackId: string;
  slug: string;
  initialData: {
    title: string;
    description: string | null;
    genre: string | null;
    tags: string[];
    isPublic: boolean;
    artworkPath: string | null;
  };
  afterDelete?: "redirect" | "refresh";
}

export function TrackActions({
  trackId,
  slug,
  initialData,
  afterDelete = "refresh",
}: TrackActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [genre, setGenre] = useState(initialData.genre ?? "");
  const [tags, setTags] = useState(initialData.tags.join(", "));
  const [isPublic, setIsPublic] = useState(initialData.isPublic);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(artworkUrl(initialData.artworkPath));
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteTrack(trackId);
    setDeleting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setDeleteOpen(false);
    if (afterDelete === "redirect") {
      router.push("/feed");
    } else {
      router.refresh();
    }
  }

  function handleArtworkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setArtworkFile(file);
    if (file) {
      setArtworkPreview(URL.createObjectURL(file));
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    if (artworkFile) {
      const fd = new FormData();
      fd.append("artwork", artworkFile);
      const artResult = await updateTrackArtwork(trackId, fd);
      if (artResult.error) {
        setSaving(false);
        toast.error(artResult.error);
        return;
      }
    }

    const result = await updateTrack(trackId, {
      title: title.trim(),
      description: description.trim() || undefined,
      genre: genre.trim() || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isPublic,
    });
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setEditOpen(false);
    if (result.slug && result.slug !== slug) {
      router.push(`/track/${result.slug}`);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label="Edit track"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => setDeleteOpen(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
        aria-label="Delete track"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete track?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete <span className="text-foreground font-medium">{initialData.title}</span>. This action cannot be undone.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit track</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="track-title">Title</Label>
              <Input
                id="track-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="track-description">Description</Label>
              <Textarea
                id="track-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="track-genre">Genre</Label>
              <Input
                id="track-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="track-tags">Tags (comma-separated)</Label>
              <Input
                id="track-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ambient, electronic, lo-fi"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Artwork</Label>
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 rounded overflow-hidden bg-surface-2">
                  {artworkPreview ? (
                    <Image src={artworkPreview} alt="Artwork preview" fill unoptimized className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {artworkFile ? artworkFile.name : "Change artwork"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleArtworkChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="track-public"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-surface-2 accent-foreground"
              />
              <Label htmlFor="track-public">Public</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" size="sm">Cancel</Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
