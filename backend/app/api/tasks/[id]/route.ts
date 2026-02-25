import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../lib/db";
import Task from "../../../models/Task";
import { requireUser } from "../../../lib/auth";
import { taskUpdateSchema } from "../../../lib/validators";
import { withCors, handlePreflight } from "../../../lib/cors";

export const runtime = "nodejs";

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

/* ---------- UPDATE TASK ---------- */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { userId, error } = await requireUser();
    if (error) {
      return withCors(req, error);
    }

    const body = await req.json();
    const parsedData = taskUpdateSchema.parse(body);

    if (Object.keys(parsedData).length === 0) {
      const res = NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
      return withCors(req, res);
    }

    await connectDB();

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(userId) },
      { $set: parsedData },
      { new: true, runValidators: true }
    );

    if (!task) {
      const res = NextResponse.json(
        { error: "Task not found or not owned by user" },
        { status: 404 }
      );
      return withCors(req, res);
    }

    const res = NextResponse.json(task, { status: 200 });
    return withCors(req, res);

  } catch (err: any) {
    const res = NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}

/* ---------- DELETE TASK ---------- */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { userId, error } = await requireUser();
    if (error) {
      return withCors(req, error);
    }

    await connectDB();

    const deleted = await Task.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      const res = NextResponse.json(
        { error: "Task not found or not owned by user" },
        { status: 404 }
      );
      return withCors(req, res);
    }

    const res = NextResponse.json(
      { message: "Deleted" },
      { status: 200 }
    );

    return withCors(req, res);

  } catch (err: any) {
    const res = NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}