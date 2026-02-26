import { NextRequest, NextResponse } from "next/server";
import { withCors, handlePreflight } from "../../../lib/cors";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  // Clear the cookies
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "none",
    secure: true,
  });

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "none",
    secure: true,
  });


  return withCors(req, res);
}
