// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { comparePassword } from "../../../utils/hash";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { loginSchema } from "../../../lib/validators";
import { withCors, handlePreflight } from "../../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST(req: Request) {
  await connectDB();
  const { email, password } = loginSchema.parse(await req.json());
  const user = await User.findOne({ email });

  if (!user || !(await comparePassword(password, user.password))) {
    return withCors(
      NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    );
  }

  const accessToken = signAccessToken({ userId: user._id }, { expiresIn: "15m" });
  const refreshToken = signRefreshToken({}, { expiresIn: "7d" });

  user.refreshToken = refreshToken;
  user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  const res = NextResponse.json({ message: "Logged in" });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 15 * 60,
    sameSite: "lax",
    secure: false,
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
    secure: false,
  });

  return withCors(res);
}
