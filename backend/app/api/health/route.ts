// app/health/route.ts
import { NextResponse } from "next/server";
import { withCors, handlePreflight } from "../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}


export async function GET() {
return withCors(NextResponse.json({ status: "ok", message: "Backend is running" }));
}