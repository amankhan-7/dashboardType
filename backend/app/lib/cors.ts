// lib/cors.ts
import { NextResponse } from "next/server";

const FRONTEND_ORIGIN = "http://localhost:3000";

export function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return res;
}

// Helper for preflight OPTIONS request
export function handlePreflight() {
  const res = NextResponse.json({});
  return withCors(res);
}
