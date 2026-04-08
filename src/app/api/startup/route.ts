/**
 * Called once at app startup via Next.js instrumentation or a startup script.
 * Not a public endpoint — protected to prevent external abuse.
 */
import { NextResponse } from "next/server";
import { recoverStuckTracks } from "@/lib/startup";

let initialized = false;

export async function GET() {
  if (initialized) {
    return NextResponse.json({ status: "already initialized" });
  }

  await recoverStuckTracks();
  initialized = true;

  return NextResponse.json({ status: "ok" });
}
