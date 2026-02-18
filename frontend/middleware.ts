import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Let client-side auth guard handle protection
  // Middleware cannot read HttpOnly cookies safely
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/tasks",
  ],
};

