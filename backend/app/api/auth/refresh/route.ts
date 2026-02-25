import { NextRequest, NextResponse } from "next/server";
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

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      const res = NextResponse.json(
        { error: "NO_REFRESH_TOKEN" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    let userId: string;

    try {
      const payload = verifyRefreshToken(refreshToken);
      userId = payload.userId;
    } catch {
      const res = NextResponse.json(
        { error: "INVALID_REFRESH_TOKEN" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      const res = NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
      return withCors(req, res);
    }

    if (
      user.refreshToken !== refreshToken ||
      !user.refreshTokenExpiry ||
      user.refreshTokenExpiry < new Date()
    ) {
      const res = NextResponse.json(
        { error: "REFRESH_TOKEN_INVALID_OR_EXPIRED" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    // 🔁 Rotate refresh token properly
    const newRefreshToken = signRefreshToken(
      { userId },
      { expiresIn: "7d" }
    );

    const newAccessToken = signAccessToken(
      { userId },
      { expiresIn: "15m" }
    );

    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    await user.save();

    const res = NextResponse.json(
      { message: "Access token refreshed" },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    // ✅ Set NEW refresh token, not old one
    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return withCors(req, res);

  } catch (err: any) {
    const res = NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}