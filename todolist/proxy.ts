import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy middleware for auth guarding
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip public routes
  if (pathname === "/" || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // All other routes: let client handle auth
  // Middleware cannot safely access HttpOnly cookies
  return NextResponse.next();
}


export const config = {
  matcher: [
    "/",
    "/profile",
    "/tasks",
  ],
};

