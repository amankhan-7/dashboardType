import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/hash";
import { registerSchema } from "../../../lib/validators";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { withCors, handlePreflight } from "../../../lib/cors";
import jwt from "jsonwebtoken";

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

// Type for request body
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body: RegisterRequestBody = registerSchema.parse(
      await req.json()
    );

    const { name, email, password } = body;

    const exists = await User.findOne({ email });

    if (exists) {
      const res = NextResponse.json(
        { message: "User exists" },
        { status: 400 }
      );
      return withCors(req, res);
    }

    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userId = user._id.toString();

    // Generate tokens
    const accessToken = signAccessToken(
      { userId },
      { expiresIn: "15m" }
    );

    const refreshToken = signRefreshToken(
      { userId },
      { expiresIn: "7d" }
    );

    // Decode refresh token expiry
    const decoded = jwt.decode(refreshToken) as any;
    const refreshTokenExpiry = new Date(decoded.exp * 1000);

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();

    const res = NextResponse.json(
      { message: "Registered" },
      { status: 201 }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return withCors(req, res);
  } catch (err: any) {
    console.error("Register error:", err);

    const res = NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );

    return withCors(req, res);
  }
}