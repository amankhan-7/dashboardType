import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Task from "../../models/Task";
import { taskSchema } from "../../lib/validators";
import { requireUser } from "../../lib/auth";
import { withCors, handlePreflight } from "../../lib/cors";

export const runtime = "nodejs";

// Preflight
export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

/* ---------- GET TASKS ---------- */
export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();

    if (error) {
      return withCors(req, error);
    }

    await connectDB();

    const tasks = await Task.find({ userId });

    const res = NextResponse.json(tasks, { status: 200 });
    return withCors(req, res);

  } catch {
    const res = NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}

/* ---------- CREATE TASK ---------- */
export async function POST(req: NextRequest) {
  try {
    const { userId, error } = await requireUser();

    if (error) {
      return withCors(req, error);
    }

    const body = taskSchema.parse(await req.json());

    await connectDB();

    const task = await Task.create({ ...body, userId });

    const res = NextResponse.json(task, { status: 201 });
    return withCors(req, res);

  } catch (err: any) {
    const res = NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
    return withCors(req, res);
  }
}