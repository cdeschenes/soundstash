export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recoverStuckTracks } = await import("@/lib/startup");
    await recoverStuckTracks().catch(console.error);
  }
}
