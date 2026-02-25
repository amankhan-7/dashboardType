import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { verifyAccessToken } from "../../../lib/jwt";
import bcrypt from "bcryptjs";
import { withCors, handlePreflight } from "../../../lib/cors";

export const runtime = "nodejs";

interface TokenPayload {
  userId: string;
}

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function PATCH(req: NextRequest) {
  try {
    // 1️⃣ Get access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      const res = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    // 2️⃣ Verify token
    let payload: TokenPayload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      const res = NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
      return withCors(req, res);
    }

    // 3️⃣ Connect DB
    await connectDB();

    // 4️⃣ Parse body
    const body = await req.json();
    const { name, email, password } = body;

    const updates: any = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      const res = NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
      return withCors(req, res);
    }

    // 5️⃣ Update user
    const updatedUser = await User.findByIdAndUpdate(
      payload.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      const res = NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
      return withCors(req, res);
    }

    // 6️⃣ Return updated user
    const res = NextResponse.json(
      { user: updatedUser },
      { status: 200 }
    );

    return withCors(req, res);

  } catch (error) {
    const res = NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}