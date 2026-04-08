import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  const { trackId } = await request.json() as { trackId: string };

  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  await db.play.create({
    data: {
      trackId,
      userId: session?.user.id ?? null,
    },
  });

  await db.track.update({
    where: { id: trackId },
    data: { playCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
