import { NextResponse } from "next/server";

export function apiError(
  message: string,
  status: number,
  context?: Record<string, unknown>,
): NextResponse {
  if (context) {
    console.error(`[API Error] ${message}`, context);
  }
  return NextResponse.json({ error: message }, { status });
}

export function dbError(
  message = "Database operation failed",
  context?: Record<string, unknown>,
): NextResponse {
  if (context) {
    console.error("[DB Error]", context);
  }
  return NextResponse.json({ error: message }, { status: 500 });
}
