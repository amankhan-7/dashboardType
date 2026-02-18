// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./app/lib/jwt"; // adjust path

export function proxy(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // If no token → redirect to login (unless already on login)
  if (!accessToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If token exists → verify it
  if (accessToken) {
    try {
      verifyAccessToken(accessToken); // throws if invalid or expired
      // Logged in user should not access login page
      if (pathname === "/login") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (err) {
      // Invalid or expired token → redirect to login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Otherwise allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile", "/login", "/tasks", "/tasks/:id"],
};
