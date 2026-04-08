"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Upload, Music2, MessageSquare, User, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Using SoundStash</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 text-sm">
          <Section icon={Music2} title="The Feed">
            <p>The feed shows all public tracks uploaded by members, newest first.</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li>Click anywhere on a track row to open its detail page</li>
              <li>Press the play button to listen without leaving the feed</li>
              <li>Audio continues playing as you browse</li>
              <li>Click the waveform to seek to any point in the track</li>
            </ul>
          </Section>

          <Section icon={Upload} title="Uploading a Track">
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>Click <strong className="text-foreground">Upload</strong> in the top bar</li>
              <li>Drag and drop an audio file, or click to browse — MP3, FLAC, WAV, M4A, OGG, and Opus are supported (max 500 MB)</li>
              <li>Add a title (required), description, genre, and tags</li>
              <li>Optionally add cover artwork using the <strong className="text-foreground">Add artwork</strong> button</li>
              <li>The waveform is generated in the background — the track appears in the feed once processing is complete</li>
            </ul>
          </Section>

          <Section icon={MessageSquare} title="Comments">
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>Open any track detail page to read and leave comments</li>
              <li>Click <strong className="text-foreground">Post comment</strong> to expand the comment box</li>
              <li>You can delete your own comments; admins can delete any comment</li>
            </ul>
          </Section>

          <Section icon={User} title="Your Profile">
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>Click your avatar in the top bar to visit your public profile</li>
              <li>Go to <strong className="text-foreground">Settings</strong> (gear icon) to update your display name, bio, website, location, and avatar</li>
              <li>You can set your preferred theme (Light, Dark, or System) in Settings</li>
              <li>Hover over any track you uploaded to reveal edit and delete buttons</li>
            </ul>
          </Section>

          <Section icon={Shield} title="Invites">
            <ul className="space-y-1 list-disc list-inside text-muted-foreground">
              <li>SoundStash is invite-only — new members join via a link sent by an admin</li>
              <li>Admins can send invites from the Admin panel</li>
            </ul>
          </Section>
        </div>

        <div className="px-5 pb-5">
          <Button size="sm" onClick={() => setOpen(false)} className="w-full">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {mounted && open ? createPortal(modal, document.body) : null}
    </>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <div className="pl-6 text-muted-foreground">{children}</div>
    </div>
  );
}
