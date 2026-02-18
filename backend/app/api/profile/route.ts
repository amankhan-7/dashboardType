// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../lib/db";
import User from "../../models/User";
import { requireUser } from "../../lib/auth";
import { withCors, handlePreflight } from "../../lib/cors";

export async function OPTIONS() {
  return handlePreflight();
}

export const runtime = "nodejs";

interface TokenPayload {
  userId: string;
}

export async function GET() {
 
   const { userId, error } = await requireUser();
   if (error) return error; // early return if unauthorized

  // Connect to DB after verifying user
  await connectDB();

  // Fetch user and exclude password
  const user = await User.findById(userId).select("-password");

  if (!user) {
    return withCors(NextResponse.json({ error: "User not found" }, { status: 404 }));
  }

  return withCors(NextResponse.json({ user }, { status: 200 }));
}
