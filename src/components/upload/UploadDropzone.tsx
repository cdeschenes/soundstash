"use client";

import { useRef, useState } from "react";
import { Upload, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = [
  "audio/mpeg", "audio/mp3", "audio/flac", "audio/wav",
  "audio/x-wav", "audio/mp4", "audio/m4a", "audio/ogg", "audio/opus",
];
const ALLOWED_EXTS = [".mp3", ".flac", ".wav", ".m4a", ".ogg", ".opus"];

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function UploadDropzone({ onFileSelect, selectedFile }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validateAndSelect(file: File) {
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.some(e => file.name.endsWith(e))) {
      setError("Unsupported format. Use MP3, FLAC, WAV, M4A, or OGG.");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("File too large. Max 500MB.");
      return;
    }
    setError(null);
    onFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }

  return (
    <div>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors",
          dragOver
            ? "border-border bg-surface-2"
            : "border-border bg-surface hover:border-border hover:bg-surface-2"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <Music className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB — click to change
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Drop your audio file here or click to browse</p>
            <p className="text-sm text-muted-foreground">MP3, FLAC, WAV, M4A, OGG — up to 500MB</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXTS.join(",")}
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
