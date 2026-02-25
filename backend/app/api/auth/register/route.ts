import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/hash";
import { registerSchema } from "../../../lib/validators";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { withCors, handlePreflight } from "../../../lib/cors";
import jwt from "jsonwebtoken";

export async function OPTIONS() {
  return handlePreflight();
}


// Type for request body
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {
    console.log("register route ran");

    await connectDB();

    const body: RegisterRequestBody = registerSchema.parse(await req.json());
    const { name, email, password } = body;

    const exists = await User.findOne({ email });
    if (exists) {
      return withCors(NextResponse.json({ message: "User exists" }, { status: 400 }));
    }

    const hashedPassword = await hashPassword(password);

    // 1. Create user first (without refresh token)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userId = user._id.toString();

    // 2. Generate tokens
    const accessToken = signAccessToken(
      { userId },
      { expiresIn: "15m" }
    );

    const refreshToken = signRefreshToken(
      { userId },
      { expiresIn: "7d" }
    );

    // 3. Set refresh token expiry
    const decoded = jwt.decode(refreshToken) as any;
    const refreshTokenExpiry = new Date(decoded.exp * 1000);
    // 4. Save refresh token to DB
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshTokenExpiry;
    await user.save();


    // Proper NextResponse creation
    const res = new NextResponse(JSON.stringify({ message: "Registered" }), {
      status: 201,
    });

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

    return withCors(res);
  } catch (err: any) {
    console.error("Register error:", err);
    return withCors(NextResponse.json({ error: err.message || "Server error" }, { status: 500 }));
  }
}

