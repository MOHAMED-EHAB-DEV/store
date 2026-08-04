/**
 * Helper to push real-time stat updates to the Socket.IO server REST endpoint.
 * Silently catches errors if socket server is down or unconfigured.
 */
export async function broadcastStatUpdate(
  stat: "templates" | "customers" | "downloads" | "rating",
  value: number
) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (!socketUrl) return;

  try {
    await fetch(`${socketUrl}/api/stats/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stat, value }),
    });
  } catch (err) {
    // Silent catch — stat updates should never block core API actions
  }
}
