import { db } from "@/lib/db";

/**
 * Resets tracks stuck in PROCESSING state at startup.
 * Handles the case where the process crashed mid-pipeline.
 */
export async function recoverStuckTracks(): Promise<void> {
  const stuckCutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes

  const result = await db.track.updateMany({
    where: {
      status: "PROCESSING",
      updatedAt: { lt: stuckCutoff },
    },
    data: { status: "FAILED" },
  });

  if (result.count > 0) {
    console.log(
      `[startup] Recovered ${result.count} stuck track(s) → FAILED`
    );
  }
}
