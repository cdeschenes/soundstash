import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/media";
import {
  extractMetadata,
  generateWaveform,
  withProcessingSlot,
} from "@/lib/audio-processing";
import { slugify } from "@/lib/utils";
import { nanoid } from "nanoid";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

const uploadLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10; // 10 uploads per hour per IP

function checkRateLimit(request: NextRequest): boolean {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  const now = Date.now();
  const entry = uploadLimits.get(ip);
  if (!entry || now >= entry.resetAt) {
    uploadLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX) return false;
  entry.count++;
  return true;
}

const ALLOWED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/ogg",
  "audio/opus",
];

const MAX_AUDIO_SIZE = 500 * 1024 * 1024; // 500MB

export async function POST(request: NextRequest) {
  const headers = request.headers;
  const session = await auth.api.getSession({ headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRateLimit(request)) {
    return NextResponse.json(
      { error: "Too many uploads. Try again later." },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio");
  const artworkFile = formData.get("artwork");
  const title = formData.get("title")?.toString() ?? "";
  const description = formData.get("description")?.toString() ?? "";
  const genre = formData.get("genre")?.toString() ?? "";
  const tagsRaw = formData.get("tags")?.toString() ?? "";
  const isPublic = formData.get("isPublic") !== "false";
  const linksRaw = formData.get("links")?.toString() ?? "[]";
  let links: { label: string; url: string }[] = [];
  try { links = JSON.parse(linksRaw); } catch { links = []; }

  if (!(audioFile instanceof File)) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  if (!title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (!ALLOWED_AUDIO_TYPES.includes(audioFile.type)) {
    return NextResponse.json(
      { error: "Unsupported audio format" },
      { status: 400 }
    );
  }

  if (audioFile.size > MAX_AUDIO_SIZE) {
    return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
  }

  const userId = session.user.id;
  const trackId = nanoid();
  const slug = slugify(title, nanoid(6));
  const ext = path.extname(audioFile.name) || ".mp3";
  const audioFilename = `${trackId}${ext}`;
  const audioRelativePath = `tracks/${userId}/${audioFilename}`;

  // Save audio
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
  await saveFile(audioBuffer, audioRelativePath);

  // Save artwork if provided
  let artworkRelativePath: string | null = null;
  if (artworkFile instanceof File && artworkFile.size > 0) {
    const artExt = path.extname(artworkFile.name) || ".jpg";
    const artFilename = `${trackId}_artwork${artExt}`;
    artworkRelativePath = `tracks/${userId}/${artFilename}`;
    const artBuffer = Buffer.from(await artworkFile.arrayBuffer());
    await saveFile(artBuffer, artworkRelativePath);
  }

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // Create track in PROCESSING state
  const track = await db.track.create({
    data: {
      id: trackId,
      userId,
      slug,
      title: title.trim(),
      description: description.trim() || null,
      genre: genre.trim() || null,
      tags,
      isPublic,
      audioPath: audioRelativePath,
      artworkPath: artworkRelativePath,
      status: "PROCESSING",
      fileSize: BigInt(audioFile.size),
      mimeType: audioFile.type,
    },
  });

  // Create track links if provided
  const validLinks = links.filter((l) => l.label?.trim() && l.url?.trim());
  if (validLinks.length > 0) {
    await db.trackLink.createMany({
      data: validLinks.map((link, i) => ({
        trackId,
        label: link.label.trim(),
        url: link.url.trim(),
        sortOrder: i,
      })),
    });
  }

  // Fire-and-forget processing
  void (async () => {
    try {
      await withProcessingSlot(async () => {
        const waveformRelativePath = `tracks/${userId}/${trackId}_waveform.json`;

        const [metadata] = await Promise.all([
          extractMetadata(audioRelativePath),
          generateWaveform(audioRelativePath, waveformRelativePath),
        ]);

        await db.track.update({
          where: { id: trackId },
          data: {
            status: "READY",
            durationMs: metadata.durationMs,
            waveformPath: waveformRelativePath,
          },
        });
      });
    } catch (err) {
      console.error(`[upload] Processing failed for track ${trackId}:`, err);
      await db.track.update({
        where: { id: trackId },
        data: { status: "FAILED" },
      });
    }
  })();

  return NextResponse.json({ success: true, trackId: track.id, slug: track.slug });
}
