import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import User from "../../models/User";
import { requireUser } from "../../lib/auth";
import { withCors, handlePreflight } from "../../lib/cors";

export const runtime = "nodejs";

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();

    if (error) {
      // Ensure CORS is applied to error responses too
      return withCors(req, error);
    }

    await connectDB();

    const user = await User.findById(userId).select("-password");

    if (!user) {
      const res = NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
      return withCors(req, res);
    }

    const res = NextResponse.json(
      { user },
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