import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/db";
import Task from "../../../models/Task";
import { verifyToken } from "../../../lib/jwt";

/* ---------- UPDATE TASK ---------- */
export async function PUT(req: Request, context: any) {
  const { id } = await context.params; // ✅ REQUIRED in your Next.js version

  const cookieStore = await cookies(); // ✅ async in your setup
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();

  // 🔒 whitelist updates
  const updateData: Record<string, any> = {};
  if (typeof body.title === "string") updateData.title = body.title;
  if (typeof body.completed === "boolean")
    updateData.completed = body.completed;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  await connectDB();

  const task = await Task.findOneAndUpdate(
    {
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!task) {
    return NextResponse.json(
      { error: "Task not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json(task);
}

/* ---------- DELETE TASK ---------- */
export async function DELETE(req: Request, context: any) {
  const { id } = await context.params; // ✅ REQUIRED

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: string;
  try {
    ({ userId } = verifyToken(token));
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  await connectDB();

  const deleted = await Task.findOneAndDelete({
    _id: id,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!deleted) {
    return NextResponse.json(
      { error: "Task not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Deleted" });
}
