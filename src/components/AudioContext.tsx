"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface NowPlaying {
  trackId: string;
  slug: string;
  title: string;
  artistName: string;
  artworkPath: string | null;
  audioPath: string;
  waveformPath: string | null;
  durationMs: number | null;
}

interface AudioContextValue {
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  play: (track: NowPlaying) => void;
  pause: () => void;
  toggle: (track: NowPlaying) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback((track: NowPlaying) => {
    setNowPlaying(track);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(
    (track: NowPlaying) => {
      if (nowPlaying?.trackId === track.trackId) {
        setIsPlaying((prev) => !prev);
      } else {
        setNowPlaying(track);
        setIsPlaying(true);
      }
    },
    [nowPlaying]
  );

  return (
    <AudioContext.Provider value={{ nowPlaying, isPlaying, play, pause, toggle }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
