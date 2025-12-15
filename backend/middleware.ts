import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/lib/jwt";

const ALLOWED_ORIGIN = "http://localhost:3000";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ===== CORS (ONLY HERE) =====
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // Public auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next({
      headers: corsHeaders(),
    });
  }

  // Protected API routes
  if (
    pathname.startsWith("/api/profile") ||
    pathname.startsWith("/api/tasks")
  ) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    try {
      verifyToken(token);
      return NextResponse.next({
        headers: corsHeaders(),
      });
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401, headers: corsHeaders() }
      );
    }
  }

  return NextResponse.next({
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const config = {
  matcher: "/api/:path*",
};
