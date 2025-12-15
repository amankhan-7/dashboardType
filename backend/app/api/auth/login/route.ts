import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { comparePassword } from "../../../utils/hash";
import { signToken } from "../../../lib/jwt";
import { loginSchema } from "../../../lib/validators";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = loginSchema.parse(await req.json());

  const user = await User.findOne({ email });
  if (!user || !(await comparePassword(password, user.password))) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signToken({ userId: user._id });

  const res = NextResponse.json({ message: "Logged in" });

  res.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",   //fixed
    secure: false,    //localhost only
  });

  return res;
}
