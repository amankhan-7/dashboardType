import { NextRequest, NextResponse } from "next/server";
import { withCors, handlePreflight } from "../../lib/cors";

export const runtime = "nodejs";

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function GET(req: NextRequest) {
  const res = NextResponse.json(
    { status: "ok", message: "Backend is running" },
    { status: 200 }
  );

  return withCors(req, res);
}