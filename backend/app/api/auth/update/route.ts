// app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { verifyAccessToken } from "../../../lib/jwt";
import bcrypt from "bcryptjs";
import { withCors, handlePreflight } from "../../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

export const runtime = "nodejs";

interface TokenPayload {
  userId: string;
}

export async function PATCH(req: Request) {
  // 1. Get access token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return withCors(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  // 2. Verify access token
  let payload: TokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return withCors(NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }));
  }

  // 3. Connect to DB
  await connectDB();

  // 4. Parse request body
  const body = await req.json();
  const { name, email, password, refreshToken } = body; // fields you want to allow updating

  // 5. Build update object dynamically
  const updates: any = {};
  if (name) updates.name = name;
  if (email) updates.email = email;
  if (password) updates.password = await bcrypt.hash(password, 10);


  if (Object.keys(updates).length === 0) {
    return withCors(NextResponse.json({ error: "No fields provided for update" }, { status: 400 }));
  }

  // 6. Update user in DB
  const updatedUser = await User.findByIdAndUpdate(
    payload.userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return withCors(NextResponse.json({ error: "User not found" }, { status: 404 }));
  }

  // 7. Return updated user
  return withCors(NextResponse.json({ user: updatedUser }, { status: 200 }));
}
