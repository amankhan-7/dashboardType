import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../lib/jwt";
import { withCors, handlePreflight } from "../../../lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return withCors(
      NextResponse.json({ error: "NO_REFRESH_TOKEN" }, { status: 401 })
    );
  }

  let userId: string;

  try {
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.userId;
  } catch {
    return withCors(
      NextResponse.json({ error: "INVALID_REFRESH_TOKEN" }, { status: 401 })
    );
  }

  await connectDB();

  const user = await User.findById(userId);

  if (!user) {
    return withCors(
      NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 })
    );
  }

  if (
    user.refreshToken !== refreshToken ||
    !user.refreshTokenExpiry ||
    user.refreshTokenExpiry < new Date()
  ) {
    return withCors(
      NextResponse.json(
        { error: "REFRESH_TOKEN_INVALID_OR_EXPIRED" },
        { status: 401 }
      )
    );
  }

  // Rotate refresh token
  const newRefreshToken = signRefreshToken(
    { userId },
    { expiresIn: "7d" }
  );

  user.refreshToken = newRefreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  const newAccessToken = signAccessToken(
    { userId },
    { expiresIn: "15m" }
  );

  const res = NextResponse.json({
    message: "Access token refreshed",
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set("accessToken", newAccessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    secure: isProd,
  });

  res.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    secure: isProd,
  });

  return withCors(res);
}
