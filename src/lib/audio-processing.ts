import { execFile, spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";
import { resolveMediaPath, ensureDir } from "@/lib/media";

const execFileAsync = promisify(execFile);

export interface AudioMetadata {
  durationMs: number;
  mimeType: string;
  fileSize: number;
}

export async function extractMetadata(
  audioRelativePath: string
): Promise<AudioMetadata> {
  const fullPath = resolveMediaPath(audioRelativePath);

  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    fullPath,
  ]);

  const data = JSON.parse(stdout) as {
    format?: { duration?: string; size?: string; format_name?: string };
  };

  const duration = parseFloat(data.format?.duration ?? "0");
  const size = parseInt(data.format?.size ?? "0", 10);
  const formatName = data.format?.format_name ?? "";

  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    flac: "audio/flac",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    opus: "audio/ogg",
  };

  const ext = path.extname(fullPath).toLowerCase().replace(".", "");
  const mimeType = mimeMap[ext] ?? mimeMap[formatName] ?? "audio/mpeg";

  return {
    durationMs: Math.round(duration * 1000),
    mimeType,
    fileSize: size,
  };
}

/**
 * Generate waveform peaks JSON using ffmpeg (raw PCM → peak extraction).
 * Produces a format compatible with wavesurfer.js pre-loaded peaks:
 *   { version: 2, channels: 1, sample_rate: number, samples_per_pixel: number,
 *     bits: 8, length: number, data: number[] }
 * where data contains alternating min/max pairs normalised to [-1, 1].
 */
export async function generateWaveform(
  audioRelativePath: string,
  outputRelativePath: string
): Promise<void> {
  const inputPath = resolveMediaPath(audioRelativePath);
  const outputPath = resolveMediaPath(outputRelativePath);

  await ensureDir(path.dirname(outputPath));

  // Decode to mono 8 kHz 16-bit PCM via ffmpeg stdout
  const SAMPLE_RATE = 8000;
  const PIXELS_PER_SECOND = 20;
  const SAMPLES_PER_PIXEL = Math.round(SAMPLE_RATE / PIXELS_PER_SECOND); // 400

  const pcmBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const proc = spawn("ffmpeg", [
      "-i", inputPath,
      "-f", "s16le",
      "-ac", "1",
      "-ar", String(SAMPLE_RATE),
      "pipe:1",
    ], { stdio: ["ignore", "pipe", "ignore"] });

    proc.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg exited with code ${code}`));
      } else {
        resolve(Buffer.concat(chunks));
      }
    });
    proc.on("error", reject);
  });

  const totalSamples = pcmBuffer.length / 2; // 16-bit = 2 bytes per sample
  const numPixels = Math.ceil(totalSamples / SAMPLES_PER_PIXEL);
  const data: number[] = [];

  for (let i = 0; i < numPixels; i++) {
    const start = i * SAMPLES_PER_PIXEL;
    const end = Math.min(start + SAMPLES_PER_PIXEL, totalSamples);
    let min = 0;
    let max = 0;

    for (let j = start; j < end; j++) {
      const sample = pcmBuffer.readInt16LE(j * 2) / 32768;
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }

    // Round to 4 decimal places to keep JSON compact
    data.push(Math.round(min * 10000) / 10000);
    data.push(Math.round(max * 10000) / 10000);
  }

  const waveformJson = {
    version: 2,
    channels: 1,
    sample_rate: SAMPLE_RATE,
    samples_per_pixel: SAMPLES_PER_PIXEL,
    bits: 8,
    length: numPixels,
    data,
  };

  await fs.writeFile(outputPath, JSON.stringify(waveformJson));
}

// Processing semaphore to cap concurrent jobs
let activeJobs = 0;
const MAX_CONCURRENT_JOBS = 2;

export async function withProcessingSlot<T>(fn: () => Promise<T>): Promise<T> {
  while (activeJobs >= MAX_CONCURRENT_JOBS) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  activeJobs++;
  try {
    return await fn();
  } finally {
    activeJobs--;
  }
}
