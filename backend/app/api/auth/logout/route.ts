import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Clear the cookies
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("accessToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: false, // true in production
  });

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: false, // true in production
  });

  return res;
}
