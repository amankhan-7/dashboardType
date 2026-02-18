import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { hashPassword } from "../../../utils/hash";
import { registerSchema } from "../../../lib/validators";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt";
import { withCors, handlePreflight } from "../../../lib/cors";

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

    const refreshToken = signRefreshToken({}, { expiresIn: '7d' });
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const user = await User.create({ name, email, password: hashedPassword, refreshToken, refreshTokenExpiry });

    const accessToken = signAccessToken({ userId: user._id.toString() });


    // Proper NextResponse creation
    const res = new NextResponse(JSON.stringify({ message: "Registered" }), {
      status: 201,
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60, //15m
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
  } catch (err: any) {
    console.error("Register error:", err);
    return withCors(NextResponse.json({ error: err.message || "Server error" }, { status: 500 }));
  }
}

