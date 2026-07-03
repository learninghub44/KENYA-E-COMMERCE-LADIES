import { NextResponse } from "next/server";

// Public, unauthenticated liveness check for the hosting platform's health probe (Render, uptime
// monitors, etc). Deliberately does NOT touch Supabase or any other dependency — a slow/degraded
// database should not cause the load balancer to kill and restart a perfectly healthy app
// instance. Use /internal/platform/health (admin-authenticated) for real dependency checks.
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
