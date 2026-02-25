import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { comparePassword } from "../../../utils/hash";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { loginSchema } from "../../../lib/validators";
import { withCors, handlePreflight } from "../../../lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email, password } = loginSchema.parse(await req.json());
    const user = await User.findOne({ email });

    if (!user || !(await comparePassword(password, user.password))) {
      const res = NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    const userId = user._id.toString();

    const accessToken = signAccessToken(
      { userId },
      { expiresIn: "15m" }
    );

    const refreshToken = signRefreshToken(
      { userId },
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    const res = NextResponse.json({ message: "Logged in" });

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
     sameSite: "none",
secure: true,
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "none",
secure: true,
    });

    return withCors(req, res);
  } catch (error) {
    const res = NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}