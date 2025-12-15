// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "../../lib/db";
import User from "../../models/User";
import { verifyToken } from "../../lib/jwt";

// Force Node runtime (important)
export const runtime = "nodejs";

export async function GET() {
  // 1️⃣ Read cookie (cheap)
const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;


  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ Verify token (cheap)
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // 3️⃣ Connect DB only after auth
  await connectDB();

  // 4️⃣ Fetch user
  const user = await User.findById(payload.userId).select("-password");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}
