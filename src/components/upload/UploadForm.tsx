"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "failed";

export function UploadForm() {
  const router = useRouter();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [trackId, setTrackId] = useState<string | null>(null);

  async function pollStatus(id: string) {
    const poll = async () => {
      const res = await fetch(`/api/tracks/${id}/status`);
      if (!res.ok) return;
      const data = await res.json() as { status: string; slug: string };

      if (data.status === "READY") {
        setStatus("done");
        toast.success("Track ready!");
        router.push(`/track/${data.slug}`);
      } else if (data.status === "FAILED") {
        setStatus("failed");
        toast.error("Processing failed. The upload was saved but may not play.");
      } else {
        setTimeout(poll, 2000);
      }
    };
    await poll();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioFile || !title.trim()) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("genre", genre.trim());
    formData.append("tags", tags);
    if (artworkFile) formData.append("artwork", artworkFile);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }

      const data = await res.json() as { trackId: string };
      setTrackId(data.trackId);
      setStatus("processing");
      toast.info("Upload complete. Processing waveform…");
      await pollStatus(data.trackId);
    } catch (err) {
      setStatus("failed");
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function handleArtworkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setArtworkFile(file);
    setArtworkPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearArtwork() {
    setArtworkFile(null);
    setArtworkPreview(null);
    if (artworkInputRef.current) artworkInputRef.current.value = "";
  }

  const isSubmitting = status === "uploading" || status === "processing";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UploadDropzone onFileSelect={setAudioFile} selectedFile={audioFile} />

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Track title"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description…"
            rows={3}
            className="mt-1 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Electronic"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ambient, lo-fi, chill"
              className="mt-1"
            />
          </div>
        </div>

        {/* Artwork */}
        <div>
          <Label>Cover artwork <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <div className="mt-2 flex items-center gap-3">
            {artworkPreview ? (
              <>
                <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border border-border">
                  <Image src={artworkPreview} alt="Artwork preview" fill unoptimized className="object-cover" sizes="80px" />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => artworkInputRef.current?.click()}
                  >
                    Change artwork
                  </Button>
                  <button
                    type="button"
                    onClick={clearArtwork}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => artworkInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <ImagePlus className="h-4 w-4" />
                Add artwork
              </button>
            )}
            <input
              ref={artworkInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleArtworkChange}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!audioFile || !title.trim() || isSubmitting}
        className="w-full"
      >
        {status === "uploading"
          ? "Uploading…"
          : status === "processing"
          ? "Processing waveform…"
          : "Upload Track"}
      </Button>

      {status === "failed" && trackId && (
        <p className="text-sm text-amber-500 text-center">
          Upload saved but processing failed. You can retry from your profile.
        </p>
      )}
    </form>
  );
}
