"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, X } from "lucide-react";
import { TrackActions } from "@/components/track/TrackActions";
import { WaveformPlayer } from "@/components/player/WaveformPlayer";
import { useAudio } from "@/components/AudioContext";
import { artworkUrl, formatDuration, mediaUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TrackWithUser } from "@/types";

interface TrackBarPlayerProps {
  track: TrackWithUser;
  /** "feed" renders as a card row; "page" renders as the full-width page header */
  variant?: "feed" | "page";
  canManage?: boolean;
}

export function TrackBarPlayer({
  track,
  variant = "feed",
  canManage = false,
}: TrackBarPlayerProps) {
  const { nowPlaying, isPlaying, toggle } = useAudio();
  const { resolvedTheme } = useTheme();
  const waveColor =
    resolvedTheme === "light" ? "#a1a1aa" :
    resolvedTheme === "warm"  ? "#1a4d6e" :
    "#3f3f46";
  const progressColor =
    resolvedTheme === "light" ? "#71717a" :
    resolvedTheme === "warm"  ? "#f77f00" :
    "#52525b";
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    track.durationMs ? track.durationMs / 1000 : 0
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const isThisPlaying =
    nowPlaying?.trackId === track.id && isPlaying;

  const artistName =
    track.user.profile?.displayName ?? track.user.name;

  function handleToggle() {
    toggle({
      trackId: track.id,
      slug: track.slug,
      title: track.title,
      artistName,
      artworkPath: track.artworkPath,
      audioPath: track.audioPath,
      waveformPath: track.waveformPath,
      durationMs: track.durationMs,
    });
  }

  const artwork = artworkUrl(track.artworkPath);

  return (
    <>
      <div
        className={cn(
          "group flex items-center gap-4 bg-surface border border-border rounded-lg hover:border-border transition-colors",
          variant === "feed" ? "p-3" : "p-5"
        )}
      >
        {/* Artwork */}
        <div
          className={cn(
            "relative flex-shrink-0 rounded overflow-hidden bg-surface-2",
            artwork && "cursor-pointer",
            variant === "feed" ? "h-14 w-14" : "h-24 w-24"
          )}
          onClick={artwork ? (e) => { e.stopPropagation(); setLightboxOpen(true); } : undefined}
        >
          {artwork ? (
            <Image
              src={artwork}
              alt={track.title}
              fill
              unoptimized
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Play button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
          className={cn(
            "flex-shrink-0 flex items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95",
            variant === "feed" ? "h-9 w-9" : "h-12 w-12"
          )}
          aria-label={isThisPlaying ? "Pause" : "Play"}
        >
          {isThisPlaying ? (
            <Pause className={variant === "feed" ? "h-4 w-4" : "h-5 w-5"} />
          ) : (
            <Play className={cn(variant === "feed" ? "h-4 w-4" : "h-5 w-5", "ml-0.5")} />
          )}
        </button>

        {/* Middle: title + waveform */}
        <div className="flex-1 min-w-0 space-y-1" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-baseline gap-2">
            <Link
              href={`/track/${track.slug}`}
              className="font-semibold text-foreground hover:text-foreground truncate"
            >
              {track.title}
            </Link>
            {track.genre && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {track.genre}
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <Link
              href={`/user/${track.user.profile?.username ?? track.user.id}`}
              className="hover:text-foreground"
            >
              {artistName}
            </Link>
          </div>
          {track.status === "READY" && (
            <WaveformPlayer
              audioPath={track.audioPath}
              waveformPath={track.waveformPath}
              isPlaying={isThisPlaying && nowPlaying?.trackId === track.id}
              onReady={(d) => setDuration(d)}
              onTimeUpdate={(t) => setCurrentTime(t)}
              height={variant === "feed" ? 40 : 64}
              waveColor={waveColor}
              progressColor={progressColor}
            />
          )}
          {track.status === "PROCESSING" && (
            <div className="text-xs text-muted-foreground animate-pulse">
              Processing waveform…
            </div>
          )}
          {track.status === "FAILED" && (
            <div className="text-xs text-red-500">Processing failed</div>
          )}
        </div>

        {/* Right: time + stats */}
        <div className="flex-shrink-0 text-right space-y-1">
          <div className="text-sm tabular-nums text-muted-foreground">
            {isThisPlaying
              ? `${formatDuration(currentTime * 1000)} / ${formatDuration(duration * 1000)}`
              : formatDuration((track.durationMs ?? duration * 1000))}
          </div>
          <div className="text-xs text-muted-foreground flex gap-2 justify-end">
            <span>{track.playCount} plays</span>
            <span>{track._count.comments} comments</span>
          </div>
          {track.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end">
              {track.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {canManage && (
            <div
              className="flex gap-1.5 justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <TrackActions
                trackId={track.id}
                slug={track.slug}
                initialData={{
                  title: track.title,
                  description: track.description,
                  genre: track.genre,
                  tags: track.tags,
                  isPublic: track.isPublic,
                  artworkPath: track.artworkPath,
                }}
                afterDelete={variant === "page" ? "redirect" : "refresh"}
              />
            </div>
          )}
        </div>
      </div>

      {/* Artwork lightbox */}
      {lightboxOpen && artwork && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div
            className="relative z-10 max-w-[90vw] max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={artwork}
              alt={track.title}
              className="block max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-3 right-3 rounded-full bg-black/60 text-white p-1.5 hover:bg-black/80 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
