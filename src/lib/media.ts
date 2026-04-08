import path from "path";
import fs from "fs/promises";

const MEDIA_ROOT = process.env.MEDIA_ROOT ?? path.join(process.cwd(), "media");

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export function mediaRoot(): string {
  return MEDIA_ROOT;
}

export function tracksDir(userId: string): string {
  return path.join(MEDIA_ROOT, "tracks", userId);
}

export function avatarsDir(): string {
  return path.join(MEDIA_ROOT, "avatars");
}

export async function saveFile(
  buffer: Buffer,
  relativePath: string
): Promise<string> {
  const fullPath = path.join(MEDIA_ROOT, relativePath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, buffer);
  return relativePath;
}

export async function deleteFile(relativePath: string): Promise<void> {
  const fullPath = path.join(MEDIA_ROOT, relativePath);
  await fs.unlink(fullPath).catch(() => {
    // Ignore if file doesn't exist
  });
}

export async function readFile(relativePath: string): Promise<Buffer> {
  const fullPath = path.join(MEDIA_ROOT, relativePath);
  return fs.readFile(fullPath);
}

export async function statFile(
  relativePath: string
): Promise<{ size: number } | null> {
  const fullPath = path.join(MEDIA_ROOT, relativePath);
  try {
    const stat = await fs.stat(fullPath);
    return { size: stat.size };
  } catch {
    return null;
  }
}

export function resolveMediaPath(relativePath: string): string {
  return path.join(MEDIA_ROOT, relativePath);
}
