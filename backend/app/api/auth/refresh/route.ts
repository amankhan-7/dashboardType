import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { signAccessToken, verifyRefreshToken } from "../../../lib/jwt";
import { withCors, handlePreflight } from "../../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return withCors(
      NextResponse.json(
        { error: "NO_REFRESH_TOKEN" },
        { status: 401 }
      )
    );
  }

  let userId: string;

  try {
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.userId;
  } catch {
    return withCors(
      NextResponse.json(
        { error: "INVALID_REFRESH_TOKEN" },
        { status: 401 }
      )
    );
  }

  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return withCors(
      NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      )
    );
  }

  const newAccessToken = signAccessToken({ userId });

  const res = NextResponse.json({
    message: "Access token refreshed",
  });

  res.cookies.set("accessToken", newAccessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return withCors(res);
}
