"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { mediaUrl } from "@/lib/utils";

interface WaveformPlayerProps {
  audioPath: string;
  waveformPath: string | null;
  isPlaying: boolean;
  onReady?: (duration: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onFinish?: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
}

export function WaveformPlayer({
  audioPath,
  waveformPath,
  isPlaying,
  onReady,
  onTimeUpdate,
  onFinish,
  height = 60,
  waveColor = "#52525b",
  progressColor = "#a1a1aa",
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const audioSrc = mediaUrl(audioPath) ?? "";

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      height,
      normalize: true,
      interact: true,
      url: audioSrc,
      peaks: undefined, // loaded below
    });

    wsRef.current = ws;

    ws.on("ready", () => {
      setIsLoaded(true);
      onReady?.(ws.getDuration());
    });

    ws.on("timeupdate", (t) => onTimeUpdate?.(t));
    ws.on("finish", () => onFinish?.());

    // Load pre-generated waveform peaks
    if (waveformPath) {
      const peaksUrl = mediaUrl(waveformPath);
      if (peaksUrl) {
        fetch(peaksUrl)
          .then((r) => r.json())
          .then((data) => {
            const peaks = data?.data ?? data?.peaks;
            if (peaks && Array.isArray(peaks)) {
              ws.load(audioSrc, [peaks]);
            }
          })
          .catch(() => {
            // Fall back to decode-on-load
            ws.load(audioSrc);
          });
      } else {
        ws.load(audioSrc);
      }
    } else {
      ws.load(audioSrc);
    }

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioPath, waveformPath]);

  useEffect(() => {
    if (!wsRef.current || !isLoaded) return;
    if (isPlaying) {
      wsRef.current.play();
    } else {
      wsRef.current.pause();
    }
  }, [isPlaying, isLoaded]);

  return (
    <div
      ref={containerRef}
      className="w-full cursor-pointer"
      style={{ height }}
    />
  );
}
