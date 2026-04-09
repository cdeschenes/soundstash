"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import { getMyProfile, updateProfile, uploadAvatar } from "@/server/actions/profile";
import { Moon, Sun, Monitor, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    getMyProfile().then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setWebsite(profile.website);
      setLocation(profile.location);
      setAvatarPath(profile.avatarPath);
    });
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      website: website.trim() || undefined,
      location: location.trim(),
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const result = await uploadAvatar(formData);
    setUploadingAvatar(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Avatar updated");
      // Refresh avatarPath so the preview updates immediately
      getMyProfile().then((p) => { if (p) setAvatarPath(p.avatarPath); });
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Profile settings</h1>

      {/* Avatar */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-4">Avatar</h2>
        <div className="flex items-center gap-4">
          <UserAvatar
            name={session?.user.name ?? ""}
            avatarPath={avatarPath}
            className="h-16 w-16"
          />
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <span className="text-sm text-foreground hover:text-foreground underline">
                {uploadingAvatar ? "Uploading…" : "Change avatar"}
              </span>
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP. Max 5MB.</p>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleProfileSave}
        className="bg-surface border border-border rounded-lg p-6 space-y-4"
      >
        <h2 className="text-sm font-medium text-muted-foreground">Profile info</h2>

        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio…"
            rows={3}
            maxLength={500}
            className="mt-1 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Appearance</h2>
        <div>
          <Label>Theme</Label>
          <div className="flex gap-2 mt-2">
            {([
              { value: "light",  label: "Light",  icon: Sun },
              { value: "dark",   label: "Dark",   icon: Moon },
              { value: "system", label: "System", icon: Monitor },
              { value: "warm",   label: "Warm",   icon: Flame },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${
                  theme === value
                    ? "border-foreground bg-surface-2 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
