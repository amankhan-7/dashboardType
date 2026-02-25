// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins =
  process.env.ALLOWED_URL?.split(",").map((o) => o.trim()) || [];

export function withCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );

  return res;
}

export function handlePreflight(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return withCors(req, res);
}